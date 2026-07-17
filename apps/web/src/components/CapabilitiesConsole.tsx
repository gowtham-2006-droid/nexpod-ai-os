"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Radio, 
  Database, 
  Brain, 
  AlertTriangle, 
  Smartphone,
  CheckCircle,
  Cpu,
  RefreshCw,
  TrendingUp,
  Activity,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";

type TabId = "telemetry" | "inventory" | "ai" | "diagnostics" | "customizer";

interface CapabilityTab {
  id: TabId;
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const CAPABILITIES: CapabilityTab[] = [
  {
    id: "telemetry",
    title: "Live Telemetry Stream",
    desc: "Monitor pressure, water flow, and boiler temperatures polled on 5s active IoT sensor ticks.",
    icon: Radio,
    badge: "Real-time"
  },
  {
    id: "inventory",
    title: "Smart Inventory",
    desc: "Track coffee beans, cups, and ingredients down to the gram with dynamic refilling alerts.",
    icon: Database,
  },
  {
    id: "ai",
    title: "AI Operations Agent",
    desc: "Gemini-powered alerts advising operators on route dispatch timing and local demand peaks.",
    icon: Brain,
    badge: "AI Powered"
  },
  {
    id: "diagnostics",
    title: "Diagnostics Node",
    desc: "Instant error codes (overheat, pump fatigue) triggering remote reboots and alerts.",
    icon: AlertTriangle,
  },
  {
    id: "customizer",
    title: "Customer Customizer",
    desc: "User drink customizer portal with milk selection and sweetness customization dials.",
    icon: Smartphone,
  }
];

export function CapabilitiesConsole() {
  const [activeTab, setActiveTab] = useState<TabId>("telemetry");
  const [openMobileAccordion, setOpenMobileAccordion] = useState<TabId | null>("telemetry");

  // Telemetry state simulation
  const [boilerTemp, setBoilerTemp] = useState(93.4);
  const [pumpPressure, setPumpPressure] = useState(15.2);
  const [waterFlow, setWaterFlow] = useState(2.4);

  // Inventory state simulation
  const [waterLevel, setWaterLevel] = useState(84);
  const [beanLevel, setBeanLevel] = useState(73);
  const [milkLevel, setMilkLevel] = useState(28);

  // Diagnostics check state simulation
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);

  // Customer Customizer State
  const [drinkType, setDrinkType] = useState<"espresso" | "cappuccino" | "latte">("cappuccino");
  const [milkType, setMilkType] = useState<"Whole" | "Oat" | "Almond">("Oat");
  const [sweetness, setSweetness] = useState<"None" | "Half" | "Regular">("Regular");

  // Simulation Interval loops
  useEffect(() => {
    const timer = setInterval(() => {
      // Fluctuate Telemetry slightly
      setBoilerTemp((prev) => parseFloat((prev + (Math.random() * 0.4 - 0.2)).toFixed(1)));
      setPumpPressure((prev) => parseFloat((prev + (Math.random() * 0.2 - 0.1)).toFixed(1)));
      setWaterFlow((prev) => parseFloat((prev + (Math.random() * 0.1 - 0.05)).toFixed(2)));
    }, 2000);

    return () => clearInterval(timer);
  }, []);

  const runDiagnostics = () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanStep(1);
    
