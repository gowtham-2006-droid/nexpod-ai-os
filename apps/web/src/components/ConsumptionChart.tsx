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
} from 'recharts';

export interface ConsumptionDataPoint {
  label: string;
  Milk: number;
  CoffeeBeans: number;
  TeaPowder: number;
  Sugar: number;
  Water: number;
}

interface ConsumptionChartProps {
  data: {
    daily: ConsumptionDataPoint[];
    weekly: ConsumptionDataPoint[];
  };
}

export const ConsumptionChart: React.FC<ConsumptionChartProps> = ({ data }) => {
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly'>('daily');

  const activeData = data[timeframe];

  const resources = [
    { key: 'Milk', color: 'var(--color-chart-1)', unit: 'L' },
    { key: 'CoffeeBeans', label: 'Coffee Beans', color: 'var(--color-chart-2)', unit: 'Kg' },
    { key: 'TeaPowder', label: 'Tea Powder', color: 'var(--color-chart-3)', unit: 'Kg' },
    { key: 'Sugar', color: 'var(--color-chart-4)', unit: 'Kg' },
    { key: 'Water', color: 'var(--color-chart-5)', unit: 'L' },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-boxdark-2 border border-strokedark p-4 rounded-xl shadow-2xl font-sans min-w-[180px]">
          <span className="block text-[10px] text-bodydark2 font-mono uppercase tracking-wider mb-2">
            Depletion Checkpoint: {payload[0].payload.label}
          </span>
          <div className="space-y-1.5">
            {payload.map((item: any, index: number) => {
              const resInfo = resources.find(r => r.key === item.name);
              const label = resInfo?.label || item.name;
              const unit = resInfo?.unit || '';
              return (
                <div key={index} className="flex justify-between items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-bodydark font-medium">{label}</span>
                  </div>
                  <span className="font-mono font-bold text-white">
                    {item.value} {unit}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col h-full bg-boxdark border border-strokedark rounded-2xl p-6 shadow-default">
      
      {/* Header and Toggle Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            Inventory Consumption Telemetry
          </h2>
          <span className="text-xs text-bodydark2 font-mono mt-0.5 block">
            Historic material depletion load curves
          </span>
        </div>

        {/* Glass Tabs */}
        <div className="inline-flex rounded-md bg-meta-4 p-1">
          {(['daily', 'weekly'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`rounded px-3 py-1 text-xs font-semibold capitalize transition-all duration-300 ${
                timeframe === t
                  ? 'bg-boxdark text-white shadow-card'
                  : 'text-bodydark hover:bg-boxdark hover:text-white'
              }`}
            >
              {t} Consumption
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="flex-1 w-full min-h-[300px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={activeData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              {resources.map((res) => (
                <linearGradient key={res.key} id={`glow-${res.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={res.color} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={res.color} stopOpacity={0.0} />
                </linearGradient>
              ))}
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
              dx={-5}
              className="font-mono"
            />

            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#2e3a47', strokeWidth: 1 }} />

            {resources.map((res) => (
              <Area
                key={res.key}
                type="monotone"
                dataKey={res.key}
                name={res.key}
                stroke={res.color}
                strokeWidth={2}
                fillOpacity={1}
                fill={`url(#glow-${res.key})`}
                activeDot={{
                  r: 5,
                  stroke: res.color,
                  strokeWidth: 2,
                  fill: '#ffffff',
                }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Info / Legends */}
      <div className="flex flex-wrap gap-4 mt-6 border-t border-strokedark pt-4 justify-center sm:justify-start">
        {resources.map((res) => (
          <div key={res.key} className="flex items-center gap-1.5 text-xs text-bodydark2 font-medium">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: res.color }} />
            <span>{res.label || res.key} ({res.unit})</span>
          </div>
        ))}
      </div>

    </div>
  );
};
