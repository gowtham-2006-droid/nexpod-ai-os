import { Suspense } from "react"

import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-6 bg-background p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <div className="flex items-center gap-2 rounded-full border border-border/70 bg-card px-3 py-1.5 text-sm font-medium shadow-sm">
            <span className="inline-flex size-2.5 rounded-full bg-emerald-500" />
            NexPod AI OS
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            <Suspense fallback={<div className="text-sm text-muted-foreground">Loading sign-in form…</div>}>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </div>
      <div className="relative hidden bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_45%),linear-gradient(135deg,_#020617,_#0f172a_50%,_#111827)] lg:block">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.07),transparent_40%,rgba(255,255,255,0.03))]" />
        <div className="absolute inset-0 flex items-center justify-center p-10">
          <div className="max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 text-white shadow-2xl backdrop-blur-xl">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Mission control</p>
            <h2 className="mt-3 text-3xl font-semibold">Operate the fleet, orders, and service insights from one secure workspace.</h2>
            <p className="mt-4 text-sm leading-6 text-slate-300">
              The new login experience brings the same authentication flow to a polished shadcn interface for faster onboarding and a clearer experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
