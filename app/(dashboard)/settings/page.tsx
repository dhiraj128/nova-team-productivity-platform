'use client';

import React from 'react';
import { Settings, Shield, Bell, Moon, Database } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6 animate-fadeIn pb-12 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-on-surface tracking-tight">Workspace Settings</h1>
        <p className="text-xs sm:text-sm text-on-surface-variant">
          Configure application preferences, dark-mode themes, and notifications.
        </p>
      </div>

      <div className="bg-surface-container-low border border-surface-container-high/60 rounded-xl p-6 space-y-6 shadow-md">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3.5 rounded-lg bg-surface-container border border-surface-container-high/40">
            <div className="flex items-center gap-3">
              <Moon className="w-5 h-5 text-primary" />
              <div>
                <div className="text-xs font-semibold text-on-surface">Dark Theme System</div>
                <div className="text-[11px] text-on-surface-variant">Stitch #0b1326 slate palette active</div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-mono text-[10px] uppercase font-semibold">
              Default Dark
            </span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-lg bg-surface-container border border-surface-container-high/40">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-secondary" />
              <div>
                <div className="text-xs font-semibold text-on-surface">In-App Notifications</div>
                <div className="text-[11px] text-on-surface-variant">Receive alerts on task assignment & comments</div>
              </div>
            </div>
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded bg-surface-variant text-primary accent-primary" />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-lg bg-surface-container border border-surface-container-high/40">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-tertiary" />
              <div>
                <div className="text-xs font-semibold text-on-surface">Database Driver</div>
                <div className="text-[11px] text-on-surface-variant">Prisma ORM + PostgreSQL / SQLite</div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-tertiary-container/30 text-tertiary font-mono text-[10px] uppercase font-semibold">
              Connected
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
