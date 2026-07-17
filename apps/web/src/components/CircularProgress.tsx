'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface CircularProgressProps {
  percentage: number;
  label: string;
  actualValue: number;
  maxValue: number;
  unit: string;
  status: 'nominal' | 'warning' | 'critical';
  size?: number;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  percentage,
  label,
  actualValue,
  maxValue,
  unit,
  status,
  size = 100,
}) => {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // TailAdmin Theme Color Assignments
  let strokeColor = '#10B981'; // Green (nominal)
  let gradientId = 'grad-nominal';
  let stopColors = ['#10B981', '#059669'];

  if (status === 'warning') {
    strokeColor = '#FFBA00'; // Yellow (warning)
    gradientId = 'grad-warning';
    stopColors = ['#FFBA00', '#D97706'];
  } else if (status === 'critical') {
    strokeColor = '#DC3545'; // Red (critical)
    gradientId = 'grad-critical';
    stopColors = ['#DC3545', '#B91C1C'];
  }

  return (
    <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-boxdark border border-strokedark shadow-default hover:shadow-lg transition-all duration-300 group">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={stopColors[0]} />
              <stop offset="100%" stopColor={stopColors[1]} />
            </linearGradient>
          </defs>

          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="stroke-meta-4"
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            strokeLinecap="round"
          />
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xl font-bold tracking-tight text-white font-mono">
            {percentage}%
          </span>
          <span className="text-[9px] text-bodydark2 font-semibold uppercase tracking-wider">
            {actualValue} {unit}
          </span>
        </div>
      </div>

      <div className="mt-4 text-center">
        <span className="block text-xs font-bold text-bodydark group-hover:text-white transition-colors">
          {label}
        </span>
        <span className="block text-[10px] text-bodydark2 font-mono mt-0.5">
          Max: {maxValue} {unit}
        </span>
      </div>
    </div>
  );
};
