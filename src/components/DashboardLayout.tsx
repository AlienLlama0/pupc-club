import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ListTodo, KanbanSquare, UserPlus, Users2, CalendarRange, Wallet, NotebookPen, Trophy, FolderOpen, Bell, ShieldCheck, Settings, LogOut, Menu, X, FlaskConical, Globe, Search, Lock } from 'lucide-react';
import { useDemo } from '../store/DemoStore';
import { Avatar, Badge } from './ui';
import { Logo } from './PublicLayout';
import type { Notification, Permission } from '../types';
import { relTime } from '../lib/util';

export const isReadBy = (n: Notification, userId: string) => (n.userId === 'all' ? (n.readBy ?? []).includes(userId) : n.read);

export const NAV: { to: string; label: string; icon: typeof ListTodo; perm?: Permission; end?: boolean }[] = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/dashboard/my-tasks', label: 'My Tasks', icon: ListTodo, perm: 'tasks.view' },
  { to: '/dashboard/tasks', label: 'Task Board', icon: KanbanSquare, perm: 'tasks.view' },
  { to: '/dashboard/members', label: 'Members', icon: UserPlus, perm: 'members.manage' },
  { to: '/dashboard/executives', label: 'Executives', icon: Users2, perm: 'executives.manage' },
  { to: '/dashboard/events', label: 'Events & Gallery', icon: CalendarRange, perm: 'events.manage' },
  { to: '/dashboard/finance', label: 'Treasury', icon: Wallet, perm: 'finance.view' },
  { to: '/dashboard/secretariat', label: 'GS Workspace', icon: NotebookPen, perm: 'secretariat.manage' },
  { to: '/dashboard/competitions', label: 'Competitions', icon: Trophy, perm: 'competitions.manage' },
  { to: '/dashboard/documents', label: 'Documents', icon: FolderOpen },
  { to: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  { to: '/dashboard/roles', label: 'Roles & Access', icon: ShieldCheck, perm: 'roles.manage' },
  { to: '/dashboard/settings', label: 'Settings', icon: Settings, perm: 'settings.manage' },
];

export function RequirePerm({ p, children }: { p: Permission; children: ReactNode }) {
  const { can } = useDemo();
  if (can(p)) return <>{children}</>;
  return (
    <div className="card mx-auto mt-10 max-w-lg p-8 text-center">
      <Lock className="mx-auto h-10 w-10 text-ice/30" />
      <h1 className="mt-4 font-display text-2xl font-semibold">No access with your current roles</h1>
      <p className="mt-2 text-sm text-ice/55">This module requires the <code className="rounded bg-white/10 px-1.5 py-0.5 text-cyan">{p}</code> permission. A Super Admin can grant it from Roles & Access.</p>
      <Link to="/dashboard" className="btn btn-gradient mt-6">Back to overview</Link>
    </div>
  );
}

