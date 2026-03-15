"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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

export default function LoginPage() {
  const router = useRouter();
  const [nextPath, setNextPath] = useState("/dashboard");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    const nextValue = search.get("next");
    if (nextValue && nextValue.startsWith("/")) {
      setNextPath(nextValue);
    }
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !data.session) {
        throw new Error(authError?.message ?? "Login failed.");
      }

      await persistSession(data.session.access_token, data.session.refresh_token);
      router.push(nextPath.startsWith("/") ? nextPath : "/dashboard");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Login failed.");
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
          <h1 className="mt-2 font-display text-4xl gold-text">Login</h1>
          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" className="input" placeholder="********" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {error ? <p className="text-sm text-red-400">{error}</p> : null}
            <button disabled={loading} className="w-full rounded-full bg-[#ffcc00] px-7 py-3 text-xs font-extrabold uppercase tracking-[0.18em] text-black disabled:opacity-70">
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
          <div className="mt-4 flex justify-between text-sm text-zinc-400">
            <Link href="/auth/forgot-password" className="hover:text-[#ffcc00]">Forgot password?</Link>
            <Link href="/auth/register" className="hover:text-[#ffcc00]">Create account</Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
