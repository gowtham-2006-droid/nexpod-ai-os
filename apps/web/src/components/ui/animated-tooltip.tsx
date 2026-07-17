'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnimatedTooltipProps {
  text: string;
  explanation: string;
}

export function AnimatedTooltip({ text, explanation }: AnimatedTooltipProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <span
      className="relative inline-block cursor-help group text-white border-b border-dashed border-primary/50 pb-0.5 px-1 bg-primary/5 rounded"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {text}
      <AnimatePresence>
        {hovered && (
          <motion.span
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 rounded-xl bg-boxdark/95 backdrop-blur-md border border-strokedark shadow-[0_10px_30px_rgba(0,0,0,0.8)] z-50 text-[10px] font-mono text-bodydark leading-relaxed text-center pointer-events-none block"
          >
            <span className="text-primary font-bold block mb-1 uppercase tracking-wider">{text}</span>
            {explanation}
            {/* Tooltip arrow */}
            <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-boxdark/95" />
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