function NotifBell() {
  const { state, user, update } = useDemo();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const nav = useNavigate();
  const mine = state.notifications.filter(n => n.userId === user!.id || n.userId === 'all');
  const unread = mine.filter(n => !isReadBy(n, user!.id));
  useEffect(() => {
    const h = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h);
  }, []);
  const markRead = (id: string) => update(d => {
    const n = d.notifications.find(x => x.id === id); if (!n) return;
    if (n.userId === 'all') n.readBy = Array.from(new Set([...(n.readBy ?? []), user!.id])); else n.read = true;
  });
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(o => !o)} className="relative rounded-lg p-2 text-navy-900/70 hover:bg-black/5" aria-label={`Notifications, ${unread.length} unread`}>
        <Bell className="h-5 w-5" />
        {unread.length > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-ember px-1 text-[10px] font-bold text-white">{unread.length}</span>}
      </button>
      {open && (
        <div className="animate-rise absolute right-0 top-12 z-50 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/10 bg-navy-850 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3"><p className="font-semibold">Notifications</p><Link to="/dashboard/notifications" onClick={() => setOpen(false)} className="text-xs text-cyan">View all</Link></div>
          <ul className="max-h-96 overflow-y-auto">
            {mine.slice(0, 8).map(n => (
              <li key={n.id}>
                <button onClick={() => { markRead(n.id); setOpen(false); if (n.link) nav(n.link); }} className="flex w-full gap-3 px-4 py-3 text-left hover:bg-white/5">
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${isReadBy(n, user!.id) ? 'bg-transparent' : 'bg-cyan'}`} />
                  <span className="min-w-0"><span className="block text-sm font-semibold">{n.title}</span><span className="block truncate text-xs text-ice/55">{n.body}</span><span className="text-[10px] text-ice/35">{relTime(n.at)}</span></span>
                </button>
              </li>
            ))}
            {!mine.length && <li className="px-4 py-8 text-center text-sm text-ice/50">You’re all caught up.</li>}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function DashboardLayout() {
  const { state, user, can, logout } = useDemo();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const loc = useLocation();
  const nav = useNavigate();
  useEffect(() => { setOpen(false); window.scrollTo(0, 0); }, [loc.pathname]);
  const items = useMemo(() => NAV.filter(n => !n.perm || can(n.perm)), [can]);
  if (!user) return <Navigate to="/login" replace />;
  const roles = user.roleIds.map(r => state.roles.find(x => x.id === r)).filter(Boolean);

  const search = (e: React.FormEvent) => { e.preventDefault(); if (q.trim()) nav(`/dashboard/search?q=${encodeURIComponent(q.trim())}`); };

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-[72px] items-center justify-between px-5"><Logo /><button className="rounded p-1 text-ice/60 lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu"><X className="h-5 w-5" /></button></div>
      <div className="mx-4 mb-4 flex items-center gap-2 rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs font-semibold text-amber-200"><FlaskConical className="h-4 w-4" />Demo Mode</div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-4" aria-label="Dashboard">
        {items.map(n => (
          <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-gradient-to-r from-[#ff5a5f]/20 to-[#c4142f]/10 text-white ring-1 ring-cyan/30' : 'text-ice/60 hover:bg-white/5 hover:text-ice'}`}>
            <n.icon className="h-4 w-4" />{n.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-white/10 p-4">
        <Link to="/" className="mb-2 flex items-center gap-2 rounded-lg px-2 py-2 text-xs text-ice/55 hover:bg-white/5 hover:text-ice"><Globe className="h-4 w-4" />View public website</Link>
        <div className="flex items-center gap-3">
          <Avatar name={user.name} hue={user.hue} photo={user.photo} size={36} />
          <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{user.name}</p><p className="truncate text-xs text-ice/45">{roles.map(r => r!.name).join(', ') || 'No active role'}</p></div>
          <button onClick={() => { logout(); nav('/login'); }} className="rounded-lg p-2 text-ice/50 hover:bg-white/5 hover:text-ember" aria-label="Log out"><LogOut className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-navy-900">
      <div className="fixed inset-0 -z-0 bg-[radial-gradient(60%_40%_at_70%_0%,rgba(59,59,191,.18),transparent)]" />
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-white/10 bg-navy-950/90 backdrop-blur lg:block">{sidebar}</aside>
      {open && <div className="fixed inset-0 z-50 lg:hidden"><div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} /><aside className="animate-rise absolute inset-y-0 left-0 w-72 border-r border-white/10 bg-navy-950">{sidebar}</aside></div>}
      <div className="relative lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-navy-900/85 px-4 py-3 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button className="rounded-lg p-2 text-ice lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu"><Menu className="h-5 w-5" /></button>
            <div className="flex h-12 flex-1 items-center gap-3 rounded-2xl bg-pill px-3 text-navy-900 shadow-card">
              <form onSubmit={search} className="flex flex-1 items-center gap-2">
                <Search className="h-4 w-4 text-navy-900/50" />
                <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search tasks, members, events, documents…" className="w-full bg-transparent text-sm text-navy-900 placeholder:text-navy-900/45 outline-none" aria-label="Global search" />
              </form>
              <span className="hidden sm:block"><Badge tone="amber" className="!bg-amber-100 !text-amber-800 !border-amber-300">DEMO</Badge></span>
              <NotifBell />
            </div>
          </div>
        </header>
        <main className="relative mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8"><Outlet /></main>
      </div>
    </div>
  );
}
