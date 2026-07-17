"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Terminal, 
  Cpu, 
  Brain, 
  Database, 
  Copy, 
  Check, 
  FileCode,
  Radio
} from "lucide-react";
import { cn } from "@/lib/utils";

type TechId = "gemini" | "fastapi" | "supabase" | "postgres";

interface CodeToken {
  text: string;
  color?: string; // Tailwind class
}

interface CodeLine {
  tokens: CodeToken[];
}

interface TechSnippet {
  id: TechId;
  name: string;
  filename: string;
  language: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeColor: string;
  codeLines: CodeLine[];
  rawCode: string;
}

const SNIPPETS: TechSnippet[] = [
  {
    id: "gemini",
    name: "Gemini 2.5",
    filename: "ai_ops.py",
    language: "python",
    desc: "Predictive LLM alert loop that analyzes ingredient depletion rates and plans dispatch routes.",
    icon: Brain,
    badgeColor: "text-primary border-primary/20 bg-primary/10",
    rawCode: `from google import genai

def predict_refill_route(pod_id, sensor_log):
    client = genai.Client()
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=f"Analyze depletion velocity for Pod {pod_id}: {sensor_log}"
    )
    return response.text # Dispatches routing coordinates`,
    codeLines: [
      { tokens: [{ text: "from", color: "text-rose-500 font-bold" }, { text: " google " }, { text: "import", color: "text-rose-500 font-bold" }, { text: " genai", color: "text-emerald-400" }] },
      { tokens: [] },
      { tokens: [{ text: "def", color: "text-rose-500 font-bold" }, { text: " " }, { text: "predict_refill_route", color: "text-blue-400" }, { text: "(pod_id, sensor_log):" }] },
      { tokens: [{ text: "    client = genai.Client()" }] },
      { tokens: [{ text: "    response = client.models.generate_content(" }] },
      { tokens: [{ text: "        model=" }, { text: '"gemini-2.5-flash"', color: "text-amber-400" }, { text: "," }] },
      { tokens: [{ text: "        contents=" }, { text: 'f"Analyze depletion velocity for Pod {pod_id}: {sensor_log}"', color: "text-amber-400" }] },
      { tokens: [{ text: "    )" }] },
      { tokens: [{ text: "    return", color: "text-rose-500 font-bold" }, { text: " response.text " }, { text: "# Dispatches routing coordinates", color: "text-slate-500 italic" }] }
    ]
  },
  {
    id: "fastapi",
    name: "FastAPI",
    filename: "telemetry.py",
    language: "python",
    desc: "High-performance async telemetry sink validating IoT sensor inputs and triggering recalculations.",
    icon: Radio,
    badgeColor: "text-teal-400 border-teal-400/20 bg-teal-400/10",
    rawCode: `from fastapi import FastAPI, BackgroundTasks

app = FastAPI()

@app.post("/v1/telemetry")
async def ingest(data: TelemetryPayload, tasks: BackgroundTasks):
    await telemetry_pipeline.push(data)
    tasks.add_task(recalculate_inventory, data.pod_id)
    return {"status": "ACK", "ticks_received": 1}`,
    codeLines: [
      { tokens: [{ text: "from", color: "text-rose-500 font-bold" }, { text: " fastapi " }, { text: "import", color: "text-rose-500 font-bold" }, { text: " FastAPI, BackgroundTasks", color: "text-emerald-400" }] },
      { tokens: [] },
      { tokens: [{ text: "app = FastAPI()" }] },
      { tokens: [] },
      { tokens: [{ text: "@app.post", color: "text-blue-400" }, { text: "(" }, { text: '"/v1/telemetry"', color: "text-amber-400" }, { text: ")" }] },
      { tokens: [{ text: "async def", color: "text-rose-500 font-bold" }, { text: " " }, { text: "ingest", color: "text-blue-400" }, { text: "(data: TelemetryPayload, tasks: BackgroundTasks):" }] },
      { tokens: [{ text: "    await", color: "text-rose-500 font-bold" }, { text: " telemetry_pipeline.push(data)" }] },
      { tokens: [{ text: "    tasks.add_task(recalculate_inventory, data.pod_id)" }] },
      { tokens: [{ text: "    return", color: "text-rose-500 font-bold" }, { text: " {" }, { text: '"status"', color: "text-amber-400" }, { text: ": " }, { text: '"ACK"', color: "text-amber-400" }, { text: ", " }, { text: '"ticks_received"', color: "text-amber-400" }, { text: ": 1}" }] }
    ]
  },
  {
    id: "supabase",
    name: "Supabase",
    filename: "realtime.ts",
    language: "typescript",
    desc: "Real-time client subscription channels broadcasting live pressure and water metrics to dashboards.",
    icon: Database,
    badgeColor: "text-cyan-400 border-cyan-400/20 bg-cyan-400/10",
    rawCode: `import { createClient } from "@supabase/supabase-js"

const supabase = createClient(URL, ANON_KEY)

supabase
  .channel("telemetry_stream")
  .on("postgres_changes", { event: "INSERT" }, (payload) => {
    updateMetricsDashboard(payload.new)
  })
  .subscribe()`,
    codeLines: [
      { tokens: [{ text: "import", color: "text-rose-500 font-bold" }, { text: " { createClient } " }, { text: "from", color: "text-rose-500 font-bold" }, { text: ' "@supabase/supabase-js"', color: "text-amber-400" }] },
      { tokens: [] },
      { tokens: [{ text: "const", color: "text-rose-500 font-bold" }, { text: " supabase = createClient(URL, ANON_KEY)" }] },
      { tokens: [] },
      { tokens: [{ text: "supabase" }] },
      { tokens: [{ text: "  .channel(" }, { text: '"telemetry_stream"', color: "text-amber-400" }, { text: ")" }] },
      { tokens: [{ text: "  .on(" }, { text: '"postgres_changes"', color: "text-amber-400" }, { text: ", { event: " }, { text: '"INSERT"', color: "text-amber-400" }, { text: " }, (payload) => {" }] },
      { tokens: [{ text: "    updateMetricsDashboard(payload.new)" }] },
      { tokens: [{ text: "  })" }] },
      { tokens: [{ text: "  .subscribe()" }] }
    ]
  },
  {
    id: "postgres",
    name: "PostgreSQL",
    filename: "schema.sql",
    language: "sql",
    desc: "Durable timeseries table structure recording transactional records and mechanical snapshots.",
    icon: Cpu,
    badgeColor: "text-indigo-400 border-indigo-400/20 bg-indigo-400/10",
    rawCode: `-- Postgres durable snapshots
CREATE TABLE pod_telemetry_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pod_id TEXT REFERENCES active_pods(id),
  boiler_temp_c NUMERIC(5,2),
  pressure_bar NUMERIC(4,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);`,
    codeLines: [
      { tokens: [{ text: "-- Postgres durable snapshots", color: "text-slate-500 italic" }] },
      { tokens: [{ text: "CREATE TABLE", color: "text-rose-500 font-bold" }, { text: " pod_telemetry_snapshots (" }] },
      { tokens: [{ text: "  id UUID " }, { text: "PRIMARY KEY", color: "text-rose-500 font-bold" }, { text: " DEFAULT gen_random_uuid()," }] },
      { tokens: [{ text: "  pod_id TEXT " }, { text: "REFERENCES", color: "text-rose-500 font-bold" }, { text: " active_pods(id)," }] },
      { tokens: [{ text: "  boiler_temp_c NUMERIC(5,2)," }] },
      { tokens: [{ text: "  pressure_bar NUMERIC(4,2)," }] },
      { tokens: [{ text: "  created_at TIMESTAMPTZ " }, { text: "DEFAULT", color: "text-rose-500 font-bold" }, { text: " NOW()" }] },
      { tokens: [{ text: ");" }] }
    ]
  }
];

