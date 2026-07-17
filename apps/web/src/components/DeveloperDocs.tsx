"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Terminal, 
  Cpu, 
  Database, 
  Copy, 
  Check, 
  Link2,
  FileCode,
  Layers,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

type DocTabId = "api" | "esp32" | "db";

interface CodeToken {
  text: string;
  color?: string;
}

interface CodeLine {
  tokens: CodeToken[];
}

interface DocContent {
  id: DocTabId;
  tabTitle: string;
  title: string;
  desc: string;
  filename: string;
  language: string;
  icon: React.ComponentType<{ className?: string }>;
  codeLines: CodeLine[];
  rawCode: string;
}

const DOCS_DATA: DocContent[] = [
  {
    id: "api",
    tabTitle: "IoT Ingest API",
    title: "HTTP Volumetric Ingest API",
    desc: "Post sensor telemetry parameters directly to the centralized ingestion pipeline. Every packet is validated and parsed in real-time.",
    filename: "ingest_endpoint.sh",
    language: "bash",
    icon: Terminal,
    rawCode: `curl -X POST "https://api.nexpod.ai/v1/telemetry" \\
  -H "Content-Type: application/json" \\
  -H "X-Device-Token: pod_token_8829" \\
  -d '{
    "pod_id": "pod_system_03",
    "boiler_temp_c": 93.4,
    "pressure_bar": 15.2,
    "water_flow_lm": 2.41,
    "ingredients": {
      "water_ml": 840,
      "beans_g": 730,
      "milk_ml": 280
    }
  }'`,
    codeLines: [
      { tokens: [{ text: "curl", color: "text-rose-500 font-bold" }, { text: " -X POST " }, { text: '"https://api.nexpod.ai/v1/telemetry"', color: "text-amber-400" }, { text: " \\" }] },
      { tokens: [{ text: "  -H " }, { text: '"Content-Type: application/json"', color: "text-amber-400" }, { text: " \\" }] },
      { tokens: [{ text: "  -H " }, { text: '"X-Device-Token: pod_token_8829"', color: "text-amber-400" }, { text: " \\" }] },
      { tokens: [{ text: "  -d " }, { text: "'{", color: "text-amber-400" }] },
      { tokens: [{ text: '    "pod_id": "pod_system_03",', color: "text-cyan-400" }] },
      { tokens: [{ text: '    "boiler_temp_c": 93.4,', color: "text-cyan-400" }] },
      { tokens: [{ text: '    "pressure_bar": 15.2,', color: "text-cyan-400" }] },
      { tokens: [{ text: '    "water_flow_lm": 2.41,', color: "text-cyan-400" }] },
      { tokens: [{ text: '    "ingredients": {', color: "text-cyan-400" }] },
      { tokens: [{ text: '      "water_ml": 840,', color: "text-cyan-400" }] },
      { tokens: [{ text: '      "beans_g": 730,', color: "text-cyan-400" }] },
      { tokens: [{ text: '      "milk_ml": 280', color: "text-cyan-400" }] },
      { tokens: [{ text: "    }", color: "text-cyan-400" }] },
      { tokens: [{ text: "  }'", color: "text-amber-400" }] }
    ]
  },
  {
    id: "esp32",
    tabTitle: "ESP32 Firmware Code",
    title: "ESP32 C++ Connection Loop",
    desc: "Connect your physical micro-controllers to the NexPod gateway. Below is the reference loop for posting volumetric records.",
    filename: "esp32_firmware.cpp",
    language: "cpp",
    icon: Cpu,
    rawCode: `#include <WiFi.h>
#include <HTTPClient.h>

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin("https://api.nexpod.ai/v1/telemetry");
    http.addHeader("Content-Type", "application/json");
    http.addHeader("X-Device-Token", "pod_token_8829");

    String json = "{\\"pod_id\\":\\"pod_03\\",\\"boiler_temp_c\\":93.4}";
    int responseCode = http.POST(json);
    http.end();
  }
  delay(5000); // Poll on 5s ticks
}`,
    codeLines: [
      { tokens: [{ text: "#include", color: "text-rose-500 font-bold" }, { text: " <WiFi.h>", color: "text-emerald-400" }] },
      { tokens: [{ text: "#include", color: "text-rose-500 font-bold" }, { text: " <HTTPClient.h>", color: "text-emerald-400" }] },
      { tokens: [] },
      { tokens: [{ text: "void", color: "text-rose-500 font-bold" }, { text: " " }, { text: "loop", color: "text-blue-400" }, { text: "() {" }] },
      { tokens: [{ text: "  if", color: "text-rose-500 font-bold" }, { text: " (WiFi.status() == WL_CONNECTED) {" }] },
      { tokens: [{ text: "    HTTPClient http;" }] },
      { tokens: [{ text: "    http.begin(" }, { text: '"https://api.nexpod.ai/v1/telemetry"', color: "text-amber-400" }, { text: ");" }] },
      { tokens: [{ text: "    http.addHeader(" }, { text: '"Content-Type"', color: "text-amber-400" }, { text: ", " }, { text: '"application/json"', color: "text-amber-400" }, { text: ");" }] },
      { tokens: [{ text: "    http.addHeader(" }, { text: '"X-Device-Token"', color: "text-amber-400" }, { text: ", " }, { text: '"pod_token_8829"', color: "text-amber-400" }, { text: ");" }] },
      { tokens: [] },
      { tokens: [{ text: "    String json = " }, { text: '"{\\"pod_id\\":\\"pod_03\\",\\"boiler_temp_c\\":93.4}"', color: "text-amber-400" }, { text: ";" }] },
      { tokens: [{ text: "    int", color: "text-rose-500 font-bold" }, { text: " responseCode = http.POST(json);" }] },
      { tokens: [{ text: "    http.end();" }] },
      { tokens: [{ text: "  }" }] },
      { tokens: [{ text: "  delay(5000); " }, { text: "// Poll on 5s ticks", color: "text-slate-500 italic" }] },
      { tokens: [{ text: "}" }] }
    ]
  },
  {
    id: "db",
    tabTitle: "Database Schema",
    title: "PostgreSQL Database Schema",
    desc: " dDB schema snapshotted metrics definitions storing flow ticks, volumetric records, and pressure indexes.",
    filename: "schema.sql",
    language: "sql",
    icon: Database,
    rawCode: `-- Table storing real-time telemetry snapshots
CREATE TABLE pod_telemetry_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pod_id TEXT REFERENCES active_pods(id),
  boiler_temp NUMERIC(4,1) NOT NULL,
  pump_pressure NUMERIC(4,1) NOT NULL,
  water_flow NUMERIC(3,2) NOT NULL,
  logged_at TIMESTAMPTZ DEFAULT NOW()
);`,
    codeLines: [
      { tokens: [{ text: "-- Table storing real-time telemetry snapshots", color: "text-slate-500 italic" }] },
      { tokens: [{ text: "CREATE TABLE", color: "text-rose-500 font-bold" }, { text: " pod_telemetry_history (" }] },
      { tokens: [{ text: "  id UUID " }, { text: "PRIMARY KEY", color: "text-rose-500 font-bold" }, { text: " DEFAULT gen_random_uuid()," }] },
      { tokens: [{ text: "  pod_id TEXT " }, { text: "REFERENCES", color: "text-rose-500 font-bold" }, { text: " active_pods(id)," }] },
      { tokens: [{ text: "  boiler_temp NUMERIC(4,1) " }, { text: "NOT NULL", color: "text-rose-500 font-bold" }, { text: "," }] },
      { tokens: [{ text: "  pump_pressure NUMERIC(4,1) " }, { text: "NOT NULL", color: "text-rose-500 font-bold" }, { text: "," }] },
      { tokens: [{ text: "  water_flow NUMERIC(3,2) " }, { text: "NOT NULL", color: "text-rose-500 font-bold" }, { text: "," }] },
      { tokens: [{ text: "  logged_at TIMESTAMPTZ " }, { text: "DEFAULT", color: "text-rose-500 font-bold" }, { text: " NOW()" }] },
      { tokens: [{ text: ");" }] }
    ]
  }
];

