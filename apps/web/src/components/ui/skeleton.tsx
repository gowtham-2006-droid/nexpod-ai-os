'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

/**
 * Apple Design System — Shimmer Skeleton
 * Matte dark finish with subtle glassmorphic wave highlight.
 */
export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl bg-white/[0.04] border border-white/[0.06] before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/[0.08] before:to-transparent',
        className
      )}
      {...props}
    />
  );
};

/** Skeleton for 6-Column KPI Cards */
export const CardSkeleton: React.FC = () => (
  <div className="rounded-2xl border border-strokedark bg-boxdark p-5 shadow-default flex flex-col justify-between h-[120px]">
    <div className="flex justify-between items-start">
      <Skeleton className="h-9 w-9 rounded-xl" />
      <Skeleton className="h-4 w-16 rounded-md" />
    </div>
    <div className="space-y-2 mt-4">
      <Skeleton className="h-6 w-24 rounded-lg" />
      <Skeleton className="h-3 w-32 rounded-md" />
    </div>
  </div>
);

/** Skeleton for AI Hero Banner */
export const HeroSkeleton: React.FC = () => (
  <div className="mb-7.5 p-6 rounded-2xl border border-strokedark bg-boxdark shadow-default h-[180px] flex flex-col justify-between">
    <div className="flex items-center gap-3">
      <Skeleton className="h-6 w-6 rounded-full" />
      <Skeleton className="h-5 w-40 rounded-lg" />
      <Skeleton className="h-4 w-20 rounded-md" />
    </div>
    <div className="space-y-2 my-4">
      <Skeleton className="h-4 w-3/4 rounded-md" />
      <Skeleton className="h-4 w-1/2 rounded-md" />
    </div>
    <div className="flex justify-between items-center pt-4 border-t border-strokedark">
      <Skeleton className="h-4 w-32 rounded-md" />
      <Skeleton className="h-9 w-28 rounded-xl" />
    </div>
  </div>
);

/** Skeleton for Charts */
export const ChartSkeleton: React.FC<{ height?: string }> = ({ height = 'h-[300px]' }) => (
  <div className={`rounded-2xl border border-strokedark bg-boxdark p-6 shadow-default ${height} flex flex-col justify-between`}>
    <div className="flex justify-between items-center mb-4">
      <Skeleton className="h-5 w-36 rounded-lg" />
      <Skeleton className="h-7 w-24 rounded-lg" />
    </div>
    <div className="flex-1 flex items-end gap-3 pt-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <Skeleton
          key={i}
          className="flex-1 rounded-t-md"
          style={{ height: `${Math.max(20, Math.floor(Math.sin(i) * 40 + 60))}%` }}
        />
      ))}
    </div>
  </div>
);

/** Skeleton for Table Rows */
export const TableRowSkeleton: React.FC = () => (
  <div className="flex items-center justify-between p-4 border-b border-strokedark bg-boxdark/50">
    <div className="flex items-center gap-3">
      <Skeleton className="h-8 w-8 rounded-lg" />
      <div className="space-y-1.5">
        <Skeleton className="h-4 w-28 rounded-md" />
        <Skeleton className="h-3 w-20 rounded-md" />
      </div>
    </div>
    <Skeleton className="h-4 w-16 rounded-md" />
    <Skeleton className="h-4 w-20 rounded-md" />
    <Skeleton className="h-6 w-24 rounded-full" />
  </div>
);
