import { NextResponse } from "next/server";
import { requirePolicyRequest } from "@/lib/policy";
import { getSupabaseAdmin } from "@/lib/supabase";
import { assertRateLimit, getClientIp } from "@/lib/security";
import { writeAuditLog } from "@/lib/audit";
import { alertCritical, getRequestId, logEvent } from "@/lib/observability";

export async function GET(request: Request) {
  const requestId = getRequestId(request);
  const route = "/api/admin/overview";

  try {
    const ip = getClientIp(request);
    await assertRateLimit(`admin-overview:${ip}`, 60, 60_000);

    const gate = await requirePolicyRequest(request, "/admin");
    if (!gate.ok) {
      gate.response.headers.set("x-request-id", requestId);
      return gate.response;
    }

    const supabase = getSupabaseAdmin();

    const [{ count: ordersCount, error: ordersError }, { count: paymentsCount, error: paymentsError }, { count: assetsCount, error: assetsError }, { count: profilesCount, error: profilesError }] = await Promise.all([
      supabase.from("orders").select("id", { count: "exact", head: true }),
      supabase.from("payments").select("id", { count: "exact", head: true }),
      supabase.from("assets").select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
    ]);

    const error = ordersError ?? paymentsError ?? assetsError ?? profilesError;
    if (error) {
      throw error;
    }

    await writeAuditLog({
      actorUserId: gate.auth.user.id,
      actorRole: gate.auth.role,
      action: "admin.overview.read",
      targetType: "admin",
      targetId: gate.auth.user.id,
      requestId,
    });

    logEvent({ requestId, route, level: "info", message: "Admin overview served", data: { actorRole: gate.auth.role } });

    const response = NextResponse.json({
      success: true,
      data: {
        role: gate.auth.role,
        orders: ordersCount ?? 0,
        payments: paymentsCount ?? 0,
        assets: assetsCount ?? 0,
        profiles: profilesCount ?? 0,
      },
    });
    response.headers.set("x-request-id", requestId);
    return response;
  } catch (error) {
    logEvent({ requestId, route, level: "error", message: "Admin overview API error", data: String(error) });
    await alertCritical({ requestId, route, message: "Admin overview critical failure", data: String(error) });
    const response = NextResponse.json({ success: false, message: "Failed to load admin overview." }, { status: 500 });
    response.headers.set("x-request-id", requestId);
    return response;
  }
}
