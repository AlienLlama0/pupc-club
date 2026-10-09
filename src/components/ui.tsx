import { createContext, useCallback, useContext, useEffect, useState, type ReactNode, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes, type ButtonHTMLAttributes } from 'react';
import { X, Search, Inbox, AlertTriangle, Code2, Trophy, Rocket, Mic, Users, Image as ImageIcon } from 'lucide-react';
import { initials } from '../lib/util';
import type { EventType } from '../types';

type BtnVariant = 'gradient' | 'cream' | 'dark' | 'ghost' | 'danger';
export function Button({ variant = 'dark', size, className = '', ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; size?: 'sm' }) {
  return <button {...p} className={`btn btn-${variant} ${size === 'sm' ? 'btn-sm' : ''} ${className}`} />;
}

export function Field({ label, error, hint, children, className = '' }: { label?: string; error?: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      {label && <span className="label">{label}</span>}
      {children}
      {error ? <span className="mt-1 block text-xs text-[#ff8a8a]">{error}</span> : hint ? <span className="mt-1 block text-xs text-ice/40">{hint}</span> : null}
    </label>
  );
}
export const Input = ({ className = '', ...p }: InputHTMLAttributes<HTMLInputElement>) => <input {...p} className={`field ${className}`} />;
export const Select = ({ className = '', ...p }: SelectHTMLAttributes<HTMLSelectElement>) => <select {...p} className={`field ${className}`} />;
export const Textarea = ({ className = '', ...p }: TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea rows={4} {...p} className={`field ${className}`} />;

export function SearchBox({ value, onChange, placeholder = 'Search…', className = '' }: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ice/40" />
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="field pl-9" aria-label={placeholder} />
    </div>
  );
}

