'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ListFilter,
  Users,
  History,
  Plus,
  Share2,
  Settings,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  Trash2,
  UserPlus,
  MessageSquare,
  Paperclip,
  CheckSquare,
  GripVertical,
} from 'lucide-react';
import { UserAvatar } from '@/components/branding/UserAvatar';
import { calculateProjectProgress, formatDate, getPriorityBadgeStyle } from '@/lib/utils';
import { CreateTaskModal } from '@/components/tasks/CreateTaskModal';

export default function ProjectWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'kanban' | 'list' | 'team' | 'activity'>('kanban');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedColumnStatus, setSelectedColumnStatus] = useState<string>('TODO');

  // Drag State
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  // New Member Modal State
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState('Member');
  const [memberError, setMemberError] = useState('');

  const fetchProjectDetails = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      if (res.ok) {
        const data = await res.json();
        setProject(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [projectId]);

  // Drag and drop status handlers
  const handleDragStart = (taskId: string) => {
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (newStatus: string) => {
    if (!draggedTaskId) return;

    // Optimistic UI update
    const updatedTasks = project.tasks.map((t: any) =>
      t.id === draggedTaskId ? { ...t, status: newStatus } : t
    );
    setProject({ ...project, tasks: updatedTasks });

    try {
      await fetch(`/api/tasks/${draggedTaskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchProjectDetails();
    } catch (e) {
      console.error('Drag update error:', e);
      fetchProjectDetails();
    } finally {
      setDraggedTaskId(null);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberEmail.trim()) return;

    try {
      const res = await fetch(`/api/projects/${projectId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: memberEmail, role: memberRole }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to add member');
      }

      setMemberEmail('');
      setIsAddMemberOpen(false);
      fetchProjectDetails();
    } catch (err: any) {
      setMemberError(err.message || 'Could not add member.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-on-surface-variant">
        <Loader2 className="w-8 h-8 animate-spin text-primary mr-3" />
        Loading workspace project...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-16 text-on-surface-variant space-y-3">
        <p>Project not found or deleted.</p>
        <Link href="/projects" className="text-xs text-primary underline">
          Return to Projects Directory
        </Link>
      </div>
    );
  }

  const tasks = project.tasks || [];
  const todoTasks = tasks.filter((t: any) => t.status === 'TODO');
  const inProgressTasks = tasks.filter((t: any) => t.status === 'IN_PROGRESS');
  const reviewTasks = tasks.filter((t: any) => t.status === 'REVIEW');
  const completedTasks = tasks.filter((t: any) => t.status === 'COMPLETED');

  const progress = calculateProjectProgress(tasks);

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Project Banner & Meta Overview */}
      <section className="relative overflow-hidden rounded-xl bg-surface-container-low border border-surface-container-high/60 p-6 space-y-4 shadow-md">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-24 -left-20 w-48 h-48 bg-secondary-container/10 rounded-full blur-2xl pointer-events-none" />

        {/* Title and Status Chips */}
        <div className="relative z-10 space-y-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-tertiary-container/30 text-tertiary font-mono text-[10px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" />
                {project.status.replace('_', ' ')}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-mono text-[10px] ${getPriorityBadgeStyle(project.priority)}`}>
                {project.priority}
              </span>
            </div>
            <span className="font-mono text-xs text-on-surface-variant flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Due {formatDate(project.dueDate, 'MMM dd, yyyy')}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
            {project.name}
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed max-w-3xl">
            {project.description}
          </p>
        </div>

        {/* Live Metric Bento Strip */}
        <div className="p-4 rounded-xl bg-surface-container border border-surface-container-high/60 space-y-3 shadow-inner">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center text-primary">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase text-on-surface-variant font-semibold">
                  SPRINT PACE
                </p>
                <p className="text-sm font-semibold text-on-surface">{progress}% Completed</p>
              </div>
            </div>
            <div className="text-right font-mono text-xs">
              <span className="text-tertiary font-bold text-base">{completedTasks.length}</span>
              <span className="text-on-surface-variant"> / {tasks.length} tasks</span>
            </div>
          </div>

          {/* Progress Gauge */}
          <div className="w-full bg-surface-container-highest rounded-full h-2 overflow-hidden flex">
            <div
              className="bg-tertiary h-full transition-all duration-500"
              style={{ width: `${(completedTasks.length / (tasks.length || 1)) * 100}%` }}
            />
            <div
              className="bg-primary h-full transition-all duration-500"
              style={{ width: `${(inProgressTasks.length / (tasks.length || 1)) * 100}%` }}
            />
            <div
              className="bg-secondary h-full transition-all duration-500"
              style={{ width: `${(reviewTasks.length / (tasks.length || 1)) * 100}%` }}
            />
          </div>

          {/* Task Velocity Pills */}
          <div className="flex items-center justify-between text-xs font-mono text-on-surface-variant pt-1">
            <span className="flex items-center gap-1 text-tertiary">
              <span className="w-2 h-2 rounded-full bg-tertiary" /> {completedTasks.length} Done
            </span>
            <span className="flex items-center gap-1 text-primary">
              <span className="w-2 h-2 rounded-full bg-primary" /> {inProgressTasks.length} In Progress
            </span>
            <span className="flex items-center gap-1 text-secondary">
              <span className="w-2 h-2 rounded-full bg-secondary" /> {reviewTasks.length} Review
            </span>
            <span className="flex items-center gap-1 text-outline">
              <span className="w-2 h-2 rounded-full bg-outline" /> {todoTasks.length} To Do
            </span>
          </div>
        </div>

        {/* Quick Action Floating Bar */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => {
              setSelectedColumnStatus('TODO');
              setIsTaskModalOpen(true);
            }}
            className="flex-1 py-2 px-3 rounded-lg bg-primary text-on-primary font-medium text-xs flex items-center justify-center gap-1.5 shadow-md hover:bg-primary-container hover:text-on-primary-container active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
          <button
            onClick={() => setIsAddMemberOpen(true)}
            className="py-2 px-3 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <UserPlus className="w-4 h-4 text-secondary" />
            <span>Add Member</span>
          </button>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="border-b border-surface-container-high">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('kanban')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'kanban'
                ? 'bg-surface-container-highest text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Kanban Board
          </button>

          <button
            onClick={() => setActiveTab('list')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'list'
                ? 'bg-surface-container-highest text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <ListFilter className="w-4 h-4" />
            List View ({tasks.length})
          </button>

          <button
            onClick={() => setActiveTab('team')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'team'
                ? 'bg-surface-container-highest text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Users className="w-4 h-4" />
            Team ({project.members?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab('activity')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'activity'
                ? 'bg-surface-container-highest text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <History className="w-4 h-4" />
            Activity Timeline
          </button>
        </div>
      </div>

      {/* TAB 1: KANBAN BOARD */}
      {activeTab === 'kanban' && (
        <div className="overflow-x-auto pb-6 scrollbar-none">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 min-w-[900px]">
            {/* Column 1: TO DO */}
            <div
              onDragOver={handleDragOver}
              onDrop={() => handleDrop('TODO')}
              className="flex flex-col gap-3 bg-surface-container-lowest/80 border border-surface-container-high/60 rounded-xl p-3 min-h-[500px]"
            >
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-outline" />
                  <h3 className="font-semibold text-xs text-on-surface">To Do</h3>
                  <span className="px-1.5 py-0.2 rounded bg-surface-container-high text-on-surface-variant font-mono text-[10px]">
                    {todoTasks.length}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSelectedColumnStatus('TODO');
                    setIsTaskModalOpen(true);
                  }}
                  className="text-on-surface-variant hover:text-primary p-1"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 flex-1">
                {todoTasks.map((t: any) => (
                  <TaskCard key={t.id} task={t} onDragStart={() => handleDragStart(t.id)} />
                ))}
              </div>
            </div>

            {/* Column 2: IN PROGRESS */}
            <div
              onDragOver={handleDragOver}
              onDrop={() => handleDrop('IN_PROGRESS')}
              className="flex flex-col gap-3 bg-surface-container-lowest/80 border border-surface-container-high/60 rounded-xl p-3 min-h-[500px]"
            >
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                  <h3 className="font-semibold text-xs text-on-surface">In Progress</h3>
                  <span className="px-1.5 py-0.2 rounded bg-primary/20 text-primary font-mono text-[10px]">
                    {inProgressTasks.length}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSelectedColumnStatus('IN_PROGRESS');
                    setIsTaskModalOpen(true);
                  }}
                  className="text-on-surface-variant hover:text-primary p-1"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 flex-1">
                {inProgressTasks.map((t: any) => (
                  <TaskCard key={t.id} task={t} onDragStart={() => handleDragStart(t.id)} />
                ))}
              </div>
            </div>

            {/* Column 3: REVIEW */}
            <div
              onDragOver={handleDragOver}
              onDrop={() => handleDrop('REVIEW')}
              className="flex flex-col gap-3 bg-surface-container-lowest/80 border border-surface-container-high/60 rounded-xl p-3 min-h-[500px]"
            >
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-secondary" />
                  <h3 className="font-semibold text-xs text-on-surface">In Review</h3>
                  <span className="px-1.5 py-0.2 rounded bg-secondary-container/30 text-secondary font-mono text-[10px]">
                    {reviewTasks.length}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSelectedColumnStatus('REVIEW');
                    setIsTaskModalOpen(true);
                  }}
                  className="text-on-surface-variant hover:text-primary p-1"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 flex-1">
                {reviewTasks.map((t: any) => (
                  <TaskCard key={t.id} task={t} onDragStart={() => handleDragStart(t.id)} />
                ))}
              </div>
            </div>

            {/* Column 4: COMPLETED */}
            <div
              onDragOver={handleDragOver}
              onDrop={() => handleDrop('COMPLETED')}
              className="flex flex-col gap-3 bg-surface-container-lowest/80 border border-surface-container-high/60 rounded-xl p-3 min-h-[500px]"
            >
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-tertiary" />
                  <h3 className="font-semibold text-xs text-on-surface">Completed</h3>
                  <span className="px-1.5 py-0.2 rounded bg-tertiary-container/30 text-tertiary font-mono text-[10px]">
                    {completedTasks.length}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSelectedColumnStatus('COMPLETED');
                    setIsTaskModalOpen(true);
                  }}
                  className="text-on-surface-variant hover:text-primary p-1"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 flex-1">
                {completedTasks.map((t: any) => (
                  <TaskCard key={t.id} task={t} onDragStart={() => handleDragStart(t.id)} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LIST VIEW */}
      {activeTab === 'list' && (
        <div className="bg-surface-container-low border border-surface-container-high/60 rounded-xl overflow-hidden divide-y divide-surface-container-high">
          {tasks.map((t: any) => (
            <Link
              key={t.id}
              href={`/projects/${projectId}/tasks/${t.id}`}
              className="p-3.5 flex items-center justify-between gap-4 hover:bg-surface-container transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-mono text-xs font-semibold text-secondary">{t.key}</span>
                <span className="text-xs font-medium text-on-surface group-hover:text-primary transition-colors truncate">
                  {t.title}
                </span>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <span className={`px-2 py-0.5 rounded font-mono text-[10px] uppercase ${getPriorityBadgeStyle(t.priority)}`}>
                  {t.priority}
                </span>
                <span className="px-2 py-0.5 rounded bg-surface-container-highest text-on-surface-variant font-mono text-[10px] uppercase">
                  {t.status.replace('_', ' ')}
                </span>
                <UserAvatar name={t.assignee?.name} image={t.assignee?.image} size="xs" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* TAB 3: TEAM MEMBERS */}
      {activeTab === 'team' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-on-surface">Project Team Members</h3>
            <button
              onClick={() => setIsAddMemberOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-on-primary font-medium text-xs"
            >
              <UserPlus className="w-4 h-4" /> Add Member
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {project.members?.map((m: any) => (
              <div
                key={m.id}
                className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high/60 flex items-center gap-3"
              >
                <UserAvatar name={m.user?.name} image={m.user?.image} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-on-surface truncate">{m.user?.name}</div>
                  <div className="text-xs text-on-surface-variant truncate">{m.user?.role || m.user?.email}</div>
                  <span className="inline-block mt-1 px-2 py-0.2 rounded bg-surface-container-highest text-primary font-mono text-[10px]">
                    Role: {m.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ACTIVITY FEED */}
      {activeTab === 'activity' && (
        <div className="bg-surface-container-low border border-surface-container-high/60 rounded-xl p-4 divide-y divide-surface-container-high/50">
          {project.activities?.map((act: any) => (
            <div key={act.id} className="py-3 flex items-start gap-3">
              <UserAvatar name={act.user?.name} image={act.user?.image} size="sm" />
              <div>
                <p className="text-xs text-on-surface">
                  <span className="font-semibold">{act.user?.name}</span> {act.description}
                </p>
                <span className="text-[10px] font-mono text-outline">{formatDate(act.createdAt, 'MMM dd, hh:mm a')}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Task Modal */}
      <CreateTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        defaultProjectId={projectId}
        defaultStatus={selectedColumnStatus}
        onSuccess={fetchProjectDetails}
      />

      {/* Add Member Modal */}
      {isAddMemberOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-md bg-surface-container-low border border-surface-container-high rounded-xl p-6 space-y-4">
            <h3 className="text-base font-semibold text-on-surface">Add Team Member to Project</h3>
            {memberError && <div className="text-xs text-error">{memberError}</div>}
            <form onSubmit={handleAddMember} className="space-y-3">
              <div>
                <label className="block text-xs font-mono uppercase text-on-surface-variant mb-1">User Email</label>
                <input
                  type="email"
                  required
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  placeholder="e.g. rahul@nova.app"
                  className="w-full px-3 py-2 rounded-lg bg-surface-container border border-surface-container-high text-xs text-on-surface focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-on-surface-variant mb-1">Project Role</label>
                <select
                  value={memberRole}
                  onChange={(e) => setMemberRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-container border border-surface-container-high text-xs text-on-surface focus:outline-none"
                >
                  <option value="Member">Member</option>
                  <option value="Admin">Admin</option>
                  <option value="Owner">Owner</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddMemberOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-surface-container text-xs text-on-surface-variant"
                >
                  Cancel
                </button>
                <button type="submit" className="px-3 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-medium">
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Kanban Task Card Component
function TaskCard({ task, onDragStart }: { task: any; onDragStart: () => void }) {
  const completedSubtasks = task.subtasks?.filter((s: any) => s.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="p-3.5 rounded-xl bg-surface-container border border-surface-container-high/60 shadow-sm space-y-2.5 hover:border-primary/40 transition-all cursor-grab active:cursor-grabbing group"
    >
      <div className="flex items-center justify-between gap-1">
        <span className={`px-1.5 py-0.5 rounded font-mono text-[9px] uppercase ${getPriorityBadgeStyle(task.priority)}`}>
          {task.priority}
        </span>
        <div className="flex items-center gap-1 text-outline">
          <span className="font-mono text-[10px] text-secondary font-semibold">{task.key}</span>
          <GripVertical className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      <Link href={`/projects/${task.projectId}/tasks/${task.id}`}>
        <p className="text-xs font-semibold text-on-surface leading-snug group-hover:text-primary transition-colors line-clamp-2">
          {task.title}
        </p>
      </Link>

      <div className="flex items-center justify-between pt-1 font-mono text-[10px] text-on-surface-variant border-t border-surface-container-high/30">
        <div className="flex items-center gap-2">
          {totalSubtasks > 0 && (
            <span className="flex items-center gap-0.5">
              <CheckSquare className="w-3 h-3 text-tertiary" /> {completedSubtasks}/{totalSubtasks}
            </span>
          )}
          {task.comments?.length > 0 && (
            <span className="flex items-center gap-0.5">
              <MessageSquare className="w-3 h-3 text-secondary" /> {task.comments.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <span>{formatDate(task.dueDate, 'MMM dd')}</span>
          <UserAvatar name={task.assignee?.name} image={task.assignee?.image} size="xs" />
        </div>
      </div>
    </div>
  );
}
