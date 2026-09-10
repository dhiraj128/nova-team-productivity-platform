'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, CheckCircle2, Clock, Zap, Loader2 } from 'lucide-react';

export default function ReportsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetch('/api/projects'), fetch('/api/tasks')])
      .then(async ([pRes, tRes]) => {
        const pData = await pRes.json();
        const tData = await tRes.json();
        setProjects(Array.isArray(pData) ? pData : []);
        setTasks(Array.isArray(tData) ? tData : []);
        setLoading(false);
      })
      .catch((e) => console.error(e));
  }, []);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const urgentCount = tasks.filter((t) => t.priority === 'URGENT').length;
  const highCount = tasks.filter((t) => t.priority === 'HIGH').length;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <div>
        <h1 className="text-2xl font-bold text-on-surface tracking-tight">Productivity & Velocity Reports</h1>
        <p className="text-xs sm:text-sm text-on-surface-variant">
          Real-time metrics, team workload, and sprint completion analytics.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-on-surface-variant">
          <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
          Calculating telemetry analytics...
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl bg-surface-container-low border border-surface-container-high/60 space-y-2">
              <span className="font-mono text-xs text-outline uppercase font-semibold">Sprint Velocity Rate</span>
              <div className="text-3xl font-bold text-tertiary">{completionRate}%</div>
              <p className="text-xs text-on-surface-variant">{completedTasks} of {totalTasks} tasks finished</p>
            </div>

            <div className="p-5 rounded-xl bg-surface-container-low border border-surface-container-high/60 space-y-2">
              <span className="font-mono text-xs text-outline uppercase font-semibold">High Priority Backlog</span>
              <div className="text-3xl font-bold text-error">{urgentCount + highCount}</div>
              <p className="text-xs text-on-surface-variant">{urgentCount} Urgent, {highCount} High priority tasks</p>
            </div>

            <div className="p-5 rounded-xl bg-surface-container-low border border-surface-container-high/60 space-y-2">
              <span className="font-mono text-xs text-outline uppercase font-semibold">Active Workspaces</span>
              <div className="text-3xl font-bold text-secondary">{projects.length}</div>
              <p className="text-xs text-on-surface-variant">Across frontend, mobile, and backend teams</p>
            </div>
          </div>

          {/* Graphical Telemetry Bars */}
          <div className="bg-surface-container-low border border-surface-container-high/60 rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-on-surface font-mono">Task Status Distribution</h2>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1 text-on-surface-variant">
                  <span>Completed</span>
                  <span className="text-tertiary">{completedTasks} tasks</span>
                </div>
                <div className="w-full h-3 bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-tertiary" style={{ width: `${completionRate}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1 text-on-surface-variant">
                  <span>In Progress</span>
                  <span className="text-primary">{tasks.filter((t) => t.status === 'IN_PROGRESS').length} tasks</span>
                </div>
                <div className="w-full h-3 bg-surface-container-highest rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${(tasks.filter((t) => t.status === 'IN_PROGRESS').length / (totalTasks || 1)) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1 text-on-surface-variant">
                  <span>Under Review</span>
                  <span className="text-secondary">{tasks.filter((t) => t.status === 'REVIEW').length} tasks</span>
                </div>
                <div className="w-full h-3 bg-surface-container-highest rounded-full overflow-hidden">
                  <div
                    className="h-full bg-secondary"
                    style={{ width: `${(tasks.filter((t) => t.status === 'REVIEW').length / (totalTasks || 1)) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
