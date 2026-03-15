import { getSupabaseAdmin } from "./supabase";

export async function writeAuditLog(input: {
  actorUserId?: string;
  actorRole?: string;
  action: string;
  targetType?: string;
  targetId?: string;
  requestId?: string;
  metadata?: unknown;
}) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("audit_logs").insert({
    actor_user_id: input.actorUserId ?? null,
    actor_role: input.actorRole ?? null,
    action: input.action,
    target_type: input.targetType ?? null,
    target_id: input.targetId ?? null,
    request_id: input.requestId ?? null,
    metadata: input.metadata ?? null,
  });

  if (error) {
    throw error;
  }
}
