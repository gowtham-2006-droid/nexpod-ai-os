'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import { Meteors } from '../components/ui/meteors';
import { Ripple } from '../components/ui/ripple';
import { TextAnimate } from '../components/ui/text-animate';
import { TextReveal } from '../components/ui/text-reveal';
import { Highlighter } from '../components/ui/highlighter';
import { ShimmerButton } from '../components/ui/shimmer-button';
import { InteractiveHoverButton } from '../components/ui/interactive-hover-button';
import { HoverBorderGradient } from '../components/ui/hover-border-gradient';
import { WobbleCard } from '../components/ui/wobble-card';
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
import StaggeredMenu from '../components/ui/StaggeredMenu';
import { HoleBackground } from '../components/ui/hole-background';

export default function LandingPage() {
  const router = useRouter();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const onboardingSteps = [
    {
      title: "Welcome to NexPod AI OS",
      short_description: "Hackathon Judge Guide",
      full_description: "NexPod AI OS is the first predictive intelligence operating system for autonomous retail. It replaces reactive maintenance with real-time telemetry and predictive AI pipelines.",
      media: {
        type: "image" as const,
        src: "/dashboard_mockup.png",
        alt: "NexPod Mission Control"
      }
    },
    {
      title: "Step 1: Simulating Customer Orders",
      short_description: "Order Placement",
      full_description: "Click the 'Customer App' button on the landing page to open the simulator. Try customizing a drink and ordering. The system dynamically processes your transaction in real-time.",
      media: {
        type: "image" as const,
        src: "/customer_mockup.png",
        alt: "Customer Portal"
      }
    },
    {
      title: "Step 2: Monitoring Live Telemetry",
      short_description: "Real-time Dashboard",
      full_description: "Open the Dashboard to see telemetry charts (temperature, power draw, latency) update instantly as simulator orders come in. Monitor machine health and view live sales metrics.",
      media: {
        type: "image" as const,
        src: "/coffee_pod_render.png",
        alt: "Telemetry Monitoring"
      }
    },
    {
      title: "Step 3: AI-Driven Auto-Replenishment",
      short_description: "Smart Operations",
      full_description: "Go to the Settings page and enable 'AI Auto-Reorder'. When any ingredient stock runs low, the background simulator automatically triggers a restocking sequence, preventing checkout failures.",
      media: {
        type: "image" as const,
        src: "/retro_vending_machine.png",
        alt: "AI Auto-Replenishment"
      },
      action: {
        label: "Launch Dashboard",
        onClick: () => {
          localStorage.setItem('nexpod_judge_onboarding', 'true');
          setShowOnboarding(false);
          router.push('/dashboard');
        }
      }
    }
  ];

  const handleLaunchDashboardClick = (e: React.MouseEvent) => {
    const dismissed = localStorage.getItem('nexpod_judge_onboarding');
    if (!dismissed) {
      e.preventDefault();
      setShowOnboarding(true);
    }
  };

  const [showCustomerOnboarding, setShowCustomerOnboarding] = useState(false);

  const customerOnboardingSteps = [
    {
      title: "Customer Order Portal",
      short_description: "Simulating Transactions",
      full_description: "Welcome to the NexPod Customer checkout screen! Here, you can simulate a walk-up user interacting with a physical retail pod in real-time.",
      media: {
        type: "image" as const,
        src: "/customer_mockup.png",
        alt: "Customer Portal"
      }
    },
    {
      title: "Customize Your Drink",
      short_description: "Dial Sweetness & Milk",
      full_description: "Use the customizers to select milk preferences (Oat, Soy, Whole) and dial in sweetness levels. Watch the ingredient inventory reflect these custom proportions dynamically.",
      media: {
        type: "image" as const,
        src: "/coffee_pod_render.png",
        alt: "Drink Customization"
      }
    },
    {
      title: "Trigger Real-Time Telemetry",
      short_description: "Live WebSockets",
      full_description: "Once you place an order, the system registers checkout transactions, recalculates remaining stock, updates telemetry (power spikes, temperature changes), and pumps metrics to the dashboard.",
      media: {
        type: "image" as const,
        src: "/retro_vending_machine.png",
        alt: "Telemetry Dispatch"
      },
      action: {
        label: "Launch Customer App",
        onClick: () => {
          localStorage.setItem('nexpod_customer_onboarding', 'true');
          setShowCustomerOnboarding(false);
          router.push('/customer');
        }
      }
    }
  ];

  const handleLaunchCustomerClick = (e: React.MouseEvent) => {
    const dismissed = localStorage.getItem('nexpod_customer_onboarding');
    if (!dismissed) {
      e.preventDefault();
      setShowCustomerOnboarding(true);
    }
  };

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
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-white dark:selection:text-black relative">
      {/* Scroll Progress Indicator */}
      <ScrollProgress className="bg-gradient-to-r from-primary via-chart-4 to-primary h-1" />

      {/* React Bits Staggered Menu */}
      <StaggeredMenu
        position="right"
        items={[
          { label: 'Dashboard', ariaLabel: 'Go to Owner Dashboard', link: '/dashboard' },
          { label: 'Intelligence', ariaLabel: 'Go to AI Intelligence', link: '/intelligence' },
          { label: 'Telemetry', ariaLabel: 'Go to Pod Telemetry', link: '/telemetry' },
          { label: 'Reports', ariaLabel: 'Go to Daily Reports', link: '/reports' },
          { label: 'Customer Kiosk', ariaLabel: 'Go to Customer Kiosk', link: '/customer' },
          { label: 'Admin Login', ariaLabel: 'Sign in to Admin Console', link: '/login' },
          { label: 'Settings', ariaLabel: 'Go to Settings', link: '/settings' },
        ]}
        socialItems={[
          { label: 'GitHub', link: 'https://github.com/gowtham-2006-droid/nexpod-ai-os' },
          { label: 'Admin Sign In', link: '/login' },
          { label: 'Owner Portal', link: '/dashboard' },
          { label: 'Kiosk App', link: '/customer' },
        ]}
        displaySocials={true}
        displayItemNumbering={true}
        menuButtonColor="#ffffff"
        openMenuButtonColor="#ffffff"
        changeMenuColorOnOpen={true}
        colors={['#10B981', '#059669']}
        logoUrl="https://res.cloudinary.com/dkt9vrlf0/image/upload/v1784138600/ChatGPT_Image_Jul_15_2026_11_32_55_PM_k0hqoz.png"
        accentColor="#10B981"
        isFixed={true}
      />

      {/* Hero Section */}
      <HoleBackground
        strokeColor="#30363D"
        numberOfLines={70}
        numberOfDiscs={65}
        particleRGBColor={[16, 185, 129]}
        className="w-full min-h-screen flex flex-col justify-center border-b border-[#21262D]"
      >
        <section className="relative min-h-screen w-full flex items-center justify-center pt-20 pb-12 lg:py-16 overflow-hidden">
          {/* Top-Left White Lamp Spotlight */}
          <div className="absolute top-0 left-0 pointer-events-none z-10 overflow-hidden w-[700px] h-[700px]">
            {/* Ambient White Glow */}
            <div
              className="absolute -top-24 -left-24 w-[500px] h-[500px] rounded-full blur-[100px]"
              style={{
                background: "radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0.06) 45%, transparent 75%)"
              }}
            />
            {/* Luminous Conic Lamp Light Beam */}
            <div
              className="absolute top-0 left-0 w-[450px] h-[550px] transform -rotate-12 opacity-80"
              style={{
                backgroundImage: "conic-gradient(from 140deg at 0% 0%, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.04) 35%, transparent 70%)"
              }}
            />
            {/* Top-Left Lamp Bar Highlight */}
            <div className="absolute top-3 left-8 w-24 h-1 bg-white/90 rounded-full blur-[1px] shadow-[0_0_25px_rgba(255,255,255,0.95)]" />
          </div>

          {/* Subtle Meteors */}
          <Meteors number={14} minDuration={4} maxDuration={8} className="opacity-40" />

          <div className="w-full max-w-[1600px] 2xl:max-w-[1850px] mx-auto px-6 sm:px-10 md:px-14 lg:px-16 xl:px-20 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 xl:gap-20 2xl:gap-24 items-center relative z-10">
            {/* Left Column - Text Details */}
            <div className="lg:col-span-6 xl:col-span-6 2xl:col-span-6 flex flex-col items-start text-left space-y-6 lg:space-y-8 relative z-20">
              <div className="space-y-3 relative py-2 w-full text-left">
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
                  <span className="text-xs sm:text-sm font-mono text-primary uppercase tracking-[0.25em] font-bold block mb-2">
                    NexPod AI Operating System
                  </span>
                  <KineticText
                    text="The AI Operating System"
                    as="h1"
                    className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-black text-foreground tracking-tight leading-[1.05] justify-start"
                  />
                </div>
              </div>

              {/* Highlighter highlights */}
                <div className="flex flex-wrap items-center gap-y-3 gap-x-4 pt-1">
                  <Highlighter action="highlight" color="var(--hero-highlight-bg, rgba(255, 255, 255, 0.08))" strokeWidth={2}>
                    <span className="text-foreground font-mono text-xs md:text-sm lg:text-base px-3 py-1 rounded border border-foreground/10">
                      Autonomous Retail Pods
                    </span>
                  </Highlighter>
                  <Highlighter action="underline" color="rgba(255, 214, 0, 0.4)">
                    <span className="text-yellow-400 font-mono text-xs md:text-sm lg:text-base">
                      Predictive Intelligence
                    </span>
                  </Highlighter>
                  <Highlighter action="box" color="rgba(41, 182, 246, 0.4)">
                    <span className="text-cyan-400 font-mono text-xs md:text-sm lg:text-base px-1.5">
                      AI Operations
                    </span>
                  </Highlighter>
                </div>

                <p className="text-sm sm:text-base md:text-lg lg:text-xl text-bodydark2 leading-relaxed max-w-xl lg:max-w-2xl xl:max-w-3xl">
                  NexPod AI OS leverages real-time telemetry pipelines, Postgres persistence, and custom LLM inference loops to orchestrate self-service retail pods. Maximize uptime, reduce dispatch costs, and optimize stock dynamically.
                </p>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                  <Link href="/dashboard" onClick={handleLaunchDashboardClick}>
                    <HoverBorderGradient
                      containerClassName="rounded-xl border border-foreground/10 shadow-[0_0_25px_rgba(0,0,0,0.08)] dark:shadow-[0_0_25px_rgba(255,255,255,0.08)]"
                      className="text-xs sm:text-sm md:text-base font-bold font-mono px-7 sm:px-8 py-3.5 sm:py-4 bg-foreground text-background"
                    >
                      Launch Dashboard
                    </HoverBorderGradient>
                  </Link>

                  <Link href="/customer" onClick={handleLaunchCustomerClick}>
                    <InteractiveHoverButton
                      className="bg-boxdark border-strokedark text-foreground font-mono text-xs sm:text-sm md:text-base hover:text-background py-3.5 sm:py-4 px-7 sm:px-8"
                    >
                      Customer App
                    </InteractiveHoverButton>
                  </Link>

                  <Link href="/login">
                    <span className="text-xs font-mono text-cyan-400 hover:text-cyan-300 underline underline-offset-4 px-3 py-2 transition-colors">
                      Admin Sign In →
                    </span>
                  </Link>
                </div>
            </div>

            {/* Right Column - Video Player / Mockup Container scaled ~35% larger */}
            <div className="lg:col-span-6 xl:col-span-6 2xl:col-span-6 w-full flex justify-center lg:justify-end items-center animate-fade-in relative">
              <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none scale-150 xl:scale-175 2xl:scale-200">
                <Ripple mainCircleSize={220} numCircles={6} mainCircleOpacity={0.35} />
              </div>
              <Skiper67 className="w-full max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl 2xl:max-w-5xl relative z-10 shadow-[0_25px_60px_rgba(0,0,0,0.6)]" />
            </div>
          </div>
        </section>
      </HoleBackground>

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
            <Link href="/dashboard" onClick={handleLaunchDashboardClick}>
              <HoverBorderGradient
                containerClassName="rounded-xl border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                className="text-xs font-bold font-mono px-6 py-3.5 bg-black"
              >
                Launch Dashboard
              </HoverBorderGradient>
            </Link>

            <Link href="/customer" onClick={handleLaunchCustomerClick}>
              <InteractiveHoverButton className="bg-boxdark border-strokedark text-black dark:text-white font-mono text-xs py-3 px-6">
                Customer App
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

      {/* Onboarding Dialog for Hackathon Judge */}
      <IntroDisclosure
        steps={onboardingSteps}
        featureId="nexpod_judge_onboarding"
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={() => {
          setShowOnboarding(false);
          router.push('/dashboard');
        }}
        onSkip={() => {
          setShowOnboarding(false);
          router.push('/dashboard');
        }}
      />
      {/* Onboarding Dialog for Customer Simulator */}
      <IntroDisclosure
        steps={customerOnboardingSteps}
        featureId="nexpod_customer_onboarding"
        isOpen={showCustomerOnboarding}
        onClose={() => setShowCustomerOnboarding(false)}
        onComplete={() => {
          setShowCustomerOnboarding(false);
          router.push('/customer');
        }}
        onSkip={() => {
          setShowCustomerOnboarding(false);
          router.push('/customer');
        }}
      />

    </div>
  );
}
