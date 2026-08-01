'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3 as ChartColumn,
  Unplug,
  Radio,
  Clock,
  Sparkles,
  Zap,
  Activity,
  Cpu,
  Wifi,
  Thermometer,
  Lock,
  Layers,
  Flame,
  Gauge,
  Terminal,
  Database,
  Sliders,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';

import { api } from '../../lib/api';
import { Sidebar } from '../../components/Sidebar';
import { Header } from '../../components/Header';
import { useLiveClock } from '../../hooks/useLiveClock';
import { usePolling } from '../../hooks/usePolling';
import { useWebSocket, WsStatus } from '../../hooks/useWebSocket';
import { WsTelemetrySnapshot } from '../../lib/api';
import { logger } from '../../lib/logger';

interface SensorCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  detail?: string;
}

const SensorCard: React.FC<SensorCardProps> = ({ label, value, icon: Icon, color, detail }) => (
  <div className="p-4 rounded-xl border border-strokedark bg-boxdark shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between group">
    <div>
      <span className="text-[10px] font-mono text-bodydark2 uppercase tracking-wider block">
        {label}
      </span>
      <span className="text-xl font-bold text-white font-mono mt-1 block">
        {value}
      </span>
      {detail && (
        <span className="text-[9px] text-bodydark2 font-mono block mt-0.5">
          {detail}
        </span>
      )}
    </div>
    <div className={`p-2.5 rounded-lg bg-meta-4 ${color} group-hover:scale-105 transition-transform`}>
      <Icon className="w-4.5 h-4.5" />
    </div>
  </div>
);

