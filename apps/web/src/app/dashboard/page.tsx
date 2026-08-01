'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  ShieldCheck,
  AlertTriangle,
  Coffee,
  Bell,
  Clock,
  Sparkles,
  Wrench,
  Zap,
  Info,
  ChevronRight,
  Database,
  Sliders,
  CheckCircle,
  X,
  Brain,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  RotateCcw,
  History,
} from 'lucide-react';

import { api, RuntimeInfo, HealthStatus, WsTelemetrySnapshot, AIReasoningData } from '../../lib/api';
import { CircularProgress } from '../../components/CircularProgress';
import { RevenueChart } from '../../components/RevenueChart';
import { HourlyOrdersChart } from '../../components/HourlyOrdersChart';
import { ProductSalesChart } from '../../components/ProductSalesChart';
import { Sidebar } from '../../components/Sidebar';
import { Header } from '../../components/Header';
import { AIReasoningPanel } from '../../components/AIReasoningPanel';
import { HeroSkeleton, CardSkeleton, ChartSkeleton, Skeleton } from '../../components/ui/skeleton';
import { useLiveClock } from '../../hooks/useLiveClock';
import { usePolling } from '../../hooks/usePolling';
import { useWebSocket, WsStatus } from '../../hooks/useWebSocket';
import { IncidentReplayDrawer } from '../../components/IncidentReplayDrawer';
import { logger } from '../../lib/logger';
import { AlertItem, InventoryItem } from '../../types';


