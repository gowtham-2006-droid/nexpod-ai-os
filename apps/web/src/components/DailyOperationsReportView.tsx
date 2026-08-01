'use client';

import React, { useState, useEffect } from 'react';
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
  Brain,
  Loader2,
} from 'lucide-react';

import { api } from '../lib/api';

interface DailyOperationsReportViewProps {
  onClose?: () => void;
  isModal?: boolean;
}

const impactColor = (impact: string) => {
  const lower = impact.toLowerCase();
  if (lower.includes('high')) return 'bg-red-500/20 text-red-400 border-red-500/30';
  if (lower.includes('medium')) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
};

export const DailyOperationsReportView: React.FC<DailyOperationsReportViewProps> = ({
  onClose,
  isModal = false,
}) => {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  // ── fetch real data from API ─────────────────────────────────────────
  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getDailyReport();
        setReport(data);
      } catch (err: any) {
        console.error('Failed to fetch daily report:', err);
        setError(err?.message || 'Failed to generate report');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, []);

  // ── loading state ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="w-full bg-[#090C10] text-[#E6EDF3] p-8 rounded-2xl border border-[#21262D] shadow-2xl flex flex-col items-center justify-center min-h-[400px] gap-6">
        <div className="relative w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin" />
          <Brain className="w-8 h-8 text-emerald-400 animate-pulse" />
        </div>
        <div className="text-center space-y-2">
          <h4 className="text-base font-bold text-white">Synthesizing Daily Intelligence</h4>
          <p className="text-xs font-mono text-emerald-400">
            Gathering live pod telemetry, running Groq AI analysis...
          </p>
        </div>
        <div className="flex gap-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-1.5 rounded-full bg-emerald-400 animate-pulse"
              style={{ width: `${12 + i * 4}px`, animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="w-full bg-[#090C10] text-[#E6EDF3] p-8 rounded-2xl border border-red-500/30 shadow-2xl flex flex-col items-center justify-center min-h-[300px] gap-4">
        <AlertTriangle className="w-10 h-10 text-red-400" />
        <p className="text-sm text-red-300 font-mono">{error || 'Report data unavailable.'}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-xs font-bold text-red-300 hover:bg-red-500/30 transition-all">
          Retry
        </button>
      </div>
    );
  }

  // ── destructure live report data ─────────────────────────────────────
  const kpis = report.kpis || {};
  const inventory = report.inventory || [];
  const alerts = report.alerts || [];
  const telemetry = report.telemetry || [];
  const podMetrics = report.pod_metrics || [];
  const biz = report.business_analytics || {};
  const forecast = report.predictive_forecast || {};
  const actions = report.recommended_actions || [];
  const insights = report.key_insights || [];
  const execSummary = report.executive_summary || '';

  const handleCopyMd = () => {
    const md = `# Daily Operations Report - ${report.report_id}
Generated on ${report.generated_at} | Period: ${report.window}
Generated By: ${report.generated_by}

## Executive Summary
${execSummary}

## Key Metrics
- Revenue: ₹${kpis.revenue_inr?.toLocaleString('en-IN')}
- Orders: ${kpis.total_orders}
- Fleet Health: ${kpis.fleet_health}%
- Uptime: ${kpis.uptime_pct}%

## Key Insights
${insights.map((i: string) => `- ${i}`).join('\n')}

## Recommended Actions
${actions.map((a: any) => `${a.id}. ${a.title} (${a.impact})`).join('\n')}
`;
    navigator.clipboard.writeText(md);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  const handleCopyReportId = () => {
    navigator.clipboard.writeText(report.report_id);
    setCopiedReportId(true);
    setTimeout(() => setCopiedReportId(false), 2000);
  };

  const handlePrint = () => { window.print(); };
  const handleDownloadPdf = () => { window.print(); };

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
              {report.generated_by || 'AI Generated'}
            </span>
          </div>
          <p className="text-xs font-mono text-[#8B949E]">
            Generated on <span className="text-white">{report.generated_at}</span> · Last 24 Hours ({report.window})
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button onClick={handleDownloadPdf} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161B22] border border-[#30363D] hover:border-[#8B949E] text-xs font-mono font-semibold text-[#C9D1D9] transition-all">
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            Download PDF
          </button>
          <button onClick={handleCopyMd} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161B22] border border-[#30363D] hover:border-[#8B949E] text-xs font-mono font-semibold text-[#C9D1D9] transition-all">
            {copiedMd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileText className="w-3.5 h-3.5 text-purple-400" />}
            {copiedMd ? 'Copied MD' : 'Export MD'}
          </button>
          <button onClick={handlePrint} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161B22] border border-[#30363D] hover:border-[#8B949E] text-xs font-mono font-semibold text-[#C9D1D9] transition-all">
            <Printer className="w-3.5 h-3.5 text-cyan-400" />
            Print
          </button>
          {isModal && onClose && (
            <button onClick={onClose} className="p-1.5 rounded-lg bg-[#161B22] border border-[#30363D] hover:border-red-500/50 text-[#8B949E] hover:text-white transition-all ml-2">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. TOP 6 KPI CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-3.5 rounded-xl bg-[#161B22] border border-[#21262D] space-y-1.5 hover:border-[#30363D] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-[#8B949E] uppercase tracking-wider">Fleet Health</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400"><ShieldCheck className="w-4 h-4" /></div>
          </div>
          <div className="text-2xl font-extrabold text-white tracking-tight">{kpis.fleet_health}%</div>
          <div className="flex items-center justify-between text-[10px] font-mono text-emerald-400">
            <span>{kpis.status}</span>
            <MiniSparkline color="#10B981" points={[80, 85, 88, kpis.fleet_health || 94]} />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#161B22] border border-[#21262D] space-y-1.5 hover:border-[#30363D] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-[#8B949E] uppercase tracking-wider">Active Pods</span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400"><Box className="w-4 h-4" /></div>
          </div>
          <div className="text-2xl font-extrabold text-white tracking-tight">{kpis.active_pods} / {kpis.total_pods}</div>
          <span className="text-[10px] font-mono text-[#8B949E] block">{kpis.active_pods === kpis.total_pods ? '100% Operational' : `${Math.round((kpis.active_pods / kpis.total_pods) * 100)}% Operational`}</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#161B22] border border-[#21262D] space-y-1.5 hover:border-[#30363D] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-[#8B949E] uppercase tracking-wider">Revenue</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400"><IndianRupee className="w-4 h-4" /></div>
          </div>
          <div className="text-2xl font-extrabold text-white tracking-tight">₹{kpis.revenue_inr?.toLocaleString('en-IN')}</div>
          <div className="flex items-center justify-between text-[10px] font-mono text-emerald-400">
            <span>AOV ₹{kpis.aov_inr}</span>
            <MiniSparkline color="#10B981" points={[kpis.revenue_inr * 0.7, kpis.revenue_inr * 0.85, kpis.revenue_inr]} />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#161B22] border border-[#21262D] space-y-1.5 hover:border-[#30363D] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-[#8B949E] uppercase tracking-wider">Orders Served</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400"><Coffee className="w-4 h-4" /></div>
          </div>
          <div className="text-2xl font-extrabold text-white tracking-tight">{kpis.total_orders}</div>
          <div className="flex items-center justify-between text-[10px] font-mono text-emerald-400">
            <span>{kpis.active_alerts} alerts</span>
            <MiniSparkline color="#10B981" points={[kpis.total_orders * 0.6, kpis.total_orders * 0.8, kpis.total_orders]} />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#161B22] border border-[#21262D] space-y-1.5 hover:border-[#30363D] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-[#8B949E] uppercase tracking-wider">Customer Rating</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400"><Star className="w-4 h-4 fill-amber-400/20" /></div>
          </div>
          <div className="text-2xl font-extrabold text-white tracking-tight">{biz.customer_rating || 4.8} / 5</div>
          <div className="flex items-center justify-between text-[10px] font-mono text-emerald-400">
            <span>Trend: {biz.revenue_trend || 'stable'}</span>
            <MiniSparkline color="#10B981" points={[4.5, 4.6, 4.7, biz.customer_rating || 4.8]} />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#161B22] border border-[#21262D] space-y-1.5 hover:border-[#30363D] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-[#8B949E] uppercase tracking-wider">Uptime</span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400"><Clock className="w-4 h-4" /></div>
          </div>
          <div className="text-2xl font-extrabold text-white tracking-tight">{kpis.uptime_pct}%</div>
          <div className="flex items-center justify-between text-[10px] font-mono text-emerald-400">
            <span>{kpis.total_pods} pods tracked</span>
            <MiniSparkline color="#10B981" points={[98.5, 99.0, 99.4, kpis.uptime_pct || 99.6]} />
          </div>
        </div>
      </div>

      {/* 3. ROW 2: AI EXECUTIVE SUMMARY & AI KEY INSIGHTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl bg-[#161B22] border border-[#21262D] space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            AI Executive Summary
          </div>
          <p className="text-xs text-[#C9D1D9] leading-relaxed font-normal">{execSummary}</p>
        </div>

        <div className="p-5 rounded-xl bg-[#161B22] border border-[#21262D] space-y-3">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
            <span className="flex items-center gap-2"><Sparkles className="w-4 h-4" /> AI Key Insights</span>
            <ChevronRight className="w-4 h-4 text-[#8B949E]" />
          </div>
          <ul className="space-y-2 text-xs text-[#C9D1D9]">
            {insights.map((insight: string, idx: number) => (
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
        <div className="p-5 rounded-xl bg-[#161B22] border border-[#21262D] space-y-4">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-[#E6EDF3] uppercase tracking-wider">
            <span className="flex items-center gap-2"><Box className="w-4 h-4 text-emerald-400" /> Inventory Summary</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[#21262D] text-[#8B949E] text-[11px]">
                  <th className="pb-2 font-normal">Item</th>
                  <th className="pb-2 font-normal">Level</th>
                  <th className="pb-2 font-normal">Consumption (24h)</th>
                  <th className="pb-2 font-normal">Remaining</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#21262D]/60">
                {inventory.map((inv: any, idx: number) => (
                  <tr key={idx} className="hover:bg-[#1C2128]">
                    <td className="py-2.5 font-semibold text-white">{inv.name}</td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-2 w-28">
                        <div className="h-1.5 flex-1 bg-[#21262D] rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${inv.is_warning ? 'bg-amber-400' : 'bg-emerald-400'}`} style={{ width: `${inv.pct}%` }} />
                        </div>
                        <span className="text-[11px] text-[#8B949E] font-bold">{inv.pct}%</span>
                      </div>
                    </td>
                    <td className="py-2.5 text-[#C9D1D9]">{inv.consumption_24h}</td>
                    <td className={`py-2.5 font-bold ${inv.is_warning ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {inv.remaining_hrs} hrs
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-[#161B22] border border-[#21262D] space-y-4">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-[#E6EDF3] uppercase tracking-wider">
            <span className="flex items-center gap-2"><Activity className="w-4 h-4 text-amber-400" /> Alerts & Diagnostics</span>
          </div>
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="p-3 rounded-lg bg-[#0D1117] border border-emerald-500/20 flex items-center gap-3 text-xs font-mono">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 font-bold">All Clear — No active alerts in the last 24 hours.</span>
              </div>
            ) : (
              alerts.map((alt: any, idx: number) => (
                <div key={idx} className="p-3 rounded-lg bg-[#0D1117] border border-[#21262D] flex items-center justify-between text-xs font-mono hover:border-[#30363D] transition-colors">
                  <div className="flex items-center gap-3">
                    {alt.severity === 'warning' || alt.severity === 'medium' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                    <span className={`font-bold ${alt.severity === 'warning' || alt.severity === 'medium' ? 'text-amber-400' : 'text-emerald-400'}`}>{alt.type}</span>
                    <span className="text-[#C9D1D9] font-sans text-xs">{alt.message}</span>
                  </div>
                  <span className="text-[#8B949E] shrink-0">{alt.time}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 5. ROW 4: 4 BOTTOM CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Telemetry Summary */}
        <div className="p-4 rounded-xl bg-[#161B22] border border-[#21262D] space-y-3">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-[#E6EDF3] uppercase tracking-wider">
            <span className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-blue-400" /> Telemetry Summary</span>
          </div>
          <div className="space-y-2 text-[11px] font-mono">
            <div className="flex justify-between text-[#8B949E] border-b border-[#21262D] pb-1">
              <span>Metric</span>
              <span className="flex gap-3"><span>Min</span><span>Max</span><span>Avg</span></span>
            </div>
            {telemetry.map((t: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center text-[#C9D1D9]">
                <span className="truncate pr-2 font-medium">{t.metric}</span>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[#8B949E]">{t.min}</span>
                  <span className="text-[#8B949E]">{t.max}</span>
                  <span className="font-bold text-white">{t.avg}</span>
                  <MiniSparkline color="#10B981" points={[t.min, t.avg, t.max, t.avg]} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Business Analytics */}
        <div className="p-4 rounded-xl bg-[#161B22] border border-[#21262D] space-y-3">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-[#E6EDF3] uppercase tracking-wider">
            <span className="flex items-center gap-1.5"><BarChart3 className="w-3.5 h-3.5 text-emerald-400" /> Business Analytics</span>
          </div>
          <div className="space-y-2.5 text-xs font-mono">
            <div className="flex justify-between items-center"><span className="text-[#8B949E]">Revenue</span><span className="font-bold text-white">₹{kpis.revenue_inr?.toLocaleString('en-IN')}</span></div>
            <div className="flex justify-between items-center"><span className="text-[#8B949E]">Orders</span><span className="font-bold text-white">{kpis.total_orders}</span></div>
            <div className="flex justify-between items-center"><span className="text-[#8B949E]">Top Selling</span><span className="font-bold text-emerald-400">{biz.top_selling || 'N/A'}</span></div>
            <div className="flex justify-between items-center"><span className="text-[#8B949E]">Peak Hours</span><span className="font-bold text-white">{biz.peak_hours || 'N/A'}</span></div>
            <div className="flex justify-between items-center"><span className="text-[#8B949E]">Avg. Order Time</span><span className="font-bold text-white">{biz.avg_order_time_sec || 48} sec</span></div>
            <div className="flex justify-between items-center"><span className="text-[#8B949E]">Customer Rating</span><span className="font-bold text-amber-400">{biz.customer_rating || 4.8} / 5</span></div>
          </div>
        </div>

        {/* Predictive Forecast */}
        <div className="p-4 rounded-xl bg-[#161B22] border border-[#21262D] space-y-3">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-[#E6EDF3] uppercase tracking-wider">
            <span className="flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5 text-purple-400" /> Predictive Forecast</span>
          </div>
          <div className="space-y-2.5 text-xs font-mono">
            <div className="flex justify-between items-center"><span className="text-[#8B949E]">Predicted Revenue</span><span className="font-bold text-white">₹{forecast.predicted_revenue_tomorrow_inr?.toLocaleString('en-IN') || '—'}</span></div>
            <div className="flex justify-between items-center"><span className="text-[#8B949E]">Expected Orders</span><span className="font-bold text-white">{forecast.expected_orders_tomorrow || '—'}</span></div>
            <div className="flex justify-between items-center"><span className="text-[#8B949E]">Milk Refill</span><span className={`font-bold ${(forecast.milk_refill_hrs || 99) < 12 ? 'text-amber-400' : 'text-white'}`}>{forecast.milk_refill_hrs || '—'} hrs</span></div>
            <div className="flex justify-between items-center"><span className="text-[#8B949E]">Beans Refill</span><span className="font-bold text-white">{forecast.beans_refill_hrs || '—'} hrs</span></div>
            <div className="flex justify-between items-center"><span className="text-[#8B949E]">Maintenance</span><span className="font-bold text-white">{forecast.maintenance_forecast || '—'}</span></div>
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[11px]"><span className="text-[#8B949E]">AI Confidence</span><span className="font-bold text-emerald-400">{forecast.ai_confidence_pct || 92}%</span></div>
              <div className="h-1.5 w-full bg-[#21262D] rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${forecast.ai_confidence_pct || 92}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Actions */}
        <div className="p-4 rounded-xl bg-[#161B22] border border-[#21262D] space-y-3">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-[#E6EDF3] uppercase tracking-wider">
            <span className="flex items-center gap-1.5"><ClipboardList className="w-3.5 h-3.5 text-emerald-400" /> Recommended Actions</span>
          </div>
          <div className="space-y-2 text-xs font-mono">
            {actions.map((act: any) => (
              <div key={act.id} className="p-2.5 rounded-lg bg-[#0D1117] border border-[#21262D] flex items-center justify-between hover:border-[#30363D] transition-colors">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-[#21262D] flex items-center justify-center text-[10px] font-bold text-emerald-400">{act.id}</span>
                  <span className="font-medium text-white text-[11px] truncate">{act.title}</span>
                </div>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded border shrink-0 ${impactColor(act.impact)}`}>{act.impact}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6. BOTTOM FOOTER METADATA BAR */}
      <div className="pt-4 border-t border-[#21262D] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#8B949E]">
        <div className="flex items-center gap-6 flex-wrap">
          <div>Generated By <span className="text-white font-semibold">{report.generated_by}</span></div>
          <div>Analysis Window <span className="text-white font-semibold">Last 24 Hours</span></div>
          <div>AI Confidence <span className="text-emerald-400 font-bold">{forecast.ai_confidence_pct || 92}%</span></div>
        </div>
        <div className="flex items-center gap-2 bg-[#161B22] border border-[#30363D] px-3 py-1.5 rounded-lg">
          <span>Report ID: <span className="text-white font-bold">{report.report_id}</span></span>
          <button onClick={handleCopyReportId} className="hover:text-white transition-colors p-1 text-[#8B949E]" title="Copy Report ID">
            {copiedReportId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
