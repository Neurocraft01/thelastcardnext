import { NextResponse } from "next/server";
import {
  getAuthenticatedUserFromRequest,
  hasRequiredRole,
  requireMinimumPageRole,
  type UserRole,
} from "./auth";

export type PolicyName = "/admin" | "/superadmin";

export const POLICY_RULES: Record<PolicyName, { minRole: UserRole; description: string }> = {
  "/admin": {
    minRole: "admin",
    description: "Admin can view operational metrics, card/order insights, and user-facing support controls.",
  },
  "/superadmin": {
    minRole: "superadmin",
    description: "Superadmin can manage role assignment and platform-level governance controls.",
  },
};

export async function requirePolicyPage(policy: PolicyName) {
  return requireMinimumPageRole(POLICY_RULES[policy].minRole);
}

export async function requirePolicyRequest(request: Request, policy: PolicyName) {
  const auth = await getAuthenticatedUserFromRequest(request);
  if (!auth) {
    return { ok: false as const, response: NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 }) };
  }

  const minRole = POLICY_RULES[policy].minRole;
  if (!hasRequiredRole(auth.role, minRole)) {
    return { ok: false as const, response: NextResponse.json({ success: false, message: "Forbidden." }, { status: 403 }) };
  }

  return { ok: true as const, auth };
}