const TONES: Record<string, string> = {
  gray: 'bg-white/5 text-ice/70 border-white/10',
  cyan: 'bg-cyan/10 text-cyan border-cyan/30',
  violet: 'bg-violet/15 text-[#ffb3ad] border-violet/30',
  green: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/30',
  amber: 'bg-amber-400/10 text-amber-300 border-amber-400/30',
  red: 'bg-ember/10 text-[#ff8a8a] border-ember/30',
  orange: 'bg-orange-400/10 text-orange-300 border-orange-400/30',
};
export type Tone = keyof typeof TONES;
export function Badge({ tone = 'gray', children, className = '' }: { tone?: Tone; children: ReactNode; className?: string }) {
  return <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${TONES[tone]} ${className}`}>{children}</span>;
}
export const statusTone = (s: string): Tone => ({
  'To Do': 'gray', 'In Progress': 'cyan', 'Under Review': 'violet', Completed: 'green', Blocked: 'red',
  Pending: 'amber', Approved: 'green', Rejected: 'red', Active: 'green', Inactive: 'gray',
  Draft: 'gray', Published: 'cyan', Archived: 'gray', Scheduled: 'cyan',
  Planning: 'gray', Registered: 'violet', Preparing: 'amber',
  Low: 'gray', Medium: 'cyan', High: 'orange', Urgent: 'red', Income: 'green', Expense: 'red',
} as Record<string, Tone>)[s] ?? 'gray';
export const StatusBadge = ({ s }: { s: string }) => <Badge tone={statusTone(s)}>{s}</Badge>;

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`card ${className}`}>{children}</div>;
}

export function Modal({ open, onClose, title, children, footer, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={e => e.target === e.currentTarget && onClose()} role="dialog" aria-modal="true" aria-label={title}>
      <div className={`animate-rise flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl border border-white/10 bg-navy-850 shadow-2xl sm:rounded-2xl ${wide ? 'sm:max-w-3xl' : 'sm:max-w-lg'}`}>
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h3 className="font-display text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="rounded-md p-1 text-ice/60 hover:bg-white/5 hover:text-white" aria-label="Close"><X className="h-5 w-5" /></button>
        </div>
        <div className="overflow-y-auto px-5 py-5">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-white/10 px-5 py-4">{footer}</div>}
      </div>
    </div>
  );
}

// Confirmation dialog for destructive actions — `const confirm = useConfirm(); if (await confirm({...}))`
type ConfirmOpts = { title: string; body: string; confirmText?: string; danger?: boolean };
const ConfirmCtx = createContext<(o: ConfirmOpts) => Promise<boolean>>(async () => false);
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<(ConfirmOpts & { resolve: (v: boolean) => void }) | null>(null);
  const confirm = useCallback((o: ConfirmOpts) => new Promise<boolean>(resolve => setState({ ...o, resolve })), []);
  const close = (v: boolean) => { state?.resolve(v); setState(null); };
  return (
    <ConfirmCtx.Provider value={confirm}>
      {children}
      <Modal open={!!state} onClose={() => close(false)} title={state?.title ?? ''}
        footer={<><Button variant="ghost" onClick={() => close(false)}>Cancel</Button><Button variant={state?.danger ? 'danger' : 'gradient'} onClick={() => close(true)}>{state?.confirmText ?? 'Confirm'}</Button></>}>
        <div className="flex gap-3">
          {state?.danger && <AlertTriangle className="h-5 w-5 shrink-0 text-ember" />}
          <p className="text-sm text-ice/80">{state?.body}</p>
        </div>
      </Modal>
    </ConfirmCtx.Provider>
  );
}
export const useConfirm = () => useContext(ConfirmCtx);

export function Empty({ title, body, action }: { title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 px-6 py-12 text-center">
      <Inbox className="mb-3 h-8 w-8 text-ice/30" />
      <p className="font-semibold text-ice/80">{title}</p>
      {body && <p className="mt-1 max-w-sm text-sm text-ice/50">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Avatar({ name, hue = 210, photo, size = 36 }: { name: string; hue?: number; photo?: string; size?: number }) {
  if (photo) return <img src={photo} alt={name} className="shrink-0 rounded-full object-cover" style={{ width: size, height: size }} />;
  return (
    <span className="inline-flex shrink-0 items-center justify-center rounded-full font-display font-bold text-white ring-1 ring-white/20"
      style={{ width: size, height: size, fontSize: size * 0.38, background: `linear-gradient(135deg, hsl(${hue} 80% 58%), hsl(${(hue + 60) % 360} 70% 38%))` }} aria-hidden>
      {initials(name)}
    </span>
  );
}

export function Progress({ value, tone = 'gradient' }: { value: number; tone?: 'gradient' | 'red' | 'green' }) {
  const v = Math.max(0, Math.min(100, value));
  const bg = tone === 'red' ? 'bg-ember' : tone === 'green' ? 'bg-emerald-400' : 'bg-gradient-to-r from-[#ff5a5f] to-[#c4142f]';
  return <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100}><div className={`h-full rounded-full ${bg} transition-all`} style={{ width: `${v}%` }} /></div>;
}

export function Tabs<T extends string>({ tabs, value, onChange }: { tabs: { id: T; label: string; count?: number }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1" role="tablist">
      {tabs.map(t => (
        <button key={t.id} role="tab" aria-selected={value === t.id} onClick={() => onChange(t.id)}
          className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium transition ${value === t.id ? 'bg-pill text-navy-900' : 'text-ice/60 hover:bg-white/5 hover:text-ice'}`}>
          {t.label}{t.count !== undefined && <span className={`ml-1.5 rounded-full px-1.5 text-[10px] ${value === t.id ? 'bg-navy-900/10' : 'bg-white/10'}`}>{t.count}</span>}
        </button>
      ))}
    </div>
  );
}

