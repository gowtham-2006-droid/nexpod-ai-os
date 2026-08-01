'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { AIReasoningData, ReasoningSignal } from '../lib/api';

interface AIReasoningPanelProps {
  reasoningData?: AIReasoningData | null;
  className?: string;
  isCollapsible?: boolean;
  defaultExpanded?: boolean;
}

export const AIReasoningPanel: React.FC<AIReasoningPanelProps> = ({
  reasoningData,
  className = '',
  isCollapsible = false,
  defaultExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Default fallback signals matching spec if backend hasn't populated yet
  const healthScore = reasoningData?.healthScore ?? 93;
  const confidence = reasoningData?.confidence ?? 98;
  const signals: ReasoningSignal[] = reasoningData?.reasoningSignals ?? [
    { status: 'healthy', label: 'Telemetry stable' },
    { status: 'healthy', label: 'Water level above operational threshold' },
    { status: 'warning', label: 'Milk consumption increasing rapidly' },
    { status: 'warning', label: 'Boiler temperature showing an upward trend' },
    { status: 'healthy', label: 'Network connectivity healthy' },
  ];

  const predictedNextEvent =
    reasoningData?.predictedNextEvent ?? 'Milk refill required within 8 hours.';

  const recommendations = reasoningData?.recommendations ?? [
    '1. Refill milk reservoir',
    '2. Inspect boiler if temperature continues rising',
    '3. Continue monitoring telemetry for the next operational cycle',
  ];

  const renderIcon = (status: 'healthy' | 'warning' | 'critical') => {
    switch (status) {
      case 'healthy':
        return (
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-mono font-bold shrink-0">
            ✓
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-amber-500/10 text-amber-400 text-xs font-mono font-bold shrink-0">
            ⚠
          </span>
        );
      case 'critical':
        return (
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-red-500/10 text-red-400 text-xs font-mono font-bold shrink-0">
            ✕
          </span>
        );
    }
  };

  const getSignalTextColor = (status: 'healthy' | 'warning' | 'critical') => {
    switch (status) {
      case 'healthy':
        return 'text-emerald-400';
      case 'warning':
        return 'text-amber-400';
      case 'critical':
        return 'text-red-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-2xl border border-strokedark bg-boxdark p-5 shadow-default space-y-4 ${className}`}
    >
      {/* Header Bar with optional expand toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-white">
            <Brain className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              AI Reasoning
              <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase">
                XAI Explainability
              </span>
            </h3>
            <p className="text-[11px] text-bodydark2 font-mono mt-0.5">
              Transparent operational signal telemetry & decision logic
            </p>
          </div>
        </div>

        {/* Action Controls & Health Pills */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="px-2.5 py-1 rounded-lg bg-[#12151E] border border-strokedark flex items-center gap-1.5">
            <span className="text-bodydark2">Health:</span>
            <span className="text-white font-bold">{healthScore}%</span>
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-[#12151E] border border-strokedark flex items-center gap-1.5">
            <span className="text-bodydark2">Confidence:</span>
            <span className="text-emerald-400 font-bold">{confidence}%</span>
          </div>

          {isCollapsible && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold transition-all shadow-sm cursor-pointer ml-1"
            >
              <span>{isExpanded ? 'Collapse' : 'Explain Reasoning'}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* Compact summary bar when collapsed */}
      {isCollapsible && !isExpanded && (
        <div className="pt-2 text-xs font-mono text-bodydark2 flex items-center justify-between border-t border-strokedark/50">
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="text-emerald-400 font-bold">✓ Telemetry Stable</span>
            <span>·</span>
            <span className="text-amber-400 font-bold">⚠ Milk Consumption High</span>
            <span>·</span>
            <span className="text-white">{predictedNextEvent}</span>
          </div>
          <button
            onClick={() => setIsExpanded(true)}
            className="text-[10px] text-emerald-400 font-bold hover:underline shrink-0 ml-2"
          >
            View Details →
          </button>
        </div>
      )}

      {/* Expandable Content Container */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="space-y-5 pt-3 border-t border-strokedark overflow-hidden"
          >
            {/* Section 1: Reasoning Signals Breakdown */}
            <div className="space-y-2.5">
              <h4 className="text-[10px] font-mono font-bold text-bodydark2 uppercase tracking-wider">
                Reasoning Signals
              </h4>
              <div className="space-y-1.5 font-mono text-xs">
                {signals.map((sig, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-[#12151E] border border-strokedark flex items-center gap-2.5"
                  >
                    {renderIcon(sig.status)}
                    <span className={`font-semibold ${getSignalTextColor(sig.status)}`}>
                      {sig.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2: Predicted Next Event */}
            <div className="space-y-1.5">
              <h4 className="text-[10px] font-mono font-bold text-bodydark2 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Predicted Next Event
              </h4>
              <div className="p-3 rounded-xl bg-[#151822] border border-amber-500/30 text-amber-400 font-mono text-xs font-bold leading-relaxed">
                {predictedNextEvent}
              </div>
            </div>

            {/* Section 3: Recommendations List */}
            <div className="space-y-1.5">
              <h4 className="text-[10px] font-mono font-bold text-bodydark2 uppercase tracking-wider">
                Recommendation Action Plan
              </h4>
              <div className="p-3 rounded-xl bg-[#12151E] border border-strokedark space-y-1.5 font-mono text-xs text-white">
                {recommendations.map((rec, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-bodydark2 leading-relaxed">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
