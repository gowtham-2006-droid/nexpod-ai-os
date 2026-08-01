'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DailyOperationsReportView } from './DailyOperationsReportView';

interface DailyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DailyReportModal: React.FC<DailyReportModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-99999 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative z-10 w-full max-w-6xl max-h-[92vh] overflow-y-auto custom-scrollbar"
        >
          <DailyOperationsReportView onClose={onClose} isModal={true} />
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
