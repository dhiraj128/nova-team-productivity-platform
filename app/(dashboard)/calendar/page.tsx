'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar as CalendarIcon, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function CalendarPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tasks')
      .then((res) => res.json())
      .then((data) => {
        setTasks(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((e) => console.error(e));
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <div>
        <h1 className="text-2xl font-bold text-on-surface tracking-tight">Task & Project Calendar</h1>
        <p className="text-xs sm:text-sm text-on-surface-variant">
          Visualize task deadlines and sprint milestones across time.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-on-surface-variant">
          <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
          Loading calendar deadlines...
        </div>
      ) : (
        <div className="bg-surface-container-low border border-surface-container-high/60 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold font-mono text-on-surface">November 2026</h2>
            <div className="flex items-center gap-1">
              <button className="p-1 rounded bg-surface-container hover:bg-surface-bright text-on-surface-variant">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="p-1 rounded bg-surface-container hover:bg-surface-bright text-on-surface-variant">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Calendar Grid Representation */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-mono font-semibold text-outline pb-2 border-b border-surface-container-high">
            <span>SUN</span>
            <span>MON</span>
            <span>TUE</span>
            <span>WED</span>
            <span>THU</span>
            <span>FRI</span>
            <span>SAT</span>
          </div>

          <div className="grid grid-cols-7 gap-2 text-xs">
            {Array.from({ length: 30 }).map((_, i) => {
              const dayNum = i + 1;
              const dayTasks = tasks.filter((t) => {
                if (!t.dueDate) return false;
                const d = new Date(t.dueDate);
                return d.getDate() === dayNum;
              });

              return (
                <div
                  key={i}
                  className="min-h-[70px] p-1.5 rounded-lg bg-surface-container border border-surface-container-high/40 flex flex-col justify-between"
                >
                  <span className="font-mono text-[10px] text-outline font-semibold text-right">{dayNum}</span>
                  <div className="space-y-1">
                    {dayTasks.map((t) => (
                      <Link
                        key={t.id}
                        href={`/projects/${t.projectId}/tasks/${t.id}`}
                        className="block px-1 py-0.5 rounded bg-primary/10 text-primary text-[9px] font-mono truncate hover:bg-primary/20"
                      >
                        {t.key}: {t.title}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
