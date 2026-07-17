"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, 
  PlayCircle, 
  HelpCircle, 
  Layers, 
  Smartphone, 
  Zap, 
  MapPin,
  Compass
} from "lucide-react";
import { cn } from "@/lib/utils";

type PhaseId = 1 | 2 | 3 | 4 | 5;

interface PhaseDetail {
  id: PhaseId;
  phase: string;
  title: string;
  desc: string;
  status: "Active • Production" | "Dev • In Progress" | "Spec • Planned" | "Design • Future" | "Research • Future";
  statusColor: string;
  features: string[];
  techStack: string[];
  icon: React.ComponentType<{ className?: string }>;
}

const PHASES: PhaseDetail[] = [
  {
    id: 1,
    phase: "PHASE 01",
    title: "Coffee Pods",
    desc: "Autonomous hot beverage telemetry engine. Tracks boiler temperatures, pump pressures, and volumetric flow.",
    status: "Active • Production",
    statusColor: "text-emerald-400 border-emerald-400/20 bg-emerald-400/10",
    features: [
      "Volumetric pressure loops calibration",
      "FastAPI real-time telemetry sink",
      "Supabase real-time client socket integration",
      "PostgreSQL snapshotted orders database"
    ],
    techStack: ["React", "FastAPI", "PostgreSQL", "Supabase"],
    icon: CheckCircle2
  },
  {
    id: 2,
    phase: "PHASE 02",
    title: "Snack Pods",
    desc: "Ambient snack and refrigerated dispensers. Adds temperature control loop monitoring and refrigeration telemetry.",
    status: "Dev • In Progress",
    statusColor: "text-primary border-primary/20 bg-primary/10",
    features: [
      "Refrigeration thermal controller monitors",
      "Coil motor solenoid actuator status",
      "Restock optimization routines for ambient items",
      "Dual-zone boiler and cooler diagnostics check"
    ],
    techStack: ["Python", "FastAPI", "Tailwind CSS", "TypeScript"],
    icon: PlayCircle
  },
  {
    id: 3,
    phase: "PHASE 03",
    title: "Parcel Lockers",
    desc: "IoT dynamic locker drop-off modules. Leverages dynamic OTP pin locks and weight sensor telemetry hooks.",
    status: "Spec • Planned",
    statusColor: "text-yellow-400 border-yellow-400/20 bg-yellow-400/10",
    features: [
      "OTP door solenoid release actuators",
      "Weight-sensor cargo volume checks",
      "Customer verification app barcode integration",
      "Dispatch notification loops"
    ],
    techStack: ["Next.js", "ESP32 Firmware", "Supabase Auth", "Webhooks"],
    icon: HelpCircle
  },
  {
    id: 4,
    phase: "PHASE 04",
    title: "EV Charging",
    desc: "Integrated electric grid charging metrics. Binds simulated electric grid adapters to the central OS.",
    status: "Design • Future",
    statusColor: "text-slate-400 border-slate-500/20 bg-slate-500/10",
    features: [
      "Smart grid load balancer adapters",
      "Billing rate calculator integrations",
      "Boiler + EV charging combined power diagnostics",
      "Simulated charger status triggers"
    ],
    techStack: ["Python API", "Postgres Timescale", "Chart.js"],
    icon: HelpCircle
  },
  {
    id: 5,
    phase: "PHASE 05",
    title: "Retail Infra",
    desc: "Decentralized automated micro-warehousing. Robot arm integrations and autonomous delivery loader docks.",
    status: "Research • Future",
    statusColor: "text-slate-400 border-slate-500/20 bg-slate-500/10",
    features: [
      "Simulated robotic arm actuator controls",
      "Central dispatch loader docking loops",
      "Inventory logistics simulation models",
      "OS dispatch priority calculations"
    ],
    techStack: ["Robotics Simulator", "Gemini 2.5 Pro", "Postgres"],
    icon: HelpCircle
  }
];

