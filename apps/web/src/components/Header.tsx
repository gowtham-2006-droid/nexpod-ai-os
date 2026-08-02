'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getStoredUser, clearSession } from '@/lib/auth';
import {
  Menu,
  Search,
  Bell,
  MessageSquare,
  ChevronDown,
  Moon,
  LogOut,
} from 'lucide-react';

export interface HeaderAlertItem {
  id: string;
  severity: string;
  code: string;
  message: string;
}

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
  notifications: number;
  triggerAction: (actionName: string, detail: string) => void;
  activeAlerts?: HeaderAlertItem[];
}

export const Header: React.FC<HeaderProps> = ({
  sidebarOpen,
  setSidebarOpen,
  notifications,
  triggerAction,
  activeAlerts,
}) => {
  const router = useRouter();
  const [notifOpen, setNotifOpen] = useState(false);
  const [logsOpen, setLogsOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ email: string; role: string } | null>(null);

  useEffect(() => {
    const user = getStoredUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const rawName = currentUser ? (currentUser.email.includes('@') ? currentUser.email.split('@')[0] : currentUser.email) : 'innovex';
  const formattedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
  const initials = rawName.slice(0, 2).toUpperCase();
  const displayRole = currentUser?.role === 'admin' ? 'Admin' : 'Operator';

  const handleSignOut = (e: React.MouseEvent) => {
    e.preventDefault();
    setUserOpen(false);
    clearSession();
    router.push('/login');
  };

  const displayCount = activeAlerts ? activeAlerts.length : notifications;

  return (
    <header className="sticky top-0 z-999 flex w-full bg-card border-b border-border relative">
      {/* Backdrop to close dropdowns on clicking outside */}
      {(notifOpen || logsOpen || userOpen) && (
        <div
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => {
            setNotifOpen(false);
            setLogsOpen(false);
            setUserOpen(false);
          }}
        />
      )}

      <div className="flex flex-grow items-center justify-between px-4 py-4 md:px-6 2xl:px-11 relative z-50">
        
        {/* Toggle Button & Search Bar */}
        <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
          {/* Hamburger Toggle */}
          <button
            aria-controls="sidebar"
            onClick={(e) => {
              e.stopPropagation();
              setSidebarOpen(!sidebarOpen);
            }}
            className="z-99999 block rounded-sm border border-border bg-secondary p-1.5 shadow-sm lg:hidden"
          >
            <Menu className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Mock Search Bar */}
        <div className="hidden sm:block">
          <form onSubmit={(e) => { e.preventDefault(); triggerAction('Search Telemetry', 'Search function triggered.'); }}>
            <div className="relative">
              <button className="absolute left-0 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Search className="h-4.5 w-4.5 hover:text-foreground transition-colors" />
              </button>
              <input
                type="text"
                placeholder="Search orders, diagnostics, inventory..."
                className="w-full bg-transparent pl-9 pr-4 font-medium text-foreground focus:outline-none xl:w-125 text-sm"
              />
            </div>
          </form>
        </div>

        {/* Action icons & User profile */}
        <div className="flex items-center gap-3 2xsm:gap-7">
          
          <ul className="flex items-center gap-2 2xsm:gap-4">
            {/* Theme Toggle Button */}
            <li>
              <button
                onClick={() => triggerAction('Theme Switch', 'Theme toggle simulated. Theme set: Dark Mode Only.')}
                className="relative flex h-8.5 w-8.5 items-center justify-center rounded-full border border-border bg-secondary hover:text-foreground text-muted-foreground"
              >
                <Moon className="h-4 w-4" />
              </button>
            </li>

            {/* Telemetry/Message Logs dropdown */}
            <li className="relative">
              <button
                onClick={() => {
                  setLogsOpen(!logsOpen);
                  setNotifOpen(false);
                  setUserOpen(false);
                  triggerAction('Directives Log Stack', 'Directives log details displayed.');
                }}
                className="relative flex h-8.5 w-8.5 items-center justify-center rounded-full border border-border bg-secondary hover:text-foreground text-muted-foreground"
              >
                <span className="absolute -top-0.5 -right-0.5 z-1 h-2 w-2 rounded-full bg-chart-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-chart-2 opacity-75"></span>
                </span>
                <MessageSquare className="h-4 w-4" />
              </button>

              {logsOpen && (
                <div className="absolute right-0 mt-2.5 w-80 rounded-2xl border border-strokedark bg-boxdark p-4 shadow-lg z-50 text-left font-sans">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-xs font-bold font-mono text-bodydark2 uppercase tracking-wider">System Logs</h4>
                    <span className="text-[10px] font-mono text-chart-2 font-semibold">Active Feed</span>
                  </div>
                  <div className="space-y-2.5 max-h-[220px] overflow-y-auto">
                    <div className="text-[11px] font-mono leading-relaxed border-b border-strokedark pb-2">
                      <span className="text-chart-2">[14:28:12]</span> Inventory Telemetry - Real-time sync operational
                    </div>
                    <div className="text-[11px] font-mono leading-relaxed border-b border-strokedark pb-2">
                      <span className="text-chart-2">[13:52:01]</span> Heating Unit - Temperature stabilized at 93.5°C
                    </div>
                    <div className="text-[11px] font-mono leading-relaxed pb-1">
                      <span className="text-bodydark2">[12:10:22]</span> Power Supply - UPS battery fully charged
                    </div>
                  </div>
                  <Link
                    href="/telemetry"
                    onClick={() => setLogsOpen(false)}
                    className="block text-center mt-3 pt-2.5 border-t border-strokedark text-xs font-semibold text-primary hover:underline"
                  >
                    Open Live Telemetry
                  </Link>
                </div>
              )}
            </li>

            {/* Notification alert stack */}
            <li className="relative">
              <button
                onClick={() => {
                  setNotifOpen(!notifOpen);
                  setLogsOpen(false);
                  setUserOpen(false);
                  triggerAction('Notification Drawer', 'Alert notifications list toggled.');
                }}
                className="relative flex h-8.5 w-8.5 items-center justify-center rounded-full border border-border bg-secondary hover:text-foreground text-muted-foreground"
              >
                {displayCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 z-1 h-2.5 w-2.5 rounded-full bg-destructive flex items-center justify-center text-[7px] text-white font-bold">
                    {displayCount}
                  </span>
                )}
                <Bell className="h-4 w-4" />
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2.5 w-80 rounded-2xl border border-strokedark bg-boxdark p-4 shadow-lg z-50 text-left font-sans">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-xs font-bold font-mono text-bodydark2 uppercase tracking-wider">Alert Notifications</h4>
                    <span className="text-[10px] font-mono text-meta-1 font-semibold">{displayCount} Pending</span>
                  </div>
                  <div className="space-y-2.5 max-h-[220px] overflow-y-auto">
                    {activeAlerts && activeAlerts.length > 0 ? (
                      activeAlerts.map((alert) => (
                        <div key={alert.id} className="text-[11px] leading-relaxed border-b border-strokedark pb-2 font-mono text-bodydark">
                          <span className={alert.severity === 'critical' ? "text-meta-1 font-bold" : "text-chart-4 font-bold"}>
                            ⚠️ {alert.severity.toUpperCase()}:
                          </span>{' '}
                          {alert.message}
                        </div>
                      ))
                    ) : displayCount > 0 ? (
                      <div className="text-[11px] leading-relaxed border-b border-strokedark pb-2 font-mono text-bodydark">
                        <span className="text-chart-4 font-bold">⚠️ NOTICE:</span> System telemetry active.
                      </div>
                    ) : (
                      <div className="text-xs text-bodydark2 py-4 text-center">
                        All systems nominal. No pending warnings.
                      </div>
                    )}
                  </div>
                  <Link
                    href="/diagnostics"
                    onClick={() => setNotifOpen(false)}
                    className="block text-center mt-3 pt-2.5 border-t border-strokedark text-xs font-semibold text-primary hover:underline"
                  >
                    Open Diagnostics Console
                  </Link>
                </div>
              )}
            </li>
          </ul>

          {/* User Area */}
          <div className="relative">
            <a
              onClick={(e) => { 
                e.preventDefault(); 
                setUserOpen(!userOpen);
                setNotifOpen(false);
                setLogsOpen(false);
                triggerAction('User Settings', 'User configuration toggled.'); 
              }}
              className="flex items-center gap-4 cursor-pointer"
              href="#"
            >
              <span className="hidden text-right lg:block">
                <span className="block text-sm font-medium text-foreground">{formattedName}</span>
                <span className="block text-[10px] text-emerald-400 font-mono mt-0.5 uppercase tracking-wider font-semibold">{displayRole}</span>
              </span>

              <span className="h-9 w-9 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center text-xs font-bold font-mono">
                {initials}
              </span>

              <ChevronDown className="hidden sm:block h-4 w-4 text-muted-foreground" />
            </a>

            {userOpen && (
              <div className="absolute right-0 mt-2.5 w-48 rounded-2xl border border-strokedark bg-boxdark p-3.5 shadow-lg z-50 text-left font-sans text-xs">
                <div className="border-b border-strokedark pb-2 mb-2">
                  <span className="block font-bold text-white leading-tight">{formattedName}</span>
                  <span className="block text-[9px] text-emerald-400 font-mono uppercase tracking-wider mt-0.5 font-semibold">{displayRole}</span>
                </div>
                <div className="space-y-1">
                  <Link href="/settings" onClick={() => setUserOpen(false)} className="block py-1.5 px-2 rounded hover:bg-secondary text-bodydark hover:text-white transition-colors">
                    Pod Configuration
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left flex items-center gap-2 py-1.5 px-2 rounded hover:bg-destructive/20 text-destructive transition-colors font-mono font-medium"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
