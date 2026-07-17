'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface ProductSalesChartProps {
  totalOrders: number;
  coffeePercent: number;
  teaPercent: number;
  coldCoffeePercent: number;
}

export const ProductSalesChart: React.FC<ProductSalesChartProps> = ({
  totalOrders,
  coffeePercent,
  teaPercent,
  coldCoffeePercent,
}) => {
  const chartData = [
    { name: 'Coffee', value: coffeePercent, color: 'var(--color-chart-1)' },
    { name: 'Tea', value: teaPercent, color: 'var(--color-chart-2)' },
    { name: 'Cold Coffee', value: coldCoffeePercent, color: 'var(--color-chart-3)' },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-boxdark-2 border border-strokedark p-2.5 rounded-lg shadow-xl font-sans">
          <span className="block text-xs font-semibold text-white">
            {payload[0].name}
          </span>
          <span className="block text-xs font-mono font-bold text-primary mt-0.5">
            {payload[0].value}% of Mix
          </span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col h-full bg-boxdark border border-strokedark rounded-2xl p-6 shadow-default">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            Beverage Distribution
          </h2>
          <span className="text-xs text-bodydark2 font-mono">
            Product Mix Breakdown
          </span>
        </div>
      </div>

      {/* Donut Canvas */}
      <div className="flex-grow w-full min-h-[220px] flex items-center justify-center relative">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Tooltip content={<CustomTooltip />} />
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="var(--color-border)" strokeWidth={2} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-extrabold text-white font-mono">{totalOrders}</span>
          <span className="text-[10px] text-bodydark2 uppercase tracking-wider font-semibold">Total Orders</span>
        </div>
      </div>

      {/* Legends Grid */}
      <div className="grid grid-cols-2 gap-y-3.5 mt-6 border-t border-strokedark pt-4">
        {chartData.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <div>
              <span className="block text-xs font-medium text-bodydark truncate max-w-[100px] sm:max-w-none">
                {item.name}
              </span>
              <span className="block text-[10px] text-bodydark2 font-mono font-bold leading-none mt-0.5">
                {item.value}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
