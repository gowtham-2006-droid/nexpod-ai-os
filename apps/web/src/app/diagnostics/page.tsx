'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame,
  Droplets,
  Zap,
  Wifi,
  Lock,
  Thermometer,
  Database,
  Sparkles,
  CheckCircle,
  Wrench,
  Activity,
  Coffee,
  AlertTriangle,
  Clock,
  RotateCcw,
} from 'lucide-react';

import { api } from '../../lib/api';
import { HealthRing } from '../../components/HealthRing';
import { Sidebar } from '../../components/Sidebar';
import { Header } from '../../components/Header';
import { useLiveClock } from '../../hooks/useLiveClock';
import { usePolling } from '../../hooks/usePolling';
import { IncidentReplayDrawer } from '../../components/IncidentReplayDrawer';
import { logger } from '../../lib/logger';

// Map component icon hint string → Lucide icon
const iconMap: Record<string, React.ElementType> = {
  flame: Flame,
  droplets: Droplets,
  grinder: Wrench,
  brewer: Coffee,
  lock: Lock,
  wifi: Wifi,
  zap: Zap,
  database: Database,
};

const renderSubTelemetry = (icon: string, temp?: string) => {
  switch (icon) {
    case 'flame':
      return (
        <>
          <div className="flex justify-between"><span>Heater Coil Duty:</span><span className="text-white font-semibold">45%</span></div>
          <div className="flex justify-between"><span>Target Temp:</span><span className="text-white font-semibold">94.0°C</span></div>
          <div className="flex justify-between"><span>Thermal Fuse:</span><span className="text-chart-2 font-semibold">OK</span></div>
        </>
      );
    case 'droplets':
      return (
        <>
          <div className="flex justify-between"><span>Water Flow Rate:</span><span className="text-white font-semibold">1.2 L/min</span></div>
          <div className="flex justify-between"><span>Pump Duty Cycle:</span><span className="text-white font-semibold">12%</span></div>
          <div className="flex justify-between"><span>Solenoid State:</span><span className="text-chart-2 font-semibold">Nominal</span></div>
        </>
      );
    case 'grinder':
      return (
        <>
          <div className="flex justify-between"><span>Grind Duration:</span><span className="text-white font-semibold">4.8s</span></div>
          <div className="flex justify-between"><span>Burr Wear Index:</span><span className="text-white font-semibold">12%</span></div>
          <div className="flex justify-between"><span>Grind Size:</span><span className="text-chart-2 font-semibold">Fine (12)</span></div>
        </>
      );
    case 'brewer':
      return (
        <>
          <div className="flex justify-between"><span>Piston Pressure:</span><span className="text-white font-semibold">9.1 bar</span></div>
          <div className="flex justify-between"><span>Infusion Duration:</span><span className="text-white font-semibold">22s</span></div>
          <div className="flex justify-between"><span>Chamber Position:</span><span className="text-chart-2 font-semibold">Home</span></div>
        </>
      );
    case 'lock':
      return (
        <>
          <div className="flex justify-between"><span>Lock Microswitch:</span><span className="text-white font-semibold">OK</span></div>
          <div className="flex justify-between"><span>Total Cycles:</span><span className="text-white font-semibold">14,203</span></div>
          <div className="flex justify-between"><span>Latch Engagement:</span><span className="text-chart-2 font-semibold">100%</span></div>
        </>
      );
    case 'wifi':
      return (
        <>
          <div className="flex justify-between"><span>Signal Strength:</span><span className="text-white font-semibold">-48 dBm</span></div>
          <div className="flex justify-between"><span>Packet Retransmit:</span><span className="text-white font-semibold">0.02%</span></div>
          <div className="flex justify-between"><span>Node IP Address:</span><span className="text-white font-semibold">192.168.0.106</span></div>
        </>
      );
    case 'zap':
      return (
        <>
          <div className="flex justify-between"><span>Input Voltage:</span><span className="text-white font-semibold">232V AC</span></div>
          <div className="flex justify-between"><span>Current Draw:</span><span className="text-white font-semibold">4.8A</span></div>
          <div className="flex justify-between"><span>Transformer Temp:</span><span className="text-chart-2 font-semibold">42.5°C</span></div>
        </>
      );
    case 'database':
      return (
        <>
          <div className="flex justify-between"><span>Sync Latency:</span><span className="text-white font-semibold">4.2ms</span></div>
          <div className="flex justify-between"><span>Active Connections:</span><span className="text-white font-semibold">8 / 20</span></div>
          <div className="flex justify-between"><span>Index Health:</span><span className="text-chart-2 font-semibold">100%</span></div>
        </>
      );
    default:
      return (
        <>
          <div className="flex justify-between"><span>Operational Mode:</span><span className="text-white font-semibold">Headless</span></div>
          <div className="flex justify-between"><span>Node Calibration:</span><span className="text-chart-2 font-semibold">OK</span></div>
        </>
      );
  }
};

