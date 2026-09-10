'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FolderPlus,
  Search,
  Filter,
  LayoutGrid,
  List,
  MoreVertical,
  Calendar,
  ArrowUpDown,
  Loader2,
  Trash2,
} from 'lucide-react';
import { UserAvatar } from '@/components/branding/UserAvatar';
import { calculateProjectProgress, formatDate, getPriorityBadgeStyle } from '@/lib/utils';
import { CreateProjectModal } from '@/components/projects/CreateProjectModal';

export default function ProjectsDirectoryPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortField, setSortField] = useState<'updatedAt' | 'name'>('updatedAt');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      let url = `/api/projects?sort=${sortField}`;
      if (statusTab !== 'ALL') url += `&status=${statusTab}`;
      if (search.trim()) url += `&search=${encodeURIComponent(search)}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setProjects(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [statusTab, sortField, search]);

  const handleDeleteProject = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (e) {
      console.error('Delete error:', e);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">Projects Directory</h1>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            Manage, filter, and track all your team&apos;s workspace projects.
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-xl text-xs font-semibold shadow-md hover:bg-primary-container hover:text-on-primary-container active:scale-95 transition-all"
        >
          <FolderPlus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Search & Tactical Controls */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-outline" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="w-full bg-surface-container-low text-on-surface placeholder:text-outline text-xs sm:text-sm pl-10 pr-12 py-2 rounded-xl border border-surface-container-high focus:outline-none focus:border-primary transition-colors"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-surface-container-highest text-on-surface-variant font-mono text-[9px]">
              ⌘K
            </kbd>
          </div>

          {/* Grid / List View Toggle */}
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="p-2 bg-surface-container-low text-on-surface-variant rounded-xl border border-surface-container-high hover:text-on-surface active:scale-95 transition-all"
            title={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
          >
            {viewMode === 'grid' ? <List className="w-5 h-5" /> : <LayoutGrid className="w-5 h-5" />}
          </button>
        </div>

        {/* Quick Sort & Count Row */}
        <div className="flex items-center justify-between text-xs text-on-surface-variant px-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase text-outline">Sort by:</span>
            <button
              onClick={() => setSortField(sortField === 'updatedAt' ? 'name' : 'updatedAt')}
              className="flex items-center gap-1 font-mono text-xs text-primary hover:underline"
            >
              <span>{sortField === 'updatedAt' ? 'Last Updated' : 'Project Name'}</span>
              <ArrowUpDown className="w-3 h-3" />
            </button>
          </div>
          <span className="font-mono text-[11px] text-outline">{projects.length} Active Workspaces</span>
        </div>
      </div>

      {/* Status Tabs Scrollable Rail */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['ALL', 'IN_PROGRESS', 'PLANNING', 'ON_HOLD', 'COMPLETED'].map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusTab(tab)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono transition-all ${
              statusTab === tab
                ? 'bg-primary text-on-primary font-semibold shadow-sm'
                : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container border border-surface-container-high/40'
            }`}
          >
            <span>{tab === 'ALL' ? 'All' : tab.replace('_', ' ')}</span>
          </button>
        ))}
      </div>

      {/* Projects Display */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-on-surface-variant">
          <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
          Loading workspace projects...
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16 bg-surface-container rounded-xl border border-surface-container-high/60 p-8 space-y-3">
          <p className="text-sm text-on-surface-variant">No projects found matching your filter.</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-on-primary text-xs font-medium"
          >
            <FolderPlus className="w-4 h-4" />
            Create First Project
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid Layout */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((proj) => {
            const progress = calculateProjectProgress(proj.tasks || []);
            return (
              <div
                key={proj.id}
                className="group relative flex flex-col justify-between bg-surface-container-low border border-surface-container-high/60 rounded-xl p-5 hover:bg-surface-container hover:border-primary/40 transition-all shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-mono text-[10px] uppercase font-semibold">
                        {proj.status.replace('_', ' ')}
                      </span>
                      <span className={`px-2 py-0.5 rounded font-mono text-[10px] uppercase ${getPriorityBadgeStyle(proj.priority)}`}>
                        {proj.priority}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteProject(proj.id, proj.name)}
                      className="text-outline hover:text-error p-1 rounded-lg hover:bg-error-container/20 transition-colors"
                      title="Delete Project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <Link href={`/projects/${proj.id}`}>
                    <h2 className="text-base font-semibold text-on-surface group-hover:text-primary transition-colors truncate">
                      {proj.name}
                    </h2>
                  </Link>
                  <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                    {proj.description || 'No description provided.'}
                  </p>
                </div>

                <div className="mt-5 space-y-3">
                  {/* Progress Gauge */}
                  <div>
                    <div className="flex justify-between items-center text-xs font-mono mb-1">
                      <span className="text-on-surface-variant">
                        Progress ({proj.tasks?.filter((t: any) => t.status === 'COMPLETED').length || 0}/
                        {proj.tasks?.length || 0} tasks)
                      </span>
                      <span className="text-tertiary font-bold">{progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                      <div
                        className="h-full bg-tertiary rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Footer */}
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
                        <div className="w-6 h-6 rounded-full bg-surface-container-highest text-on-surface-variant font-mono text-[9px] flex items-center justify-center font-bold ring-1 ring-surface-container-low">
                          +{proj.members.length - 3}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-mono text-on-surface-variant">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDate(proj.dueDate, 'MMM dd')}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List Layout */
        <div className="bg-surface-container-low border border-surface-container-high/60 rounded-xl overflow-hidden divide-y divide-surface-container-high">
          {projects.map((proj) => {
            const progress = calculateProjectProgress(proj.tasks || []);
            return (
              <div
                key={proj.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-surface-container transition-colors group"
              >
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/projects/${proj.id}`}
                      className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors truncate"
                    >
                      {proj.name}
                    </Link>
                    <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-mono text-[10px] uppercase font-semibold shrink-0">
                      {proj.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant line-clamp-1">{proj.description}</p>
                </div>

                <div className="flex items-center gap-6 shrink-0">
                  <div className="w-32 hidden md:block">
                    <div className="flex justify-between text-[11px] font-mono mb-1">
                      <span className="text-outline">Progress</span>
                      <span className="text-tertiary font-bold">{progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                      <div className="h-full bg-tertiary rounded-full" style={{ width: `${progress}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center -space-x-2">
                    {proj.members?.slice(0, 3).map((m: any) => (
                      <UserAvatar key={m.id || m.userId} name={m.user?.name} image={m.user?.image} size="xs" />
                    ))}
                  </div>

                  <button
                    onClick={() => handleDeleteProject(proj.id, proj.name)}
                    className="text-outline hover:text-error p-1 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchProjects}
      />
    </div>
  );
}
