"use client";

import { useState } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const supabase = getSupabaseBrowserClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (resetError) {
        throw resetError;
      }

      setMessage("Password reset link sent. Please check your inbox.");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <SiteHeader />
      <main className="grid place-items-center px-6 py-12">
        <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950/80 p-7">
          <h1 className="font-display text-4xl gold-text">Forgot Password</h1>
          <p className="mt-3 text-zinc-300">Enter your email to receive a password reset link.</p>
          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            {error ? <p className="text-sm text-red-400">{error}</p> : null}
            {message ? <p className="text-sm text-emerald-400">{message}</p> : null}
            <button disabled={loading} className="w-full rounded-full bg-[#ffcc00] px-7 py-3 text-xs font-extrabold uppercase tracking-[0.18em] text-black disabled:opacity-70">
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
