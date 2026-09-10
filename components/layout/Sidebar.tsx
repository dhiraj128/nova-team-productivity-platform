'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Calendar,
  BarChart3,
  User,
  Settings,
  Plus,
  Sparkles,
} from 'lucide-react';
import { NovaLogo } from '../branding/NovaLogo';

interface SidebarProps {
  collapsed?: boolean;
  onOpenCreateTask?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed = false, onOpenCreateTask }) => {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Projects', href: '/projects', icon: FolderKanban },
    { label: 'My Tasks', href: '/tasks', icon: CheckSquare },
    { label: 'Calendar', href: '/calendar', icon: Calendar },
    { label: 'Reports', href: '/reports', icon: BarChart3 },
    { label: 'Profile', href: '/profile', icon: User },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <aside
      className={`fixed left-0 top-16 bottom-0 z-30 bg-surface-container-lowest border-r border-surface-container-high/40 transition-all duration-300 flex flex-col justify-between ${
        collapsed ? 'w-14' : 'w-60'
      }`}
    >
      <div className="p-3 space-y-4">
        {/* Workspace pill indicator */}
        {!collapsed && (
          <div className="px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container-high flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span className="text-xs font-mono font-medium text-on-surface">NOVA Team</span>
            </div>
            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-primary/10 text-primary">
              Live
            </span>
          </div>
        )}

        {/* Quick Task Launcher */}
        {onOpenCreateTask && (
          <button
            onClick={onOpenCreateTask}
            className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-primary text-on-primary font-medium text-xs shadow-md hover:bg-primary-container hover:text-on-primary-container active:scale-95 transition-all ${
              collapsed ? 'px-0' : ''
            }`}
            title="Create New Task"
          >
            <Plus className="w-4 h-4 shrink-0" />
            {!collapsed && <span>New Task</span>}
          </button>
        )}

        {/* Navigation items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all ${
                  isActive
                    ? 'bg-surface-container-high text-primary font-semibold shadow-sm border border-primary/20'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
                } ${collapsed ? 'justify-center px-0' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-primary' : 'text-outline'}`} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer information */}
      {!collapsed && (
        <div className="p-3 border-t border-surface-container-high/40">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-surface-container-high to-surface-container-low border border-surface-container-high flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-secondary shrink-0" />
            <div className="min-w-0">
              <div className="text-[11px] font-semibold text-on-surface truncate">Sprint Pace</div>
              <div className="text-[10px] font-mono text-tertiary font-medium">94% On Time Velocity</div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
