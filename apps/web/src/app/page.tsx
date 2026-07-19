'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Brain,
  Radio,
  Cpu,
  Layers,
  Zap,
  ArrowRight,
  TrendingUp,
  Activity,
  ShieldAlert,
  Terminal,
  Coffee,
  Database,
  ChevronRight,
  Send,
  X,
  Smartphone,
  CheckCircle,
  Globe as GlobeIcon,
  Server,
  AlertTriangle,
  Play,
  RotateCcw,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { api } from '../lib/api';

// Installed Shadcn/MagicUI/VengenceUI/CultUI components
import { ScrollProgress } from '../components/ui/scroll-progress';
import { NotchNavbar } from '../components/ui/notch-navbar';
import { AnimatedThemeToggler } from '../components/ui/animated-theme-toggler';
import { Meteors } from '../components/ui/meteors';
import { Ripple } from '../components/ui/ripple';
import { TextAnimate } from '../components/ui/text-animate';
import { TextReveal } from '../components/ui/text-reveal';
import { Highlighter } from '../components/ui/highlighter';
import { ShimmerButton } from '../components/ui/shimmer-button';
import { InteractiveHoverButton } from '../components/ui/interactive-hover-button';
import { HoverBorderGradient } from '../components/ui/hover-border-gradient';
import { WobbleCard } from '../components/ui/wobble-card';
import { HeroVideoDialog } from '../components/ui/hero-video-dialog';
import { AnimatedTooltip } from '../components/ui/animated-tooltip';
import { IntroDisclosure } from '../components/ui/intro-disclosure';
import { MockBrowserWindow } from '../components/ui/mock-browser-window';
import { AnimatedList } from '../components/ui/animated-list';
import { Iphone } from '../components/ui/iphone';
import { Globe } from '../components/ui/globe';
import { Lens } from '../components/ui/lens';
import { KineticText } from '../components/ui/kinetic-text';
import { SparklesCore } from '../components/ui/sparkles';
import { LampContainer } from '../components/ui/lamp';
import { Skiper67 } from '../components/ui/skiper-ui/skiper67';
import { CapabilitiesConsole } from '../components/CapabilitiesConsole';
import { ConcentricRoadmap } from '../components/ConcentricRoadmap';
import { SdkSandbox } from '../components/SdkSandbox';
import { DashboardFooter } from '../components/DashboardFooter';
import { DeveloperDocs } from '../components/DeveloperDocs';
import AIChatSidebar from '../components/ui/ai-chat-sidebar';

// Chatbot specific components
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../components/ui/breadcrumb';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '../components/ui/accordion';
import {
  BubbleGroup,
  Bubble,
  BubbleContent,
} from '../components/ui/bubble';
import {
  MessageScroller,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerButton,
} from '../components/ui/message-scroller';

