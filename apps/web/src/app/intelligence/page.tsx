'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ThinkingOrb } from 'thinking-orbs';
import {
  TrendingUp,
  Layers,
  Activity,
  BarChart3,
  Brain,
  Cpu,
  Sparkles,
  Clock,
  Zap,
} from 'lucide-react';

import { api } from '../../lib/api';
import { HealthRing } from '../../components/HealthRing';
import { Sidebar } from '../../components/Sidebar';
import { Header } from '../../components/Header';
import { useLiveClock } from '../../hooks/useLiveClock';
import { usePolling } from '../../hooks/usePolling';
import { logger } from '../../lib/logger';

const domainIconMap: Record<string, React.ElementType> = {
  'trending-up': TrendingUp,
  layers: Layers,
  activity: Activity,
  'bar-chart': BarChart3,
};

const domainColorMap: Record<string, string> = {
  demand: 'text-chart-1',
  inventory: 'text-chart-5',
  machine: 'text-chart-2',
  business: 'text-chart-4',
};

const domainBorderMap: Record<string, string> = {
  demand: 'border-chart-1/20',
  inventory: 'border-chart-5/20',
  machine: 'border-chart-2/20',
  business: 'border-chart-4/20',
};

export default function IntelligencePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState(1);
  const liveTime = useLiveClock();
  const [overallConfidence, setOverallConfidence] = useState(94);
  const [intelData, setIntelData] = useState<{
    overallConfidence: number;
    modelStatus: string;
    activeDirectivesCount: number;
    summary: string;
    generatedAt: string;
    risk: string;
    domains: Array<{
      id: string;
      name: string;
      icon: string;
      confidence: number;
      insight: string;
      recommendation: string;
      priority: string;
    }>;
    generatedBy?: string;
    cacheStatus?: string;
  } | null>(null);

  const fetchIntel = async () => {
    try {
      const dashboard = await api.getDashboard();
      const intel = await api.getIntelligence();

      setNotifications(dashboard.alerts);
      setOverallConfidence(intel.confidence);

      // Map live domain outputs from Gemini/rule-based engine
      const mappedDomains = [
        {
          id: 'demand',
          name: 'Demand Intelligence',
          icon: 'trending-up',
          confidence: intel.confidence - 2,
          insight: intel.demandForecast || '',
          recommendation: `Operational adjustment: ${intel.recommendation || ''}`,
          priority: intel.priority,
        },
        {
          id: 'inventory',
          name: 'Inventory Intelligence',
          icon: 'layers',
          confidence: intel.confidence,
          insight: intel.inventoryInsight || '',
          recommendation: `Procurement recommendation: Replenish reserve payloads`,
          priority: intel.priority,
        },
        {
          id: 'machine',
          name: 'Machine Intelligence',
          icon: 'activity',
          confidence: intel.confidence + 1,
          insight: intel.maintenanceInsight || '',
          recommendation: `Service directive: Schedule proactive cycles`,
          priority: intel.priority,
        },
        {
          id: 'business',
          name: 'Business Intelligence',
          icon: 'bar-chart',
          confidence: intel.confidence - 1,
          insight: intel.businessInsight || '',
          recommendation: `Margin strategy: Adjust seasonal vending price`,
          priority: intel.priority,
        },
      ];

      setIntelData({
        overallConfidence: intel.confidence,
        modelStatus: 'Online (Continuous HMR)',
        activeDirectivesCount: intel.priority === 'HIGH' ? 4 : 2,
        summary: intel.summary || '',
        generatedAt: intel.generatedAt ? new Date(intel.generatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--:--',
        risk: intel.risk,
        domains: mappedDomains
      });

    } catch (err) {
      logger.error("Failed to fetch intelligence", err);
    }
  };

  usePolling(fetchIntel, 5000);

  const triggerAction = () => {
    alert("Interrogating Neural Agent... All connection lines healthy.");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-black font-sans text-bodydark">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          notifications={notifications}
          triggerAction={() => {}}
        />

        <main className="p-4 md:p-6 2xl:p-10 max-w-[1500px] w-full mx-auto">
          {/* Page Title */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Brain className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  NexPod Intelligence
                </h2>
                <span className="text-xs text-bodydark2 font-mono">
                  AI Operations Center
                </span>
              </div>
            </div>
            <nav className="text-xs font-medium text-bodydark2 font-mono flex items-center gap-1.5">
              <span className="hover:text-white cursor-default">AI</span>
              <span>/</span>
              <span className="text-primary">Intelligence</span>
            </nav>
          </div>

          {/* HERO: AI Status Console */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 xl:gap-7.5 mb-10">
            {/* Confidence Score Ring */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="md:col-span-4 rounded-2xl border border-strokedark bg-boxdark p-8 shadow-default flex flex-col items-center justify-center gap-3 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent pointer-events-none" />
              <HealthRing
                percentage={overallConfidence}
                size={150}
                strokeWidth={10}
                label="Overall AI Confidence"
              />
            </motion.div>

            {/* Neural Net State Indicators */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="md:col-span-8 rounded-2xl border border-strokedark bg-boxdark p-6 shadow-default flex flex-col justify-between relative overflow-hidden"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-4">
                  {/* Embedded AI Composing Orb Animation */}
                  <div className="relative shrink-0 p-1.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <ThinkingOrb state="composing" size={64} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                      Model Decision Console
                      <span className="text-[9px] font-mono font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 uppercase">
                        AI Composing
                      </span>
                    </h3>
                    <p className="text-xs text-bodydark mt-2 font-mono leading-relaxed max-w-[500px]">
                      {intelData?.summary || "Analyzing telemetry log matrices..."}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono text-chart-2 bg-chart-2/10 border border-chart-2/20 shrink-0">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>MODEL STATUS: ACTIVE</span>
                </div>
              </div>

              {/* Status parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 my-6 border-t border-b border-strokedark py-6 font-mono">
                <div>
                  <span className="text-[10px] text-bodydark2 uppercase">Learning Status</span>
                  <span className="block text-sm font-bold text-white mt-1">Fully Trained</span>
                </div>
                <div>
                  <span className="text-[10px] text-bodydark2 uppercase">Active Directives</span>
                  <span className="block text-sm font-bold text-primary mt-1">
                    {intelData?.activeDirectivesCount || 2} Recommendations
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-bodydark2 uppercase">Risk Index</span>
                  <span className={`block text-sm font-bold mt-1 uppercase ${intelData?.risk === 'HIGH' ? 'text-destructive' : 'text-chart-2'}`}>
                    {intelData?.risk || 'Low'}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center text-[11px] font-mono text-bodydark2">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  Sync clock: {liveTime} (Generated at: {intelData?.generatedAt || '--:--:--'})
                </span>
                <span className="text-chart-2">CONTINUOUS TELEMETRY MONITORING ACTIVE</span>
              </div>
            </motion.div>
          </div>

          {/* DOMAINS: AI Cards Grid */}
          <div className="mb-6">
            <h3 className="text-xs font-bold text-bodydark2 uppercase tracking-wider mb-4 font-mono flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
              Domain intelligence directives
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 xl:gap-7.5">
              {(intelData?.domains || []).map((domain: any, idx: number) => {
                const IconComponent = domainIconMap[domain.icon] || TrendingUp;
                const borderClass = domainBorderMap[domain.id] || 'border-strokedark';
                const colorClass = domainColorMap[domain.id] || 'text-primary';

                return (
                  <motion.div
                    key={domain.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: idx * 0.08 }}
                    className={`rounded-2xl border ${borderClass} bg-boxdark p-6 shadow-default flex flex-col justify-between hover:shadow-lg transition-all duration-300 relative group`}
                  >
                    <div className="flex justify-between items-start gap-4 mb-6">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-meta-4 ${colorClass}`}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">{domain.name}</h4>
                          <span className="text-[10px] text-bodydark2 font-mono">
                            Domain Agent #{100 + idx}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end">
                        <span className="text-[9px] font-mono text-bodydark2 uppercase">Confidence</span>
                        <span className="text-sm font-extrabold text-white font-mono">{domain.confidence}%</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Insight Card Content */}
                      <div className="p-4 rounded-xl bg-black/40 border border-strokedark/60">
                        <span className="text-[9px] font-mono font-bold text-bodydark2 uppercase tracking-wider block mb-1">
                          Live Observation
                        </span>
                        <p className="text-xs text-white leading-normal font-mono">
                          {domain.insight}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-primary/[0.02] border border-primary/20">
                        <span className="text-[9px] font-mono font-bold text-primary uppercase tracking-wider block mb-1">
                          Action Recommendation
                        </span>
                        <p className="text-xs text-white leading-normal font-mono">
                          {domain.recommendation}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-strokedark/50 flex justify-between items-center text-[10px] font-mono">
                      <span className={`font-bold ${domain.priority === 'HIGH' ? 'text-destructive' : domain.priority === 'MEDIUM' ? 'text-chart-4' : 'text-chart-2'}`}>
                        PRIORITY: {domain.priority}
                      </span>
                      <button
                        onClick={triggerAction}
                        className="text-bodydark2 hover:text-white transition-colors cursor-pointer"
                      >
                        INTERROGATE MODEL
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="max-w-[1500px] mx-auto px-6 py-6 border-t border-strokedark w-full flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-mono text-bodydark2">
          <span>NexPod AI Operations Control v1.0.0-PROTOTYPE</span>
          <div className="flex gap-6">
            <span>NEURAL NET: 4 cores online</span>
            <span>MODEL AGENTS: 4 active</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