export default function TelemetryPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState(2);
  const [lastSyncSeconds, setLastSyncSeconds] = useState(0);
  const liveTime = useLiveClock();
  const [simMode, setSimMode] = useState('Evening Rush');
  const [showDebug, setShowDebug] = useState(false);
  const [wsStatus, setWsStatus] = useState<WsStatus>('connecting');

  // Live pod status state
  const [podStatus, setPodStatus] = useState({
    activity: 'Preparing Cappuccino',
    queue: '3 Orders',
    avgPrepTime: '52 sec',
    ordersThisHour: 75,
    revenue: '₹7,345',
    runtimeTick: 756,
    uptime: '00:41:22',
  });

  // Live sensors state
  const [sensors, setSensors] = useState({
    temperature: '64°C',
    humidity: '42%',
    voltage: '230V',
    powerDraw: '2.1 kW',
    latency: '12ms',
    cpu: '28%',
    memory: '42%',
    water: '78%',
    milk: '42%',
    beans: '67%',
    current: '9.1 A',
  });

  // System status state
  const [systemStatus, setSystemStatus] = useState({
    backend: 'Connected',
    database: 'Connected',
    runtime: 'Running',
    scheduler: 'Running',
    api: 'Healthy',
  });

  // Debug Panel state
  const [debugData, setDebugData] = useState({
    tick: 756,
    simMinute: 756,
    ordersGenerated: 75,
    alertsGenerated: 2,
    runtimeMemory: '14.2 MB',
    lastException: 'None / OK',
    schedulerDelay: '0.2 ms / OK',
  });

  // Real-time terminal log stream state
  const [logs, setLogs] = useState<Array<{ time: string; msg: string; type: 'info' | 'warn' | 'success' }>>([]);

  // Subsystems selection details
  const [selectedSubsystem, setSelectedSubsystem] = useState<string | null>(null);
  const [dynamicSubsystems, setDynamicSubsystems] = useState<any>({
    coffee_machine: { name: 'Coffee Machine', status: 'Healthy', color: 'text-chart-2', desc: 'Brewing elements operating normally.' },
    water_tank: { name: 'Water Tank', status: 'Healthy', color: 'text-chart-2', desc: 'Water reservoir level optimal.' },
    milk_tank: { name: 'Milk Tank', status: 'Warning', color: 'text-chart-4', desc: 'Milk level warning dispatched.' },
    bean_hopper: { name: 'Bean Hopper', status: 'Healthy', color: 'text-chart-2', desc: 'Reserves capacity stable.' },
    pump: { name: 'Piston Pump', status: 'Healthy', color: 'text-chart-2', desc: 'High pressure extraction pump OK.' },
    door_lock: { name: 'Door Lock', status: 'Healthy', color: 'text-chart-2', desc: 'Electromechanical locker closed.' },
    network_module: { name: 'Network Module', status: 'Healthy', color: 'text-chart-2', desc: 'Uplink 5G connectivity stable.' },
    power_supply: { name: 'Power Supply', status: 'Healthy', color: 'text-chart-2', desc: 'AC main voltage regulated.' },
  });

  // Tick the sync seconds timer locally
  useEffect(() => {
    const interval = setInterval(() => {
      setLastSyncSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // ── WebSocket: real-time push handler ──────────────────────────────────────
  const handleWsMessage = (data: WsTelemetrySnapshot) => {
    if (data.type === 'ping') return;
    setLastSyncSeconds(0);
    setNotifications(data.dashboard.alerts);
    setSimMode(data.dashboard.simulationMode);

    setPodStatus({
      activity: data.dashboard.alerts > 0 ? 'Preparing Cappuccino' : 'Idle (Nominal)',
      queue: data.dashboard.alerts > 0 ? '3 Orders' : '0 Orders',
      avgPrepTime: '52 sec',
      ordersThisHour: data.dashboard.orders,
      revenue: `₹${data.dashboard.revenue.toLocaleString('en-IN')}`,
      runtimeTick: data.runtime.runtimeTick,
      uptime: data.runtime.uptime,
    });

    if (data.telemetry && data.telemetry[0]) {
      const t = data.telemetry[0];
      const currentVal = (t.power_draw_w / 230).toFixed(1);

      let waterPercent = 78, milkPercent = 42, beansPercent = 67;
      if (data.inventory) {
        const waterItem = data.inventory.find((i) => i.sku === 'water');
        const milkItem  = data.inventory.find((i) => i.sku === 'cold-brew');
        const beansItem = data.inventory.find((i) => i.sku === 'protein-bar');
        if (waterItem) waterPercent = waterItem.quantity;
        if (milkItem)  milkPercent  = milkItem.quantity;
        if (beansItem) beansPercent = beansItem.quantity;
      }

      setSensors({
        temperature: `${Math.round(t.temperature_c)}°C`,
        humidity: '42%',
        voltage: '230V',
        powerDraw: `${(t.power_draw_w / 1000).toFixed(1)} kW`,
        latency: `${Math.round(t.network_latency_ms)}ms`,
        cpu: '24%',
        memory: '38%',
        water: `${waterPercent}%`,
        milk: `${milkPercent}%`,
        beans: `${beansPercent}%`,
        current: `${currentVal} A`,
      });

      const isMilkLow  = milkPercent  <= 45;
      const isWaterLow = waterPercent <= 30;
      const isBeansLow = beansPercent <= 30;
      setDynamicSubsystems({
        coffee_machine: { name: 'Coffee Machine', status: 'Healthy', color: 'text-chart-2', desc: 'Main espresso brewer & steam valves operating nominal.' },
        water_tank:     { name: 'Water Tank',     status: isWaterLow ? 'Warning' : 'Healthy', color: isWaterLow ? 'text-chart-4' : 'text-chart-2', desc: `Water reservoir at ${waterPercent}%.` },
        milk_tank:      { name: 'Milk Tank',      status: isMilkLow  ? 'Warning' : 'Healthy', color: isMilkLow  ? 'text-chart-4' : 'text-chart-2', desc: `Milk level at ${milkPercent}%. ${isMilkLow ? 'Drone auto-refill warning.' : 'Reserves nominal.'}` },
        bean_hopper:    { name: 'Bean Hopper',    status: isBeansLow ? 'Warning' : 'Healthy', color: isBeansLow ? 'text-chart-4' : 'text-chart-2', desc: `Coffee beans at ${beansPercent}%.` },
        pump:           { name: 'Piston Pump',    status: 'Healthy', color: 'text-chart-2', desc: 'Extraction pressure stable at 9.2 Bar.' },
        door_lock:      { name: 'Door Lock',      status: 'Healthy', color: 'text-chart-2', desc: 'Pneumatic magnetic lock solenoid locked.' },
        network_module: { name: 'Network Module', status: 'Healthy', color: 'text-chart-2', desc: 'Dual-path telemetry healthy.' },
        power_supply:   { name: 'Power Supply',   status: 'Healthy', color: 'text-chart-2', desc: 'Input voltage within nominal range.' },
      });
    }

    setSystemStatus({
      backend: data.health.backendStatus === 'Healthy' ? 'Connected' : 'Disconnected',
      database: 'Connected',
      runtime: data.health.runtimeStatus === 'Running' ? 'Running' : 'Offline',
      scheduler: 'Running',
      api: 'Healthy',
    });

    setDebugData((prev) => ({
      ...prev,
      tick: data.runtime.runtimeTick,
      simMinute: data.runtime.runtimeTick,
      ordersGenerated: data.runtime.ordersGenerated,
      alertsGenerated: data.dashboard.alerts,
    }));

    setLogs(
      data.dashboard.alerts > 0
        ? [
            { time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }), msg: 'Milk Warning — Level dropped below 45% threshold', type: 'warn' },
            { time: '14:15:44', msg: 'Door Lock — Micro-vibration detected in lock cycle', type: 'warn' },
            { time: '13:52:01', msg: 'Heating Unit — Temperature stabilized at 93.5°C', type: 'success' },
            { time: '13:30:00', msg: 'Internet — Latency spike resolved — gateway rerouted', type: 'info' },
          ]
        : [
            { time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }), msg: 'System — All diagnostic reports passed sweeps', type: 'success' },
            { time: '13:52:01', msg: 'Heating Unit — Temperature stabilized at 93.5°C', type: 'success' },
            { time: '13:30:00', msg: 'Internet — Latency spike resolved — gateway rerouted', type: 'info' },
            { time: '12:10:22', msg: 'Power Supply — UPS battery fully charged', type: 'info' },
          ]
    );
  };

  const { status: wsStatusVal } = useWebSocket<WsTelemetrySnapshot>({
    onMessage: handleWsMessage,
  });

  // Sync WS status into local state for the badge
  useEffect(() => { setWsStatus(wsStatusVal); }, [wsStatusVal]);

  // Polling every 5 seconds using custom hook
  const fetchTelemetry = async () => {
    try {
      const runtime = await api.getRuntime();
      const dash = await api.getDashboard();
      const tele = await api.getTelemetry();
      const inv = await api.getInventory();
      const health = await api.getHealth();

      // 1. Reset sync timer
      setLastSyncSeconds(0);

      // 2. Set Notifications count
      setNotifications(dash.alerts);

      // 3. Update Live Pod Status
      setSimMode(runtime.simulationMode);
      setPodStatus({
        activity: dash.alerts > 0 ? 'Preparing Cappuccino' : 'Idle (Nominal)',
        queue: dash.alerts > 0 ? '3 Orders' : '0 Orders',
        avgPrepTime: '52 sec',
        ordersThisHour: dash.orders,
        revenue: `₹${dash.revenue.toLocaleString('en-IN')}`,
        runtimeTick: runtime.runtimeTick,
        uptime: runtime.uptime,
      });

      // 4. Update Sensors from telemetry & inventory
      if (tele && tele[0]) {
        const t = tele[0];
        const currentVal = (t.power_draw_w / 230).toFixed(1);
        
        let waterPercent = 78;
        let milkPercent = 42;
        let beansPercent = 67;
        let sugarPercent = 90;
        let teaPercent = 75;
        
        if (inv.pods && inv.pods[0]) {
          const milkItem = inv.pods[0].inventory.find((i: any) => i.sku === 'milk');
          const waterItem = inv.pods[0].inventory.find((i: any) => i.sku === 'water');
          const beansItem = inv.pods[0].inventory.find((i: any) => i.sku === 'coffee_beans');
          const sugarItem = inv.pods[0].inventory.find((i: any) => i.sku === 'sugar');
          const teaItem = inv.pods[0].inventory.find((i: any) => i.sku === 'tea_powder');
          
          if (milkItem) milkPercent = milkItem.quantity;
          if (waterItem) waterPercent = waterItem.quantity;
          if (beansItem) beansPercent = beansItem.quantity;
          if (sugarItem) sugarPercent = sugarItem.quantity;
          if (teaItem) teaPercent = teaItem.quantity;
        }

        setSensors({
          temperature: `${Math.round(t.temperature_c)}°C`,
          humidity: '42%',
          voltage: '230V',
          powerDraw: `${(t.power_draw_w / 1000).toFixed(1)} kW`,
          latency: `${t.network_latency_ms}ms`,
          cpu: '24%',
          memory: '38%',
          water: `${waterPercent}%`,
          milk: `${milkPercent}%`,
          beans: `${beansPercent}%`,
          current: `${currentVal} A`,
        });

        // 5. Update Schematic color states dynamically based on inventory health
        const isMilkLow = milkPercent <= 45;
        const isWaterLow = waterPercent <= 30;
        const isBeansLow = beansPercent <= 30;

        setDynamicSubsystems({
          coffee_machine: { name: 'Coffee Machine', status: 'Healthy', color: 'text-chart-2', desc: 'Main espresso brewer & steam valves operating nominal.' },
          water_tank: {
            name: 'Water Tank',
            status: isWaterLow ? 'Warning' : 'Healthy',
            color: isWaterLow ? 'text-chart-4' : 'text-chart-2',
            desc: `Water reservoir load cells check is at ${waterPercent}%.`
          },
          milk_tank: {
            name: 'Milk Tank',
            status: isMilkLow ? 'Warning' : 'Healthy',
            color: isMilkLow ? 'text-chart-4' : 'text-chart-2',
            desc: `Milk level is at ${milkPercent}%. ${isMilkLow ? 'Dynamic Drone Auto-refill route warning.' : 'Reserves nominal.'}`
          },
          bean_hopper: {
            name: 'Bean Hopper',
            status: isBeansLow ? 'Warning' : 'Healthy',
            color: isBeansLow ? 'text-chart-4' : 'text-chart-2',
            desc: `Coffee beans hopper level at ${beansPercent}%.`
          },
          pump: { name: 'Piston Pump', status: 'Healthy', color: 'text-chart-2', desc: 'Extraction pressure is stable at 9.2 Bar.' },
          door_lock: { name: 'Door Lock', status: 'Healthy', color: 'text-chart-2', desc: 'Pneumatic magnetic lock solenoid locked.' },
          network_module: { name: 'Network Module', status: 'Healthy', color: 'text-chart-2', desc: 'Dual-path Webpack HMR socket telemetry healthy.' },
          power_supply: { name: 'Power Supply', status: 'Healthy', color: 'text-chart-2', desc: 'Input voltage within nominal range.' },
        });
      }

      // 6. Update System Status
      setSystemStatus({
        backend: health.backendStatus === 'Healthy' ? 'Connected' : 'Disconnected',
        database: health.databaseStatus === 'Connected' ? 'Connected' : 'Error',
        runtime: health.runtimeStatus === 'Running' ? 'Running' : 'Offline',
        scheduler: 'Running',
        api: health.apiStatus === 'Healthy' ? 'Healthy' : 'Degraded',
      });

      // 7. Update Debug Panel details
      setDebugData({
        tick: runtime.runtimeTick,
        simMinute: runtime.runtimeTick,
        ordersGenerated: runtime.ordersGenerated,
        alertsGenerated: dash.alerts,
        runtimeMemory: '14.2 MB',
        lastException: 'None / OK',
        schedulerDelay: '0.2 ms / OK',
      });

      // 8. Update Event Timeline Logs dynamically from alerts
      if (dash.alerts > 0) {
        setLogs([
          { time: '14:28:12', msg: 'Milk Warning - Level dropped below 45% threshold', type: 'warn' },
          { time: '14:15:44', msg: 'Door Lock - Micro-vibration detected in lock cycle', type: 'warn' },
          { time: '13:52:01', msg: 'Heating Unit - Temperature stabilized at 93.5°C', type: 'success' },
          { time: '13:30:00', msg: 'Internet - Latency spike resolved — gateway rerouted', type: 'info' },
          { time: '12:10:22', msg: 'Power Supply - UPS battery fully charged', type: 'info' },
        ]);
      } else {
        setLogs([
          { time: '14:32:00', msg: 'System - All diagnostic reports passed sweeps', type: 'success' },
          { time: '13:52:01', msg: 'Heating Unit - Temperature stabilized at 93.5°C', type: 'success' },
          { time: '13:30:00', msg: 'Internet - Latency spike resolved — gateway rerouted', type: 'info' },
          { time: '12:10:22', msg: 'Power Supply - UPS battery fully charged', type: 'info' },
          { time: '11:45:18', msg: 'Temperature - Cooling fan speed set to 1350 RPM', type: 'info' },
        ]);
      }

    } catch (err) {
      logger.error("Telemetry polling check failed:", err);
    }
  };

  // Polling every 5 seconds — disabled when WebSocket is active (avoids duplicate fetches)
  usePolling(fetchTelemetry, 5000, [], wsStatus !== 'open');

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
          {/* Hero Header */}
          <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 mb-6 border-b border-strokedark pb-6">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  <ChartColumn className="w-6 h-6 text-primary" />
                  Pod Telemetry
                </h2>
                {/* Dynamic WebSocket connection status badge */}
                {wsStatus === 'open' ? (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-meta-3/15 text-meta-3 border border-meta-3/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-meta-3 animate-pulse" />
                    🟢 LIVE
                  </span>
                ) : wsStatus === 'connecting' ? (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-chart-4/15 text-chart-4 border border-chart-4/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-chart-4 animate-pulse" />
                    🟡 CONNECTING
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-red-500/15 text-red-400 border border-red-500/20">
                    <Unplug className="w-3 h-3 text-red-400" />
                    OFFLINE
                  </span>
                )}
              </div>
              <p className="text-xs text-bodydark2 mt-1 font-medium font-mono">
                NexPod Atrium · MISSION CONTROL SYSTEM TELEMETRY STREAM
              </p>
            </div>

            <div className="flex flex-wrap gap-3 text-xs font-mono text-bodydark2">
              <div className="bg-boxdark border border-strokedark px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span>Last Sync: <span className="text-white font-bold">{lastSyncSeconds} sec ago</span></span>
              </div>
              <div className="bg-boxdark border border-strokedark px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-chart-4" />
                <span>Simulation: <span className="text-white font-bold">{simMode}</span></span>
              </div>
            </div>
          </div>

          {/* Grid Layout: Left Column (Live Sensors + Metrics + Timeline), Right Column (Blueprint Schematic) */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            
            {/* LEFT COLUMN (8 Columns) */}
            <div className="xl:col-span-7 space-y-6">
              
              {/* 1. Live Sensors Grid */}
              <div>
                <h3 className="text-xs font-bold text-bodydark2 uppercase tracking-wider mb-4 font-mono flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-primary" />
                  Live Sensor Array
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  <SensorCard label="Temperature" value={sensors.temperature} icon={Thermometer} color="text-meta-1" detail="Boiler Element" />
                  <SensorCard label="Voltage" value={sensors.voltage} icon={Zap} color="text-chart-4" detail="Stabilized Input" />
                  <SensorCard label="Power Draw" value={sensors.powerDraw} icon={Cpu} color="text-chart-2" detail="Consumption" />
                  <SensorCard label="Current" value={sensors.current} icon={Zap} color="text-chart-2" detail="Amp Draw" />
                  <SensorCard label="Network Latency" value={sensors.latency} icon={Wifi} color="text-chart-2" detail="Ping latency" />
                  <SensorCard label="CPU Usage" value={sensors.cpu} icon={Cpu} color="text-primary" detail="Core load" />
                  <SensorCard label="Memory Usage" value={sensors.memory} icon={Database} color="text-primary" detail="Cache utilization" />
                  <SensorCard label="Water level" value={sensors.water} icon={Layers} color="text-chart-2" detail="Tank capacity" />
                  <SensorCard label="Milk level" value={sensors.milk} icon={Layers} color={parseInt(sensors.milk) <= 45 ? "text-chart-4" : "text-chart-2"} detail="Reserves status" />
                  <SensorCard label="Beans Level" value={sensors.beans} icon={Flame} color="text-chart-2" detail="Bean Hopper" />
                  <SensorCard label="Humidity" value={sensors.humidity} icon={Layers} color="text-primary" detail="Internal cavity" />
                </div>
              </div>

              {/* 2. Runtime Metrics Grid */}
              <div>
                <h3 className="text-xs font-bold text-bodydark2 uppercase tracking-wider mb-4 font-mono flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-primary" />
                  Vending Runtime Metrics
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl border border-strokedark bg-boxdark text-center font-mono">
                    <span className="text-[10px] text-bodydark2 uppercase">Current Activity</span>
                    <span className="block text-xs font-bold text-white mt-2 truncate text-primary animate-pulse">
                      {podStatus.activity}
                    </span>
                  </div>
                  <div className="p-4 rounded-xl border border-strokedark bg-boxdark text-center font-mono">
                    <span className="text-[10px] text-bodydark2 uppercase">Queue Size</span>
                    <span className="block text-xl font-bold text-white mt-1">{podStatus.queue}</span>
                  </div>
                  <div className="p-4 rounded-xl border border-strokedark bg-boxdark text-center font-mono">
                    <span className="text-[10px] text-bodydark2 uppercase">Orders count</span>
                    <span className="block text-xl font-bold text-white mt-1">{podStatus.ordersThisHour}</span>
                  </div>
                  <div className="p-4 rounded-xl border border-strokedark bg-boxdark text-center font-mono">
                    <span className="text-[10px] text-bodydark2 uppercase">Revenue</span>
                    <span className="block text-xl font-bold text-chart-2 mt-1">{podStatus.revenue}</span>
                  </div>
                  <div className="p-4 rounded-xl border border-strokedark bg-boxdark text-center font-mono">
                    <span className="text-[10px] text-bodydark2 uppercase">Runtime Tick</span>
                    <span className="block text-xl font-bold text-white mt-1">#{podStatus.runtimeTick}</span>
                  </div>
                  <div className="p-4 rounded-xl border border-strokedark bg-boxdark text-center font-mono">
                    <span className="text-[10px] text-bodydark2 uppercase">Uptime Session</span>
                    <span className="block text-xl font-bold text-white mt-1">{podStatus.uptime}</span>
                  </div>
                </div>
              </div>

              {/* 3. Event Stream log terminal */}
              <div>
                <h3 className="text-xs font-bold text-bodydark2 uppercase tracking-wider mb-4 font-mono flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-primary" />
                  Live Operational Log Stream
                </h3>
                <div className="rounded-xl border border-strokedark bg-black p-4 font-mono text-xs text-bodydark leading-relaxed shadow-inner max-h-[220px] overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-strokedark/50 pb-2 mb-2">
                    <span className="text-[10px] text-bodydark2 uppercase tracking-wider font-bold">SYSTEM EVENT LOG://V1.0</span>
                    <span className="text-[10px] text-chart-2 animate-pulse">STREAMING LIVE</span>
                  </div>
                  <div className="space-y-1.5">
                    {logs.map((log, index) => (
                      <div key={index} className="flex gap-2">
                        <span className="text-bodydark2 shrink-0">[{log.time}]</span>
                        <span className={log.type === 'warn' ? 'text-chart-4 font-bold' : log.type === 'success' ? 'text-chart-2 font-bold' : 'text-primary'}>
                          {log.type === 'warn' ? 'WRN:' : log.type === 'success' ? 'OK:' : 'INF:'}
                        </span>
                        <span className="text-bodydark">{log.msg}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN (5 Columns - Visual Diagram) */}
            <div className="xl:col-span-5 space-y-6">
              
              {/* Pod Blueprint Schematic */}
              <div>
                <h3 className="text-xs font-bold text-bodydark2 uppercase tracking-wider mb-4 font-mono flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-primary" />
                  Subsystem Health Schematic
                </h3>

                <div className="rounded-2xl border border-strokedark bg-boxdark p-6 shadow-default flex flex-col justify-between min-h-[480px]">
                  
                  {/* SVG Blueprint */}
                  <div className="relative flex justify-center py-4 bg-black/40 rounded-xl border border-strokedark/50 p-6">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:20px_20px] opacity-10 pointer-events-none" />

                    <svg width="280" height="340" viewBox="0 0 280 340" className="relative z-10">
                      <rect x="10" y="10" width="260" height="320" rx="20" fill="none" stroke="#2e3a47" strokeWidth="2.5" strokeDasharray="4 4" />

                      {/* Water Tank (Healthy/Warning) */}
                      <g onClick={() => setSelectedSubsystem('water_tank')} className="cursor-pointer group">
                        <rect x="25" y="30" width="70" height="80" rx="8" fill="#1e293b" stroke={dynamicSubsystems.water_tank.status === 'Warning' ? '#ffba00' : '#10b981'} strokeWidth="2" className="transition-colors group-hover:fill-slate-800" />
                        <text x="60" y="75" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">Water Tank</text>
                        <circle cx="60" cy="45" r="4" fill={dynamicSubsystems.water_tank.status === 'Warning' ? '#ffba00' : '#10b981'} className="animate-pulse" />
                      </g>

                      {/* Milk Tank (Healthy/Warning) */}
                      <g onClick={() => setSelectedSubsystem('milk_tank')} className="cursor-pointer group">
                        <rect x="185" y="30" width="70" height="80" rx="8" fill="#1e293b" stroke={dynamicSubsystems.milk_tank.status === 'Warning' ? '#ffba00' : '#10b981'} strokeWidth="2" className="transition-colors group-hover:fill-slate-800" />
                        <text x="220" y="75" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">Milk Tank</text>
                        <circle cx="220" cy="45" r="4" fill={dynamicSubsystems.milk_tank.status === 'Warning' ? '#ffba00' : '#10b981'} className="animate-pulse" />
                      </g>

                      {/* Bean Hopper */}
                      <g onClick={() => setSelectedSubsystem('bean_hopper')} className="cursor-pointer group">
                        <rect x="105" y="50" width="70" height="50" rx="8" fill="#1e293b" stroke={dynamicSubsystems.bean_hopper.status === 'Warning' ? '#ffba00' : '#10b981'} strokeWidth="2" className="transition-colors group-hover:fill-slate-800" />
                        <text x="140" y="80" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">Bean Hopper</text>
                        <circle cx="140" cy="65" r="4" fill={dynamicSubsystems.bean_hopper.status === 'Warning' ? '#ffba00' : '#10b981'} />
                      </g>

                      {/* Coffee Machine Brewer */}
                      <g onClick={() => setSelectedSubsystem('coffee_machine')} className="cursor-pointer group">
                        <rect x="40" y="150" width="200" height="70" rx="12" fill="#1e293b" stroke="#10b981" strokeWidth="2" className="transition-colors group-hover:fill-slate-800" />
                        <text x="140" y="190" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold">Coffee Brewer</text>
                        <circle cx="60" cy="170" r="4" fill="#10b981" />
                      </g>

                      {/* Piston Pump */}
                      <g onClick={() => setSelectedSubsystem('pump')} className="cursor-pointer group">
                        <rect x="105" y="110" width="70" height="30" rx="6" fill="#1e293b" stroke="#10b981" strokeWidth="1.5" className="transition-colors group-hover:fill-slate-800" />
                        <text x="140" y="128" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="bold">Piston Pump</text>
                      </g>

                      {/* Door Lock */}
                      <g onClick={() => setSelectedSubsystem('door_lock')} className="cursor-pointer group">
                        <rect x="25" y="240" width="70" height="50" rx="8" fill="#1e293b" stroke="#10b981" strokeWidth="2" className="transition-colors group-hover:fill-slate-800" />
                        <text x="60" y="270" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="bold">Door Lock</text>
                        <circle cx="45" cy="255" r="3.5" fill="#10b981" />
                      </g>

                      {/* Network Module */}
                      <g onClick={() => setSelectedSubsystem('network_module')} className="cursor-pointer group">
                        <rect x="105" y="240" width="70" height="50" rx="8" fill="#1e293b" stroke="#10b981" strokeWidth="2" className="transition-colors group-hover:fill-slate-800" />
                        <text x="140" y="270" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="bold">Network 5G</text>
                        <circle cx="120" cy="255" r="3.5" fill="#10b981" />
                      </g>

                      {/* Power Supply */}
                      <g onClick={() => setSelectedSubsystem('power_supply')} className="cursor-pointer group">
                        <rect x="185" y="240" width="70" height="50" rx="8" fill="#1e293b" stroke="#10b981" strokeWidth="2" className="transition-colors group-hover:fill-slate-800" />
                        <text x="220" y="270" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="bold">Power Supply</text>
                        <circle cx="200" cy="255" r="3.5" fill="#10b981" />
                      </g>
                    </svg>
                  </div>

                  {/* Schematic Details Inspection */}
                  <div className="mt-4 p-4 rounded-xl bg-black border border-strokedark flex-grow flex flex-col justify-center min-h-[90px]">
                    <AnimatePresence mode="wait">
                      {selectedSubsystem ? (
                        <motion.div
                          key={selectedSubsystem}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="space-y-1"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                              {dynamicSubsystems[selectedSubsystem].name}
                            </span>
                            <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                              dynamicSubsystems[selectedSubsystem].status === 'Warning'
                                ? 'bg-chart-4/15 text-chart-4 border border-chart-4/20'
                                : 'bg-chart-2/15 text-chart-2 border border-chart-2/20'
                            }`}>
                              {dynamicSubsystems[selectedSubsystem].status}
                            </span>
                          </div>
                          <p className="text-[11px] text-bodydark mt-1">
                            {dynamicSubsystems[selectedSubsystem].desc}
                          </p>
                        </motion.div>
                      ) : (
                        <div className="text-center py-2 text-xs text-bodydark2 font-mono">
                          💡 Tap components on blueprint to inspect load cell levels
                        </div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Status Legend */}
                  <div className="mt-4 pt-3 border-t border-strokedark flex items-center justify-between text-[9px] font-mono text-bodydark2">
                    <span>LEGEND:</span>
                    <div className="flex gap-2.5">
                      <span className="flex items-center gap-1 font-semibold text-chart-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-chart-2" />
                        HEALTHY
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-chart-4">
                        <span className="w-1.5 h-1.5 rounded-full bg-chart-4" />
                        WARNING
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. System Status Panel */}
              <div className="rounded-2xl border border-strokedark bg-boxdark p-6 shadow-default">
                <h3 className="text-xs font-bold text-bodydark2 uppercase tracking-wider mb-4 font-mono flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-primary" />
                  System Nodes Connectivity
                </h3>
                <div className="space-y-2.5 font-mono text-xs">
                  <div className="flex justify-between items-center border-b border-strokedark/50 pb-2">
                    <span className="text-bodydark2">Backend API Connection</span>
                    <span className={`font-bold ${systemStatus.backend === 'Connected' ? 'text-chart-2' : 'text-destructive'}`}>
                      {systemStatus.backend}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-strokedark/50 pb-2">
                    <span className="text-bodydark2">Database Server</span>
                    <span className={`font-bold ${systemStatus.database === 'Connected' ? 'text-chart-2' : 'text-destructive'}`}>
                      {systemStatus.database}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-strokedark/50 pb-2">
                    <span className="text-bodydark2">Runtime Engine</span>
                    <span className="text-chart-2 font-bold">{systemStatus.runtime}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-strokedark/50 pb-2">
                    <span className="text-bodydark2">Scheduler Ticking</span>
                    <span className="text-chart-2 font-bold">{systemStatus.scheduler}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-bodydark2">Gateway Status</span>
                    <span className="text-chart-2 font-bold">{systemStatus.api}</span>
                  </div>
                </div>
              </div>

              {/* 5. Developer Debug Console (Toggleable) */}
              <div className="rounded-2xl border border-strokedark bg-boxdark p-6 shadow-default">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xs font-bold text-bodydark2 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-primary" />
                    Developer Debug Console
                  </h3>
                  <button
                    onClick={() => setShowDebug(!showDebug)}
                    className="text-[10px] font-mono font-bold text-primary border border-primary/20 bg-primary/5 px-2.5 py-1 rounded hover:bg-primary/10 transition-colors"
                  >
                    {showDebug ? 'HIDE' : 'SHOW'}
                  </button>
                </div>

                <AnimatePresence>
                  {showDebug && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-2.5 font-mono text-xs overflow-hidden pt-2 border-t border-strokedark"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-bodydark2">Runtime Tick:</span>
                        <span className="text-white font-semibold">#{debugData.tick}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-bodydark2">Simulation Minute:</span>
                        <span className="text-white font-semibold">#{debugData.simMinute}m</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-bodydark2">Orders Generated:</span>
                        <span className="text-white font-semibold">{debugData.ordersGenerated}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-bodydark2">Alerts Count:</span>
                        <span className="text-chart-4 font-semibold">{debugData.alertsGenerated} active</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-bodydark2">Memory Usage:</span>
                        <span className="text-white font-semibold">{debugData.runtimeMemory}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-bodydark2">Last Exception:</span>
                        <span className="text-chart-2 font-semibold">{debugData.lastException}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-bodydark2">Scheduler Delay:</span>
                        <span className="text-chart-2 font-semibold">{debugData.schedulerDelay}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
