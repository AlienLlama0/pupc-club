import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Pencil, Users, CalendarClock, Flag, Link2, Award, FileText, ListTodo, Download } from 'lucide-react';
import { useDemo, useToast, logActivity } from '../../store/DemoStore';
import { Badge, Button, Card, Empty, Field, Input, Modal, PageHeader, Progress, Select, StatusBadge, Textarea, useConfirm } from '../../components/ui';
import { TaskForm } from './Tasks';
import { day, daysUntil, downloadCSV, fmtDate, uid } from '../../lib/util';
import type { Competition, Task } from '../../types';

const STATUSES: Competition['status'][] = ['Planning', 'Registered', 'Preparing', 'Completed'];
const progressOf = (c: Competition) => c.milestones.length ? Math.round((c.milestones.filter(m => m.done).length / c.milestones.length) * 100) : 0;

function Section({ icon, title, children, action }: { icon: ReactNode; title: string; children: ReactNode; action?: ReactNode }) {
  return <Card className="p-5"><div className="mb-3 flex items-center gap-2"><span className="text-cyan">{icon}</span><h3 className="font-display text-lg font-semibold">{title}</h3><div className="ml-auto">{action}</div></div>{children}</Card>;
}

/** Tiny inline "add row" form: fields are placeholders, submit when all filled. */
function AddRow({ fields, onAdd }: { fields: { key: string; ph: string; type?: string }[]; onAdd: (v: Record<string, string>) => void }) {
  const [v, setV] = useState<Record<string, string>>({});
  const ok = fields.every(f => (v[f.key] ?? '').trim());
  return (
    <form onSubmit={e => { e.preventDefault(); if (!ok) return; onAdd(v); setV({}); }} className="mt-3 flex flex-col gap-2 sm:flex-row">
      {fields.map(f => <Input key={f.key} type={f.type} placeholder={f.ph} value={v[f.key] ?? ''} onChange={e => setV({ ...v, [f.key]: e.target.value })} className="!py-2" aria-label={f.ph} />)}
      <Button size="sm" type="submit" disabled={!ok}><Plus className="h-3.5 w-3.5" />Add</Button>
    </form>
  );
}