export function DeveloperDocs() {
  const [activeTab, setActiveTab] = useState<DocTabId>("api");
  const [copied, setCopied] = useState(false);
  const activeDoc = DOCS_DATA.find(d => d.id === activeTab)!;

  const copyCode = () => {
    navigator.clipboard.writeText(activeDoc.rawCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="docs" className="py-24 border-t border-strokedark/30 relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="space-y-4 text-center max-w-2xl mx-auto mb-16">
          <span className="text-[10px] font-mono text-primary uppercase tracking-[0.25em] font-bold block">
            Developer Docs
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-black dark:text-white tracking-tight">
            API Seams & Integration
          </h2>
          <p className="text-xs text-bodydark2 max-w-md mx-auto leading-relaxed">
            Integrate custom telemetry scripts, flash micro-controllers, or audit Postgres transaction tables directly.
          </p>
        </div>

        {/* Console Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          
          {/* Left Column: Navigation Tabs */}
          <div className="lg:col-span-4 flex flex-col justify-start space-y-3 text-left">
            {DOCS_DATA.map((doc) => {
              const Icon = doc.icon;
              const isActive = activeTab === doc.id;

              return (
                <button
                  key={doc.id}
                  onClick={() => setActiveTab(doc.id)}
                  className={cn(
                    "w-full text-left p-4 rounded-xl border transition-all duration-300 flex items-center justify-between cursor-pointer group relative overflow-hidden",
                    isActive 
                      ? "bg-boxdark border-primary/20 shadow-[0_0_15px_rgba(59,130,246,0.03)]" 
                      : "bg-transparent border-strokedark/30 hover:border-strokedark hover:bg-black/5 dark:hover:bg-white/5"
                  )}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="activeDocOutline"
                      className="absolute inset-0 border border-primary/30 rounded-xl pointer-events-none z-20"
                    />
                  )}

                  <div className="flex items-center gap-3.5">
                    <div className={cn(
                      "p-2.5 rounded-lg border transition-colors",
                      isActive 
                        ? "bg-primary/10 border-primary/20 text-primary" 
                        : "bg-black/5 dark:bg-black/40 border-strokedark/40 text-bodydark2 group-hover:text-black dark:group-hover:text-white"
                    )}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={cn(
                      "text-xs font-bold font-mono transition-colors block",
                      isActive ? "text-black dark:text-white" : "text-bodydark group-hover:text-black dark:group-hover:text-white"
                    )}>
                      {doc.tabTitle}
                    </span>
                  </div>
                  <ChevronRight className={cn(
                    "w-4 h-4 transition-all",
                    isActive ? "text-primary translate-x-0.5" : "text-slate-600 group-hover:text-bodydark"
                  )} />
                </button>
              );
            })}
          </div>

          {/* Right Column: Code Console */}
          <div className="lg:col-span-8 flex flex-col justify-center">
            <div className="w-full bg-[#0c0c0e] border border-white/[0.08] rounded-2xl shadow-2xl relative select-none flex flex-col justify-between h-[420px] overflow-hidden text-white">
              
              {/* Top File bar */}
              <div className="flex justify-between items-center bg-black/40 border-b border-strokedark/60 px-5 py-3.5 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5 shrink-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-[10px] font-mono text-bodydark2 pl-3 border-l border-strokedark">
                    SYSTEM_DOCS
                  </span>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1 bg-white/[0.05] border border-white/[0.08] rounded-lg text-[10px] font-mono text-white">
                  <FileCode className="w-3 h-3 text-primary" />
                  {activeDoc.filename}
                </div>
              </div>

              {/* Main Content Pane */}
              <div className="flex-grow p-6 overflow-y-auto font-mono text-[10.5px] leading-relaxed text-left bg-black/20 relative select-text">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeDoc.id}
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 3 }}
                    transition={{ duration: 0.15 }}
                    className="w-full h-full flex"
                  >
                    {/* Line numbers column */}
                    <div className="text-slate-600 select-none pr-4 text-right border-r border-strokedark/30 shrink-0 w-8">
                      {activeDoc.codeLines.map((_, idx) => (
                        <div key={idx}>{idx + 1}</div>
                      ))}
                    </div>

                    {/* Lines content */}
                    <div className="pl-4 flex-grow overflow-x-auto whitespace-pre no-scrollbar">
                      {activeDoc.codeLines.map((line, idx) => (
                        <div key={idx} className="flex">
                          {line.tokens.length === 0 ? (
                            <span>&nbsp;</span>
                          ) : (
                            line.tokens.map((token, tIdx) => (
                              <span key={tIdx} className={token.color}>
                                {token.text}
                              </span>
                            ))
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Float Copy Button */}
                <button
                  onClick={copyCode}
                  className="absolute top-4 right-4 p-2 bg-white/[0.05] hover:bg-black border border-white/[0.08] hover:border-white/20 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer z-10"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Bottom Info bar */}
              <div className="bg-black/35 border-t border-strokedark/60 px-5 py-3 text-left font-mono text-[10px] text-bodydark2 flex justify-between items-center shrink-0">
                <span className="line-clamp-1 max-w-[80%]">
                  &gt; {activeDoc.desc}
                </span>
                <span className="text-[8px] font-bold px-2 py-0.5 rounded border border-primary/20 bg-primary/10 text-primary uppercase tracking-wider shrink-0">
                  {activeDoc.language}
                </span>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