    setTimeout(() => setScanStep(2), 800);
    setTimeout(() => setScanStep(3), 1600);
    setTimeout(() => setScanStep(4), 2400);
    setTimeout(() => {
      setIsScanning(false);
      setScanStep(4); // scan finished successfully
    }, 3200);
  };

  const refillIngredients = () => {
    setWaterLevel(100);
    setBeanLevel(100);
    setMilkLevel(100);
  };

  const handleAccordionToggle = (id: TabId) => {
    setOpenMobileAccordion(openMobileAccordion === id ? null : id);
    setActiveTab(id);
  };

  return (
    <div className="w-full">
      {/* Desktop Split Layout */}
      <div className="hidden lg:grid grid-cols-12 gap-10 items-stretch">
        
        {/* Left Column: Vertical Interactive Menu */}
        <div className="col-span-5 flex flex-col justify-start space-y-4">
          <span className="text-[10px] font-mono text-primary uppercase tracking-[0.25em] font-bold block mb-2 text-left">
            Interactive Capabilities
          </span>
          <h2 className="text-3xl font-extrabold text-black dark:text-white tracking-tight text-left mb-6">
            NexPod capabilities console.
          </h2>

          <div className="flex flex-col space-y-3">
            {CAPABILITIES.map((cap) => {
              const Icon = cap.icon;
              const isActive = activeTab === cap.id;

              return (
                <button
                  key={cap.id}
                  onMouseEnter={() => setActiveTab(cap.id)}
                  onClick={() => setActiveTab(cap.id)}
                  className={cn(
                    "w-full text-left p-5 rounded-2xl border transition-all duration-300 flex items-start gap-4 cursor-pointer relative overflow-hidden group",
                    isActive 
                      ? "bg-boxdark border-primary/20 shadow-[0_0_20px_rgba(59,130,246,0.05)]" 
                      : "bg-transparent border-strokedark/30 hover:border-strokedark hover:bg-black/5 dark:hover:bg-white/5"
                  )}
                >
                  {/* Subtle active tab border glow */}
                  {isActive && (
                    <motion.div 
                      layoutId="activeTabOutline" 
                      className="absolute inset-0 border border-primary/45 rounded-2xl pointer-events-none z-20"
                    />
                  )}

                  <div className={cn(
                    "p-3 rounded-xl border transition-colors",
                    isActive 
                      ? "bg-primary/10 border-primary/20 text-primary" 
                      : "bg-black/5 dark:bg-black/40 border-strokedark/40 text-bodydark2 group-hover:text-black dark:group-hover:text-white"
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-grow space-y-1">
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        "text-sm font-bold font-mono transition-colors",
                        isActive ? "text-black dark:text-white" : "text-bodydark group-hover:text-black dark:group-hover:text-white"
                      )}>
                        {cap.title}
                      </span>
                      {cap.badge && (
                        <span className="text-[8px] font-mono font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider">
                          {cap.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-bodydark2 leading-relaxed">
                      {cap.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: High-fidelity Live Updating Screen */}
        <div className="col-span-7 flex flex-col justify-center">
          <div className="w-full bg-[#0c0c0e] border border-white/[0.08] rounded-3xl p-6 md:p-8 shadow-2xl relative select-none flex flex-col justify-between h-[520px] text-white">
            {/* Ambient Bezel details */}
            <div className="absolute top-0 right-0 w-44 h-44 bg-primary/5 rounded-full blur-[50px] pointer-events-none" />
            
            {/* Bezel Terminal Header */}
            <div className="flex justify-between items-center border-b border-white/[0.08] pb-4 mb-4 shrink-0 font-mono text-[10px]">
              <span className="flex items-center gap-2 text-white">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                CONSOLE_MONITOR: ACTIVE
              </span>
              <span className="text-bodydark2 flex items-center gap-3">
                <span>MEM_USAGE: 42%</span>
                <span>OS_VER: v1.0.3</span>
              </span>
            </div>

            {/* Screen Content Wrapper */}
            <div className="flex-1 flex flex-col justify-center overflow-hidden">
              <AnimatePresence mode="wait">
                {activeTab === "telemetry" && (
                  <motion.div
                    key="telemetry"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6 w-full text-left"
                  >
                    <div className="grid grid-cols-3 gap-4 font-mono text-center">
                      <div className="bg-black/30 border border-white/[0.08] p-4 rounded-2xl">
                        <span className="text-[9px] text-bodydark2 uppercase tracking-wider block mb-1">Boiler Temperature</span>
                        <div className="text-white text-lg font-bold flex items-center justify-center gap-1">
                          <Activity className="w-4 h-4 text-rose-500 animate-pulse" />
                          {boilerTemp}°C
                        </div>
                      </div>
                      <div className="bg-black/30 border border-white/[0.08] p-4 rounded-2xl">
                        <span className="text-[9px] text-bodydark2 uppercase tracking-wider block mb-1">Water Pressure</span>
                        <div className="text-primary text-lg font-bold flex items-center justify-center gap-1">
                          <Cpu className="w-4 h-4 text-primary" />
                          {pumpPressure} Bar
                        </div>
                      </div>
                      <div className="bg-black/30 border border-white/[0.08] p-4 rounded-2xl">
                        <span className="text-[9px] text-bodydark2 uppercase tracking-wider block mb-1">Volumetric Flow</span>
                        <div className="text-chart-2 text-lg font-bold flex items-center justify-center gap-1">
                          <Radio className="w-4 h-4 text-chart-2" />
                          {waterFlow} L/m
                        </div>
                      </div>
                    </div>

                    {/* Waveform graphic simulating realtime ticks */}
                    <div className="h-32 w-full bg-black/40 border border-white/[0.08] rounded-2xl relative overflow-hidden flex flex-col justify-end p-4">
                      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 120" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="waveGlow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.2)" />
                            <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
                          </linearGradient>
                        </defs>
                        <path
                          d={`M0,60 Q50,${60 - boilerTemp * 0.2} 100,${60 + pumpPressure * 1.5} T200,60 T300,${60 - waterFlow * 12} T400,60`}
                          fill="url(#waveGlow)"
                          stroke="rgb(59, 130, 246)"
                          strokeWidth="2"
                          className="transition-all duration-1000 ease-in-out"
                        />
                        <line x1="0" y1="60" x2="400" y2="60" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                      </svg>
                      <div className="flex justify-between items-center z-10 font-mono text-[9px] text-bodydark2">
                        <span>SENSOR INTERRUPT CYCLE: NOMINAL</span>
                        <span>FREQ: 5.2 Hz</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "inventory" && (
                  <motion.div
                    key="inventory"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6 w-full text-left"
                  >
                    <div className="space-y-4">
                      {/* Water Level */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-mono">
                          <span className="text-white">Boiler Water Tank</span>
                          <span className="text-bodydark2">{waterLevel}% Capacity</span>
                        </div>
                        <div className="w-full h-3 bg-black/40 border border-white/[0.08] rounded-full overflow-hidden">
                          <motion.div 
                            animate={{ width: `${waterLevel}%` }}
                            className="h-full bg-cyan-500 rounded-full"
                          />
                        </div>
                      </div>

                      {/* Bean Level */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-mono">
                          <span className="text-white">Coffee Beans Hopper</span>
                          <span className="text-bodydark2">{beanLevel}% Remaining</span>
                        </div>
                        <div className="w-full h-3 bg-black/40 border border-white/[0.08] rounded-full overflow-hidden">
                          <motion.div 
                            animate={{ width: `${beanLevel}%` }}
                            className="h-full bg-yellow-600 rounded-full"
                          />
                        </div>
                      </div>

                      {/* Milk Level */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-mono">
                          <span className="text-white flex items-center gap-1.5">
                            Chilled Milk Reservoir
                            {milkLevel < 30 && (
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                            )}
                          </span>
                          <span className={cn(
                            "font-bold font-mono",
                            milkLevel < 30 ? "text-rose-500" : "text-bodydark2"
                          )}>
                            {milkLevel}% {milkLevel < 30 && "(LOW STOCK)"}
                          </span>
                        </div>
                        <div className="w-full h-3 bg-black/40 border border-white/[0.08] rounded-full overflow-hidden">
                          <motion.div 
                            animate={{ width: `${milkLevel}%` }}
                            className={cn(
                              "h-full rounded-full transition-colors",
                              milkLevel < 30 ? "bg-rose-500" : "bg-white"
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-4 pt-2">
                      <button 
                        onClick={refillIngredients}
                        className="px-4 py-2 border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-mono font-bold transition-all cursor-pointer"
                      >
                        Refill Ingredients
                      </button>
                      <span className="text-[10px] font-mono text-bodydark2">
                        * Simulates dispatch refilling payload updates.
                      </span>
                    </div>
                  </motion.div>
                )}

                {activeTab === "ai" && (
                  <motion.div
                    key="ai"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-5 w-full text-left"
                  >
                    <div className="bg-primary/5 border border-primary/20 p-4 rounded-2xl space-y-2 relative overflow-hidden">
                      <div className="absolute top-2 right-2 text-primary">
                        <Brain className="w-5 h-5 opacity-40 animate-pulse" />
                      </div>
                      <span className="text-[9px] font-mono text-primary uppercase font-bold tracking-wider block">Predictive Ops Recommendation</span>
                      <h4 className="text-white font-mono text-xs font-bold">Milk Refill Dispatch Suggested</h4>
                      <p className="text-[11px] text-bodydark2 leading-relaxed">
                        Gemini LLM model warns: **Pod 03** will deplete its milk reservoir in **2.8 hours** based on evening rush traffic logs. Refill route dispatch is advised.
                      </p>
                    </div>

                    <div className="bg-black/30 border border-white/[0.08] rounded-2xl p-4 space-y-2.5 font-mono text-[9px] text-bodydark">
                      <div className="flex justify-between border-b border-white/[0.08] pb-1.5">
                        <span className="text-white">DISPATCH TARGET:</span>
                        <span>POD_SYSTEM_03</span>
                      </div>
                      <div className="flex justify-between border-b border-white/[0.08] pb-1.5">
                        <span className="text-white">OPTIMIZED ROUTE TIME:</span>
                        <span className="text-emerald-500">14 MINS (ESTIMATED)</span>
                      </div>
                      <div className="flex justify-between pb-0.5">
                        <span className="text-white">INVENTORY SAVED PRE-EMPTIVE:</span>
                        <span>INR 1,240 LOSS PREVENTED</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button className="px-4 py-2 bg-primary text-black hover:bg-primary/95 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer">
                        Approve Dispatch
                      </button>
                      <button className="px-4 py-2 border border-white/[0.08] bg-black/40 hover:bg-black/60 text-white rounded-xl text-xs font-mono font-bold transition-all cursor-pointer">
                        Recalculate Route
                      </button>
                    </div>
                  </motion.div>
                )}

                {activeTab === "diagnostics" && (
                  <motion.div
                    key="diagnostics"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6 w-full text-left"
                  >
                    <div className="bg-black/40 border border-white/[0.08] rounded-2xl p-4 space-y-2 h-44 overflow-y-auto font-mono text-[10px] leading-relaxed no-scrollbar select-text">
                      <div className="text-chart-4">&gt;&gt; Initialize Pod Diagnostics Loop(id=pod_03)...</div>
                      {scanStep >= 1 && <div className="text-bodydark2">[Info] Checking Boiler temperature sensor... OK</div>}
                      {scanStep >= 2 && <div className="text-bodydark2">[Info] Checking Water pressure pump limits... OK</div>}
                      {scanStep >= 3 && <div className="text-bodydark2">[Info] Reading active WiFI connection RSSI: -64dBm... NOMINAL</div>}
                      {scanStep >= 4 && (
                        <div className="text-emerald-500 font-bold mt-1">
                          &gt;&gt; System Diagnostics check finished: 0 errors detected. Pod Nominal.
                        </div>
                      )}
                      {isScanning && (
                        <div className="text-primary flex items-center gap-1.5 mt-1 animate-pulse">
                          <span className="w-1.5 h-1.5 bg-primary rounded-full animate-ping" />
                          Executing diagnostics scan...
                        </div>
                      )}
                    </div>

                    <div className="flex gap-4 items-center">
                      <button 
                        onClick={runDiagnostics}
                        disabled={isScanning}
                        className={cn(
                          "px-4 py-2 border border-white/10 text-white rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer",
                          isScanning 
                            ? "bg-white/5 opacity-50 cursor-not-allowed" 
                            : "bg-white/5 hover:bg-white/10 hover:border-white/20"
                        )}
                      >
                        <RefreshCw className={cn("w-3.5 h-3.5", isScanning && "animate-spin")} />
                        Trigger Diagnostics Check
                      </button>
                      <span className="text-[10px] font-mono text-bodydark2">
                        * Checks sensor integrity metrics remotely.
                      </span>
                    </div>
                  </motion.div>
                )}

                {activeTab === "customizer" && (
                  <motion.div
                    key="customizer"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch w-full text-left"
                  >
                    {/* Selectors Panel */}
                    <div className="space-y-4 flex flex-col justify-between">
                      {/* Drink Type */}
                      <div className="space-y-1">
                        <span className="text-[9px] text-bodydark2 font-mono uppercase tracking-wider block">Beverage Selection</span>
                        <div className="flex gap-1.5">
                          {(["espresso", "cappuccino", "latte"] as const).map((d) => (
                            <button
                              key={d}
                              onClick={() => setDrinkType(d)}
                              className={cn(
                                "px-3 py-1 rounded-lg border text-[10px] font-mono capitalize transition-all cursor-pointer",
                                drinkType === d
                                  ? "bg-white text-black border-white font-bold"
                                  : "bg-black/35 border-white/10 text-slate-400 hover:text-white"
                              )}
                            >
                              {d}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Milk Select */}
                      <div className="space-y-1">
                        <span className="text-[9px] text-bodydark2 font-mono uppercase tracking-wider block">Milk Selection</span>
                        <div className="flex gap-1.5">
                          {(["Whole", "Oat", "Almond"] as const).map((m) => (
                            <button
                              key={m}
                              onClick={() => setMilkType(m)}
                              className={cn(
                                "px-3 py-1 rounded-lg border text-[10px] font-mono transition-all cursor-pointer",
                                milkType === m
                                  ? "bg-white text-black border-white font-bold"
                                  : "bg-black/35 border-white/10 text-slate-400 hover:text-white"
                              )}
                            >
                              {m}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Sweetness Selector */}
                      <div className="space-y-1">
                        <span className="text-[9px] text-bodydark2 font-mono uppercase tracking-wider block">Sweetness Level</span>
                        <div className="flex gap-1.5">
                          {(["None", "Half", "Regular"] as const).map((s) => (
                            <button
                              key={s}
                              onClick={() => setSweetness(s)}
                              className={cn(
                                "px-3 py-1 rounded-lg border text-[10px] font-mono transition-all cursor-pointer",
                                sweetness === s
                                  ? "bg-white text-black border-white font-bold"
                                  : "bg-black/35 border-white/10 text-slate-400 hover:text-white"
                              )}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Drink composition visual renderer */}
                    <div className="bg-black/40 border border-white/[0.08] rounded-2xl p-4 flex flex-col justify-between items-center relative overflow-hidden">
                      <span className="text-[9px] font-mono text-bodydark2 uppercase tracking-wider">Visual Recipe Composition</span>
                      
                      {/* Mini visual mockup cup */}
                      <div className="relative w-20 h-28 border-2 border-white/20 rounded-b-3xl mt-4 flex flex-col justify-end overflow-hidden bg-black/10">
                        {/* Sweetness base */}
                        {sweetness !== "None" && (
                          <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: sweetness === "Half" ? "8px" : "15px" }}
                            className="w-full bg-amber-400 opacity-60 z-10 shrink-0" 
                          />
                        )}
                        {/* Espresso Base */}
                        <motion.div 
                          initial={{ height: 0 }}
                          animate={{ height: drinkType === "espresso" ? "80%" : "30px" }}
                          className="w-full bg-[#3c2f2f] shrink-0" 
                        />
                        {/* Milk Layer */}
                        {drinkType !== "espresso" && (
                          <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: drinkType === "latte" ? "65px" : "40px" }}
                            className="w-full bg-[#f4ece1] opacity-90 shrink-0 flex items-center justify-center"
                          >
                            <span className="text-[8px] font-mono text-black/55 capitalize">{milkType}</span>
                          </motion.div>
                        )}
                      </div>

                      <div className="mt-4 font-mono text-[9px] text-bodydark2 text-center">
                        <span className="text-white block font-bold capitalize">{drinkType}</span>
                        <span>{milkType} Milk • {sweetness} Sweetness</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bezel Terminal Footer */}
            <div className="flex justify-between items-center border-t border-strokedark/60 pt-4 mt-4 shrink-0 font-mono text-[9px] text-bodydark2">
              <span>ACTIVE_TAB: {activeTab.toUpperCase()}</span>
              <span>INLINE STATUS: NOMINAL</span>
            </div>
          </div>
        </div>

      </div>

      {/* Mobile/Tablet Collapsible Accordion Layout */}
      <div className="lg:hidden flex flex-col space-y-4">
        <span className="text-[10px] font-mono text-primary uppercase tracking-[0.25em] font-bold block text-center mb-1">
          Capabilities
        </span>
        <h2 className="text-2xl font-extrabold text-black dark:text-white tracking-tight text-center mb-6">
          System capabilities.
        </h2>

        <div className="space-y-3">
          {CAPABILITIES.map((cap) => {
            const Icon = cap.icon;
            const isOpen = openMobileAccordion === cap.id;

            return (
              <div 
                key={cap.id}
                className={cn(
                  "border rounded-2xl overflow-hidden transition-all duration-300 bg-boxdark/30",
                  isOpen ? "border-primary/30" : "border-strokedark/30"
                )}
              >
                {/* Accordion Trigger Header */}
                <button
                  onClick={() => handleAccordionToggle(cap.id)}
                  className="w-full flex items-center justify-between p-5 text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2.5 rounded-lg border",
                      isOpen ? "bg-primary/10 border-primary/20 text-primary" : "bg-black/5 dark:bg-black/40 border-strokedark/40 text-bodydark2"
                    )}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold font-mono text-black dark:text-white capitalize">{cap.title}</span>
                  </div>
                  <ChevronDown className={cn("w-4 h-4 text-bodydark2 transition-transform duration-300", isOpen && "rotate-180")} />
                </button>

                {/* Accordion Content wrapper */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-strokedark/30"
                    >
                      <div className="p-5 space-y-4">
                        <p className="text-xs text-bodydark2 leading-relaxed text-left">
                          {cap.desc}
                        </p>

                        {/* High fidelity inline preview based on active id */}
                        <div className="bg-[#0c0c0e] border border-white/[0.08] rounded-2xl p-4 text-white">
                          {cap.id === "telemetry" && (
                            <div className="grid grid-cols-3 gap-2 font-mono text-[9px] text-center">
                              <div className="bg-black/30 border border-strokedark/50 p-2.5 rounded-xl">
                                <span className="text-bodydark2 block mb-0.5">Boiler Temp</span>
                                <span className="text-white font-bold block">{boilerTemp}°C</span>
                              </div>
                              <div className="bg-black/30 border border-strokedark/50 p-2.5 rounded-xl">
                                <span className="text-bodydark2 block mb-0.5">Pressure</span>
                                <span className="text-primary font-bold block">{pumpPressure} Bar</span>
                              </div>
                              <div className="bg-black/30 border border-strokedark/50 p-2.5 rounded-xl">
                                <span className="text-bodydark2 block mb-0.5">Flow</span>
                                <span className="text-chart-2 font-bold block">{waterFlow} L/m</span>
                              </div>
                            </div>
                          )}

                          {cap.id === "inventory" && (
                            <div className="space-y-3 font-mono text-[9px] text-left">
                              <div>
                                <div className="flex justify-between mb-0.5">
                                  <span>Water Tank</span>
                                  <span>{waterLevel}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                                  <div className="h-full bg-cyan-500" style={{ width: `${waterLevel}%` }} />
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between mb-0.5">
                                  <span>Beans Hopper</span>
                                  <span>{beanLevel}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                                  <div className="h-full bg-yellow-600" style={{ width: `${beanLevel}%` }} />
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between mb-0.5">
                                  <span>Milk Level</span>
                                  <span>{milkLevel}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                                  <div className="h-full bg-rose-500" style={{ width: `${milkLevel}%` }} />
                                </div>
                              </div>
                            </div>
                          )}

                          {cap.id === "ai" && (
                            <div className="text-left font-mono text-[9px] space-y-1.5 leading-relaxed">
                              <span className="text-primary font-bold block">RECOMMENDATION</span>
                              <span className="text-white block">Suggest refill dispatch target at Pod 03 in 2.8 hours.</span>
                              <span className="text-bodydark2 block">Optimized Technician Route: 14 mins.</span>
                            </div>
                          )}

                          {cap.id === "diagnostics" && (
                            <div className="text-left font-mono text-[9px] space-y-1 select-text">
                              <div>&gt;&gt; Running Remote diagnostics...</div>
                              <div>Checking temp probe: OK</div>
                              <div>Checking pump levels: OK</div>
                              <div className="text-emerald-500">Nominal check OK.</div>
                            </div>
                          )}

                          {cap.id === "customizer" && (
                            <div className="font-mono text-[9px] text-left space-y-1">
                              <div className="flex justify-between">
                                <span className="text-bodydark2">Drink Type:</span>
                                <span className="text-white capitalize">{drinkType}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-bodydark2">Milk Choice:</span>
                                <span className="text-white">{milkType}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-bodydark2">Sweetness:</span>
                                <span className="text-white">{sweetness}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