export function SdkSandbox() {
  const [activeTech, setActiveTech] = useState<TechId>("gemini");
  const [copied, setCopied] = useState(false);
  const activeSnippet = SNIPPETS.find(s => s.id === activeTech)!;

  const copyCode = () => {
    navigator.clipboard.writeText(activeSnippet.rawCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
        
        {/* Left Side: Tech Tabs */}
        <div className="lg:col-span-4 flex flex-col justify-center space-y-4 text-left">
          <span className="text-[10px] font-mono text-primary uppercase tracking-[0.25em] font-bold block">
            Architecture Stack
          </span>
          <h2 className="text-3xl font-extrabold text-black dark:text-white tracking-tight">
            NexPod core engine tech.
          </h2>
          <p className="text-xs text-bodydark2 leading-relaxed mb-6 max-w-sm">
            Leveraging low-latency telemetry pipelines and custom AI models to manage decentralized retail fleets.
          </p>

          <div className="flex flex-col space-y-2.5">
            {SNIPPETS.map((snippet) => {
              const Icon = snippet.icon;
              const isActive = activeTech === snippet.id;

              return (
                <button
                  key={snippet.id}
                  onMouseEnter={() => setActiveTech(snippet.id)}
                  onClick={() => setActiveTech(snippet.id)}
                  className={cn(
                    "w-full text-left p-4 rounded-xl border transition-all duration-300 flex items-center gap-3.5 cursor-pointer relative overflow-hidden group",
                    isActive 
                      ? "bg-boxdark border-primary/25 shadow-[0_0_15px_rgba(59,130,246,0.03)]" 
                      : "bg-transparent border-strokedark/30 hover:border-strokedark hover:bg-black/5 dark:hover:bg-white/5"
                  )}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="activeTechBorder"
                      className="absolute inset-0 border border-primary/40 rounded-xl pointer-events-none z-20"
                    />
                  )}

                  <div className={cn(
                    "p-2.5 rounded-lg border transition-colors",
                    isActive 
                      ? "bg-primary/10 border-primary/20 text-primary" 
                      : "bg-black/5 dark:bg-black/40 border-strokedark/40 text-bodydark2 group-hover:text-black dark:group-hover:text-white"
                  )}>
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="flex-grow">
                    <span className={cn(
                      "text-xs font-bold font-mono transition-colors block",
                      isActive ? "text-black dark:text-white" : "text-bodydark group-hover:text-black dark:group-hover:text-white"
                    )}>
                      {snippet.name}
                    </span>
                    <span className="text-[10px] text-bodydark2 line-clamp-1 mt-0.5">
                      {snippet.filename}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: IDE Code Sandbox */}
        <div className="lg:col-span-8 flex flex-col justify-center">
          <div className="w-full bg-[#0c0c0e] border border-white/[0.08] rounded-2xl shadow-2xl relative select-none flex flex-col justify-between h-[380px] overflow-hidden text-white">
            
            {/* Editor Top Title/Tabs Bar */}
            <div className="flex justify-between items-center bg-black/40 border-b border-strokedark/60 px-5 py-3.5 shrink-0">
              <div className="flex items-center gap-2.5">
                {/* Visual Mac dots */}
                <div className="flex gap-1.5 shrink-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-[10px] font-mono text-bodydark2 pl-3 border-l border-strokedark">
                  NexPod AI OS SDK
                </span>
              </div>

              {/* Active Tab filename */}
              <div className="flex items-center gap-1.5 px-3 py-1 bg-white/[0.05] border border-white/[0.08] rounded-lg text-[10px] font-mono text-white">
                <FileCode className="w-3 h-3 text-primary" />
                {activeSnippet.filename}
              </div>
            </div>

            {/* Code editor pane */}
            <div className="flex-1 p-5 overflow-y-auto font-mono text-[11px] leading-relaxed text-left bg-black/25 relative select-text">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSnippet.id}
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 3 }}
                  transition={{ duration: 0.15 }}
                  className="w-full h-full flex"
                >
                  {/* Line numbers column */}
                  <div className="text-slate-600 select-none pr-4 text-right border-r border-strokedark/30 shrink-0 w-8">
                    {activeSnippet.codeLines.map((_, idx) => (
                      <div key={idx}>{idx + 1}</div>
                    ))}
                  </div>

                  {/* Lines block */}
                  <div className="pl-4 flex-grow overflow-x-auto whitespace-pre no-scrollbar">
                    {activeSnippet.codeLines.map((line, idx) => (
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

            {/* Editor Bottom Info/Description Bar */}
            <div className="bg-black/35 border-t border-strokedark/60 px-5 py-3 text-left font-mono text-[10px] text-bodydark2 flex justify-between items-center shrink-0">
              <span className="line-clamp-1 max-w-[80%]">
                &gt; {activeSnippet.desc}
              </span>
              <span className={cn(
                "text-[8px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider",
                activeSnippet.badgeColor
              )}>
                {activeSnippet.language}
              </span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
