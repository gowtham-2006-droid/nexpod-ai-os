'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface IntroDisclosureProps {
  storageKey: string;
  title: string;
  description: string;
  actionText?: string;
  onConfirm?: () => void;
  triggerOpen?: boolean;
}

export function IntroDisclosure({
  storageKey,
  title,
  description,
  actionText = "Acknowledge",
  onConfirm,
  triggerOpen = false,
}: IntroDisclosureProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(storageKey);
    if (!dismissed) {
      setIsOpen(true);
    }
  }, [storageKey]);

  const handleDismiss = () => {
    localStorage.setItem(storageKey, 'true');
    setIsOpen(false);
    if (onConfirm) onConfirm();
  };

  return (
    <AnimatePresence>
      {(isOpen || triggerOpen) && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          className="fixed bottom-6 left-6 z-[9999] max-w-sm w-full bg-boxdark border border-primary/20 shadow-[0_15px_40px_rgba(0,200,83,0.15)] rounded-2xl p-5 overflow-hidden text-left"
        >
          {/* Accent light glow */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl pointer-events-none" />
          
          <div className="space-y-3 relative z-10">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              {title}
            </h4>
            <p className="text-[11px] text-bodydark2 leading-relaxed">
              {description}
            </p>
            <div className="flex gap-2 justify-end pt-1">
              <button
                onClick={handleDismiss}
                className="px-3.5 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-[10px] font-mono font-bold text-primary hover:bg-primary hover:text-black transition-all cursor-pointer"
              >
                {actionText}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