export default function LandingPage() {
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Globe configurations
  const customGlobeConfig = {
    width: 600,
    height: 600,
    onRender: () => {},
    devicePixelRatio: 2,
    phi: 0,
    theta: 0.3,
    dark: 1,
    diffuse: 1.2,
    mapSamples: 12000,
    mapBrightness: 6,
    baseColor: [0.1, 0.1, 0.1] as [number, number, number],
    markerColor: [255 / 255, 255 / 255, 255 / 255] as [number, number, number],
    glowColor: [80 / 255, 80 / 255, 80 / 255] as [number, number, number],
    markers: [
      { location: [19.076, 72.8777] as [number, number], size: 0.1 }, // Mumbai, India
      { location: [1.3521, 103.8198] as [number, number], size: 0.08 }, // Singapore
      { location: [25.2048, 55.2708] as [number, number], size: 0.09 }, // Dubai
      { location: [51.5074, -0.1278] as [number, number], size: 0.08 }, // London
      { location: [40.7128, -74.006] as [number, number], size: 0.1 }, // New York
      { location: [35.6762, 139.6503] as [number, number], size: 0.08 }, // Tokyo
    ],
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-white dark:selection:text-black">
      {/* Scroll Progress Indicator */}
      <ScrollProgress className="bg-gradient-to-r from-primary via-chart-4 to-primary h-1" />

      {/* Notch Navbar */}
      <NotchNavbar
        rightElement={
          <>
            <AnimatedThemeToggler />
            <Link
              href="/dashboard"
              className="px-4 py-2 text-xs font-bold font-mono bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 rounded-xl transition-all shadow-[0_0_15px_rgba(255,255,255,0.05)]"
            >
              Dashboard
            </Link>
          </>
        }
      />

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col justify-center pt-16 pb-16 overflow-hidden bg-background">
        {/* Subtle Meteors */}
        <Meteors number={12} minDuration={4} maxDuration={8} className="opacity-40" />



        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left Column - Text Details under the Lamp spotlight */}
          <div className="lg:col-span-7 flex flex-col items-start text-left space-y-6">
            {/* Lamp Container wrapping ONLY the heading */}
            <LampContainer 
              className="h-[400px] min-h-[400px] bg-transparent w-full justify-start items-start text-left"
              contentClassName="items-start px-0 w-full"
            >
              <div className="space-y-3 relative py-4 w-full text-left">
                {/* Sparkles Core Background for Text */}
                <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
                  <SparklesCore
                    id="hero-sparkles"
                    background="transparent"
                    minSize={0.4}
                    maxSize={1.4}
                    particleDensity={60}
                    className="w-full h-full"
                    particleColor="var(--foreground)"
                    speed={0.3}
                  />
                </div>
                
                <div className="relative z-10 pointer-events-auto">
                  <span className="text-[10px] font-mono text-primary uppercase tracking-[0.25em] font-bold block mb-1">
                    NexPod AI Operating System
                  </span>
                  <KineticText
                    text="The AI Operating System"
                    as="h1"
                    className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground tracking-tight leading-[1.05] justify-start"
                  />
                </div>
              </div>
            </LampContainer>

            {/* Rest of Hero contents positioned below the Lamp */}
            <div className="w-full flex flex-col items-start text-left space-y-6 -mt-40 pb-8 relative z-20">
              {/* Highlighter highlights */}
              <div className="flex flex-wrap items-center gap-y-3 gap-x-4 pt-1">
                <Highlighter action="highlight" color="var(--hero-highlight-bg, rgba(255, 255, 255, 0.08))" strokeWidth={2}>
                  <span className="text-foreground font-mono text-xs md:text-sm px-2 py-0.5 rounded border border-foreground/10">
                    Autonomous Retail Pods
                  </span>
                </Highlighter>
                <Highlighter action="underline" color="rgba(255, 214, 0, 0.4)">
                  <span className="text-yellow-400 font-mono text-xs md:text-sm">
                    Predictive Intelligence
                  </span>
                </Highlighter>
                <Highlighter action="box" color="rgba(41, 182, 246, 0.4)">
                  <span className="text-cyan-400 font-mono text-xs md:text-sm px-1">
                    AI Operations
                  </span>
                </Highlighter>
              </div>

              <p className="text-sm md:text-base text-bodydark2 leading-relaxed max-w-xl">
                NexPod AI OS leverages real-time telemetry pipelines, Postgres persistence, and custom LLM inference loops to orchestrate self-service retail pods. Maximize uptime, reduce dispatch costs, and optimize stock dynamically.
              </p>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                <Link href="/dashboard">
                  <HoverBorderGradient
                    containerClassName="rounded-xl border border-foreground/10 shadow-[0_0_20px_rgba(0,0,0,0.05)] dark:shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                    className="text-xs font-bold font-mono px-6 py-3.5 bg-foreground text-background"
                  >
                    Launch Dashboard
                  </HoverBorderGradient>
                </Link>

                <InteractiveHoverButton
                  onClick={() => setShowVideoModal(true)}
                  className="bg-boxdark border-strokedark text-foreground font-mono text-xs hover:text-background py-3 px-6"
                >
                  Watch Demo
                </InteractiveHoverButton>
              </div>
            </div>
          </div>

          {/* Right Column - Video Player / Mockup Container */}
          <div className="lg:col-span-5 w-full flex justify-center items-center animate-fade-in relative">
            <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none scale-125">
              <Ripple mainCircleSize={180} numCircles={5} mainCircleOpacity={0.4} />
            </div>
            <Skiper67 className="w-full max-w-lg relative z-10" />
          </div>
        </div>
      </section>

      {/* Hero Video Dialog Container */}
      <AnimatePresence>
        {showVideoModal && mounted && createPortal(
          <div className="fixed inset-0 z-[100000] flex min-h-screen items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/100 backdrop-blur-md z-[100001]"
              onClick={() => setShowVideoModal(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-6xl bg-boxdark border border-strokedark rounded-3xl overflow-hidden aspect-video z-[100002] shadow-2xl"
            >
              <button
                onClick={() => setShowVideoModal(false)}
                className="absolute bottom-4 right-4 h-8 w-8 rounded-full bg-black/40 hover:bg-black/80 border border-strokedark flex items-center justify-center text-white hover:text-primary transition-colors cursor-pointer z-20"
              >
                ✕
              </button>

              <iframe
                src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                title="NexPod Product Video Demo"
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </motion.div>
          </div>,
          document.body
        )}
      </AnimatePresence>

      {/* Text Reveal Block */}
      <section className="relative bg-background z-10 border-t border-strokedark/30">
        <TextReveal>
          NexPod AI OS replaces reactive hardware telemetry with predictive operations intelligence, ensuring maximum hardware uptime with absolute zero manual verification.
        </TextReveal>
      </section>

      {/* Trusted Technology */}
      <section className="py-20 border-t border-strokedark/30 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <SdkSandbox />
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24 border-t border-strokedark/30 relative z-10">
        <div className="max-w-3xl mx-auto px-6 text-center space-y-6">
          <span className="text-[10px] font-mono text-chart-4 uppercase tracking-[0.25em] font-bold block">
            The Retail Bottleneck
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-foreground tracking-tight leading-tight">
            Retail is still reactive.
          </h2>
          <p className="text-sm md:text-base text-bodydark2 leading-relaxed">
            Standard retail kiosks operate as isolated black boxes. Because they are{' '}
            <AnimatedTooltip text="Reactive" explanation="Maintenance only happens after hardware components fail, leading to massive downtime." />,{' '}
            <AnimatedTooltip text="Manual" explanation="Requires operations staff to drive out and physically verify stock levels." />,{' '}
            <AnimatedTooltip text="Disconnected" explanation="No real-time remote telemetry API limits visibility to zero." />, and{' '}
            <AnimatedTooltip text="Expensive" explanation="Unscheduled dispatch trips and stock outs drain retail profit margins." /> — vending networks incur huge overhead.
          </p>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-24 border-t border-strokedark/30 relative overflow-hidden bg-black">
        {/* Centered Ripple background */}
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-60">
          <Ripple mainCircleSize={220} numCircles={6} mainCircleOpacity={0.4} />
        </div>

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          {/* Left Description */}
          <div className="space-y-6 text-left">
            <span className="text-[10px] font-mono text-primary uppercase tracking-[0.25em] font-bold block">
              The NexPod Paradigm
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
              Centralized Remote Operations.
            </h2>
            <p className="text-sm text-bodydark2 leading-relaxed">
              NexPod AI OS provides a unified platform to centrally manage autonomous self-service pods. With constant sensor telemetry feed, PostgreSQL snapshot storage, and direct machine directives, you control physical kiosks at global scale.
            </p>
            <div className="space-y-3 text-xs font-mono text-bodydark2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                <span>Pre-emptive resource refills</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                <span>Automatic remote rebooting directives</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                <span>Gemini-optimized route planning for refilling</span>
              </div>
            </div>
          </div>

          {/* Right: Mock Browser Window */}
          <div className="w-full">
            <MockBrowserWindow />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 border-t border-strokedark/30 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <CapabilitiesConsole />
        </div>
      </section>

      {/* AI Operations Section (Animated List + Phone) */}
      <section className="py-24 border-t border-strokedark/30 relative z-10 bg-black">
        <div id="platform" className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Animated List */}
          <div className="space-y-6 text-left">
            <span className="text-[10px] font-mono text-primary uppercase tracking-[0.25em] font-bold block">
              Predictive Automation
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
              Operational Recommendations.
            </h2>
            <p className="text-sm text-bodydark2 leading-relaxed">
              NexPod AI OS continuously monitors pod telemetry and spins up domain warnings, guiding technicians to optimize inventory refills and prevent boiler component fatigue.
            </p>

            <div className="w-full max-w-md pt-4">
              <AnimatedList delay={2500}>
                {[
                  { title: "Inventory Prediction", desc: "Milk depleting. Refill scheduled in 2.8 hrs.", color: "text-chart-4 bg-chart-4/10 border-chart-4/20", icon: Database },
                  { title: "Demand Forecasting", desc: "Evening rush expected. Preparing batch coffee logs.", color: "text-chart-2 bg-chart-2/10 border-chart-2/20", icon: TrendingUp },
                  { title: "Machine Health", desc: "Boiler temperature nominal at 93.5°C.", color: "text-primary bg-primary/10 border-primary/20", icon: Activity },
                  { title: "AI Operational Alert", desc: "Gemini advises technician refilling route.", color: "text-chart-1 bg-chart-1/10 border-chart-1/20", icon: Brain },
                  { title: "Business Insights", desc: "Sales peak of 120 cups/hr reached.", color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20", icon: Layers },
                ].map((item, idx) => {
                  const ItemIcon = item.icon;
                  return (
                    <div
                      key={idx}
                      className={cn(
                        "w-full rounded-xl border p-4 flex gap-4 items-center text-left",
                        item.color
                      )}
                    >
                      <div className="h-9 w-9 rounded-lg bg-black/5 dark:bg-black/40 flex items-center justify-center shrink-0">
                        <ItemIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold font-mono text-foreground">{item.title}</h4>
                        <p className="text-[11px] text-bodydark2 mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </AnimatedList>
            </div>
          </div>

          {/* Right: Floating iPhone with simulated vector app UI */}
          <div className="flex justify-center">
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="w-full max-w-[280px]"
            >
              <Iphone className="w-full drop-shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
                <div className="flex flex-col h-full bg-boxdark select-none p-4 font-sans text-xs text-left">
                  {/* Status Bar */}
                  <div className="flex justify-between items-center text-[8px] text-bodydark2 mb-4 font-mono">
                    <span>9:41</span>
                    <div className="flex gap-1.5 items-center">
                      <span>5G</span>
                      <span className="w-4 h-2 rounded-xs border border-bodydark2/60 relative inline-block">
                        <span className="absolute left-0 top-0 bottom-0 bg-white w-2/3" />
                      </span>
                    </div>
                  </div>

                  {/* Header */}
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <span className="text-[8px] font-mono text-primary uppercase block">Order Live</span>
                      <h3 className="text-white font-extrabold text-xs">Select Beverage</h3>
                    </div>
                    <span className="h-6 w-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px]">☕</span>
                  </div>

                  {/* Beverage Preview Card */}
                  <div className="bg-black/40 border border-strokedark rounded-2xl p-4 space-y-3 mb-4 flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-white font-bold">Premium Cappuccino</h4>
                        <span className="text-[8px] text-bodydark2 font-mono">SKU: cold-brew-capsule</span>
                      </div>
                      <span className="text-primary font-bold font-mono">₹220</span>
                    </div>
                    <div className="h-24 w-full bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-center relative overflow-hidden my-2">
                      <span className="text-4xl">☕</span>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-2">
                        <span className="text-[8px] font-mono text-bodydark2">Espresso + Microfoam</span>
                      </div>
                    </div>

                    {/* Selectors */}
                    <div className="space-y-3">
                      <div>
                        <span className="text-[8px] text-bodydark2 font-mono uppercase block mb-1">Milk Type</span>
                        <div className="flex gap-1.5 font-mono text-[8px]">
                          {['Whole', 'Oat', 'Almond'].map((m) => (
                            <span
                              key={m}
                              className={`px-2 py-0.5 rounded-lg border ${
                                m === 'Oat'
                                  ? 'bg-white text-black border-white'
                                  : 'bg-black/30 border-strokedark text-bodydark2'
                              }`}
                            >
                              {m}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-[8px] text-bodydark2 font-mono uppercase block mb-1">Sweetness</span>
                        <div className="flex gap-1.5 font-mono text-[8px]">
                          {['None', 'Half', 'Regular'].map((s) => (
                            <span
                              key={s}
                              className={`px-2 py-0.5 rounded-lg border ${
                                s === 'Regular'
                                  ? 'bg-white text-black border-white'
                                  : 'bg-black/30 border-strokedark text-bodydark2'
                              }`}
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Add to Cart button */}
                  <button className="w-full py-2 rounded-xl bg-white text-black font-bold font-mono text-center text-[9px] shadow-[0_4px_12px_rgba(255,255,255,0.1)]">
                    Add to Cart • ₹220
                  </button>
                </div>
              </Iphone>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Platform Architecture Section */}
      <section id="architecture" className="py-24 border-t border-strokedark/30 relative z-10 text-center">
        <div className="max-w-4xl mx-auto px-6 space-y-8">
          <div className="space-y-4">
            <span className="text-[10px] font-mono text-primary uppercase tracking-[0.25em] font-bold block">
              System Architecture
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
              Generic IoT Software Layer
            </h2>
          </div>

          {/* Architecture Illustration */}
          <div className="bg-[#0c0c0e] border border-white/[0.08] rounded-3xl p-6 md:p-8 font-mono text-xs text-slate-400 max-w-2xl mx-auto text-left relative overflow-hidden space-y-4">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px] pointer-events-none" />
            <div className="flex justify-between items-center text-[10px] border-b border-strokedark/60 pb-3">
              <span className="text-white font-bold">SYSTEM_FLOW.log</span>
              <span className="text-chart-2">ONLINE TELEMETRY</span>
            </div>
            <div className="space-y-2">
              <div className="text-chart-4">&gt;&gt; Initialize PodRuntimeEngine(seed=42)...</div>
              <div>[Info] Loaded profile: Evening Rush (60-100 orders/hour)</div>
              <div>[Info] Registered subscribers: EventLogger, DBProjections</div>
              <div className="text-chart-2">&gt;&gt; Advance tick (minutes=1)...</div>
              <div>[Event] order.created - SKU: cold-brew - Total: INR 220</div>
              <div>[Event] inventory.low - Milk level 28% capacity</div>
              <div className="text-chart-3">&gt;&gt; Invoke Gemini-2.5-Flash analysis request...</div>
              <div>[JSON] Validation: OK (All 9 expected fields verified)</div>
              <div>[Info] CacheStatus: MISS (Wrote response to cache)</div>
              <div className="text-chart-2">&gt;&gt; Database projection saved. Transactions committed.</div>
            </div>
          </div>

          <TextAnimate
            by="word"
            animation="fadeIn"
            className="text-base md:text-lg font-mono font-bold text-primary mt-8 inline-block"
          >
            Monitor · Predict · Optimize · Automate
          </TextAnimate>
        </div>
      </section>

      {/* Global Expansion */}
      <section className="py-24 border-t border-strokedark/30 relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Globe representation */}
          <div className="relative h-[400px] sm:h-[500px] flex items-center justify-center">
            <Globe config={customGlobeConfig} className="w-full h-full max-w-[400px] sm:max-w-[500px]" />
          </div>

          {/* Details */}
          <div className="space-y-6 text-left relative z-20">
            <span className="text-[10px] font-mono text-primary uppercase tracking-[0.25em] font-bold block">
              Global Scale
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
              Future Autonomous Retail Network
            </h2>
            <p className="text-sm text-bodydark2 leading-relaxed">
              NexPod AI OS is designed for global deployments. Seamlessly monitor and scale retail nodes in New York, London, Tokyo, Dubai, Singapore, and Mumbai from a single centralized web console.
            </p>
            <div className="grid grid-cols-2 gap-4 text-xs font-mono text-bodydark2 bg-boxdark/50 border border-strokedark p-5 rounded-2xl">
              <div>
                <span className="text-white font-bold block">ACTIVE REGIONS</span>
                <span className="text-primary mt-1 block">6 GLOBAL MARKETS</span>
              </div>
              <div>
                <span className="text-white font-bold block">LATENCY TICK</span>
                <span className="text-primary mt-1 block">&lt;45MS WORLDWIDE</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demo (Lens Comparison Section) */}
      <section className="py-24 border-t border-strokedark/30 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="space-y-4 text-center max-w-2xl mx-auto mb-16">
            <span className="text-[10px] font-mono text-primary uppercase tracking-[0.25em] font-bold block">
              Interactive Lens Inspection
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
              Traditional vs NexPod Vending
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
            {/* Left: Traditional Vending */}
            <div className="rounded-3xl border border-strokedark bg-boxdark/30 p-8 text-left flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-chart-4 font-bold uppercase tracking-wider block mb-4">
                  01 / TRADITIONAL RETRO RETAIL
                </span>
                <h3 className="text-xl font-bold text-foreground mb-6">Reactive & Blind Kiosks</h3>
                <div className="space-y-4 text-xs font-mono text-bodydark2 leading-relaxed">
                  <div className="border-b border-strokedark/50 pb-2">
                    <span className="text-chart-4 font-bold block">NO TELEMETRY FEED</span>
                    <span>Staff must physically open machine to read temperature and diagnostic codes.</span>
                  </div>
                  <div className="border-b border-strokedark/50 pb-2">
                    <span className="text-chart-4 font-bold block">OUT OF STOCK BLINDNESS</span>
                    <span>Milk or water run out completely, resulting in hours of lost vending revenue.</span>
                  </div>
                  <div>
                    <span className="text-chart-4 font-bold block">MANUAL MAINTENANCE DISPATCH</span>
                    <span>Technicians dispatched blindly without knowing which replacement parts are required.</span>
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-mono text-chart-4 uppercase tracking-wider block mt-8">
                ✕ NO LIVE MONITORING
              </span>
            </div>

            {/* Right: NexPod with Lens zoom */}
            <div className="rounded-3xl border border-primary/20 bg-boxdark/80 p-8 text-left flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-primary font-bold uppercase tracking-wider block mb-4">
                  02 / NEXPOD OPERATIONAL DASHBOARD
                </span>
                <h3 className="text-xl font-bold text-foreground mb-4">Centralized Command Console</h3>
                <p className="text-xs text-bodydark2 mb-6">
                  Hover your cursor below to inspect the AI Insights, Revenue meters, and live telemetry widgets inside the lens.
                </p>

                {/* Lens Component wrapping a simulated Dashboard UI */}
                <Lens lensSize={200} zoomFactor={1.4}>
                  <div className="w-full bg-[#0c0c0e] border border-white/[0.08] p-6 rounded-2xl space-y-4 font-mono text-[10px] leading-relaxed relative select-none text-white">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-xl pointer-events-none" />
                    
                    <div className="flex justify-between items-center border-b border-strokedark/60 pb-3">
                      <span className="text-white font-bold">NEXPOD MISSION CONTROL</span>
                      <span className="text-primary font-bold">● ACTIVE</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Telemetry Block */}
                      <div className="bg-boxdark border border-strokedark p-3 rounded-xl space-y-1">
                        <span className="text-bodydark2 block text-[8px] uppercase">Telemetry</span>
                        <div className="text-white font-bold">Boiler: 93.5°C</div>
                        <div className="text-white font-bold">Pump: 15.2 Bar</div>
                      </div>

                      {/* KPIs Block */}
                      <div className="bg-boxdark border border-strokedark p-3 rounded-xl space-y-1">
                        <span className="text-bodydark2 block text-[8px] uppercase">KPIs Today</span>
                        <div className="text-primary font-bold">Revenue: ₹12,450</div>
                        <div className="text-white font-bold">Orders: 78</div>
                      </div>
                    </div>

                    {/* AI Insights Block */}
                    <div className="bg-primary/5 border border-primary/20 p-3 rounded-xl">
                      <span className="text-primary font-bold block text-[8px] uppercase">AI INSIGHTS</span>
                      <span className="text-white block mt-1">Refill scheduled in 2.8 hours. Current milk level 28%.</span>
                    </div>
                  </div>
                </Lens>
              </div>
              <span className="text-[10px] font-mono text-primary uppercase tracking-wider block mt-8">
                ✓ 100% MONITORABLE WITH LENS
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Developer Documentation */}
      <DeveloperDocs />

      {/* Roadmap Section */}
      <section id="roadmap" className="py-24 border-t border-strokedark/30 relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-16">
          <div className="space-y-4">
            <span className="text-[10px] font-mono text-primary uppercase tracking-[0.25em] font-bold block">
              Future Milestones
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
              Roadmap Timeline
            </h2>
          </div>

          <ConcentricRoadmap />
        </div>
      </section>

      {/* Call To Action */}
      <section className="py-24 border-t border-strokedark/30 relative z-10 text-center">
        <div className="max-w-4xl mx-auto px-6 space-y-8 rounded-3xl border border-primary/20 bg-gradient-to-b from-primary/[0.03] to-transparent p-12">
          <h2 className="text-3xl md:text-5xl font-black text-foreground tracking-tight">
            Ready to redefine autonomous retail?
          </h2>
          <p className="text-sm text-bodydark2 max-w-lg mx-auto leading-relaxed">
            Configure your simulator runtime seed, check live beverage dispatch charts, or try the customer customizer panel immediately.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/dashboard">
              <HoverBorderGradient
                containerClassName="rounded-xl border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                className="text-xs font-bold font-mono px-6 py-3.5 bg-black"
              >
                Launch Dashboard
              </HoverBorderGradient>
            </Link>

            <Link href="/customer">
              <InteractiveHoverButton className="bg-boxdark border-strokedark text-black dark:text-white font-mono text-xs py-3 px-6">
                Customer Demo
              </InteractiveHoverButton>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <DashboardFooter />

      {/* Intro Disclosures Banner */}
      <IntroDisclosure
        storageKey="nexpod_dashboard_intro"
        title="Fleet Dashboard Info"
        description="The Fleet Dashboard (Mission Control) is designed for operators to monitor live telemetry, inspect error logs, and trigger direct machine refills."
        actionText="Got It"
      />
      <IntroDisclosure
        storageKey="nexpod_customer_intro"
        title="Customer Demo Portal"
        description="Launch the Customer Order App to custom dial milk choices, configure sweetness levels, and order drinks like a physical user."
        actionText="Got It"
      />

      {/* AI Chat Sidebar */}
      <AIChatSidebar />

    </div>
  );
}
