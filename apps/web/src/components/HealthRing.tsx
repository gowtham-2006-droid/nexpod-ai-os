'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface HealthRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  showLabel?: boolean;
  className?: string;
}

export const HealthRing: React.FC<HealthRingProps> = ({
  percentage,
  size = 120,
  strokeWidth = 8,
  label,
  showLabel = true,
  className = '',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(100, percentage));
  const offset = circumference - (progress / 100) * circumference;

  // Color based on health level
  const getColor = () => {
    if (progress >= 80) return 'var(--color-chart-2)'; // green-teal
    if (progress >= 40) return 'var(--color-chart-4)'; // amber-yellow
    return 'var(--color-destructive)'; // red
  };

  const getStatusText = () => {
    if (progress >= 90) return 'Excellent';
    if (progress >= 80) return 'Good';
    if (progress >= 60) return 'Fair';
    if (progress >= 40) return 'Degraded';
    return 'Critical';
  };

  const color = getColor();

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={strokeWidth}
          opacity={0.3}
        />
        {/* Animated progress arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
        />
        {/* Glow filter */}
        <defs>
          <filter id={`glow-${label}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-2xl font-extrabold text-white font-mono"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          style={{ fontSize: size * 0.22 }}
        >
          {progress}%
        </motion.span>
        {showLabel && (
          <span
            className="font-mono font-semibold uppercase tracking-wider mt-0.5"
            style={{
              fontSize: Math.max(8, size * 0.075),
              color,
            }}
          >
            {getStatusText()}
          </span>
        )}
      </div>

      {/* Label below */}
      {label && (
        <span className="text-xs font-semibold text-bodydark2 mt-2 text-center font-mono uppercase tracking-wider">
          {label}
        </span>
      )}
    </div>
  );
};
