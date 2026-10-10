"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { BrandLogo } from "@/components/common/BrandLogo";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      router.push(nextUrl);
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Invalid credentials";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail("admin@autodrift.ph");
    setPassword("AdminAutoDrift2024!");
  };

  return (
    <div className="glass-card rounded-2xl p-7 border border-zinc-800 shadow-2xl">
      {error && (
        <div className="mb-5 p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
            Admin Email
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@autodrift.ph"
              required
              className="w-full pl-10 pr-4 py-3 bg-black/90 border border-zinc-700 focus:border-red-500 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 text-sm transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              className="w-full pl-10 pr-4 py-3 bg-black/90 border border-zinc-700 focus:border-red-500 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 text-sm transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:opacity-50 shadow-[0_0_20px_rgba(239,68,68,0.4)] flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Verifying credentials...</span>
            </>
          ) : (
            <>
              <span>Sign In to Admin</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Quick Demo Helper */}
      <div className="mt-6 pt-5 border-t border-zinc-800 text-center">
        <button
          type="button"
          onClick={fillDemoCredentials}
          className="text-xs text-red-400 hover:text-red-300 underline font-semibold"
        >
          Click here to fill standard admin credentials
        </button>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <BrandLogo
            showIcon={false}
            showBadge={false}
            className="justify-center mb-2"
            logoClassName="h-12 sm:h-14 w-auto object-contain"
          />
          <h1 className="text-xs font-extrabold text-red-500 uppercase tracking-widest mt-1">
            ADMIN CONTROL PANEL
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Price Management &amp; Catalog Center
          </p>
        </div>

        {/* Suspense-wrapped form */}
        <Suspense
          fallback={
            <div className="glass-card rounded-2xl p-12 border border-zinc-800 text-center flex items-center justify-center gap-2 text-zinc-400 text-sm">
              <Loader2 className="w-5 h-5 animate-spin text-red-500" />
              <span>Loading login...</span>
            </div>
          }
        >
          <LoginForm />
        </Suspense>

        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            &larr; Return to Public Quote Calculator
          </Link>
        </div>
      </div>
    </div>
  );
}
