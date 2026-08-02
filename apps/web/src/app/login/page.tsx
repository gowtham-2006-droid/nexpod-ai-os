"use client"

import { Suspense } from "react"
import { LoginForm } from "@/components/login-form"
import { Terminal, ShieldCheck, Activity } from "lucide-react"

function LoginPageContent() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2 bg-[#090D16] text-white selection:bg-cyan-500 selection:text-black">
      {/* Left Column - Form Container */}
      <div className="flex flex-col gap-4 p-6 sm:p-10 justify-between">
        <div className="flex justify-between items-center">
          <a href="/" className="flex items-center gap-2 font-mono text-sm font-bold text-cyan-400">
            <div className="flex size-7 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/10">
              <Terminal className="size-4" />
            </div>
            NexPod AI OS
          </a>
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">
            <LoginForm />
          </div>
        </div>

        <div className="text-center text-xs text-muted-foreground font-mono">
          NexPod AI Operating System &bull; Mission Control v2.0
        </div>
      </div>

      {/* Right Column - Hero Visual */}
      <div className="relative hidden bg-slate-950 lg:flex flex-col justify-between p-12 overflow-hidden border-l border-slate-800/60">
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-cyan-500/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex items-center gap-2 text-xs font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-full w-fit">
          <Activity className="size-3.5 animate-pulse" />
          <span>Real-time Telemetry Engine Connected</span>
        </div>

        <div className="relative z-10 space-y-4 my-auto max-w-lg">
          <h2 className="text-3xl font-extrabold tracking-tight leading-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Autonomous Fleet Mission Control & Telemetry Twin
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Monitor water pressure, boiler thermals, and AI-driven predictive dispatches in real-time across your self-service retail pod network.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800/80">
            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm">
              <span className="text-xs font-mono uppercase text-slate-400 block">Fleet Uptime</span>
              <span className="text-xl font-bold font-mono text-emerald-400">99.85%</span>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm">
              <span className="text-xs font-mono uppercase text-slate-400 block">AI Dispatches</span>
              <span className="text-xl font-bold font-mono text-cyan-400">Active</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-slate-500 font-mono pt-6 border-t border-slate-800/60">
          <span>Google Gemini & FastAPI Powered</span>
          <span className="flex items-center gap-1 text-slate-400"><ShieldCheck className="size-3.5 text-cyan-400" /> Secure Token Authentication</span>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#090D16] text-white flex items-center justify-center font-mono">Loading Authentication Console...</div>}>
      <LoginPageContent />
    </Suspense>
  )
}
