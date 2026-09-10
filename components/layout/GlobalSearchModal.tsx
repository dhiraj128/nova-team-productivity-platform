'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, X, Folder, CheckSquare, User, Loader2 } from 'lucide-react';
import { UserAvatar } from '../branding/UserAvatar';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ projects: any[]; tasks: any[]; members: any[] }>({
    projects: [],
    tasks: [],
    members: [],
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        isOpen ? onClose() : null;
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults({ projects: [], tasks: [], members: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl bg-surface-container-low border border-surface-container-high rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-surface-container-high bg-surface-container">
          <Search className="w-5 h-5 text-outline mr-3 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects, tasks (NOV-104), team members... (press Esc to exit)"
            className="w-full bg-transparent text-on-surface placeholder:text-outline text-sm focus:outline-none"
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-outline hover:text-on-surface">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block ml-2 px-2 py-0.5 rounded bg-surface-container-highest text-on-surface-variant font-mono text-[10px]">
            ESC
          </kbd>
        </div>

        {/* Results Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading && (
            <div className="flex items-center justify-center py-8 text-on-surface-variant gap-2 text-sm">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              Searching workspace...
            </div>
          )}

          {!loading && query.length >= 2 && results.projects.length === 0 && results.tasks.length === 0 && results.members.length === 0 && (
            <div className="text-center py-8 text-on-surface-variant text-sm">
              No matching projects, tasks, or team members found for &ldquo;<span className="text-on-surface">{query}</span>&rdquo;
            </div>
          )}

          {/* Projects */}
          {!loading && results.projects.length > 0 && (
            <div>
              <div className="text-xs font-mono font-semibold uppercase tracking-wider text-outline mb-2 flex items-center gap-1.5">
                <Folder className="w-3.5 h-3.5 text-primary" />
                Projects ({results.projects.length})
              </div>
              <div className="space-y-1">
                {results.projects.map((p) => (
                  <Link
                    key={p.id}
                    href={`/projects/${p.id}`}
                    onClick={onClose}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors group"
                  >
                    <div>
                      <div className="text-sm font-medium text-on-surface group-hover:text-primary transition-colors">
                        {p.name}
                      </div>
                      <div className="text-xs text-on-surface-variant line-clamp-1">{p.description}</div>
                    </div>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-primary/10 text-primary">
                      {p.status.replace('_', ' ')}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Tasks */}
          {!loading && results.tasks.length > 0 && (
            <div>
              <div className="text-xs font-mono font-semibold uppercase tracking-wider text-outline mb-2 flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-secondary" />
                Tasks ({results.tasks.length})
              </div>
              <div className="space-y-1">
                {results.tasks.map((t) => (
                  <Link
                    key={t.id}
                    href={`/projects/${t.projectId}/tasks/${t.id}`}
                    onClick={onClose}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold text-secondary">{t.key}</span>
                      <span className="text-sm text-on-surface group-hover:text-primary transition-colors">
                        {t.title}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-surface-container-highest text-on-surface-variant">
                      {t.status.replace('_', ' ')}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Members */}
          {!loading && results.members.length > 0 && (
            <div>
              <div className="text-xs font-mono font-semibold uppercase tracking-wider text-outline mb-2 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-tertiary" />
                Team Members ({results.members.length})
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {results.members.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-surface-container"
                  >
                    <UserAvatar name={m.name} image={m.image} size="sm" />
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-on-surface truncate">{m.name}</div>
                      <div className="text-xs text-on-surface-variant truncate">{m.role || m.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
