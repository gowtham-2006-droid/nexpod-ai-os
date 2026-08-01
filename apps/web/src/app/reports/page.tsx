'use client';

import React, { useState } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Header } from '../../components/Header';
import { DailyOperationsReportView } from '../../components/DailyOperationsReportView';

export default function ReportsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState(3);

  const triggerAction = (actionName: string, detail: string) => {
    console.log(`Action triggered: ${actionName} - ${detail}`);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-black font-sans text-bodydark">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content Area */}
      <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          notifications={notifications}
          triggerAction={triggerAction}
        />

        <main className="p-4 sm:p-6 lg:p-8 max-w-[1700px] mx-auto w-full">
          <DailyOperationsReportView isModal={false} />
        </main>
      </div>
    </div>
  );
}
