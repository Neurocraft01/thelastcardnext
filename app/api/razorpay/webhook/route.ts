import { NextResponse } from "next/server";
import { alertCritical, getRequestId, logEvent } from "@/lib/observability";
import { getRazorpayClient, verifyRazorpayWebhookSignature } from "@/lib/razorpay";
import { assertRateLimit, getClientIp } from "@/lib/security";
import { getSupabaseAdmin } from "@/lib/supabase";

type RazorpayWebhookEvent = {
  event?: string;
  created_at?: number;
  payload?: {
    payment?: { entity?: { id?: string; order_id?: string; status?: string; amount?: number; currency?: string } };
  };
};

function isDuplicateKeyError(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "23505";
}

export async function POST(request: Request) {
  const requestId = getRequestId(request);
  const route = "/api/razorpay/webhook";

  try {
    const ip = getClientIp(request);
    await assertRateLimit(`rzp-webhook:${ip}`, 120, 60_000);

    const signature = request.headers.get("x-razorpay-signature") ?? "";
    if (!signature) {
      const response = NextResponse.json({ success: false, message: "Missing webhook signature." }, { status: 400 });
      response.headers.set("x-request-id", requestId);
      return response;
    }

    const rawBody = await request.text();
    const isValid = verifyRazorpayWebhookSignature(rawBody, signature);
    if (!isValid) {
      const response = NextResponse.json({ success: false, message: "Invalid webhook signature." }, { status: 401 });
      response.headers.set("x-request-id", requestId);
      return response;
    }

    const event = JSON.parse(rawBody) as RazorpayWebhookEvent;
    const providerEventId = `${event.event ?? "unknown"}-${event.created_at ?? Date.now()}-${event.payload?.payment?.entity?.id ?? "none"}`;
    const paymentId = event.payload?.payment?.entity?.id ?? null;
    const paymentOrderId = event.payload?.payment?.entity?.order_id ?? null;
    const paymentStatus = event.payload?.payment?.entity?.status ?? null;

    const supabase = getSupabaseAdmin();
    const saveEvent = await supabase.from("payment_events").insert({
      provider: "razorpay",
      provider_event_id: providerEventId,
      event_type: event.event ?? "unknown",
      payment_id: paymentId,
      order_id: paymentOrderId,
      signature,
      payload: event,
    });

    if (saveEvent.error && !isDuplicateKeyError(saveEvent.error)) {
      throw saveEvent.error;
    }

    if (isDuplicateKeyError(saveEvent.error)) {
      const duplicateResponse = NextResponse.json({ success: true, duplicate: true });
      duplicateResponse.headers.set("x-request-id", requestId);
      return duplicateResponse;
    }

    if (paymentId && paymentOrderId) {
      const paymentDetails = await getRazorpayClient().payments.fetch(paymentId);
      const amount = Number(event.payload?.payment?.entity?.amount ?? paymentDetails.amount ?? 0) / 100;

      const paymentUpsert = await supabase.from("payments").upsert(
        {
          razorpay_order_id: paymentOrderId,
          razorpay_payment_id: paymentId,
          amount,
          currency: paymentDetails.currency ?? event.payload?.payment?.entity?.currency ?? "INR",
          status: paymentStatus ?? paymentDetails.status ?? "created",
          payload: paymentDetails,
        },
        { onConflict: "razorpay_payment_id" },
      );

      if (paymentUpsert.error) {
        throw paymentUpsert.error;
      }
    }

    const markProcessed = await supabase
      .from("payment_events")
      .update({ processed: true, processed_at: new Date().toISOString() })
      .eq("provider", "razorpay")
      .eq("provider_event_id", providerEventId);

    if (markProcessed.error) {
      throw markProcessed.error;
    }

    logEvent({ requestId, route, level: "info", message: "Razorpay webhook processed", data: { providerEventId, paymentId } });
    const response = NextResponse.json({ success: true });
    response.headers.set("x-request-id", requestId);
    return response;
  } catch (error) {
    logEvent({ requestId, route, level: "error", message: "Razorpay webhook processing failed", data: String(error) });
    await alertCritical({ requestId, route, message: "Razorpay webhook critical failure", data: String(error) });
    const response = NextResponse.json({ success: false, message: "Webhook processing failed." }, { status: 500 });
    response.headers.set("x-request-id", requestId);
    return response;
  }
}