export function PageHeader({ title, sub, actions }: { title: string; sub?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="h-display text-2xl sm:text-3xl">{title}</h1>
        {sub && <p className="mt-1 text-sm text-ice/55">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Stat({ label, value, sub, icon, accent = '#ff5a5f' }: { label: string; value: ReactNode; sub?: ReactNode; icon?: ReactNode; accent?: string }) {
  return (
    <div className="card relative overflow-hidden p-5">
      <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-20 blur-2xl" style={{ background: accent }} />
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-ice/50">{label}</p>
        {icon && <span className="text-ice/40">{icon}</span>}
      </div>
      <p className="mt-2 font-display text-3xl font-bold text-ice">{value}</p>
      {sub && <div className="mt-1 text-xs text-ice/50">{sub}</div>}
    </div>
  );
}

const TYPE_ICON: Record<EventType, typeof Code2> = { Workshop: Code2, Contest: Trophy, Hackathon: Rocket, Seminar: Mic, Social: Users };
/** Generated cover art used in place of photos (swap for real images via `image`). */
export function Cover({ hue, type, image, label, className = '' }: { hue: number; type?: EventType; image?: string; label?: string; className?: string }) {
  if (image) return <img src={image} alt={label ?? ''} className={`h-full w-full object-cover ${className}`} />;
  const Icon = type ? TYPE_ICON[type] : ImageIcon;
  return (
    <div className={`relative h-full w-full overflow-hidden ${className}`} style={{ background: `radial-gradient(120% 90% at 80% 110%, hsl(${hue} 90% 45% / .55), transparent 60%), radial-gradient(80% 70% at 10% 0%, hsl(${(hue + 50) % 360} 90% 60% / .35), transparent 60%), #160709` }} role="img" aria-label={label ?? 'Cover image'}>
      <div className="grid-bg absolute inset-0 opacity-70" />
      <div className="absolute inset-x-0 top-6 h-px bg-white/10" />
      <div className="absolute left-[12%] top-[18%] h-1 w-24 rounded-full bg-white/20 blur-[1px]" />
      <div className="absolute right-[10%] top-[26%] h-1 w-16 rounded-full bg-white/15 blur-[1px]" />
      <Icon className="absolute bottom-4 right-4 h-16 w-16 text-white/25" strokeWidth={1.2} />
      <span className="absolute bottom-4 left-4 font-mono text-[10px] text-white/35">{'</>'} {type ?? 'gallery'}</span>
    </div>
  );
}

export function Table({ head, children, empty }: { head: ReactNode; children: ReactNode; empty?: boolean }) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead className="border-b border-white/10 bg-white/[.02]"><tr>{head}</tr></thead>
          <tbody className="divide-y divide-white/5">{children}</tbody>
        </table>
      </div>
      {empty && <div className="p-6"><Empty title="Nothing matches" body="Try a different search or filter." /></div>}
    </div>
  );
}

export function SortTh({ label, k, sort, setSort }: { label: string; k: string; sort: { k: string; dir: 1 | -1 }; setSort: (s: { k: string; dir: 1 | -1 }) => void }) {
  const active = sort.k === k;
  return (
    <th className="th">
      <button className={`inline-flex items-center gap-1 uppercase ${active ? 'text-cyan' : ''}`} onClick={() => setSort({ k, dir: active ? (sort.dir === 1 ? -1 : 1) : 1 })}>
        {label}<span className="text-[9px]">{active ? (sort.dir === 1 ? '▲' : '▼') : '↕'}</span>
      </button>
    </th>
  );
}
export function sortBy<T>(rows: T[], sort: { k: string; dir: 1 | -1 }) {
  return [...rows].sort((a, b) => {
    const av = (a as Record<string, unknown>)[sort.k], bv = (b as Record<string, unknown>)[sort.k];
    if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * sort.dir;
    return String(av ?? '').localeCompare(String(bv ?? '')) * sort.dir;
  });
}

export function DemoNotice({ children }: { children: ReactNode }) {
  return <div className="flex items-start gap-2 rounded-xl border border-amber-400/25 bg-amber-400/[.06] px-4 py-3 text-xs text-amber-100/80"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" /><div>{children}</div></div>;
}

export function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return <button type="button" onClick={onClick} aria-pressed={active} className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${active ? 'border-cyan/60 bg-cyan/15 text-cyan' : 'border-white/10 text-ice/60 hover:border-white/25 hover:text-ice'}`}>{children}</button>;
}
