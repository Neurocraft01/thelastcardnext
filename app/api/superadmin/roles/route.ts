import { NextResponse } from "next/server";
import { z } from "zod";
import { requirePolicyRequest } from "@/lib/policy";
import { getSupabaseAdmin } from "@/lib/supabase";
import { assertRateLimit, getClientIp } from "@/lib/security";
import { writeAuditLog } from "@/lib/audit";
import { alertCritical, getRequestId, logEvent } from "@/lib/observability";

const schema = z.object({
  userId: z.string().uuid().optional(),
  email: z.email().optional(),
  role: z.enum(["customer", "admin", "superadmin"]),
});

export async function POST(request: Request) {
  const requestId = getRequestId(request);
  const route = "/api/superadmin/roles";

  try {
    const ip = getClientIp(request);
    await assertRateLimit(`superadmin-roles:${ip}`, 60, 60_000);

    const gate = await requirePolicyRequest(request, "/superadmin");
    if (!gate.ok) {
      gate.response.headers.set("x-request-id", requestId);
      return gate.response;
    }

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      const response = NextResponse.json({ success: false, message: "Invalid role update payload." }, { status: 400 });
      response.headers.set("x-request-id", requestId);
      return response;
    }

    if (!parsed.data.userId && !parsed.data.email) {
      const response = NextResponse.json({ success: false, message: "Either userId or email is required." }, { status: 400 });
      response.headers.set("x-request-id", requestId);
      return response;
    }

    const supabase = getSupabaseAdmin();

    let targetUserId = parsed.data.userId;
    if (!targetUserId && parsed.data.email) {
      const users = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });
      if (users.error) {
        throw users.error;
      }
      const user = users.data.users.find((item) => item.email?.toLowerCase() === parsed.data.email?.toLowerCase());
      if (!user) {
        const response = NextResponse.json({ success: false, message: "User not found for email." }, { status: 404 });
        response.headers.set("x-request-id", requestId);
        return response;
      }
      targetUserId = user.id;
    }

    if (!targetUserId) {
      const response = NextResponse.json({ success: false, message: "Unable to resolve user." }, { status: 404 });
      response.headers.set("x-request-id", requestId);
      return response;
    }

    const { data: beforeProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", targetUserId)
      .maybeSingle();

    const updated = await supabase.auth.admin.updateUserById(targetUserId, {
      app_metadata: { role: parsed.data.role },
    });

    if (updated.error || !updated.data.user) {
      throw updated.error ?? new Error("Unable to update user role.");
    }

    const { error: profileRoleUpdateError } = await supabase
      .from("profiles")
      .upsert({
        id: targetUserId,
        role: parsed.data.role,
        updated_at: new Date().toISOString(),
      });

    if (profileRoleUpdateError) {
      throw profileRoleUpdateError;
    }

    await writeAuditLog({
      actorUserId: gate.auth.user.id,
      actorRole: gate.auth.role,
      action: "role.changed",
      targetType: "user",
      targetId: targetUserId,
      requestId,
      metadata: {
        previousRole: beforeProfile?.role ?? null,
        nextRole: parsed.data.role,
      },
    });

    logEvent({
      requestId,
      route,
      level: "info",
      message: "Role updated",
      data: { targetUserId, previousRole: beforeProfile?.role ?? null, nextRole: parsed.data.role },
    });

    const response = NextResponse.json({
      success: true,
      data: {
        userId: updated.data.user.id,
        email: updated.data.user.email,
        role: parsed.data.role,
      },
    });
    response.headers.set("x-request-id", requestId);
    return response;
  } catch (error) {
    logEvent({ requestId, route, level: "error", message: "Superadmin role API error", data: String(error) });
    await alertCritical({ requestId, route, message: "Superadmin roles critical failure", data: String(error) });
    const response = NextResponse.json({ success: false, message: "Failed to update role." }, { status: 500 });
    response.headers.set("x-request-id", requestId);
    return response;
  }
}
