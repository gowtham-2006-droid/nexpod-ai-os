'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Coffee,
  Clock,
  Sparkles,
  TrendingDown,
  Activity,
  Zap,
  Info,
  ChevronRight,
  Database,
  Sliders,
  CheckCircle,
  X,
  Gauge,
  AlertTriangle,
  RotateCw,
} from 'lucide-react';

import { api } from '../../lib/api';
import { CircularProgress } from '../../components/CircularProgress';
import { ConsumptionChart } from '../../components/ConsumptionChart';
import { Sidebar } from '../../components/Sidebar';
import { Header } from '../../components/Header';
import { useLiveClock } from '../../hooks/useLiveClock';
import { usePolling } from '../../hooks/usePolling';
import { logger } from '../../lib/logger';

export default function InventoryPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  
  // React State for live inventory
  const [inventoryItems, setInventoryItems] = useState<Array<{
    id: string;
    sku: string;
    name: string;
    current: number;
    actualValue: number;
    maxValue: number;
    unit: string;
    status: 'critical' | 'warning' | 'nominal';
    consumptionRate: string;
    timeRemaining: string;
    aiRecommendation: string;
  }>>([]);
  const [healthScore, setHealthScore] = useState(72);
  const [nextRefill, setNextRefill] = useState('Checking recommendations...');
  const liveTime = useLiveClock();

  // Count states for materials status
  const [healthyCount, setHealthyCount] = useState(5);
  const [warningCount, setWarningCount] = useState(0);
  const [criticalCount, setCriticalCount] = useState(0);

  // Custom toasts
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'info' }>({
    show: false,
    message: '',
    type: 'success',
  });

  const fetchInventory = async () => {
    try {
      const dashboard = await api.getDashboard();
      const res = await api.getInventory();
      const intel = await api.getIntelligence();
      
      setNotifications(dashboard.alerts);
      setHealthScore(dashboard.inventoryHealth);

      if (res.pods && res.pods[0]) {
        const rawItems = res.pods[0].inventory;
        const mapped = rawItems.map((item: any, index: number) => {
          const isLow = item.quantity <= item.reorder_point;
          const isCritical = item.quantity <= 15;
          const unit = item.sku === 'milk' || item.sku === 'water' ? 'Liters' : 'Kg';
          const rate = item.sku === 'milk' ? '0.45L/hr' : item.sku === 'water' ? '2.5L/hr' : '0.15Kg/hr';
          const timeRemaining = isCritical ? 'Under 1 hr' : isLow ? '2.8 hours' : 'Stable';
          const aiRec = isLow
            ? `Milk reserves low. Refill drone dispatch scheduled.`
            : 'Reserves nominal. No action required.';

          return {
            id: (index + 1).toString(),
            sku: item.sku,
            name: item.name,
            current: item.quantity,
            actualValue: parseFloat(((item.quantity * item.capacity) / 100).toFixed(2)),
            maxValue: item.capacity,
            unit,
            status: isCritical ? ('critical' as const) : isLow ? ('warning' as const) : ('nominal' as const),
            consumptionRate: rate,
            timeRemaining,
            aiRecommendation: aiRec,
          };
        });

        setInventoryItems(mapped);

        // Compute material condition totals
        const criticals = mapped.filter((i: any) => i.current <= 15).length;
        const warnings = mapped.filter((i: any) => i.current <= 30 && i.current > 15).length;
        const healthies = mapped.length - criticals - warnings;

        setCriticalCount(criticals);
        setWarningCount(warnings);
        setHealthyCount(healthies);

        // Update AI Auto-refill text from the dedicated intelligence service
        setNextRefill(intel.recommendation || 'All reserves optimal. Standard schedule active.');
      }
    } catch (err) {
      logger.error("Failed to fetch inventory", err);
    }
  };

  usePolling(fetchInventory, 5000);

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

  // Perform replenishment action via simulation tick trigger
  const handleReplenishItem = async (sku: string, name: string) => {
    // Optimistically update local state immediately so progress indicators animate to 100% instantly
    setInventoryItems((prevItems) =>
      prevItems.map((item) =>
        item.sku === sku
          ? {
              ...item,
              current: 100,
              actualValue: item.maxValue,
              status: 'nominal' as const,
              timeRemaining: 'Stable',
              aiRecommendation: 'Reserves nominal. No action required.',
            }
          : item
      )
    );

    triggerAction('Replenishment Dispatched', `Replenished ${name} tanks to 100% capacity via pneumatic delivery drone.`);

    try {
      await api.replenishInventory('pod-001', sku);
      await fetchInventory();
    } catch (err) {
      logger.error("Refill transaction failed", err);
      // Revert local state to match backend on failure
      await fetchInventory();
    }
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
              <button
                onClick={() => setToast((prev) => ({ ...prev, show: false }))}
                className="text-bodydark2 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="p-4 md:p-6 2xl:p-10 max-w-[1500px] w-full mx-auto">
          {/* Page Title */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  Material Inventory
                </h2>
                <span className="text-xs text-bodydark2 font-mono">
                  Autonomous refilling systems
                </span>
              </div>
            </div>
            <nav className="text-xs font-medium text-bodydark2 font-mono flex items-center gap-1.5">
              <span className="hover:text-white cursor-default">Telemetry</span>
              <span>/</span>
              <span className="text-primary">Inventory</span>
            </nav>
          </div>

          {/* TOP CONSOLE: Health Score & Refill Advisor */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 xl:gap-7.5 mb-7.5">
            {/* Inventory Health Score */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="md:col-span-4 rounded-2xl border border-strokedark bg-boxdark p-6 shadow-default flex items-center justify-between gap-4"
            >
              <div className="flex-1">
                <span className="text-xs font-semibold text-bodydark2 uppercase tracking-wide">
                  Inventory Health Score
                </span>
                <h3 className="text-3xl font-extrabold text-white mt-1.5 font-mono">
                  {healthScore}%
                </h3>
                <div className="mt-3.5 flex gap-2 font-mono text-[9px]">
                  <span className="text-chart-2">🟢 {healthyCount} Healthy</span>
                  <span className="text-chart-4">🟡 {warningCount} Warn</span>
                  <span className="text-destructive">🔴 {criticalCount} Critical</span>
                </div>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-meta-4 text-primary shrink-0">
                <Gauge className="h-7 w-7" />
              </div>
            </motion.div>

            {/* Refill Advisor Banner */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="md:col-span-8 rounded-2xl border border-primary/30 bg-primary/[0.02] p-6 shadow-default flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                  <span className="text-xs font-bold text-primary font-mono tracking-wide uppercase">
                    AI Auto-Refill Advisory
                  </span>
                </div>
                <h3 className="text-xs font-bold text-white tracking-tight leading-relaxed font-mono">
                  {nextRefill}
                </h3>
                <span className="text-xs text-bodydark2 font-mono mt-1.5 block flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Live Sync Clock: {liveTime}
                </span>
              </div>

              <button
                onClick={() => triggerAction('Check Inventory Status', 'Running scanner on material load-cells...')}
                className="w-full sm:w-auto px-4.5 py-2.5 rounded bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-1 font-mono cursor-pointer shrink-0 shadow-md"
              >
                <RotateCw className="w-3.5 h-3.5 animate-spin-slow" />
                <span>Verify Reserves</span>
              </button>
            </motion.div>
          </div>

          {/* MID CONSOLE: Material Cards Grid */}
          <div className="mb-7.5">
            <h3 className="text-xs font-bold text-bodydark2 uppercase tracking-wider mb-4 font-mono flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-primary" />
              Resource Load Cells
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 md:gap-5">
              {inventoryItems.map((item, index) => {
                const isCritical = item.status === 'critical';
                const isWarning = item.status === 'warning';
                const isExpanded = expandedCardId === item.id;
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: index * 0.06 }}
                    onClick={() => setExpandedCardId(isExpanded ? null : item.id)}
                    className={`rounded-2xl border bg-boxdark p-5 shadow-default flex flex-col justify-between relative overflow-hidden transition-all duration-300 cursor-pointer select-none ${
                      isExpanded
                        ? 'border-primary shadow-md bg-primary/[0.01]'
                        : isCritical
                        ? 'border-destructive/60 bg-destructive/[0.01] shadow-[0_0_20px_rgba(239,68,68,0.03)]'
                        : isWarning
                        ? 'border-chart-4/60 bg-chart-4/[0.01]'
                        : 'border-strokedark hover:shadow-lg'
                    }`}
                  >
                    {/* Glowing indicator */}
                    {(isCritical || isWarning) && (
                      <span className="absolute top-4 right-4 flex h-2 w-2">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isCritical ? 'bg-destructive' : 'bg-chart-4'}`} />
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${isCritical ? 'bg-destructive' : 'bg-chart-4'}`} />
                      </span>
                    )}

                    {/* Gauge Header */}
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h4 className="text-sm font-bold text-white">{item.name}</h4>
                        <span className="text-[10px] text-bodydark2 font-mono block mt-0.5">
                          SKU: {item.sku.toUpperCase()}
                        </span>
                      </div>
                      {/* Inline Load Cell Progress circle */}
                      <div className="relative h-12 w-12 shrink-0">
                        <svg className="h-full w-full transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="text-meta-4"
                            strokeWidth="3"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className={isCritical ? 'text-destructive' : isWarning ? 'text-chart-4' : 'text-chart-2'}
                            strokeDasharray={`${item.current}, 100`}
                            strokeWidth="3"
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-bold text-white">
                          {item.current}%
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
                      {/* Telemetry Stats */}
                      <div className="space-y-2 border-t border-b border-strokedark/50 py-3.5 my-3.5 font-mono text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-bodydark2">Load Cell:</span>
                          <span className="text-white font-semibold">
                            {item.actualValue} / {item.maxValue} {item.unit}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-bodydark2">Consumption:</span>
                          <span className="text-white font-semibold">{item.consumptionRate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-bodydark2">Est. Depletion:</span>
                          <span className={`font-bold ${isCritical ? 'text-destructive' : isWarning ? 'text-chart-4' : 'text-chart-2'}`}>
                            {item.timeRemaining}
                          </span>
                        </div>
                      </div>

                      {/* AI Predictor message */}
                      <div className="rounded-xl bg-black/40 border border-strokedark/60 p-3 mb-4">
                        <span className="text-[9px] font-mono font-bold text-primary uppercase tracking-wider flex items-center gap-1.5 mb-1">
                          <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                          AI Prediction
                        </span>
                        <p className="text-[10px] text-bodydark leading-normal">
                          {item.aiRecommendation}
                        </p>
                      </div>

                      {/* Replenish CTA */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReplenishItem(item.sku, item.name);
                        }}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold font-mono transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 border ${
                          isCritical || isWarning
                            ? 'bg-destructive text-white border-destructive shadow-md hover:bg-destructive/90'
                            : 'bg-black/30 text-bodydark2 border-strokedark hover:border-bodydark2 hover:text-white'
                        }`}
                      >
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        <span>Replenish 100%</span>
                      </button>
                    </motion.div>

                    {/* Expand Helper Indicator (when collapsed) */}
                    {!isExpanded && (
                      <div className="mt-3 text-center text-[9px] font-mono text-bodydark2/60 uppercase tracking-widest group-hover:text-primary transition-colors">
                        Click to expand details
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* BOTTOM CONSOLE: Consumption Analytics Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="w-full"
          >
            <ConsumptionChart data={inventoryPageData.charts} />
          </motion.div>
        </main>

        {/* Footer */}
        <footer className="max-w-[1500px] mx-auto px-6 py-6 border-t border-strokedark w-full flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-mono text-bodydark2">
          <span>NexPod Inventory Diagnostics Dashboard v1.0.0-PROTOTYPE</span>
          <div className="flex gap-6">
            <span>DISPENSERS: 5 nominal</span>
            <span>RESTOCK SENSORS: ONLINE</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
