import type { Permission, Task } from '../types';

export const uid = (p = 'id') => `${p}-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-3)}`;

const pad = (n: number) => String(n).padStart(2, '0');
export const toISODate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const today = () => toISODate(new Date());
/** Date string N days from today — seed data is relative so overdue/upcoming logic always looks realistic. */
export const day = (n: number) => { const d = new Date(); d.setDate(d.getDate() + n); return toISODate(d); };
export const nowISO = () => new Date().toISOString();
export const ago = (hours: number) => new Date(Date.now() - hours * 3600_000).toISOString();

export const parseDate = (s: string) => { const [y, m, d] = s.slice(0, 10).split('-').map(Number); return new Date(y, m - 1, d); };
export const fmtDate = (s: string, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }) =>
  s ? parseDate(s).toLocaleDateString('en-GB', opts) : '—';
export const fmtDateTime = (iso: string) => new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
export const daysUntil = (s: string) => Math.round((parseDate(s).getTime() - parseDate(today()).getTime()) / 86400000);
export const relTime = (iso: string) => {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return d < 30 ? `${d}d ago` : fmtDate(iso.slice(0, 10));
};

export const isOverdue = (t: Pick<Task, 'deadline' | 'status'>) => t.status !== 'Completed' && daysUntil(t.deadline) < 0;

export const money = (n: number) => '৳' + Math.round(n).toLocaleString('en-IN');

export const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();

export function downloadCSV(filename: string, rows: Record<string, unknown>[]) {
  if (!rows.length) rows = [{ note: 'No rows' }];
  const headers = Object.keys(rows[0]);
  const esc = (v: unknown) => {
    const s = Array.isArray(v) ? v.join('; ') : v == null ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers.join(','), ...rows.map(r => headers.map(h => esc(r[h])).join(','))].join('\n');
  downloadBlob(filename, new Blob([csv], { type: 'text/csv;charset=utf-8' }));
}

export function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const formatBytes = (n: number) => n < 1024 ? `${n} B` : n < 1048576 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1048576).toFixed(1)} MB`;

export const PERMISSIONS: { key: Permission; label: string; group: string }[] = [
  { key: 'dashboard.view', label: 'View dashboard', group: 'General' },
  { key: 'tasks.view', label: 'View & work on tasks', group: 'Tasks' },
  { key: 'tasks.create', label: 'Create & assign tasks', group: 'Tasks' },
  { key: 'tasks.review', label: 'Approve / return submissions', group: 'Tasks' },
  { key: 'members.manage', label: 'Manage members & applications', group: 'Membership' },
  { key: 'executives.manage', label: 'Edit executive panel', group: 'Membership' },
  { key: 'events.manage', label: 'Create & publish events', group: 'Events' },
  { key: 'finance.view', label: 'View financial workspace', group: 'Finance' },
  { key: 'finance.approve', label: 'Record & approve transactions', group: 'Finance' },
  { key: 'secretariat.manage', label: 'Meetings, minutes & notices', group: 'Secretariat' },
  { key: 'competitions.manage', label: 'Manage competitions & projects', group: 'Competitions' },
  { key: 'documents.manage', label: 'Upload & manage documents', group: 'Documents' },
  { key: 'roles.manage', label: 'Manage roles & permissions', group: 'Administration' },
  { key: 'settings.manage', label: 'Club settings & demo reset', group: 'Administration' },
];

export const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
