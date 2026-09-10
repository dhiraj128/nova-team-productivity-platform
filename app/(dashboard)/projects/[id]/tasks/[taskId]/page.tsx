'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle,
  Star,
  MoreHorizontal,
  X,
  Edit2,
  Calendar,
  FolderOpen,
  FileText,
  CheckSquare,
  Paperclip,
  MessageSquare,
  Send,
  Loader2,
  Flame,
  User,
  Plus,
} from 'lucide-react';
import { UserAvatar } from '@/components/branding/UserAvatar';
import { formatDate, formatRelativeTime, getPriorityBadgeStyle } from '@/lib/utils';

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const taskId = params.taskId as string;

  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newCommentContent, setNewCommentContent] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [isStarred, setIsStarred] = useState(false);

  const fetchTaskDetails = async () => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`);
      if (res.ok) {
        const data = await res.json();
        setTask(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskDetails();
  }, [taskId]);

  const handleStatusChange = async (newStatus: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) fetchTaskDetails();
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleSubtask = async (subtaskId: string, currentCompleted: boolean) => {
    try {
      await fetch(`/api/tasks/${taskId}/subtasks`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subtaskId, completed: !currentCompleted }),
      });
      fetchTaskDetails();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    try {
      await fetch(`/api/tasks/${taskId}/subtasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newSubtaskTitle.trim() }),
      });
      setNewSubtaskTitle('');
      fetchTaskDetails();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentContent.trim()) return;

    setSubmittingComment(true);
    try {
      await fetch(`/api/tasks/${taskId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newCommentContent.trim() }),
      });
      setNewCommentContent('');
      fetchTaskDetails();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-on-surface-variant">
        <Loader2 className="w-8 h-8 animate-spin text-primary mr-3" />
        Loading task details...
      </div>
    );
  }

  if (!task) {
    return (
      <div className="text-center py-16 text-on-surface-variant space-y-3">
        <p>Task not found.</p>
        <Link href={`/projects/${projectId}`} className="text-xs text-primary underline">
          Return to Project Workspace
        </Link>
      </div>
    );
  }

  const subtasks = task.subtasks || [];
  const completedSubtasksCount = subtasks.filter((s: any) => s.completed).length;
  const subtaskProgress = subtasks.length > 0 ? Math.round((completedSubtasksCount / subtasks.length) * 100) : 0;
  const isCompleted = task.status === 'COMPLETED';

  return (
    <div className="space-y-6 animate-fadeIn pb-16 max-w-4xl mx-auto">
      {/* Drawer Header Representation */}
      <div className="flex items-center justify-between border-b border-surface-container-high pb-4">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Board
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsStarred(!isStarred)}
            className={`p-2 rounded-lg border border-surface-container-high transition-colors ${
              isStarred ? 'bg-primary/20 text-primary' : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Star className="w-4 h-4" />
          </button>
          <button
            onClick={() => router.push(`/projects/${projectId}`)}
            className="p-2 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-bright transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Task Header Card */}
      <div className="bg-surface-container-low border border-surface-container-high/60 rounded-xl p-6 space-y-4 shadow-md">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-1 text-on-surface-variant">
            <span className="text-primary font-semibold">{task.project?.name || 'Project'}</span>
            <span>/</span>
            <span className="text-secondary font-medium">{task.key}</span>
          </div>
          <span className="text-outline">{formatDate(task.createdAt, 'MMM dd, yyyy')}</span>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-on-surface tracking-tight leading-snug">
          {task.title}
        </h1>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => handleStatusChange(isCompleted ? 'IN_PROGRESS' : 'COMPLETED')}
            className={`flex-1 py-2.5 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all ${
              isCompleted
                ? 'bg-tertiary text-on-tertiary hover:bg-tertiary-container'
                : 'bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            <span>{isCompleted ? 'Completed' : 'Mark Complete'}</span>
          </button>
        </div>
      </div>

      {/* Metadata Section Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {/* Status Box */}
        <div className="p-4 rounded-xl bg-surface-container border border-surface-container-high/60 space-y-1.5 shadow-sm">
          <span className="font-mono text-[10px] uppercase text-outline font-semibold">Status</span>
          <select
            value={task.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="w-full bg-surface-variant text-on-surface font-mono text-xs py-1.5 px-2 rounded-lg border border-surface-container-high focus:outline-none"
          >
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="REVIEW">Under Review</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        {/* Priority Box */}
        <div className="p-4 rounded-xl bg-surface-container border border-surface-container-high/60 space-y-1.5 shadow-sm">
          <span className="font-mono text-[10px] uppercase text-outline font-semibold">Priority</span>
          <div>
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-mono text-xs font-semibold ${getPriorityBadgeStyle(task.priority)}`}>
              <Flame className="w-3.5 h-3.5" />
              {task.priority}
            </span>
          </div>
        </div>

        {/* Assignee Box */}
        <div className="p-4 rounded-xl bg-surface-container border border-surface-container-high/60 space-y-1.5 shadow-sm">
          <span className="font-mono text-[10px] uppercase text-outline font-semibold">Assignee</span>
          <div className="flex items-center gap-2">
            <UserAvatar name={task.assignee?.name} image={task.assignee?.image} size="xs" />
            <span className="text-xs font-semibold text-on-surface truncate">
              {task.assignee?.name || 'Unassigned'}
            </span>
          </div>
        </div>

        {/* Reporter Box */}
        <div className="p-4 rounded-xl bg-surface-container border border-surface-container-high/60 space-y-1.5 shadow-sm">
          <span className="font-mono text-[10px] uppercase text-outline font-semibold">Reporter</span>
          <div className="flex items-center gap-2">
            <UserAvatar name={task.reporter?.name} image={task.reporter?.image} size="xs" />
            <span className="text-xs font-semibold text-on-surface truncate">
              {task.reporter?.name || 'Dheeraj Kumar'}
            </span>
          </div>
        </div>

        {/* Due Date */}
        <div className="p-4 rounded-xl bg-surface-container border border-surface-container-high/60 space-y-1.5 shadow-sm">
          <span className="font-mono text-[10px] uppercase text-outline font-semibold">Due Date</span>
          <div className="flex items-center gap-1.5 text-xs text-error font-semibold font-mono">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(task.dueDate, 'MMM dd, yyyy')}</span>
          </div>
        </div>

        {/* Project Box */}
        <div className="p-4 rounded-xl bg-surface-container border border-surface-container-high/60 space-y-1.5 shadow-sm">
          <span className="font-mono text-[10px] uppercase text-outline font-semibold">Project</span>
          <div className="flex items-center gap-1.5 text-xs text-primary font-semibold truncate">
            <FolderOpen className="w-4 h-4" />
            <span className="truncate">{task.project?.name}</span>
          </div>
        </div>
      </div>

      {/* Description Section */}
      <div className="bg-surface-container-low border border-surface-container-high/60 rounded-xl p-5 space-y-2 shadow-sm">
        <h3 className="text-sm font-semibold text-on-surface flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          Description
        </h3>
        <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
          {task.description || 'No description provided for this task.'}
        </p>
      </div>

      {/* Subtasks Section */}
      <div className="bg-surface-container-low border border-surface-container-high/60 rounded-xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-on-surface flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-tertiary" />
              Subtasks
            </h3>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-surface-container text-on-surface-variant">
              {completedSubtasksCount}/{subtasks.length} completed
            </span>
          </div>
          <div className="w-20 h-1.5 rounded-full bg-surface-variant overflow-hidden">
            <div className="h-full bg-tertiary transition-all duration-300" style={{ width: `${subtaskProgress}%` }} />
          </div>
        </div>

        {/* Checklist */}
        <div className="space-y-2">
          {subtasks.map((sub: any) => (
            <label
              key={sub.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-surface-container border border-surface-container-high/40 hover:bg-surface-container-high/50 cursor-pointer select-none transition-colors"
            >
              <input
                type="checkbox"
                checked={sub.completed}
                onChange={() => handleToggleSubtask(sub.id, sub.completed)}
                className="w-4 h-4 rounded bg-surface-variant text-primary accent-primary cursor-pointer"
              />
              <span className={`text-xs flex-1 ${sub.completed ? 'text-outline line-through' : 'text-on-surface'}`}>
                {sub.title}
              </span>
            </label>
          ))}
        </div>

        {/* Inline Add Subtask Form */}
        <form onSubmit={handleAddSubtask} className="flex items-center gap-2 pt-1">
          <input
            type="text"
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
            placeholder="Add a new subtask item..."
            className="flex-1 bg-surface-container border border-surface-container-high rounded-lg px-3 py-2 text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-primary"
          />
          <button
            type="submit"
            className="px-3 py-2 rounded-lg bg-surface-variant hover:bg-surface-bright text-on-surface font-mono text-xs font-semibold transition-colors"
          >
            Add
          </button>
        </form>
      </div>

      {/* Attachments Section */}
      <div className="bg-surface-container-low border border-surface-container-high/60 rounded-xl p-5 space-y-3 shadow-sm">
        <h3 className="text-sm font-semibold text-on-surface flex items-center gap-2">
          <Paperclip className="w-4 h-4 text-secondary" />
          Attachments ({task.attachments?.length || 0})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {task.attachments?.map((att: any) => (
            <div key={att.id} className="p-3 rounded-lg bg-surface-container border border-surface-container-high/40 flex items-center gap-3">
              <Paperclip className="w-4 h-4 text-secondary shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-on-surface truncate">{att.name}</div>
                <div className="text-[10px] font-mono text-outline">{att.size}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comments & Collaboration Section */}
      <div className="bg-surface-container-low border border-surface-container-high/60 rounded-xl p-5 space-y-4 shadow-sm">
        <h3 className="text-sm font-semibold text-on-surface flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          Comments & Discussion ({task.comments?.length || 0})
        </h3>

        <div className="space-y-3 divide-y divide-surface-container-high/40">
          {task.comments?.map((c: any) => (
            <div key={c.id} className="pt-3 first:pt-0 flex items-start gap-3">
              <UserAvatar name={c.user?.name} image={c.user?.image} size="sm" />
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-on-surface">{c.user?.name}</span>
                  <span className="font-mono text-[10px] text-outline">{formatRelativeTime(c.createdAt)}</span>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed bg-surface-container p-3 rounded-lg border border-surface-container-high/30">
                  {c.content}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Comment Form */}
        <form onSubmit={handleAddComment} className="space-y-2 pt-2">
          <textarea
            rows={2}
            value={newCommentContent}
            onChange={(e) => setNewCommentContent(e.target.value)}
            placeholder="Write a comment or update..."
            className="w-full p-3 rounded-lg bg-surface-container border border-surface-container-high text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-primary"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submittingComment}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-on-primary font-medium text-xs shadow-md hover:bg-primary-container disabled:opacity-50"
            >
              {submittingComment ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>Post Comment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