function InfoForm({ open, onClose, c }: { open: boolean; onClose: () => void; c?: Competition }) {
  const { update, user } = useDemo();
  const toast = useToast();
  const blank = { name: '', organizer: '', date: day(45), registrationDeadline: day(20), status: 'Planning' as Competition['status'] };
  const [f, setF] = useState(blank);
  const [k, setK] = useState('');
  if (k !== `${open}${c?.id}`) { setK(`${open}${c?.id}`); setF(c ? { name: c.name, organizer: c.organizer, date: c.date, registrationDeadline: c.registrationDeadline, status: c.status } : blank); }
  const ok = f.name.trim().length > 3 && f.organizer.trim();
  return (
    <Modal open={open} onClose={onClose} title={c ? 'Edit competition' : 'New competition / project'} footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button variant="gradient" disabled={!ok} onClick={() => { update(d => { if (c) Object.assign(d.competitions.find(x => x.id === c.id)!, f); else { d.competitions.unshift({ id: uid('c'), ...f, teams: [], practice: [], milestones: [], resources: [], result: '', report: '' }); logActivity(d, user!.id, `added competition “${f.name}”`); } }); toast('Saved'); onClose(); }}>Save</Button></>}>
      <div className="grid gap-4">
        <Field label="Competition name"><Input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></Field>
        <Field label="Organizer"><Input value={f.organizer} onChange={e => setF({ ...f, organizer: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-3"><Field label="Event date"><Input type="date" value={f.date} onChange={e => setF({ ...f, date: e.target.value })} /></Field><Field label="Registration deadline"><Input type="date" value={f.registrationDeadline} onChange={e => setF({ ...f, registrationDeadline: e.target.value })} /></Field></div>
        <Field label="Status"><Select value={f.status} onChange={e => setF({ ...f, status: e.target.value as Competition['status'] })}>{STATUSES.map(s => <option key={s}>{s}</option>)}</Select></Field>
      </div>
    </Modal>
  );
}

export default function Competitions() {
  const { state, update } = useDemo();
  const toast = useToast();
  const confirm = useConfirm();
  const [sel, setSel] = useState(state.competitions[0]?.id ?? '');
  const [info, setInfo] = useState<{ open: boolean; c?: Competition }>({ open: false });
  const [taskPreset, setTaskPreset] = useState<Partial<Task> | null>(null);
  const c = state.competitions.find(x => x.id === sel) ?? state.competitions[0];
  const [report, setReport] = useState({ id: '', result: '', report: '' });
  if (c && report.id !== c.id) setReport({ id: c.id, result: c.result, report: c.report });

  const mut = (fn: (x: Competition) => void) => update(d => { const x = d.competitions.find(y => y.id === c!.id); if (x) fn(x); });
  const prepTasks = c ? state.tasks.filter(t => t.related === c.name) : [];

  return (
    <>
      <PageHeader title="Competitions & Projects" sub="Teams, practice schedules, milestones, resources and results."
        actions={<><Button onClick={() => downloadCSV('competitions.csv', state.competitions.map(x => ({ name: x.name, organizer: x.organizer, date: x.date, registration_deadline: x.registrationDeadline, status: x.status, teams: x.teams.map(t => t.name), progress: progressOf(x) + '%', result: x.result })))}><Download className="h-4 w-4" />CSV</Button><Button variant="gradient" onClick={() => setInfo({ open: true })}><Plus className="h-4 w-4" />New competition</Button></>} />
      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <div className="space-y-3">
          {state.competitions.map(x => { const p = progressOf(x); const dd = daysUntil(x.registrationDeadline); return (
            <button key={x.id} onClick={() => setSel(x.id)} className={`card w-full p-4 text-left transition ${c?.id === x.id ? '!border-cyan/60 bg-cyan/5' : 'hover:border-white/25'}`}>
              <div className="flex items-center justify-between gap-2"><StatusBadge s={x.status} />{x.status !== 'Completed' && dd >= 0 && <span className={`text-[11px] ${dd <= 7 ? 'text-amber-300' : 'text-ice/45'}`}>Reg. closes in {dd}d</span>}</div>
              <p className="mt-2 font-semibold">{x.name}</p><p className="text-xs text-ice/45">{x.organizer}</p>
              <div className="mt-3 flex items-center gap-2"><Progress value={p} /><span className="text-xs text-ice/50">{p}%</span></div>
            </button>); })}
          {!state.competitions.length && <Empty title="No competitions yet" />}
        </div>

        {c && <div className="space-y-5">
          <Card className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><StatusBadge s={c.status} /><h2 className="h-display mt-2 text-3xl">{c.name}</h2><p className="text-sm text-ice/55">{c.organizer}</p></div>
              <div className="flex gap-2"><Button size="sm" onClick={() => setInfo({ open: true, c })}><Pencil className="h-3.5 w-3.5" />Edit</Button>
                <Button size="sm" variant="danger" aria-label="Delete" onClick={async () => { if (await confirm({ title: 'Delete competition?', body: `Delete “${c.name}” and all its teams, schedules and milestones?`, danger: true, confirmText: 'Delete' })) { update(d => { d.competitions = d.competitions.filter(x => x.id !== c.id); }); setSel(''); toast('Competition deleted'); } }}><Trash2 className="h-3.5 w-3.5" /></Button></div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div><p className="text-xs text-ice/45">Event date</p><p className="font-semibold">{fmtDate(c.date)}</p></div>
              <div><p className="text-xs text-ice/45">Registration deadline</p><p className="font-semibold">{fmtDate(c.registrationDeadline)}</p></div>
              <div><p className="text-xs text-ice/45">Teams</p><p className="font-semibold">{c.teams.length}</p></div>
              <div><p className="text-xs text-ice/45">Milestones</p><p className="font-semibold">{c.milestones.filter(m => m.done).length}/{c.milestones.length} · {progressOf(c)}%</p></div>
            </div>
            <div className="mt-4"><Progress value={progressOf(c)} /></div>
          </Card>

          <div className="grid gap-5 lg:grid-cols-2">
            <Section icon={<Users className="h-5 w-5" />} title="Teams">
              <div className="space-y-2">{c.teams.map(t => (
                <div key={t.id} className="rounded-xl bg-white/[.03] p-3">
                  <div className="flex items-center justify-between"><p className="font-semibold">{t.name}</p><button aria-label="Remove team" onClick={() => mut(x => { x.teams = x.teams.filter(y => y.id !== t.id); })} className="text-ice/40 hover:text-ember"><Trash2 className="h-3.5 w-3.5" /></button></div>
                  <p className="text-xs text-ice/50">Leader: <span className="text-cyan">{t.leader}</span></p>
                  <div className="mt-1 flex flex-wrap gap-1">{t.members.map(m => <Badge key={m}>{m}</Badge>)}</div>
                </div>))}</div>
              <AddRow fields={[{ key: 'name', ph: 'Team name' }, { key: 'leader', ph: 'Leader' }, { key: 'members', ph: 'Members (comma-separated)' }]} onAdd={v => mut(x => { x.teams.push({ id: uid('tm'), name: v.name, leader: v.leader, members: Array.from(new Set([v.leader, ...v.members.split(',').map(s => s.trim()).filter(Boolean)])) }); })} />
            </Section>
            <Section icon={<CalendarClock className="h-5 w-5" />} title="Practice schedule">
              <ul className="space-y-2">{c.practice.map(p => <li key={p.id} className="flex items-center gap-3 rounded-lg bg-white/[.03] px-3 py-2 text-sm"><span className="w-24 font-semibold text-cyan">{p.day}</span><span className="w-20 text-ice/55">{p.time}</span><span className="flex-1">{p.topic}</span><button aria-label="Remove" onClick={() => mut(x => { x.practice = x.practice.filter(y => y.id !== p.id); })} className="text-ice/40 hover:text-ember"><Trash2 className="h-3.5 w-3.5" /></button></li>)}</ul>
              {!c.practice.length && <p className="text-sm text-ice/45">No sessions scheduled.</p>}
              <AddRow fields={[{ key: 'day', ph: 'Day' }, { key: 'time', ph: 'Time' }, { key: 'topic', ph: 'Topic' }]} onAdd={v => mut(x => { x.practice.push({ id: uid('p'), day: v.day, time: v.time, topic: v.topic }); })} />
            </Section>
            <Section icon={<Flag className="h-5 w-5" />} title="Milestones & deliverables">
              <ul className="space-y-1.5">{c.milestones.map(m => (
                <li key={m.id} className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-white/[.03]">
                  <input type="checkbox" className="h-4 w-4 accent-red-500" checked={m.done} onChange={() => mut(x => { const y = x.milestones.find(z => z.id === m.id)!; y.done = !y.done; })} aria-label={m.title} />
                  <span className={`flex-1 text-sm ${m.done ? 'text-ice/40 line-through' : ''}`}>{m.title}</span>
                  <span className={`text-xs ${!m.done && daysUntil(m.due) < 0 ? 'text-[#ff8a8a]' : 'text-ice/45'}`}>{fmtDate(m.due, { day: 'numeric', month: 'short' })}</span>
                  <button aria-label="Remove" onClick={() => mut(x => { x.milestones = x.milestones.filter(y => y.id !== m.id); })} className="text-ice/40 hover:text-ember"><Trash2 className="h-3.5 w-3.5" /></button>
                </li>))}</ul>
              <AddRow fields={[{ key: 'title', ph: 'Milestone' }, { key: 'due', ph: 'Due', type: 'date' }]} onAdd={v => mut(x => { x.milestones.push({ id: uid('ms'), title: v.title, due: v.due, done: false }); })} />
            </Section>
            <Section icon={<ListTodo className="h-5 w-5" />} title="Preparation tasks" action={<Button size="sm" onClick={() => setTaskPreset({ title: `Prep: `, related: c.name, roleId: 'r-lead', deadline: c.registrationDeadline })}><Plus className="h-3.5 w-3.5" />Task</Button>}>
              <ul className="space-y-2">{prepTasks.map(t => <li key={t.id}><Link to={`/dashboard/tasks?task=${t.id}`} className="flex items-center gap-3 rounded-lg bg-white/[.03] px-3 py-2 text-sm hover:text-cyan"><span className="flex-1">{t.title}</span><StatusBadge s={t.status} /></Link></li>)}</ul>
              {!prepTasks.length && <p className="text-sm text-ice/45">No tasks linked yet. Tasks whose “related project” matches this competition appear here.</p>}
            </Section>
            <Section icon={<Link2 className="h-5 w-5" />} title="Resources">
              <ul className="space-y-1.5">{c.resources.map(r => <li key={r.id} className="flex items-center gap-2 text-sm"><a href={r.url} target="_blank" rel="noreferrer" className="flex-1 truncate text-cyan hover:underline">{r.title}</a><button aria-label="Remove" onClick={() => mut(x => { x.resources = x.resources.filter(y => y.id !== r.id); })} className="text-ice/40 hover:text-ember"><Trash2 className="h-3.5 w-3.5" /></button></li>)}</ul>
              <AddRow fields={[{ key: 'title', ph: 'Title' }, { key: 'url', ph: 'https://…' }]} onAdd={v => mut(x => { x.resources.push({ id: uid('rs'), title: v.title, url: v.url }); })} />
            </Section>
            <Section icon={<Award className="h-5 w-5" />} title="Results & post-event report">
              <div className="space-y-3">
                <Field label="Result / achievement"><Input value={report.result} onChange={e => setReport({ ...report, result: e.target.value })} placeholder="e.g. 2nd place, 8 problems solved" /></Field>
                <Field label="Post-event report"><Textarea rows={4} value={report.report} onChange={e => setReport({ ...report, report: e.target.value })} placeholder="What went well, what to improve…" /></Field>
                <Button size="sm" variant="gradient" onClick={() => { mut(x => { x.result = report.result; x.report = report.report; if (report.result && x.status !== 'Completed') x.status = 'Completed'; }); toast('Report saved'); }}><FileText className="h-3.5 w-3.5" />Save report</Button>
              </div>
            </Section>
          </div>
        </div>}
      </div>
      <InfoForm open={info.open} c={info.c} onClose={() => setInfo({ open: false })} />
      <TaskForm open={!!taskPreset} preset={taskPreset ?? undefined} onClose={() => setTaskPreset(null)} />
    </>
  );
}
