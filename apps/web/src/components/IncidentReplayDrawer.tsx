'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw } from '@/components/animate-ui/icons/rotate-ccw';
import {
  X,
  Play,
  Pause,
  ShoppingCart,
  Database,
  Thermometer,
  AlertTriangle,
  Brain,
  Wrench,
  Bell,
  Clock,
  Sparkles,
  Activity,
} from 'lucide-react';
import { api, IncidentEvent } from '../lib/api';

interface IncidentReplayDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onReplaySnapshot?: (snapshot: any) => void;
}

export const IncidentReplayDrawer: React.FC<IncidentReplayDrawerProps> = ({
  isOpen,
  onClose,
  onReplaySnapshot,
}) => {
  const [events, setEvents] = useState<IncidentEvent[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<1 | 2 | 4>(1);
  const [loading, setLoading] = useState<boolean>(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const activeCardRef = useRef<HTMLDivElement>(null);

  // Fetch incidents from backend on drawer open
  useEffect(() => {
    if (!isOpen) {
      setIsPlaying(false);
      return;
    }

    const fetchEvents = async () => {
      setLoading(true);
      try {
        const res = await api.getIncidents();
        if (res && res.events && res.events.length > 0) {
          setEvents(res.events);
          setCurrentIndex(0);
          if (onReplaySnapshot && res.events[0]?.metadata?.snapshot) {
            onReplaySnapshot(res.events[0].metadata.snapshot);
          }
        }
      } catch (err) {
        console.error("Failed to load incident replay events:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [isOpen]);

  // Playback timer
  useEffect(() => {
    if (!isPlaying || events.length === 0) return;

    const intervalMs = 1000 / speed;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= events.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        const next = prev + 1;
        if (onReplaySnapshot && events[next]?.metadata?.snapshot) {
          onReplaySnapshot(events[next].metadata.snapshot);
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, speed, events, onReplaySnapshot]);

  // Auto-scroll to active card
  useEffect(() => {
    if (activeCardRef.current && containerRef.current) {
      activeCardRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [currentIndex]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const idx = parseInt(e.target.value, 10);
    setCurrentIndex(idx);
    if (onReplaySnapshot && events[idx]?.metadata?.snapshot) {
      onReplaySnapshot(events[idx].metadata.snapshot);
    }
  };

  const handleCardClick = (idx: number) => {
    setCurrentIndex(idx);
    if (onReplaySnapshot && events[idx]?.metadata?.snapshot) {
      onReplaySnapshot(events[idx].metadata.snapshot);
    }
  };

  const currentEvent = events[currentIndex];

  const formatTimestamp = (tsStr?: string) => {
    if (!tsStr) return '--:--:--';
    try {
      const d = new Date(tsStr);
      return d.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
    } catch {
      return tsStr;
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <ShoppingCart className="w-4 h-4 text-emerald-400" />;
      case 'inventory':
        return <Database className="w-4 h-4 text-amber-400" />;
      case 'telemetry':
        return <Thermometer className="w-4 h-4 text-amber-500" />;
      case 'diagnostic':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'ai':
        return <Brain className="w-4 h-4 text-purple-400" />;
      case 'maintenance':
        return <Wrench className="w-4 h-4 text-cyan-400" />;
      default:
        return <Bell className="w-4 h-4 text-blue-400" />;
    }
  };

  const getSeverityBadge = (severity?: string) => {
    switch (severity) {
      case 'critical':
        return (
          <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-red-500/10 text-red-400 border border-red-500/20">
            CRITICAL
          </span>
        );
      case 'warning':
        return (
          <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            WARNING
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            INFO
          </span>
        );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-99999 flex justify-end">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/75 backdrop-blur-xs"
          />

          {/* Drawer container */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="relative z-10 w-full max-w-lg h-full bg-[#0B0D12] border-l border-white/10 flex flex-col font-sans text-bodydark shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 bg-[#12151E] flex items-center justify-between shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    Incident Replay
                  </h2>
                </div>
                <p className="text-xs text-bodydark2 mt-1 font-mono">
                  Replay the operational history leading to an incident.
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-bodydark2 hover:text-white transition-colors"
                aria-label="Close Drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Replay Controls & Timeline Slider */}
            <div className="p-5 border-b border-white/10 bg-[#0F121A] shrink-0 space-y-4">
              {/* Timestamp Indicator */}
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-bodydark2">CURRENT TIMESTAMP</span>
                <span className="text-emerald-400 font-bold tracking-wider bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
                  {formatTimestamp(currentEvent?.timestamp)}
                </span>
              </div>

              {/* Slider */}
              <div className="space-y-1.5">
                <input
                  type="range"
                  min={0}
                  max={Math.max(0, events.length - 1)}
                  value={currentIndex}
                  onChange={handleSliderChange}
                  disabled={events.length === 0}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-400 focus:outline-none"
                />
                <div className="flex justify-between text-[10px] font-mono text-bodydark2">
                  <span>Start (Event 1)</span>
                  <span>
                    Step {currentIndex + 1} of {events.length}
                  </span>
                  <span>Latest</span>
                </div>
              </div>

              {/* Action Buttons & Speed Toggle */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    disabled={events.length === 0}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold transition-all"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-current" /> PAUSE
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" /> PLAY
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setIsPlaying(false);
                      setCurrentIndex(0);
                      if (onReplaySnapshot && events[0]?.metadata?.snapshot) {
                        onReplaySnapshot(events[0].metadata.snapshot);
                      }
                    }}
                    disabled={events.length === 0}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-bodydark2 hover:text-white border border-white/10 transition-colors"
                    title="Restart Timeline"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

                {/* Speed Multiplier */}
                <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10">
                  <span className="text-[10px] font-mono text-bodydark2 px-1.5">
                    SPEED
                  </span>
                  {([1, 2, 4] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSpeed(s)}
                      className={`px-2 py-0.5 rounded text-xs font-mono font-bold transition-colors ${
                        speed === s
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'text-bodydark2 hover:text-white'
                      }`}
                    >
                      {s}×
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Chronological Event Cards List */}
            <div
              ref={containerRef}
              className="flex-1 overflow-y-auto p-5 space-y-3 custom-scrollbar"
            >
              {loading ? (
                <div className="flex flex-col items-center justify-center h-48 space-y-3 text-bodydark2">
                  <Sparkles className="w-6 h-6 animate-spin text-emerald-400" />
                  <span className="text-xs font-mono">
                    Loading incident event timeline...
                  </span>
                </div>
              ) : events.length === 0 ? (
                <div className="text-center py-12 text-bodydark2 text-xs font-mono">
                  No incident events recorded yet.
                </div>
              ) : (
                events.map((evt, idx) => {
                  const isActive = idx === currentIndex;
                  const isPast = idx < currentIndex;

                  return (
                    <motion.div
                      key={evt.id}
                      ref={isActive ? activeCardRef : null}
                      onClick={() => handleCardClick(idx)}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                        isActive
                          ? 'bg-[#181C26] border-emerald-500/50 shadow-lg shadow-emerald-500/5'
                          : isPast
                          ? 'bg-[#12151E] border-white/10 opacity-75 hover:opacity-100'
                          : 'bg-[#0E1118] border-white/5 opacity-50 hover:opacity-80'
                      }`}
                    >
                      {/* Active indicator bar */}
                      {isActive && (
                        <div className="absolute top-0 left-0 bottom-0 w-1 bg-emerald-400 rounded-l-xl" />
                      )}

                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                            {getEventIcon(evt.type)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-white">
                                {evt.title}
                              </span>
                              {getSeverityBadge(evt.metadata?.severity)}
                            </div>
                            <span className="text-[10px] font-mono text-bodydark2 flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3 text-bodydark2" />
                              {formatTimestamp(evt.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-bodydark2 mt-2.5 font-sans leading-relaxed">
                        {evt.description}
                      </p>

                      {/* Diagnostic details preview if available */}
                      {evt.metadata?.snapshot?.aiInsight && (
                        <div className="mt-3 p-2.5 rounded bg-black/40 border border-white/5 text-[11px] font-mono text-purple-300">
                          🤖 {evt.metadata.snapshot.aiInsight}
                        </div>
                      )}
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
