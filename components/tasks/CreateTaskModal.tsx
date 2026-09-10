'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckSquare, Loader2, Calendar as CalendarIcon, User, Folder } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProjectId?: string;
  defaultStatus?: string;
  onSuccess?: () => void;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  defaultProjectId,
  defaultStatus = 'TODO',
  onSuccess,
}) => {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: defaultProjectId || '',
    status: defaultStatus,
    priority: 'MEDIUM',
    assigneeId: '',
    dueDate: '',
  });

  useEffect(() => {
    if (isOpen) {
      fetchProjects();
    }
  }, [isOpen]);

  useEffect(() => {
    if (defaultProjectId) {
      setFormData((prev) => ({ ...prev, projectId: defaultProjectId }));
    }
    if (defaultStatus) {
      setFormData((prev) => ({ ...prev, status: defaultStatus }));
    }
  }, [defaultProjectId, defaultStatus]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        setProjects(Array.isArray(data) ? data : []);
        if (data.length > 0 && !formData.projectId) {
          setFormData((prev) => ({ ...prev, projectId: data[0].id }));
          setMembers(data[0].members?.map((m: any) => m.user) || []);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectChange = (pId: string) => {
    setFormData((prev) => ({ ...prev, projectId: pId }));
    const p = projects.find((proj) => proj.id === pId);
    if (p) {
      setMembers(p.members?.map((m: any) => m.user) || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.projectId) {
      setError('Title and Project are required.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to create task');
      }

      setFormData({
        title: '',
        description: '',
        projectId: defaultProjectId || (projects[0]?.id || ''),
        status: defaultStatus,
        priority: 'MEDIUM',
        assigneeId: '',
        dueDate: '',
      });

      if (onSuccess) onSuccess();
      router.refresh();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg bg-surface-container-low border border-surface-container-high rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-container-high bg-surface-container">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-primary" />
            <h2 className="text-base font-semibold text-on-surface">Create New Task</h2>
          </div>
          <button onClick={onClose} className="p-1 text-outline hover:text-on-surface rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-error-container/40 border border-error/30 text-error text-xs">
              {error}
            </div>
          )}

          {/* Task Title */}
          <div>
            <label className="block text-xs font-mono font-medium text-on-surface-variant uppercase mb-1">
              Task Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Implement drag-and-drop task reordering"
              className="w-full px-3.5 py-2 rounded-lg bg-surface-container border border-surface-container-high text-on-surface text-sm placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-mono font-medium text-on-surface-variant uppercase mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add details, acceptance criteria, or context..."
              className="w-full px-3.5 py-2 rounded-lg bg-surface-container border border-surface-container-high text-on-surface text-sm placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Project & Assignee Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Project Selection */}
            <div>
              <label className="block text-xs font-mono font-medium text-on-surface-variant uppercase mb-1 flex items-center gap-1">
                <Folder className="w-3.5 h-3.5 text-primary" />
                Project *
              </label>
              <select
                value={formData.projectId}
                onChange={(e) => handleProjectChange(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg bg-surface-container border border-surface-container-high text-on-surface text-sm focus:outline-none focus:border-primary"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id} className="bg-surface-container text-on-surface">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Assignee Selection */}
            <div>
              <label className="block text-xs font-mono font-medium text-on-surface-variant uppercase mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-secondary" />
                Assignee
              </label>
              <select
                value={formData.assigneeId}
                onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg bg-surface-container border border-surface-container-high text-on-surface text-sm focus:outline-none focus:border-primary"
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id} className="bg-surface-container text-on-surface">
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status, Priority & Due Date Grid */}
          <div className="grid grid-cols-3 gap-3">
            {/* Status */}
            <div>
              <label className="block text-[11px] font-mono uppercase text-on-surface-variant mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg bg-surface-container border border-surface-container-high text-on-surface text-xs focus:outline-none"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="REVIEW">Review</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-[11px] font-mono uppercase text-on-surface-variant mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg bg-surface-container border border-surface-container-high text-on-surface text-xs focus:outline-none"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-[11px] font-mono uppercase text-on-surface-variant mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg bg-surface-container border border-surface-container-high text-on-surface text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-container-high">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-surface-container text-on-surface-variant hover:text-on-surface text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-on-primary font-medium text-xs shadow-md hover:bg-primary-container hover:text-on-primary-container active:scale-95 transition-all disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckSquare className="w-4 h-4" />}
              <span>Create Task</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
