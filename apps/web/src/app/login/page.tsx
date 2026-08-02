"use client"

import { Suspense } from "react"
import { LoginForm } from "@/components/login-form"
import { Globe } from "@/components/ui/globe"
import { Terminal } from "lucide-react"

const customGlobeConfig = {
  width: 600,
  height: 600,
  onRender: () => {},
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.3,
  dark: 1,
  diffuse: 1.2,
  mapSamples: 12000,
  mapBrightness: 6,
  baseColor: [0.1, 0.1, 0.1] as [number, number, number],
  markerColor: [16 / 255, 185 / 255, 129 / 255] as [number, number, number],
  glowColor: [16 / 255, 185 / 255, 129 / 255] as [number, number, number],
  markers: [
    { location: [19.076, 72.8777] as [number, number], size: 0.1 }, // Mumbai, India
    { location: [1.3521, 103.8198] as [number, number], size: 0.08 }, // Singapore
    { location: [25.2048, 55.2708] as [number, number], size: 0.09 }, // Dubai
    { location: [51.5074, -0.1278] as [number, number], size: 0.08 }, // London
    { location: [40.7128, -74.006] as [number, number], size: 0.1 }, // New York
    { location: [35.6762, 139.6503] as [number, number], size: 0.08 }, // Tokyo
  ],
}

function LoginPageContent() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2 bg-[#090D16] text-white selection:bg-emerald-500 selection:text-black">
      {/* Left Column - Form Container */}
      <div className="flex flex-col gap-4 p-6 sm:p-10 justify-between z-10">
        <div className="flex justify-between items-center">
          <a href="/" className="flex items-center gap-2 font-mono text-sm font-bold text-emerald-400">
            <div className="flex size-7 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10">
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

      {/* Right Column - Spinning Globe Only */}
      <div className="relative hidden lg:flex items-center justify-center overflow-hidden border-l border-slate-800/60 bg-[#090D16]">
        {/* Ambient Glowing Spotlights matching landing page vibe */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-emerald-500/10 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute top-1/4 right-1/4 w-[350px] h-[350px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative w-[600px] h-[600px] flex items-center justify-center">
          <Globe config={customGlobeConfig} className="w-full h-full" />
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
