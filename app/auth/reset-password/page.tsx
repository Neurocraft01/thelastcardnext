"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

async function persistSession(accessToken: string, refreshToken?: string) {
  await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accessToken, refreshToken }),
  });
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data: sessionResult } = await supabase.auth.getSession();
      if (!sessionResult.session) {
        throw new Error("Open this page from a valid password reset link.");
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        throw updateError;
      }

      await persistSession(sessionResult.session.access_token, sessionResult.session.refresh_token);
      setMessage("Password updated successfully. Redirecting to dashboard...");
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 800);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <SiteHeader />
      <main className="grid place-items-center px-6 py-12">
        <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950/80 p-7">
          <h1 className="font-display text-4xl gold-text">Reset Password</h1>
          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <div>
              <label className="label">New Password</label>
              <input type="password" className="input" placeholder="********" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required />
            </div>
            <div>
              <label className="label">Confirm Password</label>
              <input type="password" className="input" placeholder="********" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} minLength={8} required />
            </div>
            {error ? <p className="text-sm text-red-400">{error}</p> : null}
            {message ? <p className="text-sm text-emerald-400">{message}</p> : null}
            <button disabled={loading} className="w-full rounded-full bg-[#ffcc00] px-7 py-3 text-xs font-extrabold uppercase tracking-[0.18em] text-black disabled:opacity-70">
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
