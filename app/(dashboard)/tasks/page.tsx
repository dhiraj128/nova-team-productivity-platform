'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CheckSquare,
  Search,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
} from 'lucide-react';
import { formatDate, getPriorityBadgeStyle } from '@/lib/utils';
import { UserAvatar } from '@/components/branding/UserAvatar';

export default function MyTasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'today' | 'upcoming' | 'overdue' | 'completed'>('today');

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tasks');
      if (res.ok) {
        const data = await res.json();
        setTasks(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const overdueTasks = tasks.filter((t) => t.status !== 'COMPLETED' && t.dueDate && new Date(t.dueDate) < todayStart);
  const todayTasks = tasks.filter((t) => t.status !== 'COMPLETED' && t.dueDate && new Date(t.dueDate) >= todayStart);
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED');
  const upcomingTasks = tasks.filter((t) => t.status !== 'COMPLETED');

  const currentList =
    tab === 'today'
      ? todayTasks
      : tab === 'overdue'
      ? overdueTasks
      : tab === 'completed'
      ? completedTasks
      : upcomingTasks;

  const filtered = currentList.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.key.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">My Tasks</h1>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            Track and complete your personal assigned task list.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setTab('today')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
            tab === 'today'
              ? 'bg-primary text-on-primary font-semibold'
              : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Today / Active ({todayTasks.length})</span>
        </button>

        <button
          onClick={() => setTab('overdue')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
            tab === 'overdue'
              ? 'bg-error text-on-error font-semibold'
              : 'bg-surface-container-low text-error hover:bg-error-container/20'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Overdue ({overdueTasks.length})</span>
        </button>

        <button
          onClick={() => setTab('completed')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
            tab === 'completed'
              ? 'bg-tertiary text-on-tertiary font-semibold'
              : 'bg-surface-container-low text-tertiary hover:bg-tertiary-container/20'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Completed ({completedTasks.length})</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-outline" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter my tasks..."
          className="w-full bg-surface-container-low text-on-surface placeholder:text-outline text-xs sm:text-sm pl-10 pr-4 py-2 rounded-xl border border-surface-container-high focus:outline-none focus:border-primary"
        />
      </div>

      {/* Task List */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-on-surface-variant">
          <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
          Loading your tasks...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-surface-container rounded-xl border border-surface-container-high/60 p-8 text-xs text-on-surface-variant">
          No tasks found in this view.
        </div>
      ) : (
        <div className="bg-surface-container-low border border-surface-container-high/60 rounded-xl overflow-hidden divide-y divide-surface-container-high">
          {filtered.map((t) => (
            <Link
              key={t.id}
              href={`/projects/${t.projectId}/tasks/${t.id}`}
              className="p-4 flex items-center justify-between gap-4 hover:bg-surface-container transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-mono text-xs font-semibold text-secondary">{t.key}</span>
                <div className="min-w-0">
                  <span className="text-xs sm:text-sm font-semibold text-on-surface group-hover:text-primary transition-colors block truncate">
                    {t.title}
                  </span>
                  <span className="text-[10px] font-mono text-outline">{t.project?.name}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className={`px-2 py-0.5 rounded font-mono text-[10px] uppercase ${getPriorityBadgeStyle(t.priority)}`}>
                  {t.priority}
                </span>
                <span className="text-xs font-mono text-on-surface-variant hidden sm:inline">
                  {formatDate(t.dueDate, 'MMM dd')}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
