import { NextResponse } from "next/server";
import { alertCritical, getRequestId, logEvent } from "@/lib/observability";
import { getRazorpayClient } from "@/lib/razorpay";
import { assertRateLimit, getClientIp } from "@/lib/security";
import { getSupabaseAdmin } from "@/lib/supabase";

function isAuthorized(request: Request) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "").trim();
  return Boolean(token && process.env.RECONCILIATION_CRON_SECRET && token === process.env.RECONCILIATION_CRON_SECRET);
}

export async function POST(request: Request) {
  const requestId = getRequestId(request);
  const route = "/api/internal/reconcile-payments";

  try {
    const ip = getClientIp(request);
    await assertRateLimit(`reconcile-payments:${ip}`, 10, 60_000);

    if (!isAuthorized(request)) {
      const response = NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
      response.headers.set("x-request-id", requestId);
      return response;
    }

    const supabase = getSupabaseAdmin();
    const jobCreate = await supabase
      .from("reconciliation_jobs")
      .insert({
        job_type: "payments",
        status: "running",
        run_by: "cron",
        started_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (jobCreate.error || !jobCreate.data) {
      throw jobCreate.error ?? new Error("Failed to create reconciliation job.");
    }

    const jobId = jobCreate.data.id;

    const unprocessedEvents = await supabase
      .from("payment_events")
      .select("id, payment_id, payload")
      .eq("processed", false)
      .order("created_at", { ascending: true })
      .limit(50);

    if (unprocessedEvents.error) {
      throw unprocessedEvents.error;
    }

    let reconciledCount = 0;

    for (const event of unprocessedEvents.data ?? []) {
      if (!event.payment_id) {
        continue;
      }

      const payment = await getRazorpayClient().payments.fetch(event.payment_id);
      const amount = Number(payment.amount ?? 0) / 100;

      const upsertPayment = await supabase.from("payments").upsert(
        {
          razorpay_order_id: payment.order_id,
          razorpay_payment_id: payment.id,
          amount,
          currency: payment.currency,
          status: payment.status,
          payload: payment,
        },
        { onConflict: "razorpay_payment_id" },
      );

      if (upsertPayment.error) {
        throw upsertPayment.error;
      }

      const markEvent = await supabase
        .from("payment_events")
        .update({ processed: true, processed_at: new Date().toISOString() })
        .eq("id", event.id);

      if (markEvent.error) {
        throw markEvent.error;
      }

      reconciledCount += 1;
    }

    const completeJob = await supabase
      .from("reconciliation_jobs")
      .update({
        status: "completed",
        finished_at: new Date().toISOString(),
        metadata: { reconciledCount },
      })
      .eq("id", jobId);

    if (completeJob.error) {
      throw completeJob.error;
    }

    logEvent({ requestId, route, level: "info", message: "Payment reconciliation completed", data: { reconciledCount } });
    const response = NextResponse.json({ success: true, reconciledCount });
    response.headers.set("x-request-id", requestId);
    return response;
  } catch (error) {
    logEvent({ requestId, route, level: "error", message: "Payment reconciliation failed", data: String(error) });
    await alertCritical({ requestId, route, message: "Payment reconciliation critical failure", data: String(error) });
    const response = NextResponse.json({ success: false, message: "Reconciliation failed." }, { status: 500 });
    response.headers.set("x-request-id", requestId);
    return response;
  }
}
