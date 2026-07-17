'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Compass,
  LayoutDashboard,
  ShoppingCart,
  Radio,
  Layers,
  Activity,
  Brain,
  Settings,
  ArrowLeft,
} from 'lucide-react';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const pathname = usePathname();

  const menuGroups = [
    {
      title: 'MENU',
      items: [
        {
          label: 'Dashboard',
          icon: LayoutDashboard,
          path: '/dashboard',
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
        },
      ],
    },
    {
      title: '',
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
      className={`absolute left-0 top-0 z-9999 flex h-screen w-72.5 flex-col overflow-y-hidden bg-sidebar duration-300 ease-linear lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
    >
      {/* SIDEBAR HEADER */}
      <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5">
        <div className="flex h-16 items-center justify-start overflow-hidden">
          <img
            src="https://res.cloudinary.com/dkt9vrlf0/image/upload/v1784138600/ChatGPT_Image_Jul_15_2026_11_32_55_PM_k0hqoz.png"
            alt="NexPod Logo"
            className="h-full object-contain"
          />
        </div>

        {/* Mobile close button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-controls="sidebar"
          className="block lg:hidden text-sidebar-foreground hover:text-sidebar-foreground/80"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      </div>

      {/* SIDEBAR NAVIGATION */}
      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        <nav className="mt-5 px-4 py-4 lg:mt-9 lg:px-6">
          {menuGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="mb-6">
              {groupIdx > 0 && (
                <hr className="my-5 border-sidebar-border/30 mb-6" />
              )}
              {group.title && (
                <h3 className="mb-4 ml-4 text-xs font-semibold text-sidebar-foreground/50 tracking-wider">
                  {group.title}
                </h3>
              )}

              <ul className="mb-6 flex flex-col gap-1.5">
                {group.items.map((item, itemIdx) => {
                  const Icon = item.icon;
                  const active = isLinkActive(item.path);
                  const isHash = item.path.startsWith('#');

                  return (
                    <li key={itemIdx}>
                      <Link
                        href={item.path}
                        onClick={(e) => {
                          if (isHash) e.preventDefault();
                          // close sidebar on mobile navigation
                          setSidebarOpen(false);
                        }}
                        className={`group relative flex items-center gap-2.5 rounded-lg px-4 py-2 text-sm font-medium duration-300 ease-in-out hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${active
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground border-l-4 border-sidebar-primary'
                          : 'text-sidebar-foreground'
                          }`}
                      >
                        <Icon className="h-4.5 w-4.5 group-hover:text-sidebar-accent-foreground" />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
};
