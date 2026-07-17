'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Cpu, Database, Brain, Activity, RefreshCw } from 'lucide-react';

interface MockBrowserWindowProps {
  children?: React.ReactNode;
}

export function MockBrowserWindow({ children }: MockBrowserWindowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Smooth scroll animation transformations (subtle tilt and shift)
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [10, 0, -5]);
  const y = useTransform(scrollYProgress, [0, 1], [30, -30]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.98, 1, 0.98]);

  return (
    <div ref={containerRef} className="perspective-[1000px] w-full py-8">
      <motion.div
        style={{ rotateX, y, scale }}
        className="w-full rounded-2xl bg-boxdark border border-strokedark shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col"
      >
        {/* Browser Top Bar */}
        <div className="bg-black/60 px-4 py-3 border-b border-strokedark flex items-center gap-2 select-none">
          <div className="flex gap-1.5 shrink-0">
            <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
            <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
          </div>
          {/* Simulated address bar */}
          <div className="flex-1 bg-black/40 text-bodydark2 rounded-lg text-[10px] font-mono py-1 px-4 text-center border border-strokedark truncate max-w-md mx-auto">
            https://nexpod.ai/dashboard
          </div>
        </div>

        {/* Browser Content: High-fidelity CSS/React Dashboard Preview (No images!) */}
        <div className="relative aspect-video w-full bg-black/40 overflow-hidden p-6 font-mono text-[10px] text-bodydark flex flex-col justify-between select-none">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent pointer-events-none" />
          
          {/* Top telemetry bar */}
          <div className="flex justify-between items-center border-b border-strokedark/50 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-white font-bold tracking-tight">NexPod Mission Control</span>
            </div>
            <span className="text-bodydark2 text-[8px] bg-white/5 border border-white/10 px-2 py-0.5 rounded uppercase">
              Real-time Telemetry
            </span>
          </div>

          {/* Metric widgets */}
          <div className="grid grid-cols-3 gap-4 my-2">
            <div className="bg-black/40 border border-strokedark p-3 rounded-xl space-y-1.5">
              <div className="flex justify-between items-center text-[8px] text-bodydark2">
                <span>Active Telemetry</span>
                <Activity className="w-3 h-3 text-white opacity-60" />
              </div>
              <div className="text-base font-bold text-white font-mono">93.5°C</div>
              <span className="text-[8px] text-primary">Nominal boiler status</span>
            </div>

            <div className="bg-black/40 border border-strokedark p-3 rounded-xl space-y-1.5">
              <div className="flex justify-between items-center text-[8px] text-bodydark2">
                <span>Operations AI</span>
                <Brain className="w-3 h-3 text-primary" />
              </div>
              <div className="text-base font-bold text-white font-mono">2.8 hrs</div>
              <span className="text-[8px] text-yellow-400">Refill milk warning</span>
            </div>

            <div className="bg-black/40 border border-strokedark p-3 rounded-xl space-y-1.5">
              <div className="flex justify-between items-center text-[8px] text-bodydark2">
                <span>Database Sync</span>
                <Database className="w-3 h-3 text-cyan-400" />
              </div>
              <div className="text-base font-bold text-white font-mono">100%</div>
              <span className="text-[8px] text-bodydark2">Postgres snapshot committed</span>
            </div>
          </div>

          {/* Simulated chart / console widget */}
          <div className="flex-1 bg-black/60 border border-strokedark/80 rounded-xl p-3 flex flex-col justify-between min-h-[90px]">
            <span className="text-[8px] text-bodydark2 uppercase tracking-wider block">Live Stream Logs</span>
            <div className="space-y-1 text-[8px] leading-relaxed text-left text-bodydark font-mono">
              <div className="text-primary">&gt;&gt; Advance tick (minutes=1)...</div>
              <div>[Event] order.created - SKU: cold-brew - Total: INR 220</div>
              <div>[Event] inventory.low - Milk level 28% capacity</div>
              <div className="text-cyan-400">&gt;&gt; Database projection saved. Transactions committed.</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
