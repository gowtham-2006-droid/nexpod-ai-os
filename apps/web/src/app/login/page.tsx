"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setSession } from "@/lib/auth";
import { ShieldCheck, UserCheck, Lock, Mail, ArrowRight, Sparkles, Terminal } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Try relative API endpoint first (handled by Next.js rewrites or same-domain proxy)
      let res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }).catch(() => null);

      if (!res || !res.ok) {
        // Fallback to direct backend URL if proxy rewrite fails
        res = await fetch("http://localhost:8000/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Invalid email or password.");
      }

      const data = await res.json();
      setSession(data.access_token, data.user);

      if (data.user.role === "admin") {
        router.push(redirectPath);
      } else {
        router.push("/customer");
      }
    } catch (err: any) {
      // Fallback for offline/demo client mode
      if (email === "admin@nexpod.ai" && password === "admin123") {
        const dummyToken = "mock_admin_jwt_token_123456789";
        const dummyUser = { id: "usr_admin_01", email: "admin@nexpod.ai", role: "admin" as const };
        setSession(dummyToken, dummyUser);
        router.push(redirectPath);
      } else if (email === "customer@nexpod.ai" && password === "customer123") {
        const dummyToken = "mock_cust_jwt_token_987654321";
        const dummyUser = { id: "usr_cust_01", email: "customer@nexpod.ai", role: "user" as const };
        setSession(dummyToken, dummyUser);
        router.push("/customer");
      } else {
        setError(err.message || "Authentication failed. Check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (targetRole: "admin" | "user") => {
    if (targetRole === "admin") {
      setEmail("admin@nexpod.ai");
      setPassword("admin123");
    } else {
      setEmail("customer@nexpod.ai");
      setPassword("customer123");
    }
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Header Badge */}
      <div className="mb-8 text-center z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono uppercase tracking-wider mb-4">
          <Terminal className="w-3.5 h-3.5" />
          <span>NexPod AI OS Access Control</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
          Sign In to System
        </h1>
        <p className="text-slate-400 text-sm mt-1 max-w-sm mx-auto">
          Authenticate to unlock Fleet Mission Control or access Customer Services.
        </p>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md bg-[#0F172A]/80 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl z-10 relative">
        
        {/* Quick Role Fill Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => fillCredentials("admin")}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 hover:bg-cyan-900/50 hover:border-cyan-400 transition-all group text-left"
          >
            <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Role</span>
            </div>
            <span className="text-[11px] text-slate-400">Mission Control</span>
          </button>

          <button
            type="button"
            onClick={() => fillCredentials("user")}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 hover:bg-purple-900/50 hover:border-purple-400 transition-all group text-left"
          >
            <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs uppercase tracking-wider mb-1">
              <UserCheck className="w-4 h-4" />
              <span>Customer Role</span>
            </div>
            <span className="text-[11px] text-slate-400">Order Kiosk App</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@nexpod.ai"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50 mt-2"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
          <p className="text-[11px] text-slate-500">
            Default Admin: <code className="text-slate-300">admin@nexpod.ai</code> (admin123)
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Default Customer: <code className="text-slate-300">customer@nexpod.ai</code> (customer123)
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#090D16] text-white flex items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
