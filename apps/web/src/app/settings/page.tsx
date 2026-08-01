'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings as SettingsIcon } from '@/components/animate-ui/icons/settings';
import {
  Sliders,
  Bell,
  Brain,
  Database,
  CheckCircle,
  SlidersHorizontal,
} from 'lucide-react';

import { api } from '../../lib/api';
import { Sidebar } from '../../components/Sidebar';
import { Header } from '../../components/Header';
import { logger } from '../../lib/logger';

type SettingsTab = 'general' | 'runtime' | 'notifications' | 'ai' | 'system';

export default function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState(2);
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  // Form states
  const [podName, setPodName] = useState('NexPod Atrium');
  const [locationCode, setLocationCode] = useState('Atrium Zone A');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [language, setLanguage] = useState('English');

  const [simMode, setSimMode] = useState<'Morning' | 'Afternoon' | 'Evening Rush'>('Evening Rush');
  const [simSpeed, setSimSpeed] = useState<'1x' | '2x' | '5x'>('1x');

  const [alertsInventory, setAlertsInventory] = useState(true);
  const [alertsMaintenance, setAlertsMaintenance] = useState(true);
  const [alertsRevenue, setAlertsRevenue] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyPush, setNotifyPush] = useState(true);

  const [aiEnabled, setAiEnabled] = useState(true);
  const [aiAutoReorder, setAiAutoReorder] = useState(true);
  const [insightFreq, setInsightFreq] = useState('15 min');
  const [confidenceThreshold, setConfidenceThreshold] = useState(90);

  const [saveToast, setSaveToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Pod configuration updated and written to live backend.');

  // Load live settings from backend on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await api.getSettings();
        setPodName(data.pod_name || 'NexPod Atrium');
        setLocationCode(data.location_code || 'Atrium Zone A');
        setTimezone(data.timezone || 'Asia/Kolkata');
        setLanguage(data.language || 'English');
        setSimMode((data.simulation_mode || 'Evening Rush') as any);
        setSimSpeed((data.simulation_speed || '1x') as any);
        setAlertsInventory(data.alerts_inventory !== false);
        setAlertsMaintenance(data.alerts_maintenance !== false);
        setAlertsRevenue(data.alerts_revenue !== false);
        setNotifyEmail(data.notify_email !== false);
        setNotifyPush(data.notify_push !== false);
        setAiEnabled(data.ai_enabled !== false);
        setAiAutoReorder(data.ai_auto_reorder !== false);
        setInsightFreq(data.insight_frequency || '15 min');
        setConfidenceThreshold(data.confidence_threshold ?? 90);
      } catch (err) {
        logger.error("Failed to load settings from API", err);
      }
    };
    fetchSettings();
  }, []);

  const triggerSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateSettings({
        pod_name: podName,
        timezone: timezone,
        language: language,
        simulation_mode: simMode,
        alerts_inventory: alertsInventory,
        alerts_maintenance: alertsMaintenance,
        alerts_revenue: alertsRevenue,
        notify_email: notifyEmail,
        notify_push: notifyPush,
        ai_enabled: aiEnabled,
        ai_auto_reorder: aiAutoReorder,
        insight_frequency: insightFreq,
        confidence_threshold: confidenceThreshold,
      });

      // Show success toast
      setToastMessage('Pod configuration updated and written to live backend.');
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 3000);
    } catch (err) {
      logger.error("Failed to save settings via API", err);
    }
  };

  const handleFactoryReset = async () => {
    try {
      const data = await api.resetSettings();
      setPodName(data.pod_name || 'NexPod Atrium');
      setLocationCode(data.location_code || 'Atrium Zone A');
      setTimezone(data.timezone || 'Asia/Kolkata');
      setLanguage(data.language || 'English');
      setSimMode((data.simulation_mode || 'Evening Rush') as any);
      setSimSpeed((data.simulation_speed || '1x') as any);
      setAlertsInventory(data.alerts_inventory !== false);
      setAlertsMaintenance(data.alerts_maintenance !== false);
      setAlertsRevenue(data.alerts_revenue !== false);
      setNotifyEmail(data.notify_email !== false);
      setNotifyPush(data.notify_push !== false);
      setAiEnabled(data.ai_enabled !== false);
      setAiAutoReorder(data.ai_auto_reorder !== false);
      setInsightFreq(data.insight_frequency || '15 min');
      setConfidenceThreshold(data.confidence_threshold ?? 90);

      setToastMessage('Factory Reset Directive Complete. Settings and material inventory levels restored to factory defaults.');
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 4000);
    } catch (err) {
      logger.error("Failed to factory reset settings via API", err);
    }
  };

  const tabsConfig = [
    { id: 'general' as const, label: 'General', icon: SlidersHorizontal, desc: 'Location parameters & descriptors' },
    { id: 'runtime' as const, label: 'Runtime', icon: Sliders, desc: 'Simulation profile speeds' },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell, desc: 'Channel delivery thresholds' },
    { id: 'ai' as const, label: 'AI Settings', icon: Brain, desc: 'Predictive neural-net boundaries' },
    { id: 'system' as const, label: 'System', icon: Database, desc: 'Platform statuses & versioning' },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-black font-sans text-bodydark">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          notifications={notifications}
          triggerAction={() => {}}
        />

        {/* Dynamic Save Config Notification toast */}
        <AnimatePresence>
          {saveToast && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="fixed top-24 left-1/2 transform -translate-x-1/2 z-99999 w-full max-w-md bg-boxdark border border-primary p-4 rounded-xl shadow-2xl flex gap-3 items-center"
            >
              <div className="p-1.5 rounded bg-chart-2/10 text-chart-2 shrink-0">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-[10px] font-mono text-primary uppercase font-bold tracking-wider">
                  SYSTEM MESSAGE
                </span>
                <span className="block text-sm font-semibold text-white mt-0.5">
                  {toastMessage}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="p-4 md:p-6 2xl:p-10 max-w-[1200px] w-full mx-auto">
          {/* Page Header */}
          <div className="flex items-center gap-3 mb-6 border-b border-strokedark pb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <SettingsIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Settings
              </h2>
              <span className="text-xs text-bodydark2 font-mono">
                Operator configuration profile
              </span>
            </div>
          </div>

          {/* Settings Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            
            {/* LEFT COLUMN: Tab Navigation Links (4 Columns) */}
            <div className="md:col-span-4 space-y-2">
              {tabsConfig.map((tab) => {
                const TabIcon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer flex items-center gap-3.5 ${
                      isActive
                        ? 'border-primary bg-primary/[0.04] text-white shadow-sm'
                        : 'border-strokedark bg-boxdark text-bodydark2 hover:border-bodydark2 hover:text-white'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${isActive ? 'bg-primary/20 text-primary' : 'bg-meta-4 text-bodydark2'}`}>
                      <TabIcon className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <span className="block text-xs font-bold font-mono tracking-wide uppercase">
                        {tab.label}
                      </span>
                      <span className="block text-[10px] text-bodydark2 font-mono mt-0.5">
                        {tab.desc}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* RIGHT COLUMN: Settings Form panels (8 Columns) */}
            <div className="md:col-span-8">
              <div className="rounded-2xl border border-strokedark bg-boxdark p-6 shadow-default">
                
                <form onSubmit={triggerSave}>
                  <AnimatePresence mode="wait">
                    
                    {/* 1. GENERAL SETTINGS */}
                    {activeTab === 'general' && (
                      <motion.div
                        key="general"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-5"
                      >
                        <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider border-b border-strokedark pb-3">
                          General Specifications
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-mono font-bold text-bodydark2 uppercase mb-2">
                              Pod Display Name
                            </label>
                            <input
                              type="text"
                              value={podName}
                              onChange={(e) => setPodName(e.target.value)}
                              className="w-full rounded-lg border border-strokedark bg-black/40 p-3 text-xs font-semibold text-white focus:border-primary focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono font-bold text-bodydark2 uppercase mb-2">
                              Location / Zone Identifier
                            </label>
                            <input
                              type="text"
                              value={locationCode}
                              onChange={(e) => setLocationCode(e.target.value)}
                              className="w-full rounded-lg border border-strokedark bg-black/40 p-3 text-xs font-semibold text-white focus:border-primary focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-mono font-bold text-bodydark2 uppercase mb-2">
                              Timezone
                            </label>
                            <select
                              value={timezone}
                              onChange={(e) => setTimezone(e.target.value)}
                              className="w-full rounded-lg border border-strokedark bg-black/40 p-3 text-xs font-semibold text-white focus:border-primary focus:outline-none"
                            >
                              <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                              <option value="UTC">UTC / GMT</option>
                              <option value="America/New_York">America/New_York (EST)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono font-bold text-bodydark2 uppercase mb-2">
                              Language interface
                            </label>
                            <select
                              value={language}
                              onChange={(e) => setLanguage(e.target.value)}
                              className="w-full rounded-lg border border-strokedark bg-black/40 p-3 text-xs font-semibold text-white focus:border-primary focus:outline-none"
                            >
                              <option value="English">English</option>
                              <option value="Hindi">Hindi</option>
                              <option value="Spanish">Spanish</option>
                            </select>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* 2. RUNTIME SETTINGS */}
                    {activeTab === 'runtime' && (
                      <motion.div
                        key="runtime"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-5"
                      >
                        <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider border-b border-strokedark pb-3">
                          Runtime Simulation Configuration
                        </h3>

                        <div>
                          <label className="block text-[10px] font-mono font-bold text-bodydark2 uppercase mb-3">
                            Simulation Mode Profile
                          </label>
                          <div className="grid grid-cols-3 gap-3">
                            {(['Morning', 'Afternoon', 'Evening Rush'] as const).map((mode) => (
                              <button
                                type="button"
                                key={mode}
                                onClick={() => setSimMode(mode)}
                                className={`p-3 rounded-lg border text-xs font-bold font-mono transition-all text-center ${
                                  simMode === mode
                                    ? 'border-primary bg-primary/10 text-white'
                                    : 'border-strokedark bg-black/20 text-bodydark2 hover:border-bodydark2 hover:text-white'
                                }`}
                              >
                                {mode}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono font-bold text-bodydark2 uppercase mb-3">
                            Simulation Tick Speed
                          </label>
                          <div className="grid grid-cols-3 gap-3">
                            {(['1x', '2x', '5x'] as const).map((speed) => (
                              <button
                                type="button"
                                key={speed}
                                onClick={() => setSimSpeed(speed)}
                                className={`p-3 rounded-lg border text-xs font-bold font-mono transition-all text-center ${
                                  simSpeed === speed
                                    ? 'border-primary bg-primary/10 text-white'
                                    : 'border-strokedark bg-black/20 text-bodydark2 hover:border-bodydark2 hover:text-white'
                                }`}
                              >
                                {speed}
                              </button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* 3. NOTIFICATIONS SETTINGS */}
                    {activeTab === 'notifications' && (
                      <motion.div
                        key="notifications"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-5"
                      >
                        <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider border-b border-strokedark pb-3">
                          Alert Threshold Rules
                        </h3>

                        <div className="space-y-4 font-mono text-xs text-white">
                          <div className="flex justify-between items-center border-b border-strokedark/50 pb-3">
                            <div>
                              <span className="font-bold">Inventory Alerts</span>
                              <span className="block text-[10px] text-bodydark2 mt-0.5">Trigger warning when stock drops below reorder points</span>
                            </div>
                            <input
                              type="checkbox"
                              checked={alertsInventory}
                              onChange={(e) => setAlertsInventory(e.target.checked)}
                              className="w-4 h-4 accent-primary cursor-pointer"
                            />
                          </div>

                          <div className="flex justify-between items-center border-b border-strokedark/50 pb-3">
                            <div>
                              <span className="font-bold">Maintenance Alerts</span>
                              <span className="block text-[10px] text-bodydark2 mt-0.5">Alert on predictive sensor anomalies</span>
                            </div>
                            <input
                              type="checkbox"
                              checked={alertsMaintenance}
                              onChange={(e) => setAlertsMaintenance(e.target.checked)}
                              className="w-4 h-4 accent-primary cursor-pointer"
                            />
                          </div>

                          <div className="flex justify-between items-center border-b border-strokedark/50 pb-3">
                            <div>
                              <span className="font-bold">Revenue Alerts</span>
                              <span className="block text-[10px] text-bodydark2 mt-0.5">Send summary logs of hourly revenue spikes</span>
                            </div>
                            <input
                              type="checkbox"
                              checked={alertsRevenue}
                              onChange={(e) => setAlertsRevenue(e.target.checked)}
                              className="w-4 h-4 accent-primary cursor-pointer"
                            />
                          </div>

                          <div className="flex justify-between items-center border-b border-strokedark/50 pb-3">
                            <div>
                              <span className="font-bold">Email alerts channel</span>
                              <span className="block text-[10px] text-bodydark2 mt-0.5">Deliver daily reports to admin@nexpod.ai</span>
                            </div>
                            <input
                              type="checkbox"
                              checked={notifyEmail}
                              onChange={(e) => setNotifyEmail(e.target.checked)}
                              className="w-4 h-4 accent-primary cursor-pointer"
                            />
                          </div>

                          <div className="flex justify-between items-center pb-1">
                            <div>
                              <span className="font-bold">Push notifications</span>
                              <span className="block text-[10px] text-bodydark2 mt-0.5">Deliver OS level urgent notifications</span>
                            </div>
                            <input
                              type="checkbox"
                              checked={notifyPush}
                              onChange={(e) => setNotifyPush(e.target.checked)}
                              className="w-4 h-4 accent-primary cursor-pointer"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* 4. AI SETTINGS */}
                    {activeTab === 'ai' && (
                      <motion.div
                        key="ai"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-5"
                      >
                        <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider border-b border-strokedark pb-3">
                          AI Core Vending Settings
                        </h3>

                        <div className="space-y-4 font-mono text-xs text-white">
                          <div className="flex justify-between items-center border-b border-strokedark/50 pb-3">
                            <div>
                              <span className="font-bold">Enable NexPod ML Core</span>
                              <span className="block text-[10px] text-bodydark2 mt-0.5">Permit LLM observation agent activity</span>
                            </div>
                            <input
                              type="checkbox"
                              checked={aiEnabled}
                              onChange={(e) => setAiEnabled(e.target.checked)}
                              className="w-4 h-4 accent-primary cursor-pointer"
                            />
                          </div>

                          <div className="flex justify-between items-center border-b border-strokedark/50 pb-3">
                            <div>
                              <span className="font-bold">Auto drone replenishment</span>
                              <span className="block text-[10px] text-bodydark2 mt-0.5">Dispatch reorder logistics dynamically</span>
                            </div>
                            <input
                              type="checkbox"
                              checked={aiAutoReorder}
                              onChange={(e) => setAiAutoReorder(e.target.checked)}
                              className="w-4 h-4 accent-primary cursor-pointer"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-mono font-bold text-bodydark2 uppercase mb-2">
                              Insight scan interval
                            </label>
                            <select
                              value={insightFreq}
                              onChange={(e) => setInsightFreq(e.target.value)}
                              className="w-full rounded-lg border border-strokedark bg-black/40 p-3 text-xs font-semibold text-white focus:border-primary focus:outline-none font-mono"
                            >
                              <option value="5 min">Every 5 min</option>
                              <option value="15 min">Every 15 min</option>
                              <option value="1 hour">Every 1 hour</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono font-bold text-bodydark2 uppercase mb-2">
                              Confidence limit: {confidenceThreshold}%
                            </label>
                            <input
                              type="range"
                              min="75"
                              max="99"
                              value={confidenceThreshold}
                              onChange={(e) => setConfidenceThreshold(parseInt(e.target.value))}
                              className="w-full accent-primary h-2 bg-black/40 rounded-lg cursor-pointer mt-3"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* 5. SYSTEM SETTINGS */}
                    {activeTab === 'system' && (
                      <motion.div
                        key="system"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-5"
                      >
                        <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider border-b border-strokedark pb-3">
                          System Diagnostics Status
                        </h3>

                        <div className="space-y-3 font-mono text-xs text-white">
                          <div className="flex justify-between items-center border-b border-strokedark/30 pb-2">
                            <span className="text-bodydark2">Core Version</span>
                            <span className="text-white font-bold">v1.0.0-PROTOTYPE</span>
                          </div>
                          <div className="flex justify-between items-center border-b border-strokedark/30 pb-2">
                            <span className="text-bodydark2">Pod Runtime State</span>
                            <span className="text-chart-2 font-bold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-chart-2 animate-pulse" />
                              Running
                            </span>
                          </div>
                          <div className="flex justify-between items-center border-b border-strokedark/30 pb-2">
                            <span className="text-bodydark2">Backend API Connection</span>
                            <span className="text-chart-2 font-bold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-chart-2 animate-pulse" />
                              Connected (Webpack dev)
                            </span>
                          </div>
                          <div className="flex justify-between items-center border-b border-strokedark/30 pb-2">
                            <span className="text-bodydark2">Database Connection</span>
                            <span className="text-chart-2 font-bold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-chart-2" />
                              Connected (Supabase PG)
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-bodydark2">Gateway status</span>
                            <span className="text-chart-2 font-bold">Healthy (CORS rewrites ok)</span>
                          </div>
                        </div>

                        {/* Dangerous Action */}
                        <div className="pt-4 border-t border-strokedark/50">
                          <button
                            type="button"
                            onClick={handleFactoryReset}
                            className="px-4 py-2 bg-destructive/15 border border-destructive/30 hover:bg-destructive text-destructive hover:text-white rounded-lg text-xs font-bold font-mono transition-all duration-200 cursor-pointer"
                          >
                            Factory Reset System Settings
                          </button>
                        </div>
                      </motion.div>
                    )}

                  </AnimatePresence>

                  {/* Form Footer Action */}
                  <div className="mt-8 pt-4 border-t border-strokedark/50 flex justify-end gap-3.5">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-primary text-white text-xs font-bold font-mono hover:bg-primary/95 transition-all shadow-md cursor-pointer"
                    >
                      Save Configuration
                    </button>
                  </div>

                </form>

              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
