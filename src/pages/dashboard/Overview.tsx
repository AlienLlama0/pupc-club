import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, UserPlus, CalendarRange, FolderKanban, ListTodo, AlertTriangle, Plus, Wallet, NotebookPen, Trophy, Upload, ShieldCheck, Receipt, ArrowUpRight, Megaphone } from 'lucide-react';
import { useDemo } from '../../store/DemoStore';
import { Avatar, Badge, Card, DemoNotice, Progress, Stat, StatusBadge } from '../../components/ui';
import { daysUntil, fmtDate, isOverdue, money, relTime } from '../../lib/util';
import { TaskForm } from './Tasks';
import { ReimbursementForm, monthlySummary } from './Finance';

export function BarChart({ data, height = 180 }: { data: { label: string; a: number; b: number }[]; height?: number }) {
  const max = Math.max(1, ...data.flatMap(d => [d.a, d.b]));
  return (
    <div>
      <div className="flex items-end gap-3" style={{ height }}>
        {data.map(d => (
          <div key={d.label} className="group relative flex h-full flex-1 items-end justify-center gap-1">
            <div className="w-1/3 max-w-5 rounded-t bg-gradient-to-t from-[#ff5a5f]/60 to-[#ff5a5f]" style={{ height: `${(d.a / max) * 100}%` }} title={`Income ${money(d.a)}`} />
            <div className="w-1/3 max-w-5 rounded-t bg-gradient-to-t from-[#f3d6d2]/30 to-[#f3d6d2]" style={{ height: `${(d.b / max) * 100}%` }} title={`Expense ${money(d.b)}`} />
            <div className="pointer-events-none absolute -top-12 z-10 hidden whitespace-nowrap rounded-lg border border-white/10 bg-navy-950 px-2 py-1 text-[11px] group-hover:block">In {money(d.a)} · Out {money(d.b)}</div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-3">{data.map(d => <p key={d.label} className="flex-1 text-center text-[11px] text-ice/40">{d.label}</p>)}</div>
      <div className="mt-3 flex gap-4 text-xs text-ice/55"><span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#ff5a5f]" />Income</span><span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#f3d6d2]" />Expense</span></div>
    </div>
  );
}

export default function Overview() {
  const { state, user, can } = useDemo();
  const [taskOpen, setTaskOpen] = useState(false);
  const [reimbOpen, setReimbOpen] = useState(false);
  const roles = user!.roleIds.map(r => state.roles.find(x => x.id === r)).filter(Boolean);
  const myTasks = state.tasks.filter(t => t.assigneeIds.includes(user!.id) && t.status !== 'Completed').sort((a, b) => a.deadline.localeCompare(b.deadline));
  const overdue = state.tasks.filter(isOverdue);
  const myOverdue = myTasks.filter(isOverdue);
  const pending = state.applications.filter(a => a.status === 'Pending');
  const upcomingEvents = state.events.filter(e => e.status === 'Published' && daysUntil(e.date) >= 0);
  const activeProjects = state.competitions.filter(c => c.status !== 'Completed');
  const income = state.transactions.filter(t => t.type === 'Income' && t.status === 'Approved').reduce((s, t) => s + t.amount, 0);
  const expense = state.transactions.filter(t => t.type === 'Expense' && t.status === 'Approved').reduce((s, t) => s + t.amount, 0);
  const monthly = monthlySummary(state.transactions).slice(-6);

  const deadlines = [
    ...state.tasks.filter(t => t.status !== 'Completed' && daysUntil(t.deadline) >= 0).map(t => ({ k: t.id, date: t.deadline, label: t.title, kind: 'Task', to: `/dashboard/tasks?task=${t.id}` })),
    ...state.meetings.filter(m => m.status === 'Scheduled').map(m => ({ k: m.id, date: m.date, label: m.title, kind: 'Meeting', to: '/dashboard/secretariat' })),
    ...upcomingEvents.map(e => ({ k: e.id, date: e.date, label: e.title, kind: 'Event', to: `/events/${e.id}` })),
    ...state.competitions.filter(c => daysUntil(c.registrationDeadline) >= 0).map(c => ({ k: c.id + 'r', date: c.registrationDeadline, label: `${c.name} — registration closes`, kind: 'Competition', to: '/dashboard/competitions' })),
  ].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 7);

  const quick = [
    can('tasks.create') && { label: 'Create task', icon: Plus, onClick: () => setTaskOpen(true) },
    can('members.manage') && { label: `Review applications (${pending.length})`, icon: UserPlus, to: '/dashboard/members' },
    can('events.manage') && { label: 'New event', icon: CalendarRange, to: '/dashboard/events?new=1' },
    can('finance.approve') && { label: 'Record transaction', icon: Wallet, to: '/dashboard/finance?tab=ledger&new=1' },
    can('secretariat.manage') && { label: 'Schedule meeting', icon: NotebookPen, to: '/dashboard/secretariat?new=1' },
    can('competitions.manage') && { label: 'Manage competitions', icon: Trophy, to: '/dashboard/competitions' },
    can('roles.manage') && { label: 'Manage roles', icon: ShieldCheck, to: '/dashboard/roles' },
    can('documents.manage') && { label: 'Upload document', icon: Upload, to: '/dashboard/documents?upload=1' },
    { label: 'Request reimbursement', icon: Receipt, onClick: () => setReimbOpen(true) },
    { label: 'My tasks', icon: ListTodo, to: '/dashboard/my-tasks' },
  ].filter(Boolean) as { label: string; icon: typeof Plus; to?: string; onClick?: () => void }[];

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="eyebrow">Executive dashboard</p>
          <h1 className="h-display mt-1 text-3xl sm:text-4xl">Welcome back, {user!.name.split(' ')[0]}</h1>
          <div className="mt-2 flex flex-wrap gap-1.5">{roles.map(r => <span key={r!.id} className="rounded-full border px-2.5 py-0.5 text-[11px] font-semibold" style={{ borderColor: `${r!.color}66`, color: r!.color, background: `${r!.color}14` }}>{r!.name}</span>)}{!roles.length && <Badge tone="red">No active role</Badge>}</div>
        </div>
        <DemoNotice>Demo Mode — sample data only. Permissions are simulated in the browser and are not a security boundary.</DemoNotice>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <Stat label="Total members" value={state.members.length} sub={`${state.members.filter(m => m.status === 'Active').length} active`} icon={<Users className="h-4 w-4" />} />
        <Stat label="Pending registrations" value={pending.length} sub={can('members.manage') ? <Link className="text-cyan" to="/dashboard/members">Review →</Link> : 'awaiting review'} icon={<UserPlus className="h-4 w-4" />} accent="#f4c95d" />
        <Stat label="Upcoming events" value={upcomingEvents.length} sub={upcomingEvents[0] ? `Next: ${fmtDate(upcomingEvents.sort((a, b) => a.date.localeCompare(b.date))[0].date, { day: 'numeric', month: 'short' })}` : '—'} icon={<CalendarRange className="h-4 w-4" />} accent="#c4142f" />
        <Stat label="Active projects" value={activeProjects.length} sub="competitions & projects" icon={<FolderKanban className="h-4 w-4" />} accent="#f472b6" />
        <Stat label="My tasks" value={myTasks.length} sub={myOverdue.length ? <span className="text-[#ff8a8a]">{myOverdue.length} overdue</span> : 'all on track'} icon={<ListTodo className="h-4 w-4" />} />
        <Stat label="Overdue tasks" value={overdue.length} sub="club-wide" icon={<AlertTriangle className="h-4 w-4" />} accent="#ff3b3b" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card className="p-5 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between"><h2 className="font-display text-xl font-semibold">My tasks</h2><Link to="/dashboard/my-tasks" className="text-sm text-cyan">Open →</Link></div>
          <ul className="divide-y divide-white/5">
            {myTasks.slice(0, 5).map(t => (
              <li key={t.id}><Link to={`/dashboard/tasks?task=${t.id}`} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:gap-4">
                <div className="min-w-0 flex-1"><p className="truncate font-medium hover:text-cyan">{t.title}</p><p className="text-xs text-ice/40">{t.related}</p></div>
                <div className="flex items-center gap-3"><StatusBadge s={t.status} /><div className="w-24"><Progress value={t.progress} tone={isOverdue(t) ? 'red' : 'gradient'} /></div>
                  <span className={`w-20 text-right text-xs ${isOverdue(t) ? 'font-semibold text-[#ff8a8a]' : 'text-ice/50'}`}>{isOverdue(t) ? 'Overdue' : fmtDate(t.deadline, { day: 'numeric', month: 'short' })}</span></div>
              </Link></li>
            ))}
            {!myTasks.length && <li className="py-8 text-center text-sm text-ice/45">No open tasks assigned to you.</li>}
          </ul>
        </Card>
        <Card className="p-5">
          <h2 className="mb-4 font-display text-xl font-semibold">Quick actions</h2>
          <div className="grid grid-cols-2 gap-2">
            {quick.map(q => q.to
              ? <Link key={q.label} to={q.to} className="flex flex-col gap-2 rounded-xl border border-white/10 p-3 text-sm font-medium transition hover:border-cyan/50 hover:bg-cyan/5"><q.icon className="h-4 w-4 text-cyan" />{q.label}</Link>
              : <button key={q.label} onClick={q.onClick} className="flex flex-col gap-2 rounded-xl border border-white/10 p-3 text-left text-sm font-medium transition hover:border-cyan/50 hover:bg-cyan/5"><q.icon className="h-4 w-4 text-cyan" />{q.label}</button>)}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        {can('finance.view') ? (
          <Card className="p-5 xl:col-span-2">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2"><h2 className="font-display text-xl font-semibold">Financial overview</h2><Link to="/dashboard/finance" className="text-sm text-cyan">Treasury →</Link></div>
            <div className="mb-5 grid grid-cols-3 gap-3">
              <div><p className="text-xs text-ice/45">Income</p><p className="font-display text-xl font-bold text-emerald-300">{money(income)}</p></div>
              <div><p className="text-xs text-ice/45">Expenses</p><p className="font-display text-xl font-bold text-[#f3d6d2]">{money(expense)}</p></div>
              <div><p className="text-xs text-ice/45">Balance</p><p className="font-display text-xl font-bold">{money(income - expense)}</p></div>
            </div>
            <BarChart data={monthly.map(m => ({ label: m.label, a: m.income, b: m.expense }))} />
          </Card>
        ) : (
          <Card className="p-5 xl:col-span-2">
            <h2 className="mb-4 font-display text-xl font-semibold">Club task progress</h2>
            <div className="space-y-3">{['To Do', 'In Progress', 'Under Review', 'Completed', 'Blocked'].map(s => { const n = state.tasks.filter(t => t.status === s).length; return <div key={s}><div className="mb-1 flex justify-between text-sm"><span>{s}</span><span className="text-ice/50">{n}</span></div><Progress value={(n / state.tasks.length) * 100} /></div>; })}</div>
          </Card>
        )}
        <Card className="p-5">
          <h2 className="mb-4 font-display text-xl font-semibold">Upcoming deadlines</h2>
          <ul className="space-y-3">
            {deadlines.map(d => { const n = daysUntil(d.date); return (
              <li key={d.k}><Link to={d.to} className="flex items-center gap-3 hover:text-cyan">
                <div className="w-12 shrink-0 rounded-lg bg-white/5 py-1 text-center"><p className="text-[10px] uppercase text-ice/45">{fmtDate(d.date, { month: 'short' })}</p><p className="font-display text-lg font-bold leading-none">{fmtDate(d.date, { day: 'numeric' })}</p></div>
                <div className="min-w-0"><p className="truncate text-sm font-medium">{d.label}</p><p className="text-xs text-ice/45">{d.kind} · {n === 0 ? 'today' : `in ${n} day${n > 1 ? 's' : ''}`}</p></div>
              </Link></li>); })}
          </ul>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-semibold"><Megaphone className="h-5 w-5 text-cyan" />Recent announcements</h2>
          <ul className="space-y-3">
            {[...state.notices].sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.date.localeCompare(a.date)).slice(0, 4).map(n => (
              <li key={n.id} className="rounded-xl bg-white/[.03] p-3"><div className="flex items-center gap-2"><p className="font-semibold">{n.title}</p>{n.pinned && <Badge tone="cyan">Pinned</Badge>}</div><p className="mt-1 text-sm text-ice/55">{n.body}</p><p className="mt-1 text-xs text-ice/35">{fmtDate(n.date)} · {n.audience}</p></li>
            ))}
          </ul>
        </Card>
        <Card className="p-5">
          <h2 className="mb-4 font-display text-xl font-semibold">Recent activity</h2>
          <ul className="space-y-3">
            {state.activity.slice(0, 7).map(a => { const ex = state.executives.find(e => e.id === a.actorId); return (
              <li key={a.id} className="flex items-start gap-3 text-sm"><Avatar name={ex?.name ?? '?'} hue={ex?.hue} size={28} /><p className="flex-1 text-ice/70"><b className="text-ice">{ex?.name}</b> {a.text}<span className="block text-xs text-ice/35">{relTime(a.at)}</span></p></li>); })}
          </ul>
          <Link to="/" className="mt-4 inline-flex items-center gap-1 text-sm text-cyan">View public site <ArrowUpRight className="h-3.5 w-3.5" /></Link>
        </Card>
      </div>
      <TaskForm open={taskOpen} onClose={() => setTaskOpen(false)} />
      <ReimbursementForm open={reimbOpen} onClose={() => setReimbOpen(false)} />
    </>
  );
}
