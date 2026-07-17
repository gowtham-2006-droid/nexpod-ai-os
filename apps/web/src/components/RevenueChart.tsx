'use client';

import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceDot,
} from 'recharts';
import { ChartDataPoint } from '../types';

interface RevenueChartProps {
  data: {
    today: ChartDataPoint[];
    week: ChartDataPoint[];
    month: ChartDataPoint[];
  };
}

const eventsMap: Record<string, { title: string; desc: string; type: 'refill' | 'ai' | 'peak' | 'maint' }> = {
  // today
  '10:00': { title: 'Inventory Refill', desc: 'Water refill completed successfully', type: 'refill' },
  '14:00': { title: 'AI Recommendation', desc: 'Milk depletion warning generated', type: 'ai' },
  '18:00': { title: 'Peak Hour', desc: 'Evening Rush profile active (+120% order volume)', type: 'peak' },
  // week
  'Wed': { title: 'Maintenance Event', desc: 'Brewing head seals descaled', type: 'maint' },
  'Fri': { title: 'AI Recommendation', desc: 'Promo campaign recommendation dispatched', type: 'ai' },
  'Sun': { title: 'Peak Hour', desc: 'Sunday atrium peak traffic', type: 'peak' },
  // month
  'Week 2': { title: 'Maintenance Event', desc: 'Monthly cleaning cycle', type: 'maint' },
  'Week 3': { title: 'AI Recommendation', desc: 'Weekly price adjustment deployed', type: 'ai' },
};

export const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month'>('today');

  const activeData = data[timeframe];

  const formatYAxis = (value: number) => {
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)}L`;
    }
    if (value >= 1000) {
      return `₹${(value / 1000).toFixed(0)}k`;
    }
    return `₹${value}`;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const label = payload[0].payload.label;
      const event = eventsMap[label];
      return (
        <div className="bg-boxdark-2 border border-strokedark p-3.5 rounded-xl shadow-xl font-sans min-w-[200px]">
          <span className="block text-[10px] text-bodydark2 font-mono uppercase tracking-wider">
            Timeframe: {timeframe}
          </span>
          <span className="block text-xs font-semibold text-white mt-0.5">
            {label}
          </span>
          <span className="block text-sm font-bold text-primary mt-1 font-mono">
            ₹{payload[0].value.toLocaleString('en-IN')}
          </span>
          {event && (
            <div className="mt-2.5 pt-2 border-t border-strokedark/60 space-y-1">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                🔔 {event.title}
              </span>
              <p className="text-[10px] text-bodydark leading-relaxed">
                {event.desc}
              </p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Date range descriptions for TailAdmin style legend
  const getDateRange = () => {
    if (timeframe === 'today') return '15 Jul, 2026';
    if (timeframe === 'week') return '09 Jul - 15 Jul';
    return '01 Jul - 31 Jul';
  };

  const getReferenceDots = () => {
    if (timeframe === 'today') {
      return (
        <>
          <ReferenceDot x="10:00" y={9800} r={5} fill="var(--color-chart-2)" stroke="#ffffff" strokeWidth={1.5} />
          <ReferenceDot x="14:00" y={22800} r={5} fill="var(--color-chart-1)" stroke="#ffffff" strokeWidth={1.5} />
          <ReferenceDot x="18:00" y={35100} r={5} fill="var(--color-chart-5)" stroke="#ffffff" strokeWidth={1.5} />
        </>
      );
    } else if (timeframe === 'week') {
      return (
        <>
          <ReferenceDot x="Wed" y={39100} r={5} fill="var(--color-chart-3)" stroke="#ffffff" strokeWidth={1.5} />
          <ReferenceDot x="Fri" y={48900} r={5} fill="var(--color-chart-1)" stroke="#ffffff" strokeWidth={1.5} />
          <ReferenceDot x="Sun" y={49500} r={5} fill="var(--color-chart-5)" stroke="#ffffff" strokeWidth={1.5} />
        </>
      );
    } else {
      return (
        <>
          <ReferenceDot x="Week 2" y={298000} r={5} fill="var(--color-chart-3)" stroke="#ffffff" strokeWidth={1.5} />
          <ReferenceDot x="Week 3" y={312000} r={5} fill="var(--color-chart-1)" stroke="#ffffff" strokeWidth={1.5} />
        </>
      );
    }
  };

  return (
    <div className="flex flex-col h-full bg-boxdark border border-strokedark rounded-2xl p-6 shadow-default">
      
      {/* Header and Toggles (TailAdmin style layout) */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        
        {/* Left Side Legends */}
        <div className="flex flex-wrap gap-4 sm:gap-8">
          <div className="flex gap-2">
            <span className="mt-1.5 flex h-3 w-3 shrink-0 rounded-full border-2 border-primary bg-transparent" />
            <div>
              <span className="block text-xs font-semibold text-bodydark2 uppercase tracking-wide">
                Total Revenue
              </span>
              <span className="block text-base font-extrabold text-white font-mono leading-none mt-1">
                ₹{timeframe === 'today' ? '42,850' : timeframe === 'week' ? '3,13,800' : '12,30,000'}
              </span>
              <span className="block text-[10px] text-bodydark2 font-mono mt-0.5">
                {getDateRange()}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side Timeframe Toggles */}
        <div className="flex justify-end">
          <div className="inline-flex rounded-md bg-meta-4 p-1">
            {(['today', 'week', 'month'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`rounded px-3 py-1 text-xs font-semibold capitalize transition-all duration-300 ${
                  timeframe === t
                    ? 'bg-boxdark text-white shadow-card'
                    : 'text-bodydark hover:bg-boxdark hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Chart Canvas */}
      <div className="flex-1 w-full min-h-[260px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={activeData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="primaryGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#2e3a47"
              vertical={false}
            />

            <XAxis
              dataKey="label"
              stroke="#8a99ad"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              dy={10}
              className="font-mono"
            />

            <YAxis
              stroke="#8a99ad"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatYAxis}
              dx={-5}
              className="font-mono"
            />

            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#2e3a47', strokeWidth: 1 }} />

            {getReferenceDots()}

            <Area
              type="monotone"
              dataKey="revenue"
              stroke="var(--color-chart-1)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#primaryGlow)"
              activeDot={{
                r: 6,
                stroke: 'var(--color-chart-1)',
                strokeWidth: 2,
                fill: '#ffffff',
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