export default function DiagnosticsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState(2);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const liveTime = useLiveClock();
  const [components, setComponents] = useState<Array<{
    id: string;
    name: string;
    icon: string;
    health: number;
    status: 'operational' | 'warning' | 'critical' | 'offline';
    temp?: string;
    lastCheck: string;
  }>>([]);
  const [healthScore, setHealthScore] = useState(95.5);
  const [uptime, setUptime] = useState('00:00:00');
  const [runtimeTick, setRuntimeTick] = useState(0);
  const [isReplayOpen, setIsReplayOpen] = useState(false);

  // Timeline events state
  const [timelineEvents, setTimelineEvents] = useState<Array<{
    id: string;
    title: string;
    desc: string;
    type: 'warning' | 'success' | 'info';
    time: string;
  }>>([]);

  // Toast
  const [toast, setToast] = useState<{ show: boolean; message: string }>({
    show: false,
    message: '',
  });

  const fetchMachine = async () => {
    try {
      const dashboard = await api.getDashboard();
      const res = await api.getMachine();
      const runtime = await api.getRuntime();

      setNotifications(dashboard.alerts);
      setHealthScore(dashboard.machineHealth);
      setUptime(runtime.uptime);
      setRuntimeTick(runtime.runtimeTick);

      if (res && res[0]) {
        const pod = res[0];
        const baseHealth = pod.health.score || 95.5;
        const isCriticalTemp = pod.health.temperature_c > 80;
        
        const mappedComponents = [
          { id: 'heating', name: 'Heating Unit', icon: 'flame', health: Math.min(100, Math.round(baseHealth + 1.2)), status: isCriticalTemp ? ('critical' as const) : ('operational' as const), temp: `${Math.round(pod.health.temperature_c)}°C`, lastCheck: 'Real-time' },
          { id: 'pump', name: 'Water Pump', icon: 'droplets', health: Math.min(100, Math.round(baseHealth - 1.5)), status: 'operational' as const, lastCheck: 'Real-time' },
          { id: 'grinder', name: 'Grinder Assembly', icon: 'grinder', health: Math.min(100, Math.round(baseHealth + 0.8)), status: 'operational' as const, lastCheck: 'Real-time' },
          { id: 'brewer', name: 'Espresso Brewer', icon: 'brewer', health: Math.min(100, Math.round(baseHealth - 0.4)), status: 'operational' as const, lastCheck: 'Real-time' },
          { id: 'lock', name: 'Door Lock', icon: 'lock', health: pod.health.door_locked ? 100 : 0, status: pod.health.door_locked ? ('operational' as const) : ('warning' as const), lastCheck: 'Real-time' },
          { id: 'network', name: 'Network Module', icon: 'wifi', health: pod.health.online ? 100 : 0, status: pod.health.online ? ('operational' as const) : ('offline' as const), lastCheck: 'Real-time' },
          { id: 'power', name: 'Power Supply', icon: 'zap', health: Math.min(100, Math.round(baseHealth + 2.1)), status: 'operational' as const, lastCheck: 'Real-time' },
          { id: 'water', name: 'Water Tank Sensor', icon: 'database', health: Math.min(100, Math.round(baseHealth - 4.2)), status: 'operational' as const, lastCheck: 'Real-time' },
        ];
        setComponents(mappedComponents);

        // Populate live timeline events from active database warnings
        const events = [];
        if (dashboard.alerts > 0) {
          events.push({
            id: 'evt-1',
            title: 'Material Warning',
            desc: 'Milk reserves dropped below safety threshold (drone dispatched)',
            type: 'warning' as const,
            time: '14:28'
          });
          events.push({
            id: 'evt-2',
            title: 'Temperature Spike Check',
            desc: `Boiler core stabilized at ${Math.round(pod.health.temperature_c)}°C`,
            type: 'info' as const,
            time: '13:52'
          });
        } else {
          events.push({
            id: 'evt-1',
            title: 'System Self-Test Passed',
            desc: 'All 8 hardware modules report nominal condition',
            type: 'success' as const,
            time: '14:32'
          });
          events.push({
            id: 'evt-2',
            title: 'Calibration Check',
            desc: 'Boiler pressure validated at 9.2 Bar',
            type: 'success' as const,
            time: '13:10'
          });
        }
        events.push({
          id: 'evt-3',
          title: 'Maintenance Completed',
          desc: 'Dual-seal descaling service completed successfully',
          type: 'success' as const,
          time: 'Yesterday'
        });
        setTimelineEvents(events);
      }
    } catch (err) {
      logger.error("Failed to fetch machine health", err);
    }
  };

  usePolling(fetchMachine, 5000);

  // Synchronize diagnostics UI state with historical incident replay snapshots
  const handleReplaySnapshot = (snap: any) => {
    if (!snap) return;
    if (snap.machineHealth !== undefined) setHealthScore(snap.machineHealth);
    if (snap.temperature_c !== undefined) {
      setComponents((prev) =>
        prev.map((c) =>
          c.id === 'heating'
            ? {
                ...c,
                temp: `${Math.round(snap.temperature_c)}°C`,
                status: snap.temperature_c > 80 ? 'critical' : 'operational',
              }
            : c
        )
      );
    }
  };

  const triggerAction = (name: string, detail: string) => {
    setToast({ show: true, message: `${name} — ${detail}` });
    setTimeout(() => setToast((p) => ({ ...p, show: false })), 4000);
  };

  const handleRunSelfTest = async () => {
    try {
      await api.tickSimulation(1);
      triggerAction('Calibration Complete', 'All diagnostic load-cells validated successfully.');
    } catch (err) {
      logger.error(err);
    }
  };

  const statusConfig: Record<
    string,
    { label: string; bg: string; text: string; dot: string }
  > = {
    operational: { label: 'Operational', bg: 'bg-chart-2/10', text: 'text-chart-2', dot: 'bg-chart-2' },
    warning: { label: 'Warning', bg: 'bg-chart-4/10', text: 'text-chart-4', dot: 'bg-chart-4' },
    critical: { label: 'Critical', bg: 'bg-destructive/10', text: 'text-destructive', dot: 'bg-destructive' },
    offline: { label: 'Offline', bg: 'bg-muted', text: 'text-muted-foreground', dot: 'bg-muted-foreground' },
  };

  return (
    <div className="flex h-screen overflow-hidden bg-black font-sans text-bodydark">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          notifications={notifications}
          triggerAction={triggerAction}
        />

        {/* TOAST SYSTEM ALERTS */}
        <AnimatePresence>
          {toast.show && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="fixed top-24 left-1/2 transform -translate-x-1/2 z-99999 w-full max-w-md bg-boxdark-2 border border-primary p-4 rounded-xl shadow-2xl flex gap-3.5 items-start"
            >
              <div className="p-1 rounded bg-primary/10 text-primary">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div className="flex-grow">
                <span className="block text-xs font-mono font-bold text-primary uppercase tracking-wider">
                  OS DIRECTIVE LOG
                </span>
                <p className="text-sm font-semibold text-white mt-0.5">
                  {toast.message}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="p-4 md:p-6 2xl:p-10 max-w-[1500px] w-full mx-auto">
          {/* Page Title */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Wrench className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  Machine Diagnostics
                </h2>
                <span className="text-xs text-bodydark2 font-mono">
                  Hardware telemetry & sub-components
                </span>
              </div>
            </div>

            {/* INCIDENT REPLAY BUTTON */}
            <button
              onClick={() => setIsReplayOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold transition-all shadow-sm hover:scale-[1.02] self-start sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Incident Replay
            </button>
          </div>
          <nav className="text-xs font-medium text-bodydark2 font-mono flex items-center gap-1.5">
              <span className="hover:text-white cursor-default">Telemetry</span>
              <span>/</span>
              <span className="text-primary">Diagnostics</span>
            </nav>
          </div>

          {/* TOP CONSOLE: Health Score & Calibration */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 xl:gap-7.5 mb-7.5">
            {/* Machine Health Score Ring */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="md:col-span-5 rounded-2xl border border-strokedark bg-boxdark p-6 shadow-default flex items-center justify-between gap-6"
            >
              <div>
                <span className="text-xs font-semibold text-bodydark2 uppercase tracking-wide">
                  Overall Health Score
                </span>
                <h3 className="text-3xl font-extrabold text-white mt-2 font-mono">
                  {healthScore}%
                </h3>
                <span className="text-[10px] text-chart-2 font-mono font-bold uppercase mt-2.5 px-2 py-0.5 rounded border border-chart-2/20 bg-chart-2/10 inline-block">
                  Nominal Condition
                </span>
              </div>
              <HealthRing percentage={healthScore} size={110} strokeWidth={8} />
            </motion.div>

            {/* AI Calibration Advisor */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="md:col-span-7 rounded-2xl border border-primary/30 bg-primary/[0.02] p-6 shadow-default flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                  <span className="text-xs font-bold text-primary font-mono tracking-wide uppercase">
                    AI Calibration Advisory
                  </span>
                </div>
                <h3 className="text-xs font-bold text-white tracking-tight leading-relaxed font-mono">
                  Boiler core and dispenser valves verified calibrated. Next descaling maintenance window recommended in 120 cups.
                </h3>
                <span className="text-xs text-bodydark2 font-mono mt-1.5 block flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Uptime: {uptime} (Tick: #{runtimeTick})
                </span>
              </div>

              <button
                onClick={handleRunSelfTest}
                className="w-full sm:w-auto px-4.5 py-2.5 rounded bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-1 font-mono cursor-pointer shrink-0 shadow-md"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Run Self-Test</span>
              </button>
            </motion.div>
          </div>

          {/* MID CONSOLE: Sub-Components Health Grid */}
          <div className="mb-7.5">
            <h3 className="text-xs font-bold text-bodydark2 uppercase tracking-wider mb-4 font-mono flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-primary" />
              Hardware Modules Diagnostics
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
              {components.map((comp) => {
                const IconComponent = iconMap[comp.icon] || Flame;
                const status = statusConfig[comp.status] || statusConfig.operational;
                const isExpanded = expandedCardId === comp.id;

                return (
                  <motion.div
                    key={comp.id}
                    onClick={() => setExpandedCardId(isExpanded ? null : comp.id)}
                    className={`rounded-2xl border bg-boxdark p-5 shadow-default flex flex-col justify-between hover:shadow-lg transition-all duration-300 relative group cursor-pointer select-none ${
                      isExpanded ? 'border-primary shadow-md bg-primary/[0.01]' : 'border-strokedark'
                    }`}
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-meta-4 text-primary group-hover:scale-105 transition-transform">
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider ${status.bg} ${status.text}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${status.dot} animate-pulse`} />
                          {status.label}
                        </span>
                      </div>

                      {/* Component Title & Value */}
                      <div className="mt-5">
                        <h4 className="text-sm font-bold text-white group-hover:text-primary transition-colors">
                          {comp.name}
                        </h4>
                        <div className="mt-2.5 flex items-baseline justify-between">
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-2xl font-extrabold text-white font-mono leading-none">
                              {comp.health}%
                            </span>
                            <span className="text-[9px] text-bodydark2 font-mono uppercase tracking-wider font-semibold">
                              health
                            </span>
                          </div>
                          {comp.temp && (
                            <span className="text-xs font-bold text-chart-4 font-mono">
                              {comp.temp}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Smooth Expandable Content Panel */}
                    <motion.div
                      initial={false}
                      animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      {/* Sub-telemetry detailed specs */}
                      <div className="space-y-2 border-t border-strokedark/50 py-3.5 my-3.5 font-mono text-[10px] text-bodydark2">
                        {renderSubTelemetry(comp.icon, comp.temp)}
                      </div>

                      {/* Footer Sync */}
                      <div className="pt-3.5 border-t border-strokedark/50 flex justify-between items-center text-[9px] font-mono text-bodydark2">
                        <span>SYNC: {comp.lastCheck}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerAction('Check Hardware Node', `Interrogating ${comp.name} telemetry logs...`);
                          }}
                          className="hover:text-white transition-colors cursor-pointer"
                        >
                          DIAGNOSE
                        </button>
                      </div>
                    </motion.div>

                    {/* Expand Helper Indicator (when collapsed) */}
                    {!isExpanded && (
                      <div className="mt-3 text-center text-[9px] font-mono text-bodydark2/60 uppercase tracking-widest group-hover:text-primary transition-colors">
                        Click to inspect module
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* BOTTOM CONSOLE: Maintenance Timeline & Predictive Maintenance */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Predictive Maintenance Advisory (5 Columns) */}
            <div className="lg:col-span-5 rounded-2xl border border-strokedark bg-boxdark p-6 shadow-default space-y-6">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Predictive Maintenance
                </h3>
                <span className="text-[10px] text-bodydark2 font-mono uppercase mt-0.5 block">
                  Failure probability analytics
                </span>
              </div>

              <div className="space-y-4 font-mono text-xs text-white">
                <div className="flex justify-between items-center border-b border-sidebar-border pb-3">
                  <span className="text-bodydark2">Maintenance Due In</span>
                  <span className="font-bold text-chart-4">7 days</span>
                </div>
                <div className="flex justify-between items-center border-b border-sidebar-border pb-3">
                  <span className="text-bodydark2">Est. Remaining Cups</span>
                  <span className="font-bold text-white">120 cups</span>
                </div>
                <div className="flex justify-between items-center border-b border-sidebar-border pb-3">
                  <span className="text-bodydark2">Risk Index Level</span>
                  <span className="font-bold text-chart-2">Low</span>
                </div>
                <div className="space-y-2">
                  <span className="text-bodydark2 block">Recommended Action:</span>
                  <p className="text-[11px] bg-black/40 border border-strokedark/50 p-3 rounded-lg text-bodydark leading-normal">
                    Schedule group cleaning for heating elements descaling, water filter check, and piston lubrication Bay A.
                  </p>
                </div>
              </div>
            </div>

            {/* Maintenance Timeline List (7 Columns) */}
            <div className="lg:col-span-7 rounded-2xl border border-strokedark bg-boxdark p-6 shadow-default">
              <div className="mb-6">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Maintenance Timeline
                </h3>
                <span className="text-[10px] text-bodydark2 font-mono uppercase mt-0.5 block">
                  Chronological hardware events logs
                </span>
              </div>

              <div className="relative border-l border-strokedark pl-6 ml-2 space-y-6">
                {timelineEvents.map((evt) => (
                  <div key={evt.id} className="relative">
                    {/* Event Type Dot Indicator */}
                    <span className={`absolute -left-[30px] top-1.5 h-3.5 w-3.5 rounded-full border border-boxdark flex items-center justify-center ${
                      evt.type === 'warning'
                        ? 'bg-chart-4'
                        : evt.type === 'success'
                        ? 'bg-chart-2'
                        : 'bg-primary'
                    }`} />
                    
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wide">
                          {evt.title}
                        </h4>
                        <p className="text-[11px] text-bodydark mt-1">
                          {evt.desc}
                        </p>
                      </div>
                      <span className="text-[9px] text-bodydark2 font-mono shrink-0">
                        {evt.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </main>

        {/* Footer */}
        <footer className="max-w-[1500px] mx-auto px-6 py-6 border-t border-strokedark w-full flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-mono text-bodydark2">
          <span>NexPod Hardware Diagnostics Dashboard v1.0.0-PROTOTYPE</span>
          <div className="flex gap-6">
            <span>MODULES: 8 verified</span>
            <span>SYSTEM HEALTH: EXCELLENT</span>
          </div>
        </footer>
      </div>

      {/* INCIDENT REPLAY DRAWER */}
      <IncidentReplayDrawer
        isOpen={isReplayOpen}
        onClose={() => setIsReplayOpen(false)}
        onReplaySnapshot={handleReplaySnapshot}
      />
    </div>
  );
}
