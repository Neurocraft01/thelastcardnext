"use client";

import Link from "next/link";
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

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: "customer",
          },
          emailRedirectTo: `${window.location.origin}/auth/login`,
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      if (data.session) {
        await persistSession(data.session.access_token, data.session.refresh_token);
        router.push("/dashboard");
        router.refresh();
        return;
      }

      setMessage("Account created. Please verify your email if confirmation is enabled.");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <SiteHeader />
      <main className="grid place-items-center px-6 py-12">
        <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950/80 p-7">
          <p className="text-xs uppercase tracking-[0.18em] text-[#ffcc00]">Account</p>
          <h1 className="mt-2 font-display text-4xl gold-text">Register</h1>
          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <div>
              <label className="label">Full Name</label>
              <input className="input" placeholder="Your full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" className="input" placeholder="********" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required />
            </div>
            {error ? <p className="text-sm text-red-400">{error}</p> : null}
            {message ? <p className="text-sm text-emerald-400">{message}</p> : null}
            <button disabled={loading} className="w-full rounded-full bg-[#ffcc00] px-7 py-3 text-xs font-extrabold uppercase tracking-[0.18em] text-black disabled:opacity-70">
              {loading ? "Creating..." : "Create Account"}
            </button>
          </form>
          <p className="mt-4 text-sm text-zinc-400">
            Already have an account? <Link href="/auth/login" className="hover:text-[#ffcc00]">Login</Link>
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
