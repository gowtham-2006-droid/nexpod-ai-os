"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Terminal, 
  Cpu, 
  Activity, 
  Send,
  Compass,
  FileText,
  Workflow,
  Server,
  Zap,
  RotateCcw
} from "lucide-react";
import { cn } from "@/lib/utils";

export function DashboardFooter() {
  const [currentTime, setCurrentTime] = useState("");
  const [uptimeSeconds, setUptimeSeconds] = useState(0);
  const [pingMetric, setPingMetric] = useState(12);

  // Diagnostic states
  const [pingState, setPingState] = useState<"IDLE" | "SCANNING" | "NOMINAL">("NOMINAL");
  const [rebootState, setRebootState] = useState<"IDLE" | "REBOOTING" | "FINISHED">("IDLE");

  // Timer loops
  useEffect(() => {
    // Clock
    setCurrentTime(new Date().toISOString().replace("T", " ").substring(0, 19) + " UTC");
    
    const timer = setInterval(() => {
      // Clock
      setCurrentTime(new Date().toISOString().replace("T", " ").substring(0, 19) + " UTC");
      // Uptime
      setUptimeSeconds(prev => prev + 1);
      // Telemetry fluctuation
      setPingMetric(prev => Math.max(8, Math.min(25, prev + (Math.random() > 0.5 ? 1 : -1))));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatUptime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600).toString().padStart(2, "0");
    const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  const triggerPingCheck = () => {
    if (pingState === "SCANNING") return;
    setPingState("SCANNING");
    setTimeout(() => {
      setPingState("NOMINAL");
    }, 1200);
  };

  const triggerSystemReboot = () => {
    if (rebootState === "REBOOTING") return;
    setRebootState("REBOOTING");
    setTimeout(() => {
      setRebootState("FINISHED");
      setTimeout(() => setRebootState("IDLE"), 2500);
    }, 1500);
  };

  return (
    <footer className="border-t border-white/[0.06] bg-[#0a0a0c] py-16 text-xs font-mono text-slate-400 relative z-10">
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        
        {/* Top Row: System Status Header */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 gap-4">
          <div className="flex flex-wrap items-center gap-4 text-[10px]">
            <span className="flex items-center gap-2 text-white font-bold shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              OS_HEARTBEAT: OK
            </span>
            <span className="h-4 w-[1px] bg-white/[0.08] hidden sm:inline" />
            <span className="text-bodydark2 shrink-0 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-primary" />
              SYS_LATENCY: {pingMetric}ms
            </span>
            <span className="h-4 w-[1px] bg-white/[0.08] hidden sm:inline" />
            <span className="text-bodydark2 shrink-0">
              UPTIME: {formatUptime(uptimeSeconds)}
            </span>
          </div>

          <div className="text-[10px] text-right text-primary font-bold font-mono">
            {currentTime || "LOADING TELEMETRY..."}
          </div>
        </div>

        {/* Middle Row: Bezel Link Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Module 1: Brand Info */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 flex flex-col justify-between h-[200px] text-left">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 text-white">
                <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-chart-2 to-primary flex items-center justify-center">
                  <span className="text-[11px] font-extrabold text-black">⚡</span>
                </div>
                <span className="font-bold text-sm">NexPod AI OS</span>
              </div>
              <p className="text-[10px] text-bodydark2 leading-relaxed">
                Operating system layer designed for self-service retail hardware telemetry and real-time predictive restock coordination.
              </p>
            </div>
            <span className="text-[8px] text-slate-500 uppercase tracking-widest block font-bold mt-2">
              BUILD: PROD_v1.0.3
            </span>
          </div>

          {/* Module 2: Documentation Links */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 flex flex-col justify-between h-[200px] text-left">
            <h4 className="text-white font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5 pb-2 border-b border-white/[0.06]">
              <FileText className="w-3.5 h-3.5 text-primary" />
              01 // Documentation
            </h4>
            <ul className="space-y-2.5 flex-grow pt-4">
              <li>
                <a href="#docs" className="hover:text-white transition-colors flex items-center gap-2 group">
                  <span className="text-primary group-hover:translate-x-0.5 transition-transform">&gt;</span> 
                  System Architecture
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition-colors flex items-center gap-2 group">
                  <span className="text-primary group-hover:translate-x-0.5 transition-transform">&gt;</span>
                  Predictive Ops Engine
                </a>
              </li>
              <li>
                <a href="#roadmap" className="hover:text-white transition-colors flex items-center gap-2 group">
                  <span className="text-primary group-hover:translate-x-0.5 transition-transform">&gt;</span>
                  Future Roadmap
                </a>
              </li>
            </ul>
          </div>

          {/* Module 3: Product Links */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 flex flex-col justify-between h-[200px] text-left">
            <h4 className="text-white font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5 pb-2 border-b border-white/[0.06]">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              02 // Product Seams
            </h4>
            <ul className="space-y-2.5 flex-grow pt-4">
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors flex items-center gap-2 group">
                  <span className="text-cyan-400 group-hover:translate-x-0.5 transition-transform">&gt;</span>
                  Owner Dashboard
                </Link>
              </li>
              <li>
                <Link href="/customer" className="hover:text-white transition-colors flex items-center gap-2 group">
                  <span className="text-cyan-400 group-hover:translate-x-0.5 transition-transform">&gt;</span>
                  Customer App Portal
                </Link>
              </li>
              <li>
                <a href="#docs" className="hover:text-white transition-colors flex items-center gap-2 group">
                  <span className="text-cyan-400 group-hover:translate-x-0.5 transition-transform">&gt;</span>
                  Developer API Docs
                </a>
              </li>
            </ul>
          </div>

          {/* Module 4: System Control Console */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 flex flex-col justify-between h-[200px] text-left">
            <h4 className="text-white font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5 pb-2 border-b border-white/[0.06]">
              <Server className="w-3.5 h-3.5 text-chart-2" />
              03 // Systems Command
            </h4>
            
            <div className="space-y-3 pt-4 flex-grow flex flex-col justify-end">
              {/* Action 1: Ping Check */}
              <button 
                onClick={triggerPingCheck}
                disabled={pingState === "SCANNING"}
                className={cn(
                  "w-full px-3 py-1.5 rounded-lg border text-[9px] font-mono font-bold transition-all text-center flex items-center justify-between cursor-pointer",
                  pingState === "SCANNING" 
                    ? "bg-white/5 border-strokedark text-slate-500" 
                    : "bg-black/35 hover:bg-black/60 border-strokedark hover:border-white/20 text-white"
                )}
              >
                <span>SCAN DEVICE INTEGRITY</span>
                <span className={cn(
                  "font-bold",
                  pingState === "SCANNING" ? "text-amber-500 animate-pulse" : "text-emerald-400"
                )}>
                  {pingState}
                </span>
              </button>

              {/* Action 2: System Reboot */}
              <button 
                onClick={triggerSystemReboot}
                disabled={rebootState === "REBOOTING"}
                className={cn(
                  "w-full px-3 py-1.5 rounded-lg border text-[9px] font-mono font-bold transition-all text-center flex items-center justify-between cursor-pointer",
                  rebootState === "REBOOTING"
                    ? "bg-white/5 border-strokedark text-slate-500"
                    : "bg-black/35 hover:bg-black/60 border-strokedark hover:border-white/20 text-white"
                )}
              >
                <span>TRIGGER RECEPTOR REBOOT</span>
                <span className={cn(
                  "font-bold",
                  rebootState === "REBOOTING" ? "text-rose-500 animate-spin" : rebootState === "FINISHED" ? "text-emerald-400" : "text-bodydark2"
                )}>
                  {rebootState === "REBOOTING" ? <RotateCcw className="w-3 h-3" /> : rebootState}
                </span>
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Copyright & Badges */}
        <div className="border-t border-white/[0.06] pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px]">
          <p>© 2026 NexPod OS. Centralized Autonomous Retail Management. Built for MVP Demo.</p>
          <div className="flex gap-3">
            <span className="px-2.5 py-1 rounded-lg border border-white/[0.08] bg-white/[0.03] text-slate-400 hover:text-white transition-all cursor-pointer">
              Privacy Config
            </span>
            <span className="px-2.5 py-1 rounded-lg border border-white/[0.08] bg-white/[0.03] text-slate-400 hover:text-white transition-all cursor-pointer">
              System Seams
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
