'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

export interface IntroStep {
  title: string;
  short_description?: string;
  full_description: string;
  media?: {
    type: 'image' | 'video';
    src: string;
    alt?: string;
  };
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

interface IntroDisclosureProps {
  // Legacy / Basic single-step mode props
  storageKey?: string;
  title?: string;
  description?: string;
  actionText?: string;
  onConfirm?: () => void;
  triggerOpen?: boolean;

  // New multi-step mode props
  steps?: IntroStep[];
  featureId?: string;
  isOpen?: boolean;
  onClose?: () => void;
  onComplete?: () => void;
  onSkip?: () => void;
}

export function IntroDisclosure({
  storageKey,
  title,
  description,
  actionText = "Acknowledge",
  onConfirm,
  triggerOpen = false,

  steps,
  featureId,
  isOpen: externalIsOpen,
  onClose: externalOnClose,
  onComplete,
  onSkip,
}: IntroDisclosureProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const activeStorageKey = featureId || storageKey;
  const isMultiStep = steps && steps.length > 0;
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : (internalIsOpen || triggerOpen);

  useEffect(() => {
    if (activeStorageKey) {
      const dismissed = localStorage.getItem(activeStorageKey);
      if (!dismissed) {
        setInternalIsOpen(true);
      }
    }
  }, [activeStorageKey]);

  const handleDismiss = () => {
    if (activeStorageKey) {
      localStorage.setItem(activeStorageKey, 'true');
    }
    setInternalIsOpen(false);
    if (externalOnClose) externalOnClose();
    if (isMultiStep) {
      if (onComplete) onComplete();
    } else {
      if (onConfirm) onConfirm();
    }
  };

  const handleSkip = () => {
    if (activeStorageKey) {
      localStorage.setItem(activeStorageKey, 'true');
    }
    setInternalIsOpen(false);
    if (externalOnClose) externalOnClose();
    if (onSkip) onSkip();
  };

  const handleNext = () => {
    if (!steps) return;
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleDismiss();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // 1. Single-step Notification Popup Mode (Original Behavior)
  if (!isMultiStep) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="fixed bottom-6 left-6 z-[9999] max-w-sm w-full bg-card border border-border shadow-[0_15px_40px_rgba(0,0,0,0.5)] rounded-2xl p-5 overflow-hidden text-left"
          >
            {/* Accent light glow */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-foreground/5 rounded-full blur-xl pointer-events-none" />
            
            <div className="space-y-3 relative z-10">
              <h4 className="text-xs font-mono font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-foreground animate-pulse" />
                {title}
              </h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {description}
              </p>
              <div className="flex gap-2 justify-end pt-1">
                <button
                  onClick={handleDismiss}
                  className="px-3.5 py-1.5 rounded-lg bg-foreground/10 border border-border text-[10px] font-mono font-bold text-foreground hover:bg-foreground hover:text-background transition-all cursor-pointer"
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

  // 2. Multi-step Dialog Walkthrough Mode
  const step = steps[currentStep];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
          {/* Opaque backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={handleSkip}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl bg-card border border-border rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col md:flex-row min-h-[480px]"
          >
            {/* Left: Media Area (Desktop) / Top Media Area (Mobile) */}
            <div className="w-full md:w-1/2 bg-black/40 border-b md:border-b-0 md:border-r border-border flex items-center justify-center relative min-h-[240px] md:min-h-full overflow-hidden">
              {step.media ? (
                step.media.type === 'video' ? (
                  <video
                    src={step.media.src}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover absolute inset-0"
                  />
                ) : (
                  <img
                    src={step.media.src}
                    alt={step.media.alt || step.title}
                    className="w-full h-full object-cover absolute inset-0 opacity-80"
                  />
                )
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <div className="h-16 w-16 rounded-2xl bg-foreground/5 border border-border flex items-center justify-center">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">NEXPOD AI OS</span>
                </div>
              )}
              {/* Overlay shadow to integrate with card border */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Right: Content & Controls Area */}
            <div className="w-full md:w-1/2 p-8 flex flex-col justify-between">
              {/* Header Actions */}
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em] font-bold">
                  Step {currentStep + 1} of {steps.length}
                </span>
                <button
                  onClick={handleSkip}
                  className="text-[10px] font-mono text-muted-foreground hover:text-foreground tracking-wider uppercase transition-colors cursor-pointer"
                >
                  Skip
                </button>
              </div>

              {/* Step Content */}
              <div className="space-y-4 flex-1">
                {step.short_description && (
                  <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.25em] font-semibold block">
                    {step.short_description}
                  </span>
                )}
                <h3 className="text-2xl font-black text-foreground tracking-tight">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-mono">
                  {step.full_description}
                </p>

                {/* Custom Action (if any) */}
                {step.action && (
                  <div className="pt-2">
                    {step.action.href ? (
                      <a
                        href={step.action.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-foreground text-background text-xs font-mono font-bold hover:opacity-95 transition-opacity"
                      >
                        {step.action.label}
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>
                      </a>
                    ) : (
                      <button
                        onClick={step.action.onClick}
                        className="px-4 py-2 rounded-xl bg-foreground text-background text-xs font-mono font-bold hover:opacity-95 transition-opacity cursor-pointer"
                      >
                        {step.action.label}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Navigation */}
              <div className="pt-8 border-t border-border/40 mt-6 flex justify-between items-center">
                {/* Step Indicators */}
                <div className="flex gap-1.5">
                  {steps.map((_, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "h-1.5 rounded-full transition-all duration-300",
                        idx === currentStep ? "w-6 bg-foreground" : "w-1.5 bg-foreground/20"
                      )}
                    />
                  ))}
                </div>

                {/* Nav Buttons */}
                <div className="flex gap-2">
                  {currentStep > 0 && (
                    <button
                      onClick={handleBack}
                      className="px-4 py-2 rounded-xl border border-border bg-transparent text-xs font-mono font-bold text-foreground hover:bg-secondary transition-all cursor-pointer"
                    >
                      Back
                    </button>
                  )}
                  <button
                    onClick={handleNext}
                    className="px-5 py-2 rounded-xl bg-foreground text-background text-xs font-mono font-bold hover:opacity-90 transition-all cursor-pointer"
                  >
                    {currentStep === steps.length - 1 ? "Get Started" : "Next"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
