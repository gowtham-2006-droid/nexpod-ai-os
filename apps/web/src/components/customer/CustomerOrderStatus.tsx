'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  Coffee,
  Flame,
  Droplets,
  Wrench,
  Gauge,
  Zap,
  Clock,
  Sparkles,
  Lock,
} from 'lucide-react';
import { CartItem } from '../../data/menuData';
import { api } from '../../lib/api';
import { logger } from '../../lib/logger';

interface CustomerOrderStatusProps {
  cart: CartItem[];
  orderId: string;
  onReset: () => void;
}

export const CustomerOrderStatus: React.FC<CustomerOrderStatusProps> = ({
  cart,
  orderId,
  onReset,
}) => {
  const [status, setStatus] = useState<'preparing' | 'ready'>('preparing');
  const [progress, setProgress] = useState(10);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [telemetry, setTelemetry] = useState({
    temp: '25.0°C',
    pressure: '0.0 Bar',
    flowRate: '0.0 L/min',
    motorRpm: '0 RPM',
  });
  const [estimatedTime, setEstimatedTime] = useState('14s');

  const STAGES = [
    {
      id: 'grind',
      name: 'Grinder Subsystem',
      detail: 'Dosing 18.2g beans at 1450 RPM (Grind size: Fine #12)',
      icon: Wrench,
      color: 'text-amber-400',
    },
    {
      id: 'heat',
      name: 'Thermoblock Surge',
      detail: 'Boiler preheat ramping to 93.5°C (Heater duty: 85%)',
      icon: Flame,
      color: 'text-orange-400',
    },
    {
      id: 'extract',
      name: 'Piston Extraction',
      detail: 'Pressurizing to 9.2 Bar (Rich crema extraction active)',
      icon: Droplets,
      color: 'text-emerald-400',
    },
    {
      id: 'dispense',
      name: 'Cup Dispenser',
      detail: 'Filling cup payload & unlatching magnetic pickup bay',
      icon: Coffee,
      color: 'text-cyan-400',
    },
  ];

  // Poll live backend telemetry
  useEffect(() => {
    const pollOrderStatus = async () => {
      try {
        const tele = await api.getTelemetry();
        if (tele && tele[0]) {
          const t = tele[0];
          const tempVal = Math.round(t.temperature_c);
          const pressVal = t.temperature_c > 40 ? 9.2 : 0.0;
          const flowVal = t.temperature_c > 40 ? 1.2 : 0.0;
          const rpmVal = t.temperature_c > 40 ? 1450 : 0;

          setTelemetry({
            temp: `${tempVal}°C`,
            pressure: `${pressVal.toFixed(1)} Bar`,
            flowRate: `${flowVal.toFixed(1)} L/min`,
            motorRpm: `${rpmVal} RPM`,
          });
        }
      } catch (err) {
        logger.error("Failed to query order tracking details", err);
      }
    };

    pollOrderStatus();
    const interval = setInterval(pollOrderStatus, 1500);
    return () => clearInterval(interval);
  }, []);

  // Smooth stage transition timeline
  useEffect(() => {
    const storageKey = `order_start_${orderId}`;
    let startTimeStr = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null;
    if (!startTimeStr) {
      startTimeStr = Date.now().toString();
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, startTimeStr);
      }
    }
    const startTime = parseInt(startTimeStr, 10);
    const totalDurationSec = 14;

    const updateProgress = () => {
      const ageSeconds = (Date.now() - startTime) / 1000;
      const pct = Math.min(100, (ageSeconds / totalDurationSec) * 100);
      setProgress(pct);

      if (pct < 25) {
        setCurrentStageIndex(0);
      } else if (pct < 50) {
        setCurrentStageIndex(1);
      } else if (pct < 85) {
        setCurrentStageIndex(2);
      } else {
        setCurrentStageIndex(3);
      }

      const remaining = Math.max(0, Math.round(totalDurationSec - ageSeconds));
      setEstimatedTime(`${remaining}s`);

      if (pct >= 100) {
        setStatus('ready');
        setEstimatedTime('Ready!');
      } else {
        setStatus('preparing');
      }
    };

    updateProgress();
    const interval = setInterval(updateProgress, 100);
    return () => clearInterval(interval);
  }, [orderId]);

  const activeStage = STAGES[currentStageIndex];

  // SVG Gauge calculations
  const size = 160;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="min-h-screen flex flex-col justify-between px-6 py-8 relative overflow-hidden bg-black font-sans text-bodydark select-none">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="text-center shrink-0">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-xs font-mono text-emerald-400 tracking-[0.2em] uppercase font-bold">
            Autonomous Retail Dispenser
          </span>
        </div>
        <h2 className="text-xl font-extrabold text-white tracking-tight font-mono">
          Order #{orderId}
        </h2>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center my-6 max-w-sm mx-auto w-full space-y-6">
        <AnimatePresence mode="wait">
          {status === 'preparing' ? (
            <motion.div
              key="preparing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center w-full space-y-6"
            >
              {/* Circular Brewing Ring with animated cup fill */}
              <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="transform -rotate-90">
                  <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth={strokeWidth}
                  />
                  <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="#10B981"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-300 ease-linear"
                  />
                </svg>

                {/* Center Cup & Progress Percent */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  {/* Liquid fill cup visualization */}
                  <div className="relative w-10 h-12 border-2 border-white/40 rounded-b-xl overflow-hidden mb-1 flex items-end">
                    <div
                      className="w-full bg-gradient-to-t from-amber-700 via-amber-600 to-amber-500 transition-all duration-300"
                      style={{ height: `${progress}%` }}
                    />
                  </div>
                  <span className="text-xl font-extrabold text-white font-mono tracking-tight">
                    {Math.round(progress)}%
                  </span>
                </div>
              </div>

              {/* Step Pipeline Badges */}
              <div className="flex items-center justify-between w-full px-2">
                {STAGES.map((stg, i) => {
                  const Icon = stg.icon;
                  const isDone = i < currentStageIndex;
                  const isCurrent = i === currentStageIndex;
                  return (
                    <React.Fragment key={stg.id}>
                      <div className="flex flex-col items-center gap-1">
                        <div
                          className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
                            isCurrent
                              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 scale-110 shadow-lg shadow-emerald-500/20'
                              : isDone
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400/60'
                              : 'bg-white/5 border-white/10 text-white/30'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-[9px] font-mono font-bold uppercase text-bodydark2">
                          {stg.id}
                        </span>
                      </div>
                      {i < STAGES.length - 1 && (
                        <div
                          className={`h-0.5 flex-1 transition-colors ${
                            i < currentStageIndex ? 'bg-emerald-500/40' : 'bg-white/10'
                          }`}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Active Stage Description Card */}
              <div className="w-full p-4 rounded-xl bg-[#12151E] border border-white/10 text-center space-y-1.5 shadow-md">
                <div className="flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                    {activeStage.name}
                  </span>
                </div>
                <p className="text-xs text-bodydark2 font-mono leading-relaxed">
                  {activeStage.detail}
                </p>
                <div className="text-[10px] font-mono text-emerald-400 font-bold pt-1">
                  Est. pickup in {estimatedTime}
                </div>
              </div>

              {/* Subsystem Telemetry HUD */}
              <div className="w-full grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#0F121A] border border-white/10 font-mono text-xs">
                <div>
                  <span className="text-[9px] text-bodydark2 uppercase block">Brew Temp</span>
                  <span className="text-white font-bold">{telemetry.temp}</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-bodydark2 uppercase">Pump Pressure</span>
                  <span className="text-emerald-400 font-bold">{telemetry.pressure}</span>
                </div>
                <div className="pt-2 border-t border-white/5">
                  <span className="text-[9px] text-bodydark2 uppercase block">Flow Rate</span>
                  <span className="text-white font-bold">{telemetry.flowRate}</span>
                </div>
                <div className="pt-2 border-t border-white/5 text-right">
                  <span className="text-[9px] text-bodydark2 uppercase">Grinder Speed</span>
                  <span className="text-amber-400 font-bold">{telemetry.motorRpm}</span>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="ready"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center space-y-6 w-full py-4"
            >
              {/* Ready Check Animation */}
              <motion.div
                initial={{ rotate: -15, scale: 0.8 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="h-20 w-20 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.2)]"
              >
                <CheckCircle className="w-10 h-10" />
              </motion.div>

              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-white tracking-tight font-mono">
                  Beverage Ready!
                </h3>
                <p className="text-xs text-bodydark2 font-mono">
                  Dispense complete. Magnetic pickup door unlatched.
                </p>
              </div>

              {/* Order Items summary */}
              <div className="w-full p-4 rounded-xl bg-[#12151E] border border-white/10 space-y-2 font-mono text-xs text-left">
                <span className="text-[10px] text-bodydark2 uppercase block border-b border-white/10 pb-1">
                  Dispensed Payload
                </span>
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-white">
                    <span>{item.quantity}x {item.name}</span>
                    <span className="text-emerald-400 font-bold">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Reset Order Button */}
              <button
                onClick={onReset}
                className="w-full py-3.5 rounded-xl bg-emerald-500 text-black font-mono font-bold text-xs uppercase tracking-wider hover:bg-emerald-400 transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                Place New Order →
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="text-center text-[10px] font-mono text-bodydark2 shrink-0">
        NexPod Atrium Zone A · Autonomous Dispenser
      </div>
    </div>
  );
};
