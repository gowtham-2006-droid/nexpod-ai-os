'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Coffee, ChevronRight } from 'lucide-react';

interface CustomerHomeProps {
  onStart: () => void;
}

export const CustomerHome: React.FC<CustomerHomeProps> = ({ onStart }) => {
  return (
    <div
      onClick={onStart}
      className="min-h-screen flex flex-col justify-end items-center px-6 pb-16 relative cursor-pointer overflow-hidden bg-black select-none"
    >
      {/* Full-bleed background image with soft fade-in */}
      <motion.div
        initial={{ scale: 1.08, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.75 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        className="absolute inset-0 z-0"
      >
        <img
          src="https://res.cloudinary.com/dkt9vrlf0/image/upload/v1784138235/ChatGPT_Image_Jul_15_2026_11_26_54_PM_m3mot4.png"
          alt="NexPod Splash"
          className="w-full h-full object-cover"
        />
        {/* Dark linear gradient overlay to ensure UI elements contrast perfectly */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      </motion.div>

      {/* Foreground Content */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
        className="relative z-10 text-center w-full max-w-xs space-y-6"
      >
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight drop-shadow-lg">
            NexPod
          </h1>
          <span className="text-[10px] font-mono text-primary tracking-[0.3em] uppercase mt-1 block drop-shadow">
            AI Coffee Experience
          </span>
        </div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 rounded-2xl bg-primary text-primary-foreground text-sm font-bold tracking-wide flex items-center justify-center gap-2 shadow-2xl hover:shadow-[0_0_30px_rgba(60,80,224,0.3)] transition-all cursor-pointer"
        >
          <Coffee className="w-4 h-4" />
          <span>Tap to Start Order</span>
          <ChevronRight className="w-4 h-4" />
        </motion.div>

        <p className="text-[9px] font-mono text-bodydark2 uppercase tracking-widest pt-2">
          Touch anywhere to begin
        </p>
      </motion.div>
    </div>
  );
};
