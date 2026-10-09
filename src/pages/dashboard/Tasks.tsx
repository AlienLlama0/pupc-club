import { useMemo, useState, type DragEvent, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, LayoutGrid, Table2, CalendarDays, AlertCircle, Download, Send, Check, RotateCcw, Pencil, Trash2, Paperclip, MessageSquare, History as HistoryIcon, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { useDemo, useToast, execName } from '../../store/DemoStore';
import { Avatar, Badge, Button, Empty, Field, Input, Modal, PageHeader, Progress, SearchBox, Select, SortTh, StatusBadge, Table, Tabs, Textarea, sortBy, useConfirm } from '../../components/ui';
import { addComment, addDeliverable, createTask, deleteTask, editTask, setStatus } from '../../lib/taskActions';
import { day, daysUntil, downloadCSV, fmtDate, fmtDateTime, isOverdue, relTime, toISODate } from '../../lib/util';
import type { Priority, Task, TaskStatus } from '../../types';

export const STATUSES: TaskStatus[] = ['To Do', 'In Progress', 'Under Review', 'Completed', 'Blocked'];
const PRIORITIES: Priority[] = ['Low', 'Medium', 'High', 'Urgent'];
const STATUS_DOT: Record<TaskStatus, string> = { 'To Do': '#94a3b8', 'In Progress': '#ff5a5f', 'Under Review': '#ff8a65', Completed: '#4ade80', Blocked: '#ff6b6b' };

function Deadline({ t }: { t: Task }) {
  const n = daysUntil(t.deadline);
  if (isOverdue(t)) return <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#ff8a8a]"><AlertCircle className="h-3.5 w-3.5" />Overdue {Math.abs(n)}d</span>;
  if (t.status === 'Completed') return <span className="text-xs text-ice/40">{fmtDate(t.deadline)}</span>;
  return <span className={`text-xs ${n <= 2 ? 'text-amber-300' : 'text-ice/50'}`}>{n === 0 ? 'Due today' : `Due ${fmtDate(t.deadline, { day: 'numeric', month: 'short' })}`}</span>;
}

function Assignees({ ids }: { ids: string[] }) {
  const { state } = useDemo();
  return (
    <div className="flex -space-x-2">
      {ids.slice(0, 4).map(id => { const e = state.executives.find(x => x.id === id); return e ? <span key={id} title={e.name} className="rounded-full ring-2 ring-navy-800"><Avatar name={e.name} hue={e.hue} photo={e.photo} size={24} /></span> : null; })}
    </div>
  );
}

// ---------------- Create / edit form with role-based assignment ----------------
export function TaskForm({ open, onClose, task, preset }: { open: boolean; onClose: () => void; task?: Task; preset?: Partial<Task> }) {
  const { state, update, user } = useDemo();
  const toast = useToast();
  const init = () => ({
    title: task?.title ?? preset?.title ?? '', description: task?.description ?? preset?.description ?? '',
    roleId: task?.roleId ?? preset?.roleId ?? '', assigneeIds: task?.assigneeIds ?? preset?.assigneeIds ?? [],
    priority: task?.priority ?? preset?.priority ?? 'Medium' as Priority, startDate: task?.startDate ?? day(0), deadline: task?.deadline ?? preset?.deadline ?? day(7),
    related: task?.related ?? preset?.related ?? '',
  });
  const [f, setF] = useState(init);
  const [err, setErr] = useState<Record<string, string>>({});
  const [lastKey, setLastKey] = useState('');
  const key = `${open}-${task?.id ?? ''}-${preset?.title ?? ''}`;
  if (key !== lastKey) { setLastKey(key); setF(init()); setErr({}); }

  const activeRoles = state.roles.filter(r => r.active);
  const eligible = f.roleId ? state.executives.filter(e => e.roleIds.includes(f.roleId)) : [];
  const relatedOptions = [...state.events.map(e => e.title), ...state.competitions.map(c => c.name), 'Website', 'Finance', 'Executive Meeting'];

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (f.title.trim().length < 4) er.title = 'Give the task a clear title (4+ characters).';
    if (!f.roleId) er.roleId = 'Choose the responsible role.';
    else if (!eligible.length) er.roleId = 'No executive holds this role yet.';
    if (!f.assigneeIds.length) er.assigneeIds = 'Select at least one executive.';
    if (!f.deadline) er.deadline = 'Set a deadline.';
    else if (f.deadline < f.startDate) er.deadline = 'Deadline must be on or after the start date.';
    setErr(er);
    if (Object.keys(er).length) return;
    update(d => {
      if (task) editTask(d, user!.id, task.id, { ...f, title: f.title.trim() });
      else createTask(d, user!.id, { ...f, title: f.title.trim() });
    });
    toast(task ? 'Task updated' : `Task created and assigned to ${f.assigneeIds.length} executive${f.assigneeIds.length > 1 ? 's' : ''}`);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={task ? 'Edit task' : 'Create task'} wide
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button variant="gradient" type="submit" form="task-form">{task ? 'Save changes' : 'Create & assign'}</Button></>}>
      <form id="task-form" onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
        <Field label="Title" error={err.title} className="sm:col-span-2"><Input value={f.title} onChange={e => setF({ ...f, title: e.target.value })} /></Field>
        <Field label="Description" className="sm:col-span-2"><Textarea rows={3} value={f.description} onChange={e => setF({ ...f, description: e.target.value })} /></Field>
        <Field label="1 · Responsible role" error={err.roleId}>
          <Select value={f.roleId} onChange={e => setF({ ...f, roleId: e.target.value, assigneeIds: [] })}>
            <option value="">Select role…</option>{activeRoles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </Select>
        </Field>
        <Field label="Related event / project"><Input list="related-list" value={f.related} onChange={e => setF({ ...f, related: e.target.value })} /><datalist id="related-list">{relatedOptions.map(o => <option key={o} value={o} />)}</datalist></Field>
        <div className="sm:col-span-2">
          <span className="label">2 · Assign executives holding this role</span>
          {!f.roleId ? <p className="rounded-lg border border-dashed border-white/10 p-4 text-sm text-ice/45">Pick a role to see eligible executives.</p>
            : !eligible.length ? <div className="flex items-start gap-2 rounded-lg border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100"><Users className="mt-0.5 h-4 w-4 shrink-0" />No executive is currently assigned to “{state.roles.find(r => r.id === f.roleId)?.name}”. Assign someone in Roles & Access first, or choose another role.</div>
              : <div className="grid gap-2 sm:grid-cols-2">{eligible.map(ex => {
                const on = f.assigneeIds.includes(ex.id);
                return (
                  <label key={ex.id} className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition ${on ? 'border-cyan/60 bg-cyan/10' : 'border-white/10 hover:border-white/25'}`}>
                    <input type="checkbox" className="h-4 w-4 accent-red-500" checked={on} onChange={() => setF({ ...f, assigneeIds: on ? f.assigneeIds.filter(x => x !== ex.id) : [...f.assigneeIds, ex.id] })} />
                    <Avatar name={ex.name} hue={ex.hue} photo={ex.photo} size={28} />
                    <span className="min-w-0"><span className="block truncate text-sm font-semibold">{ex.name}</span><span className="block truncate text-xs text-ice/45">{ex.designation} · {state.tasks.filter(t => t.assigneeIds.includes(ex.id) && t.status !== 'Completed').length} open tasks</span></span>
                  </label>
                );
              })}</div>}
          {err.assigneeIds && f.roleId && eligible.length > 0 && <span className="mt-1 block text-xs text-[#ff8a8a]">{err.assigneeIds}</span>}
        </div>
        <Field label="3 · Priority"><Select value={f.priority} onChange={e => setF({ ...f, priority: e.target.value as Priority })}>{PRIORITIES.map(p => <option key={p}>{p}</option>)}</Select></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Start"><Input type="date" value={f.startDate} onChange={e => setF({ ...f, startDate: e.target.value })} /></Field>
          <Field label="Deadline" error={err.deadline}><Input type="date" value={f.deadline} onChange={e => setF({ ...f, deadline: e.target.value })} /></Field>
        </div>
      </form>
    </Modal>
  );
}

// ---------------- Task detail drawer ----------------
export function TaskDetail({ id, onClose, onEdit }: { id: string | null; onClose: () => void; onEdit: (t: Task) => void }) {
  const { state, update, user, can } = useDemo();
  const toast = useToast();
  const confirm = useConfirm();
  const t = state.tasks.find(x => x.id === id);
  const [comment, setComment] = useState('');
  const [progress, setProgress] = useState<number | null>(null);
  const [dl, setDl] = useState({ name: '', url: '' });
  const [returnNote, setReturnNote] = useState('');
  const [tab, setTab] = useState<'updates' | 'deliverables' | 'history'>('updates');
  if (!t) return null;
  const mine = t.assigneeIds.includes(user!.id);
  const canWork = mine || can('tasks.create');
  const canReview = can('tasks.review');
  const role = state.roles.find(r => r.id === t.roleId);
  const prog = progress ?? t.progress;

  const act = (fn: Parameters<typeof update>[0], msg: string) => { update(fn); toast(msg); };
  const postUpdate = () => {
    if (!comment.trim() && progress === null) return;
    act(d => addComment(d, user!.id, t.id, comment.trim() || `Progress updated to ${prog}%`, progress !== null ? 'progress' : 'comment', progress ?? undefined), 'Update posted');
    setComment(''); setProgress(null);
  };

  return (
    <Modal open onClose={onClose} title="Task details" wide>
      <div className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap gap-2"><StatusBadge s={t.status} /><StatusBadge s={t.priority} />{isOverdue(t) && <Badge tone="red">Overdue</Badge>}</div>
            <h2 className="mt-2 font-display text-2xl font-semibold">{t.title}</h2>
            {t.related && <p className="text-sm text-cyan">{t.related}</p>}
          </div>
          {can('tasks.create') && <div className="flex gap-2">
            <Button size="sm" onClick={() => onEdit(t)}><Pencil className="h-3.5 w-3.5" />Edit</Button>
            <Button size="sm" variant="danger" onClick={async () => { if (await confirm({ title: 'Delete task?', body: `“${t.title}” and its comments will be removed from the demo data.`, danger: true, confirmText: 'Delete' })) { update(d => deleteTask(d, user!.id, t.id)); toast('Task deleted'); onClose(); } }}><Trash2 className="h-3.5 w-3.5" /></Button>
          </div>}
        </div>
        <p className="text-sm leading-relaxed text-ice/70">{t.description || 'No description.'}</p>
        <dl className="grid grid-cols-2 gap-4 rounded-xl bg-white/[.03] p-4 text-sm sm:grid-cols-4">
          <div><dt className="text-xs text-ice/40">Role</dt><dd className="font-medium" style={{ color: role?.color }}>{role?.name ?? '—'}</dd></div>
          <div><dt className="text-xs text-ice/40">Assigned</dt><dd className="font-medium">{t.assigneeIds.map(a => execName(state, a)).join(', ')}</dd></div>
          <div><dt className="text-xs text-ice/40">Start</dt><dd className="font-medium">{fmtDate(t.startDate)}</dd></div>
          <div><dt className="text-xs text-ice/40">Deadline</dt><dd className="font-medium"><Deadline t={t} /></dd></div>
        </dl>
        <div><div className="mb-1 flex justify-between text-xs text-ice/50"><span>Progress</span><span>{prog}%</span></div><Progress value={prog} tone={isOverdue(t) ? 'red' : 'gradient'} /></div>

        {/* workflow actions */}
        <div className="flex flex-wrap gap-2 rounded-xl border border-white/10 p-3">
          {canWork && t.status !== 'Completed' && t.status !== 'Under Review' && <>
            {t.status !== 'In Progress' && <Button size="sm" onClick={() => act(d => setStatus(d, user!.id, t.id, 'In Progress'), 'Moved to In Progress')}>Start / resume</Button>}
            {t.status !== 'Blocked' && <Button size="sm" onClick={() => act(d => setStatus(d, user!.id, t.id, 'Blocked'), 'Marked as blocked')}>Mark blocked</Button>}
            <Button size="sm" variant="gradient" onClick={() => act(d => { const x = d.tasks.find(y => y.id === t.id)!; x.progress = Math.max(x.progress, 100); setStatus(d, user!.id, t.id, 'Under Review'); }, 'Submitted for review')}><Send className="h-3.5 w-3.5" />Submit for review</Button>
          </>}
          {t.status === 'Under Review' && (canReview ? <>
            <Button size="sm" variant="gradient" onClick={() => act(d => setStatus(d, user!.id, t.id, 'Completed'), 'Approved — task completed')}><Check className="h-3.5 w-3.5" />Approve</Button>
            <div className="flex flex-1 gap-2"><Input value={returnNote} onChange={e => setReturnNote(e.target.value)} placeholder="What needs to change?" className="!py-2" />
              <Button size="sm" variant="danger" onClick={() => { if (!returnNote.trim()) { toast('Add a note explaining the requested changes', 'error'); return; } act(d => setStatus(d, user!.id, t.id, 'In Progress', returnNote.trim()), 'Returned with changes requested'); setReturnNote(''); }}><RotateCcw className="h-3.5 w-3.5" />Request changes</Button></div>
          </> : <p className="text-sm text-ice/55">Waiting for a reviewer (Moderator, President or Super Admin).</p>)}
          {t.status === 'Completed' && <p className="text-sm text-emerald-300">Completed and approved.</p>}
          {!canWork && t.status !== 'Under Review' && t.status !== 'Completed' && <p className="text-sm text-ice/50">Only assignees and task coordinators can update this task.</p>}
        </div>

        <Tabs tabs={[{ id: 'updates', label: 'Comments & progress', count: t.comments.length }, { id: 'deliverables', label: 'Deliverables', count: t.deliverables.length }, { id: 'history', label: 'Activity history', count: t.history.length }]} value={tab} onChange={setTab} />
        {tab === 'updates' && <div className="space-y-4">
          <ul className="space-y-3">
            {t.comments.map(c => { const a = state.executives.find(e => e.id === c.authorId); return (
              <li key={c.id} className="flex gap-3"><Avatar name={a?.name ?? '?'} hue={a?.hue} size={30} />
                <div className={`flex-1 rounded-xl p-3 text-sm ${c.kind === 'review' ? 'border border-ember/30 bg-ember/10' : c.kind === 'progress' ? 'border border-cyan/20 bg-cyan/5' : 'bg-white/5'}`}>
                  <p className="text-xs text-ice/45"><b className="text-ice/80">{a?.name}</b> · {c.kind === 'review' ? 'requested changes' : c.kind === 'progress' ? 'progress update' : 'comment'} · {relTime(c.at)}</p>
                  <p className="mt-1 text-ice/80">{c.text}</p></div></li>); })}
            {!t.comments.length && <li className="text-sm text-ice/45"><MessageSquare className="mr-1 inline h-4 w-4" />No comments yet.</li>}
          </ul>
          {(canWork || canReview) && <div className="space-y-3 rounded-xl border border-white/10 p-3">
            <Textarea rows={2} value={comment} onChange={e => setComment(e.target.value)} placeholder="Write a comment or progress note…" />
            <div className="flex flex-wrap items-center gap-3">
              {canWork && t.status !== 'Completed' && <label className="flex flex-1 items-center gap-3 text-xs text-ice/60">Progress<input type="range" min={0} max={100} step={5} value={prog} onChange={e => setProgress(Number(e.target.value))} className="flex-1 accent-red-500" /><span className="w-9 text-right">{prog}%</span></label>}
              <Button size="sm" variant="gradient" onClick={postUpdate}>Post update</Button>
            </div>
          </div>}
        </div>}
        {tab === 'deliverables' && <div className="space-y-3">
          {t.deliverables.map(dv => <div key={dv.id} className="flex items-center gap-3 rounded-lg bg-white/5 p-3 text-sm"><Paperclip className="h-4 w-4 text-cyan" /><a href={dv.url} target="_blank" rel="noreferrer" className="flex-1 truncate hover:text-cyan">{dv.name}</a><span className="text-xs text-ice/40">{execName(state, dv.by)} · {relTime(dv.at)}</span></div>)}
          {!t.deliverables.length && <p className="text-sm text-ice/45">No deliverables attached.</p>}
          {canWork && <form onSubmit={e => { e.preventDefault(); if (!dl.name.trim()) return; update(d => addDeliverable(d, user!.id, t.id, dl.name.trim(), dl.url.trim() || '#')); setDl({ name: '', url: '' }); toast('Deliverable added'); }} className="flex flex-col gap-2 sm:flex-row">
            <Input placeholder="Deliverable name" value={dl.name} onChange={e => setDl({ ...dl, name: e.target.value })} /><Input placeholder="Link (optional)" value={dl.url} onChange={e => setDl({ ...dl, url: e.target.value })} /><Button type="submit" size="sm">Attach</Button>
          </form>}
        </div>}
        {tab === 'history' && <ol className="space-y-2 border-l border-white/10 pl-4">
          {[...t.history].reverse().map((h, i) => <li key={i} className="text-sm"><HistoryIcon className="-ml-[25px] mr-2 inline h-4 w-4 rounded-full bg-navy-850 text-ice/40" /><b>{execName(state, h.actorId)}</b> <span className="text-ice/65">{h.text.toLowerCase()}</span> <span className="text-xs text-ice/35">· {fmtDateTime(h.at)}</span></li>)}
        </ol>}
      </div>
    </Modal>
  );
}

// ---------------- Views ----------------
function Kanban({ tasks, open }: { tasks: Task[]; open: (id: string) => void }) {
  const { update, user, can } = useDemo();
  const toast = useToast();
  const [over, setOver] = useState<TaskStatus | null>(null);
  const drop = (e: DragEvent, status: TaskStatus) => {
    e.preventDefault(); setOver(null);
    const id = e.dataTransfer.getData('text/plain');
    const t = tasks.find(x => x.id === id); if (!t || t.status === status) return;
    const mine = t.assigneeIds.includes(user!.id);
    if (status === 'Completed' && !can('tasks.review')) { toast('Only reviewers can mark tasks as completed — submit for review instead.', 'error'); return; }
    if (t.status === 'Under Review' && !can('tasks.review')) { toast('This task is waiting for review.', 'error'); return; }
    if (!mine && !can('tasks.create') && !can('tasks.review')) { toast('You can only move tasks assigned to you.', 'error'); return; }
    update(d => setStatus(d, user!.id, id, status));
    toast(`Moved to ${status}`);
  };
  return (
    <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0">
      {STATUSES.map(s => {
        const col = tasks.filter(t => t.status === s);
        return (
          <div key={s} onDragOver={e => { e.preventDefault(); setOver(s); }} onDragLeave={() => setOver(null)} onDrop={e => drop(e, s)}
            className={`flex w-72 shrink-0 flex-col rounded-2xl border bg-navy-850/70 p-3 transition ${over === s ? 'border-cyan/60 bg-cyan/5' : 'border-white/10'}`}>
            <div className="mb-3 flex items-center gap-2 px-1"><span className="h-2.5 w-2.5 rounded-full" style={{ background: STATUS_DOT[s] }} /><p className="text-sm font-semibold">{s}</p><span className="ml-auto rounded-full bg-white/10 px-2 text-xs">{col.length}</span></div>
            <div className="flex min-h-24 flex-1 flex-col gap-2.5">
              {col.map(t => (
                <button key={t.id} draggable onDragStart={e => e.dataTransfer.setData('text/plain', t.id)} onClick={() => open(t.id)}
                  className={`group cursor-grab rounded-xl border bg-navy-800 p-3.5 text-left transition hover:border-cyan/40 active:cursor-grabbing ${isOverdue(t) ? 'border-ember/40' : 'border-white/10'}`}>
                  <div className="flex items-center justify-between gap-2"><StatusBadge s={t.priority} /><Deadline t={t} /></div>
                  <p className="mt-2 text-sm font-semibold leading-snug group-hover:text-cyan">{t.title}</p>
                  {t.related && <p className="mt-1 truncate text-xs text-ice/40">{t.related}</p>}
                  <div className="mt-3"><Progress value={t.progress} tone={isOverdue(t) ? 'red' : 'gradient'} /></div>
                  <div className="mt-3 flex items-center justify-between"><Assignees ids={t.assigneeIds} /><span className="text-xs text-ice/40">{t.comments.length > 0 && <><MessageSquare className="mr-0.5 inline h-3 w-3" />{t.comments.length}</>}</span></div>
                </button>
              ))}
              {!col.length && <p className="rounded-xl border border-dashed border-white/10 p-4 text-center text-xs text-ice/35">Drop tasks here</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TaskTable({ tasks, open }: { tasks: Task[]; open: (id: string) => void }) {
  const { state } = useDemo();
  const [sort, setSort] = useState<{ k: string; dir: 1 | -1 }>({ k: 'deadline', dir: 1 });
  const rows = sortBy(tasks, sort);
  return (
    <Table empty={!rows.length} head={<><SortTh label="Task" k="title" sort={sort} setSort={setSort} /><th className="th">Role</th><th className="th">Assigned</th><SortTh label="Priority" k="priority" sort={sort} setSort={setSort} /><SortTh label="Status" k="status" sort={sort} setSort={setSort} /><SortTh label="Deadline" k="deadline" sort={sort} setSort={setSort} /><SortTh label="Progress" k="progress" sort={sort} setSort={setSort} /></>}>
      {rows.map(t => (
        <tr key={t.id} onClick={() => open(t.id)} className="cursor-pointer hover:bg-white/[.03]">
          <td className="td max-w-xs"><p className="font-semibold">{t.title}</p><p className="truncate text-xs text-ice/40">{t.related}</p></td>
          <td className="td text-xs">{state.roles.find(r => r.id === t.roleId)?.name}</td>
          <td className="td"><Assignees ids={t.assigneeIds} /></td>
          <td className="td"><StatusBadge s={t.priority} /></td>
          <td className="td"><StatusBadge s={t.status} /></td>
          <td className="td"><Deadline t={t} /></td>
          <td className="td w-32"><Progress value={t.progress} tone={isOverdue(t) ? 'red' : 'gradient'} /></td>
        </tr>
      ))}
    </Table>
  );
}

function CalendarView({ tasks, open }: { tasks: Task[]; open: (id: string) => void }) {
  const [cursor, setCursor] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const first = new Date(cursor); const startPad = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const cells = Array.from({ length: Math.ceil((startPad + daysInMonth) / 7) * 7 }, (_, i) => { const dn = i - startPad + 1; return dn > 0 && dn <= daysInMonth ? new Date(cursor.getFullYear(), cursor.getMonth(), dn) : null; });
  const todayStr = toISODate(new Date());
  return (
    <div className="card p-4">
      <div className="mb-4 flex items-center justify-between">
        <Button size="sm" variant="ghost" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))} aria-label="Previous month"><ChevronLeft className="h-4 w-4" /></Button>
        <p className="font-display text-xl font-semibold">{cursor.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</p>
        <Button size="sm" variant="ghost" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))} aria-label="Next month"><ChevronRight className="h-4 w-4" /></Button>
      </div>
      <div className="overflow-x-auto"><div className="grid min-w-[700px] grid-cols-7 gap-1.5">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => <p key={d} className="pb-1 text-center text-xs font-semibold text-ice/40">{d}</p>)}
        {cells.map((c, i) => {
          const ds = c ? toISODate(c) : '';
          const due = c ? tasks.filter(t => t.deadline === ds) : [];
          return (
            <div key={i} className={`min-h-24 rounded-lg border p-1.5 ${!c ? 'border-transparent' : ds === todayStr ? 'border-cyan/60 bg-cyan/5' : 'border-white/5 bg-white/[.02]'}`}>
              {c && <p className={`mb-1 text-xs ${ds === todayStr ? 'font-bold text-cyan' : 'text-ice/45'}`}>{c.getDate()}</p>}
              {due.map(t => <button key={t.id} onClick={() => open(t.id)} className="mb-1 block w-full truncate rounded px-1.5 py-1 text-left text-[11px] font-medium" style={{ background: `${STATUS_DOT[t.status]}22`, color: isOverdue(t) ? '#ff8a8a' : STATUS_DOT[t.status] }}>{t.title}</button>)}
            </div>
          );
        })}
      </div></div>
    </div>
  );
}

// ---------------- Pages ----------------
function useTaskModals() {
  const [params, setParams] = useSearchParams();
  const openId = params.get('task');
  const [form, setForm] = useState<{ open: boolean; task?: Task }>({ open: false });
  const open = (id: string) => setParams(p => { p.set('task', id); return p; });
  const close = () => setParams(p => { p.delete('task'); return p; });
  const modals = <>
    <TaskDetail id={openId} onClose={close} onEdit={t => { close(); setForm({ open: true, task: t }); }} />
    <TaskForm open={form.open} task={form.task} onClose={() => setForm({ open: false })} />
  </>;
  return { open, modals, newTask: () => setForm({ open: true }) };
}

function useFilters(tasks: Task[]) {
  const [q, setQ] = useState('');
  const [status, setStatusF] = useState('');
  const [priority, setPriority] = useState('');
  const [role, setRole] = useState('');
  const [overdueOnly, setOverdueOnly] = useState(false);
  const filtered = useMemo(() => tasks.filter(t =>
    (!q || `${t.title} ${t.description} ${t.related}`.toLowerCase().includes(q.toLowerCase())) &&
    (!status || t.status === status) && (!priority || t.priority === priority) && (!role || t.roleId === role) && (!overdueOnly || isOverdue(t))), [tasks, q, status, priority, role, overdueOnly]);
  return { filtered, q, setQ, status, setStatusF, priority, setPriority, role, setRole, overdueOnly, setOverdueOnly };
}

function FilterBar({ f, showStatus = true }: { f: ReturnType<typeof useFilters>; showStatus?: boolean }) {
  const { state } = useDemo();
  return (
    <div className="mb-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_auto]">
      <SearchBox value={f.q} onChange={f.setQ} placeholder="Search tasks…" />
      {showStatus ? <Select value={f.status} onChange={e => f.setStatusF(e.target.value)} aria-label="Status"><option value="">All statuses</option>{STATUSES.map(s => <option key={s}>{s}</option>)}</Select> : <span className="hidden lg:block" />}
      <Select value={f.priority} onChange={e => f.setPriority(e.target.value)} aria-label="Priority"><option value="">All priorities</option>{PRIORITIES.map(s => <option key={s}>{s}</option>)}</Select>
      <Select value={f.role} onChange={e => f.setRole(e.target.value)} aria-label="Role"><option value="">All roles</option>{state.roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</Select>
      <label className="flex items-center gap-2 rounded-lg border border-white/10 px-3 text-sm text-ice/70"><input type="checkbox" className="accent-red-400" checked={f.overdueOnly} onChange={e => f.setOverdueOnly(e.target.checked)} />Overdue</label>
    </div>
  );
}

export function TaskBoard() {
  const { state, can } = useDemo();
  const [view, setView] = useState<'kanban' | 'table' | 'calendar'>('kanban');
  const f = useFilters(state.tasks);
  const { open, modals, newTask } = useTaskModals();
  const exportCsv = () => downloadCSV('tasks.csv', f.filtered.map(t => ({ id: t.id, title: t.title, role: state.roles.find(r => r.id === t.roleId)?.name, assigned: t.assigneeIds.map(a => execName(state, a)), priority: t.priority, status: t.status, start: t.startDate, deadline: t.deadline, progress: t.progress, related: t.related, overdue: isOverdue(t) ? 'yes' : 'no' })));
  return (
    <>
      <PageHeader title="Task Board" sub={`${state.tasks.filter(t => t.status !== 'Completed').length} open · ${state.tasks.filter(isOverdue).length} overdue · drag cards between columns`}
        actions={<>
          <Button onClick={exportCsv}><Download className="h-4 w-4" />CSV</Button>
          {can('tasks.create') && <Button variant="gradient" onClick={newTask}><Plus className="h-4 w-4" />New task</Button>}
        </>} />
      <div className="mb-4"><Tabs tabs={[{ id: 'kanban', label: 'Kanban' }, { id: 'table', label: 'Table' }, { id: 'calendar', label: 'Deadlines calendar' }]} value={view} onChange={setView} /></div>
      <FilterBar f={f} showStatus={view !== 'kanban'} />
      {view === 'kanban' && <Kanban tasks={f.filtered} open={open} />}
      {view === 'table' && <TaskTable tasks={f.filtered} open={open} />}
      {view === 'calendar' && <CalendarView tasks={f.filtered} open={open} />}
      {modals}
    </>
  );
}

export function MyTasks() {
  const { state, user, can } = useDemo();
  const mine = state.tasks.filter(t => t.assigneeIds.includes(user!.id));
  const toReview = can('tasks.review') ? state.tasks.filter(t => t.status === 'Under Review') : [];
  const [tab, setTab] = useState<'active' | 'review' | 'done'>('active');
  const f = useFilters(tab === 'review' ? toReview : mine.filter(t => (tab === 'done') === (t.status === 'Completed')));
  const { open, modals, newTask } = useTaskModals();
  return (
    <>
      <PageHeader title="My Tasks" sub="Everything assigned to you, plus submissions waiting for your review." actions={can('tasks.create') && <Button variant="gradient" onClick={newTask}><Plus className="h-4 w-4" />New task</Button>} />
      <div className="mb-4"><Tabs value={tab} onChange={setTab} tabs={[{ id: 'active', label: 'Active', count: mine.filter(t => t.status !== 'Completed').length }, ...(can('tasks.review') ? [{ id: 'review' as const, label: 'To review', count: toReview.length }] : []), { id: 'done', label: 'Completed', count: mine.filter(t => t.status === 'Completed').length }]} /></div>
      <FilterBar f={f} />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {f.filtered.map(t => (
          <button key={t.id} onClick={() => open(t.id)} className={`card p-4 text-left transition hover:border-cyan/40 ${isOverdue(t) ? '!border-ember/40' : ''}`}>
            <div className="flex flex-wrap items-center gap-2"><StatusBadge s={t.status} /><StatusBadge s={t.priority} /><span className="ml-auto"><Deadline t={t} /></span></div>
            <p className="mt-3 font-semibold">{t.title}</p>
            <p className="mt-1 line-clamp-2 text-sm text-ice/50">{t.description}</p>
            <div className="mt-3"><Progress value={t.progress} tone={isOverdue(t) ? 'red' : 'gradient'} /></div>
            <div className="mt-3 flex items-center justify-between text-xs text-ice/40"><span>{t.related}</span><Assignees ids={t.assigneeIds} /></div>
          </button>
        ))}
      </div>
      {!f.filtered.length && <Empty title={tab === 'review' ? 'Nothing waiting for review' : tab === 'done' ? 'No completed tasks yet' : 'No active tasks — nice!'} body={tab === 'active' ? 'Tasks assigned to you by the moderator will appear here.' : undefined} />}
      {modals}
    </>
  );
}
