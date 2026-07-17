'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { OrderDataPoint } from '../types';

interface HourlyOrdersChartProps {
  data: OrderDataPoint[];
}

export const HourlyOrdersChart: React.FC<HourlyOrdersChartProps> = ({ data }) => {
  // Helper to color-code based on demand profile in TailAdmin color scale
  const getProfileColor = (profile: string) => {
    switch (profile) {
      case 'Morning':
        return 'var(--color-chart-1)'; // OKLCH Purple-Blue
      case 'Afternoon':
        return 'var(--color-chart-2)'; // OKLCH Green-Teal
      case 'Evening Rush':
        return 'var(--color-chart-5)'; // OKLCH Orange-Red
      default:
        return 'var(--color-bodydark2)';
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload as OrderDataPoint;
      return (
        <div className="bg-boxdark-2 border border-strokedark p-3 rounded-lg shadow-xl font-sans">
          <span className="block text-[10px] text-bodydark2 font-mono uppercase tracking-wider">
            Hourly Telemetry
          </span>
          <div className="flex justify-between items-center gap-6 mt-1">
            <span className="text-xs font-semibold text-white">Hour: {item.hour}</span>
            <span
              className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider"
              style={{
                backgroundColor: `${getProfileColor(item.profile)}20`,
                color: getProfileColor(item.profile),
                border: `1px solid ${getProfileColor(item.profile)}30`,
              }}
            >
              {item.profile}
            </span>
          </div>
          <span className="block text-base font-extrabold text-white mt-1.5 font-mono">
            {item.orders} Orders
          </span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col h-full bg-boxdark border border-strokedark rounded-2xl p-6 shadow-default">
      
      {/* Header and Legend */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            Hourly Orders & Demand Load
          </h2>
          <span className="text-xs text-bodydark2 font-mono">
            Telemetry Stream 02
          </span>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4">
          {[
            { label: 'Morning', color: 'var(--color-chart-1)' },
            { label: 'Afternoon', color: 'var(--color-chart-2)' },
            { label: 'Evening Rush', color: 'var(--color-chart-5)' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5 text-xs text-bodydark2 font-medium">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              {item.label}
            </div>
          ))}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="flex-1 w-full min-h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -30, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#2e3a47"
              vertical={false}
            />

            <XAxis
              dataKey="hour"
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

            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.02)' }} />

            <Bar dataKey="orders" radius={[2, 2, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getProfileColor(entry.profile)}
                  className="transition-all duration-300 hover:opacity-80"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
