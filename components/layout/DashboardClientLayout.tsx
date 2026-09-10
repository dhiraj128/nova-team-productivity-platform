'use client';

import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { CreateTaskModal } from '@/components/tasks/CreateTaskModal';

export function DashboardClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className="flex-1 flex pt-16">
        {/* Desktop & Tablet Sidebar */}
        <Sidebar
          collapsed={sidebarCollapsed}
          onOpenCreateTask={() => setIsCreateTaskOpen(true)}
        />

        {/* Main Workspace Stage */}
        <main
          className={`flex-1 transition-all duration-300 min-w-0 ${
            sidebarCollapsed ? 'pl-14' : 'pl-0 md:pl-60'
          }`}
        >
          <div className="p-4 sm:p-6 max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      {/* Global Quick Task Launcher Modal */}
      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
      />
    </div>
  );
}
