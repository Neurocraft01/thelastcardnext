import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { getSupabaseAuthClient } from "./supabase";

export const ACCESS_COOKIE = "tlc-access-token";
export const REFRESH_COOKIE = "tlc-refresh-token";

export const ROLE_HIERARCHY = {
  customer: 1,
  admin: 2,
  superadmin: 3,
} as const;

export type UserRole = keyof typeof ROLE_HIERARCHY;

export type AuthenticatedUser = {
  user: User;
  role: UserRole;
  accessToken: string;
};

function getRole(user: User) {
  const rawRole = String(user.app_metadata?.role ?? user.user_metadata?.role ?? "customer").toLowerCase();
  if (rawRole === "superadmin") {
    return "superadmin" as const;
  }
  if (rawRole === "admin") {
    return "admin" as const;
  }
  return "customer" as const;
}

export function hasRequiredRole(currentRole: UserRole, requiredRole: UserRole) {
  return ROLE_HIERARCHY[currentRole] >= ROLE_HIERARCHY[requiredRole];
}

function getAccessTokenFromRequest(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice("Bearer ".length).trim();
  }

  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader.match(/(?:^|; )tlc-access-token=([^;]+)/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export async function getAuthenticatedUserFromRequest(request: Request): Promise<AuthenticatedUser | null> {
  const accessToken = getAccessTokenFromRequest(request);
  if (!accessToken) {
    return null;
  }

  const supabase = getSupabaseAuthClient();
  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error || !data.user) {
    return null;
  }

  return {
    user: data.user,
    role: getRole(data.user),
    accessToken,
  };
}

export async function requireRoleFromRequest(request: Request, allowedRoles: string[]) {
  const auth = await getAuthenticatedUserFromRequest(request);
  if (!auth) {
    return { ok: false as const, response: new Response(JSON.stringify({ success: false, message: "Unauthorized." }), { status: 401, headers: { "content-type": "application/json" } }) };
  }

  if (!allowedRoles.includes(auth.role)) {
    return { ok: false as const, response: new Response(JSON.stringify({ success: false, message: "Forbidden." }), { status: 403, headers: { "content-type": "application/json" } }) };
  }

  return { ok: true as const, auth };
}

export async function requireMinimumRoleFromRequest(request: Request, requiredRole: UserRole) {
  const auth = await getAuthenticatedUserFromRequest(request);
  if (!auth) {
    return {
      ok: false as const,
      response: new Response(JSON.stringify({ success: false, message: "Unauthorized." }), {
        status: 401,
        headers: { "content-type": "application/json" },
      }),
    };
  }

  if (!hasRequiredRole(auth.role, requiredRole)) {
    return {
      ok: false as const,
      response: new Response(JSON.stringify({ success: false, message: "Forbidden." }), {
        status: 403,
        headers: { "content-type": "application/json" },
      }),
    };
  }

  return { ok: true as const, auth };
}

export async function getAuthenticatedUserFromCookies() {
  const store = await cookies();
  const accessToken = store.get(ACCESS_COOKIE)?.value;
  if (!accessToken) {
    return null;
  }

  const supabase = getSupabaseAuthClient();
  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error || !data.user) {
    return null;
  }

  return {
    user: data.user,
    role: getRole(data.user),
    accessToken,
  };
}

export async function requirePageUser(allowedRoles?: string[]) {
  const auth = await getAuthenticatedUserFromCookies();
  if (!auth) {
    redirect("/auth/login");
  }

  if (allowedRoles && !allowedRoles.includes(auth.role)) {
    redirect("/");
  }

  return auth;
}

export async function requireMinimumPageRole(requiredRole: UserRole) {
  const auth = await getAuthenticatedUserFromCookies();
  if (!auth) {
    redirect("/auth/login");
  }

  if (!hasRequiredRole(auth.role, requiredRole)) {
    redirect("/dashboard");
  }

  return auth;
}
