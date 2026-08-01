'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingCart,
  Radio,
  Layers,
  Activity,
  Brain,
  Settings,
  ArrowLeft,
  FileText,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import {
  Sidebar as ShadcnSidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarRail,
  SidebarMenuBadge,
} from './ui/sidebar';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const pathname = usePathname();

  const menuGroups = [
    {
      title: 'MISSION CONTROL',
      items: [
        {
          label: 'Dashboard',
          icon: LayoutDashboard,
          path: '/dashboard',
          badge: 'Live',
        },
        {
          label: 'Orders',
          icon: ShoppingCart,
          path: '/orders',
        },
        {
          label: 'Pod Telemetry',
          icon: Radio,
          path: '/telemetry',
        },
        {
          label: 'Material Inventory',
          icon: Layers,
          path: '/inventory',
        },
        {
          label: 'Machine Diagnostics',
          icon: Activity,
          path: '/diagnostics',
        },
        {
          label: 'NexPod Intelligence',
          icon: Brain,
          path: '/intelligence',
          badge: 'AI',
        },
        {
          label: 'Daily Reports',
          icon: FileText,
          path: '/reports',
        },
      ],
    },
    {
      title: 'SYSTEM PREFERENCES',
      items: [
        {
          label: 'Settings',
          icon: Settings,
          path: '/settings',
        },
      ],
    },
  ];

  const isLinkActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname === path || pathname.startsWith(path + '/');
  };

  return (
    <aside
      className={`fixed lg:static left-0 top-0 z-50 h-screen w-72 flex-col bg-[#0D1117] border-r border-[#21262D] duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <ShadcnSidebar collapsible="none" className="h-full w-full bg-[#0D1117]">
        {/* SIDEBAR HEADER */}
        <SidebarHeader className="flex flex-row items-center justify-between px-5 py-4 border-b border-[#21262D]">
          <Link href="/dashboard" className="flex items-center gap-3">
            <img
              src="https://res.cloudinary.com/dkt9vrlf0/image/upload/v1784138600/ChatGPT_Image_Jul_15_2026_11_32_55_PM_k0hqoz.png"
              alt="NexPod Logo"
              className="h-9 object-contain"
            />
          </Link>

          {/* Mobile close button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-controls="sidebar"
            className="block lg:hidden p-1.5 rounded-lg text-[#8B949E] hover:text-white hover:bg-[#161B22] transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        </SidebarHeader>

        {/* SIDEBAR CONTENT */}
        <SidebarContent className="py-4">
          {menuGroups.map((group, groupIdx) => (
            <SidebarGroup key={groupIdx} className="mb-4">
              {group.title && (
                <SidebarGroupLabel className="text-[10px] font-mono text-[#8B949E] px-3 mb-1.5 font-bold uppercase tracking-wider">
                  {group.title}
                </SidebarGroupLabel>
              )}

              <SidebarMenu>
                {group.items.map((item, itemIdx) => {
                  const Icon = item.icon;
                  const active = isLinkActive(item.path);

                  return (
                    <SidebarMenuItem key={itemIdx}>
                      <SidebarMenuButton
                        isActive={active}
                        onClick={() => setSidebarOpen(false)}
                        className="py-2.5 px-3 rounded-xl transition-all"
                      >
                        <Link href={item.path} className="flex items-center gap-3 w-full">
                          <Icon className={`h-4 w-4 ${active ? 'text-emerald-400' : 'text-[#8B949E]'}`} />
                          <span className="font-medium">{item.label}</span>
                          {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroup>
          ))}
        </SidebarContent>

        {/* SIDEBAR FOOTER */}
        <SidebarFooter className="p-4 border-t border-[#21262D] bg-[#090C10]">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#161B22] border border-[#21262D]">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-mono font-bold text-white truncate">NexPod AI OS</span>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                System Nominal
              </span>
            </div>
          </div>
        </SidebarFooter>

        <SidebarRail />
      </ShadcnSidebar>
    </aside>
  );
};
