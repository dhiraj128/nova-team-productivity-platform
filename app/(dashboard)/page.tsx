'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  Folder,
  Rocket,
  AlarmClock,
  CheckCircle2,
  Plus,
  Zap,
  BarChart3,
  Calendar,
  ArrowRight,
  TrendingUp,
  Loader2,
} from 'lucide-react';
import { UserAvatar } from '@/components/branding/UserAvatar';
import { calculateProjectProgress, formatDate, getPriorityBadgeStyle } from '@/lib/utils';
import { CreateTaskModal } from '@/components/tasks/CreateTaskModal';
import { CreateProjectModal } from '@/components/projects/CreateProjectModal';

export default function DashboardPage() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  const currentUser = session?.user || {
    name: 'Dheeraj Kumar',
  };

  const loadDashboardData = async () => {
    try {
      const [projRes, taskRes, actRes] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/tasks'),
        fetch('/api/activity?limit=6'),
      ]);

      if (projRes.ok && taskRes.ok && actRes.ok) {
        const projData = await projRes.json();
        const taskData = await taskRes.json();
        const actData = await actRes.json();

        setProjects(Array.isArray(projData) ? projData : []);
        setTasks(Array.isArray(taskData) ? taskData : []);
        setActivities(Array.isArray(actData) ? actData : []);
      }
    } catch (e) {
      console.error('Error loading dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Calculated Metrics from DB
  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.status === 'IN_PROGRESS' || p.status === 'PLANNING');
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED');
  const dueSoonTasks = tasks.filter(
    (t) => t.status !== 'COMPLETED' && (t.priority === 'URGENT' || t.priority === 'HIGH')
  );

  const todoCount = tasks.filter((t) => t.status === 'TODO').length;
  const inProgressCount = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const reviewCount = tasks.filter((t) => t.status === 'REVIEW').length;
  const doneCount = completedTasks.length;

  const filteredTasks = statusFilter === 'ALL'
    ? tasks
    : tasks.filter((t) => t.status === statusFilter);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Greeting & Contextual Aura Section */}
      <section className="relative overflow-hidden rounded-xl bg-gradient-to-br from-surface-container-high via-surface-container to-surface-container-low p-6 shadow-md border border-surface-container-high/60">
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-primary-container/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-12 bottom-0 w-32 h-32 bg-secondary/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-primary/10 text-primary font-mono text-[10px] uppercase tracking-wider font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
              Workspace Live
            </span>
            <span className="font-mono text-xs text-on-surface-variant flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Today, {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-semibold text-on-surface tracking-tight">
            Good morning, {currentUser.name?.split(' ')[0] || 'Dheeraj'}
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            Here&apos;s what&apos;s happening across your team&apos;s high-velocity projects.
          </p>

          {/* Quick Action Launcher Strip */}
          <div className="flex items-center gap-2 pt-2 overflow-x-auto">
            <button
              onClick={() => setIsTaskModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-on-primary font-medium text-xs shadow-sm hover:bg-primary-container hover:text-on-primary-container active:scale-95 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              New Task
            </button>
            <button
              onClick={() => setIsProjectModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-variant text-on-surface hover:bg-surface-bright font-medium text-xs active:scale-95 transition-all shrink-0"
            >
              <Folder className="w-4 h-4" />
              New Project
            </button>
            <Link
              href="/reports"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-variant text-on-surface hover:bg-surface-bright font-medium text-xs active:scale-95 transition-all shrink-0"
            >
              <BarChart3 className="w-4 h-4" />
              Sprint Report
            </Link>
          </div>
        </div>
      </section>

      {/* Metric Cards: 2x2 / 4-Col Bento Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Projects */}
        <div className="flex flex-col justify-between p-4 rounded-xl bg-surface-container border border-surface-container-high/60 shadow-sm">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-mono text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold">
              Total Projects
            </span>
            <div className="w-7 h-7 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
              <Folder className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-on-surface">{totalProjects}</div>
            <div className="flex items-center gap-1 mt-1 text-tertiary font-mono text-[11px]">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+2 active this sprint</span>
            </div>
          </div>
        </div>

        {/* Active Projects */}
        <div className="flex flex-col justify-between p-4 rounded-xl bg-surface-container border border-surface-container-high/60 shadow-sm">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-mono text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold">
              Active Projects
            </span>
            <div className="w-7 h-7 rounded-lg bg-secondary-container/20 flex items-center justify-center text-secondary">
              <Rocket className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-on-surface">{activeProjects.length}</div>
            <div className="flex items-center gap-1 mt-1 text-on-surface-variant font-mono text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
              <span>{projects.filter((p) => p.status === 'IN_PROGRESS').length} in progress</span>
            </div>
          </div>
        </div>

        {/* Due Soon */}
        <div className="flex flex-col justify-between p-4 rounded-xl bg-surface-container border border-surface-container-high/60 shadow-sm">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-mono text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold">
              Due Soon / Urgent
            </span>
            <div className="w-7 h-7 rounded-lg bg-error-container/40 flex items-center justify-center text-error">
              <AlarmClock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-on-surface">{dueSoonTasks.length}</div>
            <div className="flex items-center gap-1 mt-1 text-error font-mono text-[11px]">
              <span>{tasks.filter((t) => t.priority === 'URGENT').length} urgent priorities</span>
            </div>
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="flex flex-col justify-between p-4 rounded-xl bg-surface-container border border-surface-container-high/60 shadow-sm">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-mono text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold">
              Completed Tasks
            </span>
            <div className="w-7 h-7 rounded-lg bg-tertiary-container/30 flex items-center justify-center text-tertiary">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-on-surface">{completedTasks.length}</div>
            <div className="flex items-center gap-1 mt-1 text-tertiary font-mono text-[11px]">
              <span>
                {totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 100}% velocity
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Task Status Overview Pills Filter */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-on-surface">Task Pipeline Breakdown</h2>
          <span className="font-mono text-xs text-on-surface-variant">{totalTasks} Total Tasks</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors shrink-0 ${
              statusFilter === 'ALL'
                ? 'bg-primary text-on-primary font-semibold'
                : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span>All</span>
            <span className="px-1.5 py-0.2 rounded bg-surface-variant text-[10px]">{totalTasks}</span>
          </button>
          <button
            onClick={() => setStatusFilter('TODO')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors shrink-0 ${
              statusFilter === 'TODO'
                ? 'bg-outline text-surface-container-lowest font-semibold'
                : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-outline" />
            <span>To Do</span>
            <span className="px-1.5 py-0.2 rounded bg-surface-variant text-[10px]">{todoCount}</span>
          </button>
          <button
            onClick={() => setStatusFilter('IN_PROGRESS')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors shrink-0 ${
              statusFilter === 'IN_PROGRESS'
                ? 'bg-primary text-on-primary font-semibold'
                : 'bg-surface-container-high text-primary hover:bg-surface-bright'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span>In Progress</span>
            <span className="px-1.5 py-0.2 rounded bg-primary/20 text-primary text-[10px]">{inProgressCount}</span>
          </button>
          <button
            onClick={() => setStatusFilter('REVIEW')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors shrink-0 ${
              statusFilter === 'REVIEW'
                ? 'bg-secondary text-on-secondary font-semibold'
                : 'bg-surface-container-high text-secondary hover:bg-surface-bright'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-secondary" />
            <span>Review</span>
            <span className="px-1.5 py-0.2 rounded bg-secondary-container/30 text-secondary text-[10px]">
              {reviewCount}
            </span>
          </button>
          <button
            onClick={() => setStatusFilter('COMPLETED')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors shrink-0 ${
              statusFilter === 'COMPLETED'
                ? 'bg-tertiary text-on-tertiary font-semibold'
                : 'bg-surface-container-high text-tertiary hover:bg-surface-bright'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-tertiary" />
            <span>Completed</span>
            <span className="px-1.5 py-0.2 rounded bg-tertiary-container/30 text-tertiary text-[10px]">
              {doneCount}
            </span>
          </button>
        </div>
      </section>

      {/* Key Projects Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-on-surface">Key Projects</h2>
            <span className="px-2 py-0.5 rounded bg-surface-variant text-on-surface-variant font-mono text-[10px]">
              Active {projects.length}
            </span>
          </div>
          <Link
            href="/projects"
            className="font-mono text-xs text-primary flex items-center gap-1 hover:underline"
          >
            View all projects
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 text-on-surface-variant">
            <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
            Loading projects...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((proj) => {
              const progress = calculateProjectProgress(proj.tasks || []);
              return (
                <div
                  key={proj.id}
                  className="flex flex-col justify-between rounded-xl bg-surface-container border border-surface-container-high/60 p-4 shadow-sm hover:border-primary/40 transition-all group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-1">
                      <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-mono text-[10px] uppercase font-semibold">
                        {proj.status.replace('_', ' ')}
                      </span>
                      <span className={`px-2 py-0.5 rounded font-mono text-[10px] uppercase ${getPriorityBadgeStyle(proj.priority)}`}>
                        {proj.priority}
                      </span>
                    </div>
                    <Link href={`/projects/${proj.id}`}>
                      <h3 className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors line-clamp-1 mt-1">
                        {proj.name}
                      </h3>
                    </Link>
                    <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                      {proj.description}
                    </p>
                  </div>

                  <div className="mt-4 space-y-3">
                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between items-center text-xs font-mono mb-1">
                        <span className="text-on-surface-variant">
                          {proj.tasks?.filter((t: any) => t.status === 'COMPLETED').length || 0}/
                          {proj.tasks?.length || 0} tasks
                        </span>
                        <span className="text-tertiary font-bold">{progress}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
                        <div
                          className="h-full bg-tertiary rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Footer: Avatars + Deadline */}
                    <div className="flex items-center justify-between pt-2 border-t border-surface-container-high/40">
                      <div className="flex items-center -space-x-2">
                        {proj.members?.slice(0, 3).map((m: any) => (
                          <UserAvatar
                            key={m.id || m.userId}
                            name={m.user?.name}
                            image={m.user?.image}
                            size="xs"
                          />
                        ))}
                        {proj.members?.length > 3 && (
                          <div className="w-6 h-6 rounded-full bg-surface-container-highest text-on-surface-variant font-mono text-[9px] flex items-center justify-center font-bold ring-1 ring-surface-container">
                            +{proj.members.length - 3}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1 font-mono text-[10px] text-on-surface-variant">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(proj.dueDate, 'MMM dd')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Recent Activity Timeline Section */}
      <section className="space-y-3 pt-2">
        <h2 className="text-base font-semibold text-on-surface">Recent Team Activity</h2>
        <div className="bg-surface-container border border-surface-container-high/60 rounded-xl p-4 divide-y divide-surface-container-high/50">
          {activities.length === 0 ? (
            <div className="text-xs text-on-surface-variant py-4 text-center">No recent activity</div>
          ) : (
            activities.map((act) => (
              <div key={act.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center gap-3">
                <UserAvatar name={act.user?.name} image={act.user?.image} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-on-surface leading-snug">
                    <span className="font-semibold">{act.user?.name || 'User'}</span> {act.description}
                  </p>
                  <span className="text-[10px] font-mono text-outline">
                    {formatDate(act.createdAt, 'MMM dd, hh:mm a')}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Modals */}
      <CreateTaskModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} onSuccess={loadDashboardData} />
      <CreateProjectModal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} onSuccess={loadDashboardData} />
    </div>
  );
}
