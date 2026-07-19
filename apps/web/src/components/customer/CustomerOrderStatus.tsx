'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Coffee, RefreshCw } from 'lucide-react';
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
  const [brewStep, setBrewStep] = useState('Initializing brew system...');
  const [telemetry, setTelemetry] = useState({ temp: '25.0°C', pressure: '0.0 bar' });
  const [estimatedTime, setEstimatedTime] = useState('1m 30s');

  useEffect(() => {
    const pollOrderStatus = async () => {
      try {
        // Fetch live telemetry from the machine
        const tele = await api.getTelemetry();

        let liveTemp = '93.5°C';
        let livePress = '9.0 bar';

        if (tele && tele[0]) {
          const t = tele[0];
          liveTemp = `${Math.round(t.temperature_c)}°C`;
          // Map pressure as a function of temperature
          const pressVal = t.temperature_c > 40 ? 9.2 : 0.0;
          livePress = `${pressVal.toFixed(1)} bar`;
        }

        setTelemetry({ temp: liveTemp, pressure: livePress });
      } catch (err) {
        logger.error("Failed to query order tracking details", err);
      }
    };

    pollOrderStatus();
    const interval = setInterval(pollOrderStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Initialize order start time locally to survive refreshes and bypass simulation clock offsets
    const storageKey = `order_start_${orderId}`;
    let startTimeStr = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null;
    if (!startTimeStr) {
      startTimeStr = Date.now().toString();
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, startTimeStr);
      }
    }
    const startTime = parseInt(startTimeStr, 10);

    const updateProgress = () => {
      const ageSeconds = (Date.now() - startTime) / 1000;
      
      if (ageSeconds < 4) {
        setProgress(15 + (ageSeconds / 4) * 25); // 15% to 40%
        setStatus('preparing');
        setBrewStep('Calibrating grinders...');
        setEstimatedTime(`${Math.max(0, Math.round(12 - ageSeconds))}s`);
      } else if (ageSeconds < 12) {
        setProgress(40 + ((ageSeconds - 4) / 8) * 60); // 40% to 100%
        setStatus('preparing');
        setBrewStep('Extracting espresso crema...');
        setEstimatedTime(`${Math.max(0, Math.round(12 - ageSeconds))}s`);
      } else {
        setProgress(100);
        setStatus('ready');
        setBrewStep('Beverage ready for pickup!');
        setEstimatedTime('Ready!');
      }
    };

    updateProgress();
    const interval = setInterval(updateProgress, 100); // Fast 100ms interval for fluid movement
    return () => clearInterval(interval);
  }, [orderId]);

  // Radius for progress circle
  const size = 180;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="min-h-screen flex flex-col justify-between px-6 py-10 relative overflow-hidden bg-black font-sans">
      {/* Ambient glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      
      {/* Top section: Order status header */}
      <div className="text-center">
        <span className="text-xs font-mono text-primary tracking-[0.2em] uppercase block mb-1">
          Live Pod Telemetry
        </span>
        <h2 className="text-2xl font-extrabold text-white tracking-tight font-mono">
          Order {orderId}
        </h2>
      </div>

      {/* Mid Section: Telemetry & Status Gauge */}
      <div className="flex-1 flex flex-col items-center justify-center my-8 max-w-sm mx-auto w-full">
        <AnimatePresence mode="wait">
          {status === 'preparing' ? (
            <motion.div
              key="preparing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center w-full"
            >
              {/* Circular Gauge */}
              <div className="relative mb-8" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="transform -rotate-90">
                  <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="var(--color-border)"
                    strokeWidth={strokeWidth}
                    opacity={0.3}
                  />
                  <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="var(--color-primary)"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-300 ease-linear"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Coffee className="w-8 h-8 text-primary animate-pulse mb-1" />
                  <span className="text-2xl font-extrabold text-white font-mono">
                    {Math.round(progress)}%
                  </span>
                  <span className="text-[9px] font-mono text-bodydark2 tracking-wider uppercase">
                    Brewing
                  </span>
                </div>
              </div>

              {/* Status Message */}
              <div className="text-center space-y-2 mb-6">
                <p className="text-sm font-bold text-white tracking-tight h-6">
                  {brewStep}
                </p>
                <span className="text-xs text-bodydark2 block font-mono">
                  Est. time remaining: {estimatedTime}
                </span>
              </div>

              {/* Live telemetry monitors */}
              <div className="grid grid-cols-2 gap-4 w-full border border-strokedark bg-boxdark/50 backdrop-blur rounded-2xl p-4 font-mono">
                <div>
                  <span className="block text-[8px] text-bodydark2 uppercase">Brew Temp</span>
                  <span className="block text-sm font-bold text-white mt-0.5">{telemetry.temp}</span>
                </div>
                <div className="text-right">
                  <span className="block text-[8px] text-bodydark2 uppercase">Pump Pressure</span>
                  <span className="block text-sm font-bold text-white mt-0.5">{telemetry.pressure}</span>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="ready"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center space-y-6 w-full"
            >
              {/* Ready check Animation */}
              <motion.div
                initial={{ rotate: -15, scale: 0.8 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="h-20 w-20 rounded-full bg-chart-2/15 border border-chart-2/30 flex items-center justify-center text-chart-2 shadow-[0_0_40px_rgba(16,185,129,0.1)]"
              >
                <CheckCircle className="w-10 h-10" />
              </motion.div>

              <div className="space-y-2">
                <h3 className="text-2xl font-extrabold text-white">Order is Ready!</h3>
                <p className="text-sm text-bodydark max-w-[280px]">
                  Please collect your freshly brewed beverages from Dispenser Bay A.
                </p>
              </div>

              {/* Items Summary list */}
              <div className="w-full bg-boxdark/60 border border-strokedark rounded-2xl p-4 text-left max-h-[140px] overflow-y-auto">
                <span className="block text-[9px] font-mono text-bodydark2 uppercase mb-2">Collected items</span>
                <div className="space-y-1.5">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-xs text-white">
                      <span>{item.emoji} {item.name}</span>
                      <span className="font-mono text-bodydark2">x{item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Section */}
      <div className="max-w-sm mx-auto w-full">
        {status === 'ready' && (
          <motion.button
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onReset}
            className="w-full py-4 rounded-2xl bg-primary text-primary-foreground text-sm font-bold tracking-wide flex items-center justify-center gap-2 shadow-lg cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Order Something Else
          </motion.button>
        )}
      </div>
    </div>
  );
};