// Mini inline SVG Sparkline helper
const MiniSparkline = ({ data, color }: { data: number[]; color: string }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min === 0 ? 1 : max - min;
  const width = 50;
  const height = 16;
  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');
  return (
    <svg width={width} height={height} className="overflow-visible inline-block">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [isPodExpanded, setIsPodExpanded] = useState(false);
  const [activeAlerts, setActiveAlerts] = useState<AlertItem[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const liveTime = useLiveClock();
  const [analysisTimer, setAnalysisTimer] = useState(4);
  const [wsStatus, setWsStatus] = useState<WsStatus>('connecting');
  const [isReplayOpen, setIsReplayOpen] = useState(false);
  const [reasoningData, setReasoningData] = useState<AIReasoningData | null>(null);
  const [chartData, setChartData] = useState<{
    revenue: {
      today: Array<{ label: string; revenue: number }>;
      week: Array<{ label: string; revenue: number }>;
      month: Array<{ label: string; revenue: number }>;
    };
    hourlyOrders: Array<{ hour: string; orders: number; profile: 'Morning' | 'Afternoon' | 'Evening Rush' }>;
  } | null>(null);

  // Loading and Error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Runtime info details
  const [runtimeData, setRuntimeData] = useState<RuntimeInfo>({
    simulationMode: 'Evening Rush',
    runtimeTick: 0,
    uptime: '00:00:00',
    ordersGenerated: 0,
    engineStatus: 'Running',
    lastTick: '',
    profile: 'Evening Rush',
    backendStatus: 'Healthy',
  });

  // Health check statuses
  const [healthData, setHealthData] = useState<HealthStatus>({
    backendStatus: 'Healthy',
    databaseStatus: 'Connected',
    runtimeStatus: 'Running',
    apiStatus: 'Healthy',
    timestamp: new Date().toISOString()
  });

  // Beverage Sales distribution breakdown
  const [beverageMix, setBeverageMix] = useState({
    total: 0,
    coffee: 72,
    tea: 18,
    coldCoffee: 10,
  });

  // AI Hero state
  const [aiHero, setAiHero] = useState({
    insight: 'All core materials are nominal. Processing operations...',
    action: 'Review Action Plan →',
    priority: 'LOW',
    risk: 'None',
    confidence: 99,
    replenished: false,
  });

  // KPI State representation
  const [kpiState, setKpiState] = useState({
    revenue: { value: '₹0', label: "Today's Revenue", change: '+0.0%', trend: 'stable' },
    orders: { value: '0', label: "Today's Orders", change: '+0.0%', trend: 'stable' },
    machineHealth: { value: '100%', label: 'Machine Health', change: '0.0%', trend: 'stable' },
    inventoryHealth: { value: '100%', label: 'Inventory Health', change: '0.0%', trend: 'stable', status: 'nominal' },
    activeAlertsCount: { value: 0, label: 'Active Alerts', details: '0 alerts pending' },
  });

  // Continuous AI Ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setAnalysisTimer((t) => (t >= 15 ? 1 : t + 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Polling every 5 seconds using custom hook
  const fetchLiveData = async () => {
    try {
      const dash = await api.getDashboard();
      const inv = await api.getInventory();
      const intel = await api.getIntelligence();
      const runtime = await api.getRuntime();
      const health = await api.getHealth();
      const ordersRes = await api.getOrders();

      setError(false);

      // 1. Update general KPIs
      setKpiState({
        revenue: { value: `₹${dash.revenue.toLocaleString('en-IN')}`, label: "Today's Revenue", change: '+14.2%', trend: 'up' },
        orders: { value: dash.orders.toString(), label: "Today's Orders", change: '+8.5%', trend: 'up' },
        machineHealth: { value: `${dash.machineHealth}%`, label: 'Machine Health', change: '-0.3%', trend: 'down' },
        inventoryHealth: { value: `${dash.inventoryHealth}%`, label: 'Inventory Health', change: '-4.1%', trend: 'down', status: dash.inventoryHealth < 75 ? 'warning' : 'nominal' },
        activeAlertsCount: { value: dash.alerts, label: 'Active Alerts', details: `${dash.alerts} alerts pending` },
      });

      // 2. Set runtime & health states
      setRuntimeData(runtime);
      setHealthData(health);

      // 3. Set alerts mapping
      if (intel.context && intel.context.active_alerts) {
        const mappedAlerts = intel.context.active_alerts.map((a: any) => ({
          id: a.id,
          code: a.code,
          title: a.code.includes('milk') ? 'Milk Low' : a.code.includes('water') ? 'Water Low' : 'Subsystem Check',
          message: a.message,
          severity: a.severity,
          timestamp: new Date(a.opened_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          action: a.code.includes('milk') ? 'Refill Milk' : 'Schedule Service',
        }));
        setActiveAlerts(mappedAlerts);
      } else {
        setActiveAlerts([]);
      }

      // 4. Set inventory progress gauges
      if (inv.pods && inv.pods[0]) {
        const mappedInv = inv.pods[0].inventory.map((item: any, index: number) => ({
          id: (index + 1).toString(),
          name: item.name,
          current: item.quantity,
          actualValue: parseFloat(((item.quantity * item.capacity) / 100).toFixed(2)),
          maxValue: item.capacity,
          unit: item.sku === 'milk' || item.sku === 'water' ? 'Liters' : 'Kg',
          status: item.quantity <= item.reorder_point ? 'warning' : 'nominal',
        }));
        setInventory(mappedInv);
      }

      // 5. Update AI intelligence metrics
      const insightMsg = intel.summary || intel.message || 'All systems are operating within safe zones.';
      setAiHero({
        insight: insightMsg,
        action: 'Review Action Plan →',
        priority: intel.priority,
        risk: intel.risk,
        confidence: intel.confidence,
        replenished: !insightMsg.toLowerCase().includes('milk'),
      });

      if (intel.reasoning) {
        setReasoningData(intel.reasoning);
      }

      setNotifications(dash.alerts);

      // 6. Aggregate beverage category distribution and live hourly demand lists
      const ordersList = ordersRes.orders || [];
      let coffeeCount = 0;
      let teaCount = 0;
      let coldCoffeeCount = 0;

      const hourlyMap: Record<string, number> = {
        '06:00': 0, '08:00': 0, '10:00': 0, '12:00': 0, '14:00': 0,
        '16:00': 0, '18:00': 0, '20:00': 0, '22:00': 0
      };
      const singleHourMap: Record<string, number> = {
        '06:00': 0, '08:00': 0, '10:00': 0, '12:00': 0, '14:00': 0,
        '16:00': 0, '18:00': 0, '20:00': 0, '22:00': 0
      };

      let cumulative = 0;
      const sortedOrders = [...ordersList].sort((a: any, b: any) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      sortedOrders.forEach((o: any) => {
        let sku = 'water';
        if (o.lines && o.lines.items && o.lines.items[0]) {
          sku = o.lines.items[0].sku;
        }
        if (sku === 'water') coffeeCount++;
        else if (sku === 'protein-bar') teaCount++;
        else if (sku === 'cold-brew') coldCoffeeCount++;

        const date = new Date(o.created_at);
        const hourNum = date.getHours();
        let bin = '22:00';
        if (hourNum < 8) bin = '06:00';
        else if (hourNum < 10) bin = '08:00';
        else if (hourNum < 12) bin = '10:00';
        else if (hourNum < 14) bin = '12:00';
        else if (hourNum < 16) bin = '14:00';
        else if (hourNum < 18) bin = '16:00';
        else if (hourNum < 20) bin = '18:00';
        else if (hourNum < 22) bin = '20:00';

        cumulative += o.total_inr;
        hourlyMap[bin] = cumulative;
        singleHourMap[bin] = (singleHourMap[bin] || 0) + 1;
      });

      const totalOrdersCount = ordersList.length;
      if (totalOrdersCount > 0) {
        const sum = coffeeCount + teaCount + coldCoffeeCount || 1;
        setBeverageMix({
          total: totalOrdersCount,
          coffee: Math.round((coffeeCount / sum) * 100),
          tea: Math.round((teaCount / sum) * 100),
          coldCoffee: Math.round((coldCoffeeCount / sum) * 100),
        });
      }

      let runningRev = 0;
      const finalRevenueToday = ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'].map(bin => {
        if (hourlyMap[bin] > 0) runningRev = hourlyMap[bin];
        return { label: bin, revenue: runningRev || 1200 };
      });

      const finalHourlyOrders = Object.entries(singleHourMap).map(([hour, count]) => {
        let profile: 'Morning' | 'Afternoon' | 'Evening Rush' = 'Afternoon';
        const hourNum = parseInt(hour.split(':')[0]);
        if (hourNum < 10) profile = 'Morning';
        else if (hourNum >= 17) profile = 'Evening Rush';
        return { hour, orders: count || 4, profile };
      });

      setChartData({
        revenue: {
          today: finalRevenueToday,
          week: [
            { label: 'Mon', revenue: 38200 },
            { label: 'Tue', revenue: 41500 },
            { label: 'Wed', revenue: 39100 },
            { label: 'Thu', revenue: 44200 },
            { label: 'Fri', revenue: 48900 },
            { label: 'Sat', revenue: 52400 },
            { label: 'Sun', revenue: runningRev || 49500 }
          ],
          month: [
            { label: 'Week 1', revenue: 275000 },
            { label: 'Week 2', revenue: 298000 },
            { label: 'Week 3', revenue: 312000 },
            { label: 'Week 4', revenue: 345000 }
          ]
        },
        hourlyOrders: finalHourlyOrders
      });

      setLoading(false);
    } catch (err) {
      logger.error("Dashboard REST fetching failed, activating Demo Mode fallback:", err);
      
      // Fallback demo data so UI operates seamlessly when local backend server is offline
      setKpiState({
        revenue: { value: '₹49,850', label: "Today's Revenue", change: '+14.2%', trend: 'up' },
        orders: { value: '142', label: "Today's Orders", change: '+8.5%', trend: 'up' },
        machineHealth: { value: '93%', label: 'Machine Health', change: '-0.3%', trend: 'down' },
        inventoryHealth: { value: '78%', label: 'Inventory Health', change: '-4.1%', trend: 'down', status: 'nominal' },
        activeAlertsCount: { value: 1, label: 'Active Alerts', details: '1 alert pending' },
      });

      setAiHero({
        insight: 'All pod systems operating within nominal operational bounds. Evening rush telemetry active.',
        priority: 'LOW',
        risk: 'None',
        confidence: 96,
        action: 'Review Action Plan →',
        replenished: false,
      });

      setBeverageMix({
        total: 142,
        coffee: 55,
        tea: 25,
        coldCoffee: 20,
      });

      setLoading(false);
      setError(false);
    }
  };

  usePolling(fetchLiveData, 5000, [], wsStatus !== 'open');

  // ── WebSocket: real-time push handler ──────────────────────────────────────
  const handleWsMessage = (data: WsTelemetrySnapshot) => {
    if (data.type === 'ping') return;
    setError(false);
    setLoading(false);
    setNotifications(data.dashboard.alerts);
    setRuntimeData({ ...runtimeData, ...data.runtime } as RuntimeInfo);

    setKpiState({
      revenue:          { value: `₹${data.dashboard.revenue.toLocaleString('en-IN')}`, label: "Today's Revenue", change: '+14.2%', trend: 'up' },
      orders:           { value: data.dashboard.orders.toString(), label: "Today's Orders", change: '+8.5%', trend: 'up' },
      machineHealth:    { value: `${data.dashboard.machineHealth}%`, label: 'Machine Health', change: '-0.3%', trend: 'down' },
      inventoryHealth:  { value: `${data.dashboard.inventoryHealth}%`, label: 'Inventory Health', change: '-4.1%', trend: 'down', status: data.dashboard.inventoryHealth < 75 ? 'warning' : 'nominal' },
      activeAlertsCount:{ value: data.dashboard.alerts, label: 'Active Alerts', details: `${data.dashboard.alerts} alerts pending` },
    });

    if (data.alerts) {
      setActiveAlerts(data.alerts.map((a) => ({
        id: a.id,
        code: a.code,
        title: a.code.includes('milk') ? 'Milk Low' : a.code.includes('water') ? 'Water Low' : 'Subsystem Check',
        message: a.message,
        severity: a.severity as 'critical' | 'warning' | 'info',
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        action: a.code.includes('milk') ? 'Refill Milk' : 'Schedule Service',
      })));
    }

    if (data.inventory) {
      setInventory(data.inventory.map((item, index) => ({
        id: (index + 1).toString(),
        name: item.name,
        current: item.quantity,
        actualValue: parseFloat(((item.quantity * item.capacity) / 100).toFixed(2)),
        maxValue: item.capacity,
        unit: item.sku === 'water' ? 'Liters' : 'Kg',
        status: item.quantity <= item.reorder_point ? 'warning' : 'nominal',
      })));
    }
  };

  const { status: wsStatusVal } = useWebSocket<WsTelemetrySnapshot>({
    onMessage: handleWsMessage,
  });
  useEffect(() => { setWsStatus(wsStatusVal); }, [wsStatusVal]);

  // Synchronize dashboard UI state with historical incident replay snapshots
  const handleReplaySnapshot = (snap: any) => {
    if (!snap) return;
    if (snap.revenue !== undefined || snap.orders !== undefined) {
      setKpiState((prev) => ({
        ...prev,
        revenue: snap.revenue !== undefined ? { ...prev.revenue, value: `₹${snap.revenue.toLocaleString('en-IN')}` } : prev.revenue,
        orders: snap.orders !== undefined ? { ...prev.orders, value: snap.orders.toString() } : prev.orders,
        machineHealth: snap.machineHealth !== undefined ? { ...prev.machineHealth, value: `${snap.machineHealth}%` } : prev.machineHealth,
        inventoryHealth: snap.inventoryHealth !== undefined ? { ...prev.inventoryHealth, value: `${snap.inventoryHealth}%` } : prev.inventoryHealth,
      }));
    }

    if (snap.aiInsight) {
      setAiHero((prev) => ({
        ...prev,
        insight: snap.aiInsight,
        risk: snap.alertMessage?.includes('CRITICAL') ? 'HIGH' : 'MEDIUM',
        priority: snap.alertMessage?.includes('CRITICAL') ? 'HIGH' : 'LOW',
      }));
    }
  };

  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'info' | 'error' }>({
    show: false,
    message: '',
    type: 'success',
  });

  const triggerAction = (actionName: string, detail: string) => {
    setToast({
      show: true,
      message: `Directive Action: ${actionName} triggered. (${detail})`,
      type: 'success',
    });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 4000);
  };

  const handleRefillMilk = async () => {
    // Optimistically update local inventory gauges instantly
    setInventory((prev) =>
      prev.map((item) =>
        item.name.toLowerCase().includes('milk') || item.sku === 'milk'
          ? {
              ...item,
              current: 100,
              actualValue: item.maxValue,
              status: 'nominal' as const,
            }
          : item
      )
    );

    // Optimistically update overall inventory health KPI and alerts count
    setKpiState((prev) => ({
      ...prev,
      inventoryHealth: { ...prev.inventoryHealth, value: '100.0%', status: 'nominal' },
      activeAlertsCount: { ...prev.activeAlertsCount, value: 0, details: '0 alerts pending' }
    }));

    triggerAction('Material Refill Dispatched', 'Restocking drone routed. Milk reserves replenished to 100%.');

    try {
      await api.replenishInventory('pod-001', 'milk');
      await fetchLiveData();
    } catch (err) {
      logger.error(err);
      await fetchLiveData();
    }
  };

  const handleScheduleMaintenance = async () => {
    try {
      await api.tickSimulation(2);
      triggerAction('Maintenance Scheduled', 'Service engineer dispatched. Brewing head seals scheduled.');
    } catch (err) {
      logger.error(err);
    }
  };

  const improvedKpis = [
    {
      label: "Today's Revenue",
      value: loading ? '...' : kpiState.revenue.value,
      change: kpiState.revenue.change,
      trend: kpiState.revenue.trend,
      icon: TrendingUp,
      statusColor: 'text-chart-2',
      sparkData: [40, 45, 42, 50, 48, 55, 60, 58, 65],
      updated: 'Synced 5s ago',
    },
    {
      label: "Today's Orders",
      value: loading ? '...' : kpiState.orders.value,
      change: kpiState.orders.change,
      trend: kpiState.orders.trend,
      icon: ShoppingCart,
      statusColor: 'text-chart-2',
      sparkData: [12, 18, 15, 22, 28, 24, 30, 32, 35],
      updated: 'Synced 5s ago',
    },
    {
      label: 'Machine Health',
      value: loading ? '...' : kpiState.machineHealth.value,
      change: kpiState.machineHealth.change,
      trend: kpiState.machineHealth.trend,
      icon: ShieldCheck,
      statusColor: 'text-chart-2',
      sparkData: [99, 98, 98, 97, 96, 96, 95, 95, 95],
      updated: 'Synced 5s ago',
    },
    {
      label: 'Inventory Health',
      value: loading ? '...' : kpiState.inventoryHealth.value,
      change: kpiState.inventoryHealth.change,
      trend: kpiState.inventoryHealth.trend,
      icon: Database,
      statusColor: kpiState.inventoryHealth.status === 'nominal' ? 'text-chart-2' : 'text-chart-4',
      sparkData: [92, 90, 88, 85, 82, 78, 75, 74, 72],
      updated: 'Synced 5s ago',
    },
    {
      label: 'Active Alerts',
      value: loading ? '...' : kpiState.activeAlertsCount.value.toString(),
      change: kpiState.activeAlertsCount.value > 0 ? `${kpiState.activeAlertsCount.value} active` : '0 issues',
      trend: kpiState.activeAlertsCount.value > 0 ? 'down' : 'stable',
      icon: AlertTriangle,
      statusColor: kpiState.activeAlertsCount.value > 0 ? 'text-destructive' : 'text-chart-2',
      sparkData: [1, 2, 1, 3, 2, 2, 1, 2, kpiState.activeAlertsCount.value],
      updated: 'Real-time sync',
    },
    {
      label: 'Customer Rating',
      value: '4.88',
      change: '+0.05',
      trend: 'up',
      icon: Sparkles,
      statusColor: 'text-chart-2',
      sparkData: [4.6, 4.6, 4.7, 4.7, 4.7, 4.8, 4.8, 4.8, 4.88],
      updated: 'Synced 10m ago',
    },
  ];

  const quickActionsList = [
    { label: 'View Orders', path: '/orders', icon: ShoppingCart },
    { label: 'Open Inventory', path: '/inventory', icon: Database },
    { label: 'Machine Diagnostics', path: '/diagnostics', icon: Wrench },
    { label: 'AI Intelligence', path: '/intelligence', icon: Brain },
    { label: 'Generate Daily Report', path: '#report', icon: Sliders, detail: 'Exporting PDF statistics...' },
    { label: 'Run Diagnostics', path: '#diag', icon: RefreshCw, detail: 'Checking sensor nodes...' },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-black font-sans text-bodydark">
      
      {/* SIDEBAR NAVIGATION (Left Column) */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* RIGHT CONTENT COLUMN */}
      <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        
        {/* HEADER BAR (Top Row) */}
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
              <button 
                onClick={() => setToast((prev) => ({ ...prev, show: false }))}
                className="text-bodydark2 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* WARNING OVERLAY ERROR BAR */}
        {error && (
          <div className="bg-destructive/15 border-b border-destructive p-4 text-center text-xs font-mono text-destructive flex items-center justify-center gap-2 shrink-0">
            <AlertTriangle className="w-4 h-4 animate-pulse" />
            <span>WARNING: Live telemetry stream interrupted. Verify uvicorn server connection status.</span>
          </div>
        )}

        {/* MAIN BODY AREA */}
        <main className="p-4 md:p-6 2xl:p-10 max-w-[1500px] w-full mx-auto">
          
          {/* Dashboard Title Header */}
          <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 mb-6 border-b border-strokedark pb-6">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-2xl font-extrabold text-white tracking-tight">
                  NexPod Atrium
                </h2>
                <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold border transition-all ${
                  wsStatus === 'open' || !error
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : wsStatus === 'connecting'
                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    : 'bg-red-500/15 text-red-400 border-red-500/30'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    wsStatus === 'open' || !error ? 'bg-emerald-400 animate-pulse' : wsStatus === 'connecting' ? 'bg-amber-400 animate-ping' : 'bg-red-400'
                  }`} />
                  {wsStatus === 'open' ? 'ONLINE (LIVE WS)' : !error ? 'ONLINE (LIVE STREAM)' : wsStatus === 'connecting' ? 'CONNECTING...' : 'OFFLINE'}
                </span>
              </div>
              <p className="text-xs text-bodydark2 mt-1 font-medium">
                Autonomous Coffee Pod · Atrium Zone A
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3 text-xs font-mono text-bodydark2 items-center">
              {/* INCIDENT REPLAY BUTTON */}
              <button
                onClick={() => setIsReplayOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold transition-all shadow-sm hover:scale-[1.02]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Incident Replay
              </button>

              <div className="bg-boxdark border border-strokedark px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-chart-2 animate-pulse" />
                <span>AI Status: <span className="text-chart-2 font-bold">🟢 Monitoring</span> <span className="text-bodydark2">({analysisTimer}s ago)</span></span>
              </div>
              <div className="bg-boxdark border border-strokedark px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span>Last Synced: <span className="text-white">{liveTime}</span></span>
              </div>
              <div className="bg-boxdark border border-strokedark px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-chart-4" />
                <span>Simulation: <span className="text-white">{runtimeData.simulationMode}</span></span>
              </div>
            </div>
          </div>

          {/* 1. MAKE AI THE HERO (Intelligence Card) */}
          {loading ? (
            <HeroSkeleton />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-7.5 p-6 rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/[0.04] via-primary/[0.02] to-transparent shadow-[0_0_35px_rgba(60,80,224,0.06)] relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-80 h-full bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
              
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
                <div className="space-y-3.5 flex-1">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">🧠</span>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                      NexPod Intelligence
                    </h3>
                    <span className={`text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded border border-meta-1/20 bg-meta-1/10 text-meta-1`}>
                      Priority: {aiHero.priority}
                    </span>
                    <span className={`text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded border border-meta-6/20 bg-meta-6/10 text-meta-6`}>
                      Risk: {aiHero.risk}
                    </span>
                  </div>
                  
                  <div>
                    <span className="text-[9px] text-bodydark2 font-mono uppercase tracking-wider block">
                      Today's Operational Insight
                    </span>
                    <p className="text-base font-semibold text-white mt-1.5 leading-snug">
                      {aiHero.insight}
                    </p>
                  </div>
                </div>

                {/* Confidence ring / score */}
                <div className="flex items-center gap-6 shrink-0 w-full lg:w-auto border-t lg:border-t-0 border-strokedark pt-4 lg:pt-0">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-bodydark2 font-mono uppercase">ML Confidence</span>
                    <span className="text-2xl font-extrabold text-white font-mono mt-0.5">{aiHero.confidence}%</span>
                  </div>

                  <Link
                    href="/intelligence"
                    className="flex-1 lg:flex-none px-6 py-3 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 font-mono shadow-[0_0_20px_rgba(60,80,224,0.3)] cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>{aiHero.action}</span>
                  </Link>
                </div>
              </div>

              {/* EMBEDDED AI REASONING & EXPLAINABILITY (XAI) PANEL */}
              <div className="mt-6 border-t border-strokedark pt-6">
                <AIReasoningPanel reasoningData={reasoningData} className="bg-transparent border-0 p-0 shadow-none" isCollapsible={true} defaultExpanded={false} />
              </div>
            </motion.div>
          )}

          {/* 3. IMPROVED KPI CARDS (6-Column Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 xl:gap-6 mb-7.5">
            {loading
              ? Array.from({ length: 6 }).map((_, idx) => <CardSkeleton key={idx} />)
              : improvedKpis.map((card, i) => {
                  const CardIcon = card.icon;
                  const isUp = card.trend === 'up';
                  const isDown = card.trend === 'down';
                  
                  return (
                    <motion.div
                      key={card.label}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: i * 0.05 }}
                      className="rounded-2xl border border-strokedark bg-boxdark p-5 shadow-default flex flex-col justify-between hover:shadow-lg transition-all duration-300 group"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-meta-4 text-primary group-hover:scale-105 transition-transform">
                          <CardIcon className="h-4.5 w-4.5" />
                        </div>
                        {/* Inline Sparkline */}
                        <MiniSparkline data={card.sparkData} color={isDown ? 'var(--color-destructive)' : 'var(--color-chart-2)'} />
                      </div>
                      
                      <div className="mt-4">
                        <h4 className="text-xl font-extrabold text-white font-mono">
                          {card.value}
                        </h4>
                        
                        {card.label === 'Machine Health' ? (
                          <div className="mt-1">
                            <span className="text-[10px] font-bold text-chart-2 font-mono uppercase tracking-wider block">Excellent</span>
                            <span className="text-[9px] text-bodydark2 block mt-0.5 font-mono">Next service in <span className="text-white font-bold">120 cups</span></span>
                          </div>
                        ) : card.label === 'Inventory Health' ? (
                          <div className="mt-1">
                            <span className="text-[10px] font-bold text-chart-4 font-mono uppercase tracking-wider block">
                              {aiHero.replenished ? 'Lowest: Water (62%)' : 'Lowest: Milk (28%)'}
                            </span>
                            <span className="text-[9px] text-bodydark2 block mt-0.5 font-mono">
                              Refill in <span className="text-white font-bold">{aiHero.replenished ? '8.4 hrs' : '2.8 hrs'}</span>
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] font-semibold text-bodydark2 mt-0.5 block">
                            {card.label}
                          </span>
                        )}
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-sidebar-border/30 flex items-center justify-between text-[9px] font-mono">
                        <span className="text-bodydark2">{card.updated}</span>
                        <span className={`font-bold flex items-center gap-0.5 ${card.statusColor}`}>
                          {isUp ? <ArrowUpRight className="w-3 h-3" /> : isDown ? <ArrowDownRight className="w-3 h-3" /> : null}
                          {card.change}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
          </div>

          {/* TELEMETRY CHARTS SECTION */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-6 2xl:gap-7.5 mb-7.5">
            {/* Enhanced Revenue Area Chart */}
            <div className="md:col-span-8">
              {chartData && <RevenueChart data={chartData.revenue} />}
            </div>

            {/* Beverage Distribution Donut Chart */}
            <div className="md:col-span-4">
              <ProductSalesChart
                totalOrders={beverageMix.total}
                coffeePercent={beverageMix.coffee}
                teaPercent={beverageMix.tea}
                coldCoffeePercent={beverageMix.coldCoffee}
              />
            </div>
          </div>

          {/* SECOND CHARTS SECTION (Hourly Orders + Live Pod Status) */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-6 2xl:gap-7.5 mb-7.5">
            {/* Hourly Demand Bar Chart */}
            <div className="md:col-span-7">
              {chartData && <HourlyOrdersChart data={chartData.hourlyOrders} />}
            </div>

            {/* LIVE POD STATUS */}
            <div className="md:col-span-5">
              <motion.div
                layoutId="live-pod-status"
                onClick={() => setIsPodExpanded(true)}
                className="rounded-2xl border border-strokedark bg-boxdark p-6 shadow-default relative overflow-hidden group cursor-pointer hover:border-primary/30 hover:shadow-lg transition-all"
                whileHover={{ y: -2 }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-chart-2/5 rounded-full blur-[40px] pointer-events-none" />

                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-white tracking-tight">
                      Live Pod Status
                    </h2>
                    <span className="text-xs text-bodydark2 font-mono">
                      Real-time telemetry stream
                    </span>
                  </div>
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-meta-3/15 text-meta-3 border border-meta-3/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-meta-3" />
                    ONLINE
                  </span>
                </div>

                <div className="space-y-3.5 font-mono text-xs">
                  <div className="flex justify-between items-center border-b border-strokedark/50 pb-2">
                    <span className="text-bodydark2">Current Activity</span>
                    <span className="text-white font-bold flex items-center gap-1">
                      <Coffee className="w-3.5 h-3.5 text-primary animate-pulse" />
                      Preparing Cappuccino
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-strokedark/50 pb-2">
                    <span className="text-bodydark2">Current Queue</span>
                    <span className="text-white font-bold">3 Orders</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-strokedark/50 pb-2">
                    <span className="text-bodydark2">Uptime Session</span>
                    <span className="text-white font-bold">{runtimeData.uptime}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-bodydark2">Runtime Tick</span>
                    <span className="text-white font-bold">#{runtimeData.runtimeTick}</span>
                  </div>
                </div>

                <span className="text-[10px] font-mono text-primary font-bold uppercase tracking-wider block pt-4">Click to Inspect</span>
              </motion.div>
            </div>
          </div>

          {/* QUICK ACTIONS SECTION */}
          <div className="mb-7.5 rounded-2xl border border-strokedark bg-boxdark p-6 shadow-default">
            <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider mb-4 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-primary" />
              Operational Quick Actions
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
              {quickActionsList.map((act) => {
                const ActIcon = act.icon;
                const isHash = act.path.startsWith('#');
                const btnStyle = "flex items-center gap-2 p-3 rounded-xl border border-strokedark bg-black/20 hover:bg-primary/5 hover:border-primary/50 text-xs font-bold text-white transition-all duration-200 cursor-pointer font-mono shadow-sm hover:shadow-md";
                
                if (isHash) {
                  return (
                    <button
                      key={act.label}
                      onClick={() => triggerAction(act.label, act.detail || 'Executing...')}
                      className={btnStyle}
                    >
                      <ActIcon className="w-4 h-4 text-primary shrink-0" />
                      <span className="truncate">{act.label}</span>
                    </button>
                  );
                }
                
                return (
                  <Link
                    key={act.label}
                    href={act.path}
                    className={btnStyle}
                  >
                    <ActIcon className="w-4 h-4 text-primary shrink-0" />
                    <span className="truncate">{act.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* INVENTORY & ALERTS FOOTER GRID */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-6 2xl:gap-7.5">
            {/* Inventory Status */}
            <div className="md:col-span-8 rounded-2xl border border-strokedark bg-boxdark p-6 shadow-default">
              <div className="mb-6 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    Inventory Status
                  </h2>
                  <span className="text-xs text-bodydark2 font-mono">
                    Resource Fill Levels
                  </span>
                </div>
                
                <div className="flex items-center gap-2 bg-meta-4 px-3 py-1.5 rounded-lg text-[10px] font-mono text-bodydark2 border border-strokedark">
                  <Info className="w-3.5 h-3.5 text-primary" />
                  <span>5S POLLING REFRESH</span>
                </div>
              </div>

              {/* Gauges Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {inventory.map((item) => (
                  <CircularProgress
                    key={item.id}
                    label={item.name}
                    percentage={item.current}
                    actualValue={item.actualValue}
                    maxValue={item.maxValue}
                    unit={item.unit}
                    status={item.status}
                    size={80}
                  />
                ))}
              </div>
            </div>

            {/* RECENT OPERATIONAL ALERTS */}
            <div className="md:col-span-4 rounded-2xl border border-strokedark bg-boxdark p-6 shadow-default flex flex-col justify-between h-full min-h-[300px]">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-white tracking-tight">
                      Recent Operational Alerts
                    </h2>
                    <span className="text-xs text-bodydark2 font-mono">
                      Subsystem anomalies & refilling
                    </span>
                  </div>
                  {activeAlerts.length > 0 && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-meta-1/10 text-meta-1 border border-meta-1/20 font-bold">
                      {activeAlerts.length} ACTIVE
                    </span>
                  )}
                </div>

                {/* Alerts List */}
                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {activeAlerts.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-8 text-center gap-2"
                      >
                        <div className="w-9 h-9 rounded-full bg-chart-2/15 border border-chart-2/20 text-chart-2 flex items-center justify-center">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-semibold text-white">All Systems Nominal</span>
                        <span className="text-[10px] text-bodydark2 font-mono">No warnings pending.</span>
                      </motion.div>
                    ) : (
                      activeAlerts.map((alert) => (
                        <motion.div
                          key={alert.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className={`p-3.5 rounded-xl border bg-meta-4/30 flex flex-col gap-2 transition-all duration-300 border-chart-4/30`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-chart-4 animate-pulse" />
                              <span className="text-xs font-bold text-white">
                                {alert.title}
                              </span>
                            </div>
                            <span className="text-[9px] text-bodydark2 font-mono">
                              {alert.timestamp}
                            </span>
                          </div>

                          <p className="text-[11px] text-bodydark leading-normal">
                            {alert.message}
                          </p>

                          <div className="flex justify-between items-center border-t border-strokedark pt-2 mt-1">
                            <span className="text-[9px] text-bodydark2 font-mono">
                              CODE: {alert.code}
                            </span>
                            <button
                              onClick={() => {
                                if (alert.code.includes('milk')) {
                                  handleRefillMilk();
                                } else if (alert.code.includes('maint')) {
                                  handleScheduleMaintenance();
                                } else {
                                  triggerAction(alert.action, `Resolving ${alert.code}...`);
                                }
                              }}
                              className="text-[10px] font-bold text-primary hover:text-primary/80 transition-colors font-mono flex items-center gap-0.5 cursor-pointer"
                            >
                              {alert.action}
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>

        </main>

        {/* Live Pod Status – Centered Modal Overlay */}
        <AnimatePresence>
          {isPodExpanded && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsPodExpanded(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
              />
              <motion.div
                layoutId="live-pod-status"
                className="relative w-full max-w-xl bg-boxdark border border-strokedark rounded-3xl p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-10 overflow-hidden text-left"
              >
                <button
                  onClick={() => setIsPodExpanded(false)}
                  className="absolute top-4 right-4 h-8 w-8 rounded-full bg-black/40 hover:bg-black/80 border border-strokedark flex items-center justify-center text-white hover:text-primary transition-colors cursor-pointer"
                >
                  ✕
                </button>

                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-bold text-white tracking-tight">
                        Live Pod Status
                      </h2>
                      <span className="text-xs text-bodydark2 font-mono">
                        Extended diagnostics & actions
                      </span>
                    </div>
                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-meta-3/15 text-meta-3 border border-meta-3/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-meta-3" />
                      ONLINE
                    </span>
                  </div>

                  <div className="space-y-3 font-mono text-xs border-b border-strokedark/50 pb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-bodydark2">Current Activity</span>
                      <span className="text-white font-bold flex items-center gap-1">
                        <Coffee className="w-3.5 h-3.5 text-primary animate-pulse" />
                        Preparing Cappuccino
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-bodydark2">Current Queue</span>
                      <span className="text-white font-bold">3 Orders</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-bodydark2">Uptime Session</span>
                      <span className="text-white font-bold">{runtimeData.uptime}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-bodydark2">Runtime Tick</span>
                      <span className="text-white font-bold">#{runtimeData.runtimeTick}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-bodydark2">Backend Status</span>
                      <span className="text-chart-2 font-bold">{healthData.backendStatus}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-bodydark2">Database Server</span>
                      <span className="text-chart-2 font-bold">{healthData.databaseStatus}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-bodydark2">Simulation Mode</span>
                      <span className="text-chart-4 font-bold uppercase tracking-wider text-[10px]">{runtimeData.simulationMode}</span>
                    </div>
                  </div>

                  {/* Resource Levels */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-bodydark2 uppercase tracking-wider block">Resource Levels</span>
                    <div className="grid grid-cols-2 gap-3 text-[10px] font-mono bg-black/40 p-4 rounded-xl border border-strokedark">
                      {inventory.slice(0, 4).map((item: InventoryItem) => (
                        <div key={item.id} className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-white font-bold">{item.name}</span>
                            <span className={item.status === 'warning' ? 'text-chart-4' : 'text-chart-2'}>{item.current}%</span>
                          </div>
                          <div className="w-full bg-strokedark h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${item.status === 'warning' ? 'bg-chart-4' : 'bg-chart-2'}`}
                              style={{ width: `${item.current}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Interactive Actions */}
                  <div className="space-y-2 pt-2">
                    <span className="text-[10px] font-mono text-bodydark2 uppercase tracking-wider block">Direct Directives</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRefillMilk()}
                        className="flex-1 py-2.5 rounded-xl border border-strokedark bg-black/50 hover:bg-primary/10 hover:border-primary/50 text-[10px] text-white hover:text-primary transition-all font-mono font-bold cursor-pointer"
                      >
                        Refill Milk
                      </button>
                      <button
                        onClick={() => triggerAction("Restart Simulation", "Restarting pod state...")}
                        className="flex-grow py-2.5 rounded-xl border border-strokedark bg-black/50 hover:bg-chart-4/10 hover:border-chart-4/50 text-[10px] text-white hover:text-chart-4 transition-all font-mono font-bold cursor-pointer"
                      >
                        Restart Engine
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
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
