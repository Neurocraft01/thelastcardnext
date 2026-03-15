import { createClient } from "@supabase/supabase-js";
import { getEnvVar } from "./env";

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

function getSupabaseUrl() {
  return getEnvVar("SUPABASE_URL");
}

export function getSupabaseAdmin() {
  const url = getSupabaseUrl();
  const serviceRole = getEnvVar("SUPABASE_SERVICE_ROLE_KEY");

  return createClient(url, serviceRole, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function getSupabaseAuthClient() {
  const url = getSupabaseUrl();
  const anonKey = getEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function findAuthUserByEmail(email: string) {
  const admin = getSupabaseAdmin();
  let page = 1;
  const target = email.toLowerCase().trim();

  while (page <= 10) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) {
      throw error;
    }

    const user = data.users.find((candidate) => candidate.email?.toLowerCase() === target);
    if (user) {
      return user;
    }

    if (!data.users.length || data.users.length < 200) {
      break;
    }

    page += 1;
  }

  return null;
}
