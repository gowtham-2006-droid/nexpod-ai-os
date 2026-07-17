'use client';

import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { cn } from '../../lib/utils';

interface NotchNavbarProps {
  children?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export function NotchNavbar({ children, rightElement }: NotchNavbarProps) {
  const { scrollY } = useScroll();
  
  // Transform values for shrinking when scrolling
  const width = useTransform(scrollY, [0, 80], ['100%', '85%']);
  const maxW = useTransform(scrollY, [0, 80], ['1280px', '900px']);
  const paddingY = useTransform(scrollY, [0, 80], ['16px', '10px']);
  const borderRadius = useTransform(scrollY, [0, 80], ['0px', '24px']);
  const top = useTransform(scrollY, [0, 80], ['0px', '12px']);
  const shadow = useTransform(
    scrollY,
    [0, 80],
    ['none', '0 10px 30px -10px rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)']
  );
  const border = useTransform(
    scrollY,
    [0, 80],
    ['border-bottom: 1px solid rgba(255, 255, 255, 0.05)', '1px solid rgba(255, 255, 255, 0.1)']
  );

  return (
    <motion.header
      style={{
        width,
        maxWidth: maxW,
        paddingTop: paddingY,
        paddingBottom: paddingY,
        borderRadius,
        top,
        boxShadow: shadow,
      }}
      className={cn(
        "fixed left-1/2 -translate-x-1/2 z-[100] transition-colors duration-300",
        "bg-white/60 dark:bg-black/60 backdrop-blur-xl border border-black/[0.05] dark:border-white/[0.05]"
      )}
    >
      <div className="w-full px-6 flex items-center justify-between">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-chart-2 to-primary flex items-center justify-center shadow-lg transition-transform group-hover:scale-105">
            <span className="text-[14px] font-extrabold text-black font-mono">⚡</span>
          </div>
          <span className="font-black text-black dark:text-white tracking-tight text-sm font-mono group-hover:text-primary transition-colors">
            NexPod <span className="text-chart-2 font-sans font-normal text-[10px] uppercase tracking-widest ml-1">OS</span>
          </span>
        </Link>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-[11px] font-mono font-bold tracking-wider text-bodydark2">
          <a href="#platform" className="hover:text-black dark:hover:text-white transition-colors">PLATFORM</a>
          <a href="#features" className="hover:text-black dark:hover:text-white transition-colors">FEATURES</a>
          <a href="#architecture" className="hover:text-black dark:hover:text-white transition-colors">ARCHITECTURE</a>
          <a href="#roadmap" className="hover:text-black dark:hover:text-white transition-colors">ROADMAP</a>
          <a href="#docs" className="hover:text-black dark:hover:text-white transition-colors font-semibold">DOCS</a>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          {rightElement}
        </div>
      </div>
    </motion.header>
  );
}