export function ConcentricRoadmap() {
  const [activePhase, setActivePhase] = useState<PhaseId>(1);
  const activeDetails = PHASES.find(p => p.id === activePhase)!;

  return (
    <div className="w-full">
      {/* Desktop Concentric Radar Orbit Map */}
      <div className="hidden lg:grid grid-cols-12 gap-12 items-center">
        
        {/* Left Side: Animated Orbit Map */}
        <div className="col-span-6 flex items-center justify-center relative h-[500px]">
          {/* Radar Background Sweeper Line */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[450px] h-[450px] rounded-full border border-white/5 relative overflow-hidden flex items-center justify-center bg-radial-gradient">
              {/* Sweeping line */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/2 left-1/2 w-[225px] h-[1px] bg-gradient-to-r from-primary/30 to-transparent origin-left -translate-y-1/2 z-0"
              />
            </div>
          </div>

          {/* Central OS Core */}
          <div className="relative z-10 w-16 h-16 rounded-full bg-white dark:bg-black border border-primary/40 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.15)]">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary"
            >
              <Compass className="w-5 h-5" />
            </motion.div>
            <span className="absolute top-[105%] font-mono text-[8px] text-slate-500 dark:text-bodydark2 tracking-wider uppercase whitespace-nowrap">
              NEXPOD_OS_CORE
            </span>
          </div>

          {/* Orbit Rings & Nodes */}
          {[
            { id: 1, size: 140, duration: 18, angle: 0 },
            { id: 2, size: 210, duration: 25, angle: 72 },
            { id: 3, size: 280, duration: 32, angle: 144 },
            { id: 4, size: 350, duration: 40, angle: 216 },
            { id: 5, size: 420, duration: 48, angle: 288 },
          ].map((orbit) => {
            const isSelected = activePhase === orbit.id;
            const phaseInfo = PHASES.find(p => p.id === orbit.id)!;

            return (
              <motion.div
                key={orbit.id}
                style={{
                  width: `${orbit.size}px`,
                  height: `${orbit.size}px`,
                }}
                className={cn(
                  "absolute rounded-full border border-dashed transition-colors duration-500 pointer-events-none flex items-center justify-center z-10",
                  isSelected ? "border-primary/45" : "border-black/10 dark:border-white/10"
                )}
                animate={{ rotate: 360 }}
                transition={{ duration: orbit.duration, repeat: Infinity, ease: "linear" }}
              >
                {/* Node Button positioned on the border of the rotating orbit */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActivePhase(orbit.id as PhaseId);
                  }}
                  onMouseEnter={() => setActivePhase(orbit.id as PhaseId)}
                  style={{
                    transform: `rotate(-${orbit.angle}deg) translateY(-${orbit.size / 2}px)`,
                  }}
                  className={cn(
                    "absolute h-7 w-7 rounded-full border flex items-center justify-center transition-all duration-300 pointer-events-auto cursor-pointer shadow-lg",
                    isSelected 
                      ? "bg-primary border-primary text-black scale-125 shadow-[0_0_15px_rgba(59,130,246,0.4)]" 
                      : "bg-white dark:bg-black border-strokedark text-bodydark hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white"
                  )}
                >
                  <span className="text-[10px] font-mono font-bold">{orbit.id}</span>
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Right Side: Command Specifications Card */}
        <div className="col-span-6 flex flex-col justify-center">
          <div className="w-full bg-[#0c0c0e] border border-white/[0.08] rounded-3xl p-6 md:p-8 shadow-2xl relative select-none text-left flex flex-col justify-between min-h-[420px] text-white">
            {/* Bezel header */}
            <div className="flex justify-between items-center border-b border-strokedark/60 pb-4 mb-6 font-mono text-[9px] text-bodydark2">
              <span className="text-white font-bold">{activeDetails.phase} SPECIFICATION</span>
              <span>ENGINE: ROADMAP_SYSTEM</span>
            </div>

            <div className="space-y-6 flex-grow">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="text-xl font-extrabold text-white tracking-tight">{activeDetails.title}</h3>
                  <p className="text-xs text-bodydark2 mt-2 leading-relaxed max-w-md">
                    {activeDetails.desc}
                  </p>
                </div>
                <span className={cn(
                  "text-[9px] font-mono font-bold px-2.5 py-1 rounded-lg border uppercase tracking-wider shrink-0",
                  activeDetails.statusColor
                )}>
                  {activeDetails.status}
                </span>
              </div>

              {/* Phase sub features checklist */}
              <div className="space-y-2">
                <span className="text-[9px] font-mono text-primary uppercase font-bold tracking-wider block">Key Deliverables</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono text-bodydark">
                  {activeDetails.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">▪</span>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technologies */}
              <div className="space-y-2">
                <span className="text-[9px] font-mono text-primary uppercase font-bold tracking-wider block">Tech Stack</span>
                <div className="flex flex-wrap gap-2">
                  {activeDetails.techStack.map((tech, idx) => (
                    <span 
                      key={idx} 
                      className="px-2 py-0.5 rounded-lg border border-strokedark bg-black/40 text-[10px] font-mono text-bodydark2"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bezel footer */}
            <div className="flex justify-between items-center border-t border-strokedark/60 pt-4 mt-6 font-mono text-[9px] text-bodydark2">
              <span>ORBIT_CYC: PHASE_0{activePhase}</span>
              <span>NEXPOD ROADMAP v1.0</span>
            </div>
          </div>
        </div>

      </div>

      {/* Mobile/Tablet Linear Timeline Layout */}
      <div className="lg:hidden flex flex-col space-y-8 text-left">
        <div className="relative border-l border-strokedark/60 ml-4 pl-8 space-y-10 py-2">
          {PHASES.map((phase) => {
            const Icon = phase.icon;
            return (
              <div key={phase.id} className="relative">
                {/* Timeline node */}
                <div className="absolute -left-[45px] top-0.5 h-8 w-8 rounded-full border border-strokedark bg-white dark:bg-black flex items-center justify-center text-primary shadow-[0_0_10px_rgba(59,130,246,0.1)]">
                  <span className="text-[10px] font-mono font-bold">{phase.id}</span>
                </div>

                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-[9px] font-mono text-primary uppercase tracking-wider font-bold">
                      {phase.phase}
                    </span>
                    <span className={cn(
                      "text-[8px] font-mono px-2 py-0.5 rounded border uppercase tracking-wider",
                      phase.statusColor
                    )}>
                      {phase.status}
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-black dark:text-white font-mono">{phase.title}</h3>
                  <p className="text-xs text-bodydark2 leading-relaxed">
                    {phase.desc}
                  </p>

                  <div className="space-y-1.5 font-mono text-[10px] text-bodydark pt-1">
                    {phase.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-1.5">
                        <span className="text-primary">•</span>
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
