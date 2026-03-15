import { NextResponse } from "next/server";
import { requirePolicyRequest } from "@/lib/policy";
import { getSupabaseAdmin } from "@/lib/supabase";
import { assertRateLimit, getClientIp } from "@/lib/security";
import { writeAuditLog } from "@/lib/audit";
import { alertCritical, getRequestId, logEvent } from "@/lib/observability";

export async function GET(request: Request) {
  const requestId = getRequestId(request);
  const route = "/api/superadmin/users";

  try {
    const ip = getClientIp(request);
    await assertRateLimit(`superadmin-users:${ip}`, 60, 60_000);

    const gate = await requirePolicyRequest(request, "/superadmin");
    if (!gate.ok) {
      gate.response.headers.set("x-request-id", requestId);
      return gate.response;
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });

    if (error) {
      throw error;
    }

    await writeAuditLog({
      actorUserId: gate.auth.user.id,
      actorRole: gate.auth.role,
      action: "superadmin.users.read",
      targetType: "users",
      requestId,
      metadata: { count: data.users.length },
    });

    logEvent({ requestId, route, level: "info", message: "Superadmin users listed", data: { count: data.users.length } });

    const response = NextResponse.json({
      success: true,
      data: data.users.map((user) => ({
        id: user.id,
        email: user.email,
        role: String(user.app_metadata?.role ?? user.user_metadata?.role ?? "customer"),
        createdAt: user.created_at,
        lastSignInAt: user.last_sign_in_at,
      })),
    });
    response.headers.set("x-request-id", requestId);
    return response;
  } catch (error) {
    logEvent({ requestId, route, level: "error", message: "Superadmin users API error", data: String(error) });
    await alertCritical({ requestId, route, message: "Superadmin users critical failure", data: String(error) });
    const response = NextResponse.json({ success: false, message: "Failed to load users." }, { status: 500 });
    response.headers.set("x-request-id", requestId);
    return response;
  }
}
