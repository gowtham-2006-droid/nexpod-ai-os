'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Brain, ArrowRight, ShieldCheck, Clock, Sparkles } from 'lucide-react';
import { AIReasoningData, ReasoningSignal } from '../lib/api';

interface AIReasoningPanelProps {
  reasoningData?: AIReasoningData | null;
  className?: string;
}

export const AIReasoningPanel: React.FC<AIReasoningPanelProps> = ({
  reasoningData,
  className = '',
}) => {
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
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`rounded-2xl border border-strokedark bg-boxdark p-6 shadow-default space-y-6 ${className}`}
    >
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-strokedark pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-white">
            <Brain className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              AI Reasoning
              <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase">
                XAI Explainability
              </span>
            </h3>
            <p className="text-xs text-bodydark2 font-mono mt-0.5">
              Transparent operational signal telemetry & decision logic
            </p>
          </div>
        </div>

        {/* Health & Confidence Pills */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-lg bg-[#12151E] border border-strokedark flex items-center gap-2">
            <span className="text-bodydark2">Current Health:</span>
            <span className="text-white font-bold">{healthScore}%</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-[#12151E] border border-strokedark flex items-center gap-2">
            <span className="text-bodydark2">AI Confidence:</span>
            <span className="text-emerald-400 font-bold">{confidence}%</span>
          </div>
        </div>
      </div>

      {/* Section 1: Reasoning Signals Breakdown */}
      <div className="space-y-3">
        <h4 className="text-xs font-mono font-bold text-bodydark2 uppercase tracking-wider">
          Reasoning
        </h4>
        <div className="space-y-2 font-mono text-xs">
          {signals.map((sig, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-[#12151E] border border-strokedark flex items-center gap-3"
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
      <div className="space-y-2">
        <h4 className="text-xs font-mono font-bold text-bodydark2 uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          Predicted Next Event
        </h4>
        <div className="p-4 rounded-xl bg-[#151822] border border-amber-500/30 text-amber-400 font-mono text-xs font-bold leading-relaxed flex items-center gap-2">
          <span>{predictedNextEvent}</span>
        </div>
      </div>

      {/* Section 3: Recommendations List */}
      <div className="space-y-2">
        <h4 className="text-xs font-mono font-bold text-bodydark2 uppercase tracking-wider">
          Recommendation
        </h4>
        <div className="p-4 rounded-xl bg-[#12151E] border border-strokedark space-y-2 font-mono text-xs text-white">
          {recommendations.map((rec, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-bodydark2 leading-relaxed">{rec}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
