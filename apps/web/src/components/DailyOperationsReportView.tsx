'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ShieldCheck,
  Box,
  IndianRupee,
  Coffee,
  Star,
  Clock,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Activity,
  BarChart3,
  TrendingUp,
  ClipboardList,
  Download,
  FileText,
  Printer,
  Eye,
  X,
  Copy,
  ChevronDown,
  Check,
} from 'lucide-react';

interface DailyOperationsReportViewProps {
  onClose?: () => void;
  isModal?: boolean;
}

export const DailyOperationsReportView: React.FC<DailyOperationsReportViewProps> = ({
  onClose,
  isModal = false,
}) => {
  const [copiedReportId, setCopiedReportId] = useState(false);
  const [copiedMd, setCopiedMd] = useState(false);

  // Sparkline SVG renderer
  const MiniSparkline = ({ color = '#10B981', points = [5, 8, 4, 9, 12, 10, 15] }: { color?: string; points?: number[] }) => {
    const max = Math.max(...points);
    const min = Math.min(...points);
    const range = max - min === 0 ? 1 : max - min;
    const width = 60;
    const height = 18;
    const polyPoints = points
      .map((val, idx) => {
        const x = (idx / (points.length - 1)) * width;
        const y = height - ((val - min) / range) * (height - 4) - 2;
        return `${x},${y}`;
      })
      .join(' ');

    return (
      <svg width={width} height={height} className="overflow-visible inline-block">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={polyPoints}
        />
      </svg>
    );
  };

  const reportData = {
    reportId: 'RPT-2026-08-01-0630',
    generatedAt: '01 Aug 2026, 06:30 AM',
    window: '31 Jul 06:30 AM – 01 Aug 06:30 AM',
    kpis: {
      health: { value: '94%', change: '+ 3% vs yesterday', isPositive: true },
      activePods: { value: '12 / 12', label: '100% Operational' },
      revenue: { value: '₹65,340', change: '+ 14.2% vs yesterday', isPositive: true },
      orders: { value: '620', change: '+ 12.7% vs yesterday', isPositive: true },
      rating: { value: '4.8 / 5', change: '+ 0.2 vs yesterday', isPositive: true },
      uptime: { value: '99.6%', change: '+ 0.6% vs yesterday', isPositive: true },
    },
    summary:
      'Today the NexPod fleet remained operational with an overall fleet health score of 94%. A total of 620 beverages were served, generating ₹65,340 in revenue. One inventory warning and two maintenance alerts were detected. No critical failures occurred.',
    insights: [
      'Milk consumption increased 18% during evening hours.',
      'Boiler temperature remained stable across all pods.',
      'Revenue increased 14% compared to yesterday.',
      'Customer satisfaction remained above 4.8 stars.',
      'No critical incidents recorded in the last 24 hours.',
    ],
    inventory: [
      { name: 'Milk', pct: 58, consumption: '42 L', remaining: '8.2 hrs', refill: 'Today, 02:45 PM', isWarning: true },
      { name: 'Coffee Beans', pct: 72, consumption: '18 kg', remaining: '26.4 hrs', refill: 'Tomorrow, 06:30 AM', isWarning: false },
      { name: 'Sugar', pct: 81, consumption: '12 kg', remaining: '36.1 hrs', refill: 'Tomorrow, 04:30 PM', isWarning: false },
      { name: 'Water', pct: 82, consumption: '120 L', remaining: '41.8 hrs', refill: 'Tomorrow, 10:15 PM', isWarning: false },
      { name: 'Cups', pct: 91, consumption: '620 pcs', remaining: '2.8 days', refill: '03 Aug, 08:00 AM', isWarning: false },
    ],
    alerts: [
      { type: 'Inventory Warning', message: 'Milk reservoir below threshold.', time: '02:35 PM', severity: 'warning' },
      { type: 'Maintenance Alert', message: 'Cleaning cycle recommended.', time: '04:12 PM', severity: 'warning' },
      { type: 'Maintenance Alert', message: 'Boiler efficiency reduced by 3%.', time: '05:44 PM', severity: 'warning' },
      { type: 'Resolved Alert', message: 'Water pump fluctuation resolved.', time: '09:15 AM', severity: 'resolved' },
    ],
    telemetry: [
      { metric: 'Boiler Temp (°C)', min: 58, max: 68, avg: 62.4, points: [58, 60, 62, 65, 63, 61, 62.4] },
      { metric: 'Voltage (V)', min: 218, max: 235, avg: 226.7, points: [220, 225, 230, 224, 228, 226.7] },
      { metric: 'Current (A)', min: 3.2, max: 6.8, avg: 4.7, points: [3.5, 4.2, 5.8, 4.5, 4.7] },
      { metric: 'CPU Usage (%)', min: 12, max: 48, avg: 28.6, points: [15, 22, 45, 30, 28.6] },
      { metric: 'Memory Usage (%)', min: 34, max: 62, avg: 45.3, points: [35, 40, 55, 48, 45.3] },
      { metric: 'Network Latency (ms)', min: 12, max: 48, avg: 23.7, points: [14, 20, 42, 25, 23.7] },
    ],
    actions: [
      { id: 1, title: 'Refill Milk Reservoir', impact: 'High Impact', impactColor: 'bg-red-500/20 text-red-400 border-red-500/30' },
      { id: 2, title: 'Schedule Cleaning Cycle', impact: 'Medium Impact', impactColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
      { id: 3, title: 'Monitor Boiler Temperature', impact: 'Low Impact', impactColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
      { id: 4, title: 'Check Water Pump Efficiency', impact: 'Low Impact', impactColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    ],
  };

  const handleCopyMd = () => {
    const md = `# Daily Operations Report - ${reportData.reportId}
Generated on ${reportData.generatedAt} | Period: ${reportData.window}

## Executive Summary
${reportData.summary}

## Key Metrics
- Revenue: ${reportData.kpis.revenue.value} (${reportData.kpis.revenue.change})
- Orders: ${reportData.kpis.orders.value} (${reportData.kpis.orders.change})
- Fleet Health: ${reportData.kpis.health.value}
- Uptime: ${reportData.kpis.uptime.value}

## Key Insights
${reportData.insights.map((i) => `- ${i}`).join('\n')}

## Recommended Actions
${reportData.actions.map((a) => `${a.id}. ${a.title} (${a.impact})`).join('\n')}
`;
    navigator.clipboard.writeText(md);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  const handleCopyReportId = () => {
    navigator.clipboard.writeText(reportData.reportId);
    setCopiedReportId(true);
    setTimeout(() => setCopiedReportId(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    window.print();
  };

  return (
    <div className="w-full bg-[#090C10] text-[#E6EDF3] p-4 sm:p-6 lg:p-8 space-y-6 font-sans select-none rounded-2xl border border-[#21262D] shadow-2xl">
      {/* 1. TOP HEADER & BAR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#21262D] pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" />
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Daily Operations Report</h1>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#1F242C] text-purple-300 border border-purple-500/30">
              AI Generated
            </span>
          </div>
          <p className="text-xs font-mono text-[#8B949E]">
            Generated on <span className="text-white">{reportData.generatedAt}</span> · Last 24 Hours ({reportData.window})
          </p>
        </div>

        {/* TOP RIGHT BUTTON SUITE */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161B22] border border-[#30363D] hover:border-[#8B949E] text-xs font-mono font-semibold text-[#C9D1D9] transition-all">
            <Eye className="w-3.5 h-3.5 text-blue-400" />
            Preview
          </button>

          <button
            onClick={handleDownloadPdf}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161B22] border border-[#30363D] hover:border-[#8B949E] text-xs font-mono font-semibold text-[#C9D1D9] transition-all"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            Download PDF
          </button>

          <button
            onClick={handleCopyMd}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161B22] border border-[#30363D] hover:border-[#8B949E] text-xs font-mono font-semibold text-[#C9D1D9] transition-all"
          >
            {copiedMd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileText className="w-3.5 h-3.5 text-purple-400" />}
            {copiedMd ? 'Copied MD' : 'Export MD'}
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161B22] border border-[#30363D] hover:border-[#8B949E] text-xs font-mono font-semibold text-[#C9D1D9] transition-all"
          >
            <Printer className="w-3.5 h-3.5 text-cyan-400" />
            Print
          </button>

          {isModal && onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#161B22] border border-[#30363D] hover:border-red-500/50 text-[#8B949E] hover:text-white transition-all ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. TOP 6 KPI CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Fleet Health */}
        <div className="p-3.5 rounded-xl bg-[#161B22] border border-[#21262D] space-y-1.5 hover:border-[#30363D] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-[#8B949E] uppercase tracking-wider">Fleet Health</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white tracking-tight">{reportData.kpis.health.value}</div>
          <div className="flex items-center justify-between text-[10px] font-mono text-emerald-400">
            <span>{reportData.kpis.health.change}</span>
            <MiniSparkline color="#10B981" points={[80, 85, 88, 91, 94]} />
          </div>
        </div>

        {/* Active Pods */}
        <div className="p-3.5 rounded-xl bg-[#161B22] border border-[#21262D] space-y-1.5 hover:border-[#30363D] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-[#8B949E] uppercase tracking-wider">Active Pods</span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Box className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white tracking-tight">{reportData.kpis.activePods.value}</div>
          <span className="text-[10px] font-mono text-[#8B949E] block">{reportData.kpis.activePods.label}</span>
        </div>

        {/* Revenue */}
        <div className="p-3.5 rounded-xl bg-[#161B22] border border-[#21262D] space-y-1.5 hover:border-[#30363D] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-[#8B949E] uppercase tracking-wider">Revenue</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white tracking-tight">{reportData.kpis.revenue.value}</div>
          <div className="flex items-center justify-between text-[10px] font-mono text-emerald-400">
            <span>{reportData.kpis.revenue.change}</span>
            <MiniSparkline color="#10B981" points={[45000, 52000, 58000, 65340]} />
          </div>
        </div>

        {/* Orders Served */}
        <div className="p-3.5 rounded-xl bg-[#161B22] border border-[#21262D] space-y-1.5 hover:border-[#30363D] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-[#8B949E] uppercase tracking-wider">Orders Served</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Coffee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white tracking-tight">{reportData.kpis.orders.value}</div>
          <div className="flex items-center justify-between text-[10px] font-mono text-emerald-400">
            <span>{reportData.kpis.orders.change}</span>
            <MiniSparkline color="#10B981" points={[400, 480, 550, 620]} />
          </div>
        </div>

        {/* Customer Rating */}
        <div className="p-3.5 rounded-xl bg-[#161B22] border border-[#21262D] space-y-1.5 hover:border-[#30363D] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-[#8B949E] uppercase tracking-wider">Customer Rating</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Star className="w-4 h-4 fill-amber-400/20" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white tracking-tight">{reportData.kpis.rating.value}</div>
          <div className="flex items-center justify-between text-[10px] font-mono text-emerald-400">
            <span>{reportData.kpis.rating.change}</span>
            <MiniSparkline color="#10B981" points={[4.5, 4.6, 4.7, 4.8]} />
          </div>
        </div>

        {/* Uptime */}
        <div className="p-3.5 rounded-xl bg-[#161B22] border border-[#21262D] space-y-1.5 hover:border-[#30363D] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-[#8B949E] uppercase tracking-wider">Uptime</span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white tracking-tight">{reportData.kpis.uptime.value}</div>
          <div className="flex items-center justify-between text-[10px] font-mono text-emerald-400">
            <span>{reportData.kpis.uptime.change}</span>
            <MiniSparkline color="#10B981" points={[98.5, 99.0, 99.4, 99.6]} />
          </div>
        </div>
      </div>

      {/* 3. ROW 2: AI EXECUTIVE SUMMARY & AI KEY INSIGHTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: AI Executive Summary */}
        <div className="p-5 rounded-xl bg-[#161B22] border border-[#21262D] space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            AI Executive Summary
          </div>
          <p className="text-xs text-[#C9D1D9] leading-relaxed font-normal">
            {reportData.summary}
          </p>
        </div>

        {/* Right: AI Key Insights */}
        <div className="p-5 rounded-xl bg-[#161B22] border border-[#21262D] space-y-3">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              AI Key Insights
            </span>
            <ChevronRight className="w-4 h-4 text-[#8B949E]" />
          </div>
          <ul className="space-y-2 text-xs text-[#C9D1D9]">
            {reportData.insights.map((insight, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 4. ROW 3: INVENTORY SUMMARY & ALERTS DIAGNOSTICS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Inventory Summary */}
        <div className="p-5 rounded-xl bg-[#161B22] border border-[#21262D] space-y-4">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-[#E6EDF3] uppercase tracking-wider">
            <span className="flex items-center gap-2">
              <Box className="w-4 h-4 text-emerald-400" />
              Inventory Summary
            </span>
            <ChevronRight className="w-4 h-4 text-[#8B949E]" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[#21262D] text-[#8B949E] text-[11px]">
                  <th className="pb-2 font-normal">Item</th>
                  <th className="pb-2 font-normal">Current Level</th>
                  <th className="pb-2 font-normal">Consumption (24h)</th>
                  <th className="pb-2 font-normal">Remaining</th>
                  <th className="pb-2 font-normal">Predicted Refill</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#21262D]/60">
                {reportData.inventory.map((inv, idx) => (
                  <tr key={idx} className="hover:bg-[#1C2128]">
                    <td className="py-2.5 font-semibold text-white">{inv.name}</td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-2 w-28">
                        <div className="h-1.5 flex-1 bg-[#21262D] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${inv.isWarning ? 'bg-amber-400' : 'bg-emerald-400'}`}
                            style={{ width: `${inv.pct}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-[#8B949E] font-bold">{inv.pct}%</span>
                      </div>
                    </td>
                    <td className="py-2.5 text-[#C9D1D9]">{inv.consumption}</td>
                    <td className={`py-2.5 font-bold ${inv.isWarning ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {inv.remaining}
                    </td>
                    <td className={`py-2.5 ${inv.isWarning ? 'text-amber-400 font-bold' : 'text-[#8B949E]'}`}>
                      {inv.refill}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Alerts & Diagnostics */}
        <div className="p-5 rounded-xl bg-[#161B22] border border-[#21262D] space-y-4">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-[#E6EDF3] uppercase tracking-wider">
            <span className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" />
              Alerts & Diagnostics
            </span>
            <ChevronRight className="w-4 h-4 text-[#8B949E]" />
          </div>

          <div className="space-y-3">
            {reportData.alerts.map((alt, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-[#0D1117] border border-[#21262D] flex items-center justify-between text-xs font-mono hover:border-[#30363D] transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {alt.severity === 'warning' ? (
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                  <span
                    className={`font-bold ${alt.severity === 'warning' ? 'text-amber-400' : 'text-emerald-400'}`}
                  >
                    {alt.type}
                  </span>
                  <span className="text-[#C9D1D9] font-sans text-xs">{alt.message}</span>
                </div>

                <div className="flex items-center gap-2 text-[#8B949E]">
                  <span>{alt.time}</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. ROW 4: 4 BOTTOM CARDS (Telemetry, Business Analytics, Predictive Forecast, Recommended Actions) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Telemetry Summary */}
        <div className="p-4 rounded-xl bg-[#161B22] border border-[#21262D] space-y-3">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-[#E6EDF3] uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-blue-400" />
              Telemetry Summary
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-[#8B949E]" />
          </div>

          <div className="space-y-2 text-[11px] font-mono">
            <div className="flex justify-between text-[#8B949E] border-b border-[#21262D] pb-1">
              <span>Metric</span>
              <span className="flex gap-3">
                <span>Min</span>
                <span>Max</span>
                <span>Avg</span>
                <span>Trend</span>
              </span>
            </div>
            {reportData.telemetry.map((t, idx) => (
              <div key={idx} className="flex justify-between items-center text-[#C9D1D9]">
                <span className="truncate pr-2 font-medium">{t.metric}</span>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[#8B949E]">{t.min}</span>
                  <span className="text-[#8B949E]">{t.max}</span>
                  <span className="font-bold text-white">{t.avg}</span>
                  <MiniSparkline color="#10B981" points={t.points} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: Business Analytics */}
        <div className="p-4 rounded-xl bg-[#161B22] border border-[#21262D] space-y-3">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-[#E6EDF3] uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
              Business Analytics
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-[#8B949E]" />
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="flex justify-between items-center">
              <span className="text-[#8B949E]">Revenue</span>
              <span className="font-bold text-white flex items-center gap-1">
                ₹65,340 <span className="text-[10px] text-emerald-400 font-bold">↑ 14.2%</span>
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#8B949E]">Orders</span>
              <span className="font-bold text-white flex items-center gap-1">
                620 <span className="text-[10px] text-emerald-400 font-bold">↑ 12.7%</span>
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#8B949E]">Top Selling Beverage</span>
              <span className="font-bold text-emerald-400">Cappuccino (42%)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#8B949E]">Peak Hours</span>
              <span className="font-bold text-white">6 PM – 9 PM</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#8B949E]">Avg. Order Time</span>
              <span className="font-bold text-white">48 sec</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#8B949E]">Customer Rating</span>
              <span className="font-bold text-amber-400">4.8 / 5</span>
            </div>
            <div className="pt-1 flex items-center justify-between text-[11px] text-[#8B949E]">
              <span>Revenue Trend</span>
              <MiniSparkline color="#10B981" points={[12, 18, 25, 20, 32, 45, 50]} />
            </div>
          </div>
        </div>

        {/* Card 3: Predictive Forecast */}
        <div className="p-4 rounded-xl bg-[#161B22] border border-[#21262D] space-y-3">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-[#E6EDF3] uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
              Predictive Forecast
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-[#8B949E]" />
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="flex justify-between items-center">
              <span className="text-[#8B949E]">Predicted Revenue (Tomorrow)</span>
              <span className="font-bold text-white">₹71,000</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#8B949E]">Expected Orders</span>
              <span className="font-bold text-white">680</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#8B949E]">Milk Refill Forecast</span>
              <span className="font-bold text-amber-400">8 hours</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#8B949E]">Beans Refill Forecast</span>
              <span className="font-bold text-white">26 hours</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#8B949E]">Maintenance Forecast</span>
              <span className="font-bold text-white">Cleaning in 2 days</span>
            </div>
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-[#8B949E]">AI Confidence</span>
                <span className="font-bold text-emerald-400">96%</span>
              </div>
              <div className="h-1.5 w-full bg-[#21262D] rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full w-[96%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Recommended Actions */}
        <div className="p-4 rounded-xl bg-[#161B22] border border-[#21262D] space-y-3">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-[#E6EDF3] uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <ClipboardList className="w-3.5 h-3.5 text-emerald-400" />
              Recommended Actions
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-[#8B949E]" />
          </div>

          <div className="space-y-2 text-xs font-mono">
            {reportData.actions.map((act) => (
              <div
                key={act.id}
                className="p-2.5 rounded-lg bg-[#0D1117] border border-[#21262D] flex items-center justify-between hover:border-[#30363D] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-[#21262D] flex items-center justify-center text-[10px] font-bold text-emerald-400">
                    {act.id}
                  </span>
                  <span className="font-medium text-white text-[11px] truncate">{act.title}</span>
                </div>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded border shrink-0 ${act.impactColor}`}>
                  {act.impact}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6. BOTTOM FOOTER METADATA BAR */}
      <div className="pt-4 border-t border-[#21262D] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#8B949E]">
        <div className="flex items-center gap-6 flex-wrap">
          <div>
            Generated By <span className="text-white font-semibold">NexPod AI Intelligence</span>
          </div>
          <div>
            Analysis Window <span className="text-white font-semibold">Last 24 Hours</span>
          </div>
          <div>
            AI Confidence <span className="text-emerald-400 font-bold">98%</span>
          </div>
        </div>

        {/* Report ID + Copy/Dropdown */}
        <div className="flex items-center gap-2 bg-[#161B22] border border-[#30363D] px-3 py-1.5 rounded-lg">
          <span>Report ID: <span className="text-white font-bold">{reportData.reportId}</span></span>
          <button
            onClick={handleCopyReportId}
            className="hover:text-white transition-colors p-1 text-[#8B949E]"
            title="Copy Report ID"
          >
            {copiedReportId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <ChevronDown className="w-3.5 h-3.5 text-[#8B949E]" />
        </div>
      </div>
    </div>
  );
};
