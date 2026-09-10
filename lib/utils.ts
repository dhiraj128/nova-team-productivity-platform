import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, isAfter, isBefore } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateProjectProgress(tasks: { status: string }[]): number {
  if (!tasks || tasks.length === 0) return 0;
  const completed = tasks.filter((t) => t.status === 'COMPLETED').length;
  return Math.round((completed / tasks.length) * 100);
}

export function formatDate(date: Date | string | null | undefined, pattern: string = 'MMM dd, yyyy'): string {
  if (!date) return 'No deadline';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return 'Invalid date';
  return format(d, pattern);
}

export function formatRelativeTime(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  return formatDistanceToNow(d, { addSuffix: true });
}

export function isOverdue(date: Date | string | null | undefined, status?: string): boolean {
  if (!date || status === 'COMPLETED') return false;
  const d = typeof date === 'string' ? new Date(date) : date;
  return isBefore(d, new Date());
}

export function getStatusBadgeStyle(status: string) {
  switch (status.toUpperCase()) {
    case 'IN_PROGRESS':
    case 'IN PROGRESS':
      return 'bg-primary/10 text-primary border-primary/30';
    case 'COMPLETED':
      return 'bg-tertiary-container/30 text-tertiary border-tertiary/30';
    case 'PLANNING':
    case 'REVIEW':
    case 'IN REVIEW':
      return 'bg-secondary-container/30 text-secondary border-secondary/30';
    case 'ON_HOLD':
    case 'ON HOLD':
    case 'TODO':
    default:
      return 'bg-surface-container-high text-on-surface-variant border-outline-variant';
  }
}

export function getPriorityBadgeStyle(priority: string) {
  switch (priority.toUpperCase()) {
    case 'URGENT':
      return 'bg-error-container/40 text-error border-error/40';
    case 'HIGH':
      return 'bg-error-container/20 text-error border-error/20';
    case 'MEDIUM':
      return 'bg-secondary-container/20 text-secondary border-secondary/20';
    case 'LOW':
    default:
      return 'bg-surface-container-high text-on-surface-variant border-outline-variant';
  }
}
