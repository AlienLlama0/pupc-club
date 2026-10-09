import { useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Pencil, CalendarClock, MapPin, ListChecks, Gavel, ClipboardList, Pin, Trash2, FileText, Download, Megaphone } from 'lucide-react';
import { useDemo, useToast, notify, logActivity, execName } from '../../store/DemoStore';
import { Badge, Button, Card, Empty, Field, Input, Modal, PageHeader, SearchBox, Select, StatusBadge, Tabs, Textarea, useConfirm } from '../../components/ui';
import { TaskForm } from './Tasks';
import { day, downloadCSV, fmtDate, uid } from '../../lib/util';
import type { Attendance, Meeting, Notice, Task } from '../../types';

function MeetingForm({ open, onClose, m }: { open: boolean; onClose: () => void; m?: Meeting }) {
  const { state, update, user } = useDemo();
  const toast = useToast();
  const blank = { title: '', date: day(7), time: '5:00 PM', venue: 'Club Room', type: 'Executive' as Meeting['type'], agendaText: '', minutes: '', decisionsText: '', attendance: {} as Record<string, Attendance>, status: 'Scheduled' as Meeting['status'] };
  const [f, setF] = useState(blank);
  const [err, setErr] = useState('');
  const [k, setK] = useState('');
  if (k !== `${open}${m?.id}`) { setK(`${open}${m?.id}`); setF(m ? { ...m, agendaText: m.agenda.join('\n'), decisionsText: m.decisions.join('\n') } : blank); setErr(''); }
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (f.title.trim().length < 3) return setErr('Add a meeting title.');
    const lines = (s: string) => s.split('\n').map(x => x.trim()).filter(Boolean);
    const data = { title: f.title.trim(), date: f.date, time: f.time, venue: f.venue, type: f.type, agenda: lines(f.agendaText), minutes: f.minutes, decisions: lines(f.decisionsText), attendance: f.attendance, status: f.status };
    update(d => {
      if (m) Object.assign(d.meetings.find(x => x.id === m.id)!, data);
      else { d.meetings.push({ id: uid('m'), ...data }); notify(d, 'all', 'Meeting scheduled', `${data.title} — ${fmtDate(data.date)}, ${data.time} at ${data.venue}`, 'meeting', '/dashboard/secretariat'); logActivity(d, user!.id, `scheduled “${data.title}”`); }
    });
    toast(m ? 'Meeting record saved' : 'Meeting scheduled — executives notified'); onClose();
  };
  return (
    <Modal open={open} onClose={onClose} title={m ? 'Edit meeting record' : 'Schedule meeting'} wide footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button variant="gradient" type="submit" form="mt-form">Save</Button></>}>
      <form id="mt-form" onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
        <Field label="Title" error={err} className="sm:col-span-2"><Input value={f.title} onChange={e => setF({ ...f, title: e.target.value })} /></Field>
        <Field label="Date"><Input type="date" value={f.date} onChange={e => setF({ ...f, date: e.target.value })} /></Field>
        <Field label="Time"><Input value={f.time} onChange={e => setF({ ...f, time: e.target.value })} /></Field>
        <Field label="Venue"><Input value={f.venue} onChange={e => setF({ ...f, venue: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Type"><Select value={f.type} onChange={e => setF({ ...f, type: e.target.value as Meeting['type'] })}><option>Executive</option><option>General</option><option>Emergency</option></Select></Field>
          <Field label="Status"><Select value={f.status} onChange={e => setF({ ...f, status: e.target.value as Meeting['status'] })}><option>Scheduled</option><option>Completed</option></Select></Field>
        </div>
        <Field label="Agenda (one item per line)" className="sm:col-span-2"><Textarea rows={3} value={f.agendaText} onChange={e => setF({ ...f, agendaText: e.target.value })} /></Field>
        <Field label="Minutes" className="sm:col-span-2"><Textarea rows={4} value={f.minutes} onChange={e => setF({ ...f, minutes: e.target.value })} placeholder="Record discussion points after the meeting…" /></Field>
        <Field label="Decisions & resolutions (one per line)" className="sm:col-span-2"><Textarea rows={3} value={f.decisionsText} onChange={e => setF({ ...f, decisionsText: e.target.value })} /></Field>
        <div className="sm:col-span-2">
          <span className="label">Attendance</span>
          <div className="grid gap-2 sm:grid-cols-2">{state.executives.map(ex => (
            <div key={ex.id} className="flex items-center justify-between gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm">
              <span className="truncate">{ex.name}</span>
              <div className="flex gap-1">{(['Present', 'Absent', 'Excused'] as Attendance[]).map(a => (
                <button type="button" key={a} onClick={() => setF({ ...f, attendance: { ...f.attendance, [ex.id]: a } })} className={`rounded px-2 py-0.5 text-[11px] font-semibold ${f.attendance[ex.id] === a ? (a === 'Present' ? 'bg-emerald-400/20 text-emerald-300' : a === 'Absent' ? 'bg-ember/20 text-[#ff8a8a]' : 'bg-amber-400/20 text-amber-300') : 'text-ice/40 hover:bg-white/5'}`}>{a[0]}</button>
              ))}</div>
            </div>
          ))}</div>
          <p className="mt-1 text-xs text-ice/40">P = Present · A = Absent · E = Excused</p>
        </div>
      </form>
    </Modal>
  );
}

function NoticeForm({ open, onClose, n }: { open: boolean; onClose: () => void; n?: Notice }) {
  const { update, user } = useDemo();
  const toast = useToast();
  const [f, setF] = useState({ title: '', body: '', audience: 'Executives' as Notice['audience'], pinned: false });
  const [k, setK] = useState('');
  if (k !== `${open}${n?.id}`) { setK(`${open}${n?.id}`); setF(n ? { title: n.title, body: n.body, audience: n.audience, pinned: n.pinned } : { title: '', body: '', audience: 'Executives', pinned: false }); }
  const ok = f.title.trim().length > 3 && f.body.trim().length > 5;
  return (
    <Modal open={open} onClose={onClose} title={n ? 'Edit notice' : 'New official notice'} footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button variant="gradient" disabled={!ok} onClick={() => { update(d => { if (n) Object.assign(d.notices.find(x => x.id === n.id)!, f); else { d.notices.unshift({ id: uid('n'), ...f, date: day(0), authorId: user!.id }); notify(d, 'all', 'New notice', f.title, 'system', '/dashboard'); } }); toast('Notice published'); onClose(); }}>Publish</Button></>}>
      <div className="grid gap-4">
        <Field label="Title"><Input value={f.title} onChange={e => setF({ ...f, title: e.target.value })} /></Field>
        <Field label="Body"><Textarea value={f.body} onChange={e => setF({ ...f, body: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-3"><Field label="Audience"><Select value={f.audience} onChange={e => setF({ ...f, audience: e.target.value as Notice['audience'] })}><option>Executives</option><option>Members</option><option>Public</option></Select></Field>
          <label className="mt-6 flex items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4 accent-red-500" checked={f.pinned} onChange={e => setF({ ...f, pinned: e.target.checked })} />Pin to dashboard</label></div>
      </div>
    </Modal>
  );
}

const GS_CATEGORIES = ['Minutes', 'Notice', 'Official Letter', 'Report', 'Competition Plan', 'Event Documentation', 'Constitution'];

export default function Secretariat() {
  const { state, update, user } = useDemo();
  const toast = useToast();
  const confirm = useConfirm();
  const [params, setParams] = useSearchParams();
  const [tab, setTab] = useState<'meetings' | 'notices' | 'archive'>('meetings');
  const [mForm, setMForm] = useState<{ open: boolean; m?: Meeting }>({ open: params.get('new') === '1' });
  const [nForm, setNForm] = useState<{ open: boolean; n?: Notice }>({ open: false });
  const [taskPreset, setTaskPreset] = useState<Partial<Task> | null>(null);
  const [view, setView] = useState<Meeting | null>(null);
  const [docForm, setDocForm] = useState({ open: false, name: '', category: 'Official Letter', content: '' });
  const [q, setQ] = useState(''); const [cat, setCat] = useState('');
  const meetings = [...state.meetings].sort((a, b) => b.date.localeCompare(a.date));
  const archive = state.documents.filter(d => GS_CATEGORIES.includes(d.category) && (!cat || d.category === cat) && (!q || `${d.name} ${d.tags.join(' ')} ${d.content ?? ''}`.toLowerCase().includes(q.toLowerCase())));

  const attendanceRate = (m: Meeting) => { const v = Object.values(m.attendance); return v.length ? Math.round((v.filter(a => a === 'Present').length / v.length) * 100) : null; };

  return (
    <>
      <PageHeader title="General Secretary Workspace" sub="Meetings, minutes, attendance, resolutions, notices and the official archive."
        actions={<>{tab === 'meetings' && <Button variant="gradient" onClick={() => setMForm({ open: true })}><Plus className="h-4 w-4" />Schedule meeting</Button>}
          {tab === 'notices' && <Button variant="gradient" onClick={() => setNForm({ open: true })}><Plus className="h-4 w-4" />New notice</Button>}
          {tab === 'archive' && <Button variant="gradient" onClick={() => setDocForm({ open: true, name: '', category: 'Official Letter', content: '' })}><Plus className="h-4 w-4" />Draft letter / report</Button>}</>} />
      <div className="mb-5"><Tabs value={tab} onChange={setTab} tabs={[{ id: 'meetings', label: 'Meetings', count: state.meetings.length }, { id: 'notices', label: 'Official notices', count: state.notices.length }, { id: 'archive', label: 'Documents & archive' }]} /></div>

      {tab === 'meetings' && <div className="grid gap-4 lg:grid-cols-2">
        {meetings.map(m => { const rate = attendanceRate(m); return (
          <Card key={m.id} className="flex flex-col p-5">
            <div className="flex flex-wrap items-center gap-2"><StatusBadge s={m.status} /><Badge>{m.type}</Badge>{rate !== null && <Badge tone="green">{rate}% attendance</Badge>}</div>
            <h3 className="mt-2 font-display text-xl font-semibold">{m.title}</h3>
            <p className="mt-1 flex flex-wrap gap-x-4 text-xs text-ice/50"><span className="flex items-center gap-1"><CalendarClock className="h-3.5 w-3.5" />{fmtDate(m.date)} · {m.time}</span><span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{m.venue}</span></p>
            <div className="mt-3 text-sm"><p className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-ice/45"><ListChecks className="h-3.5 w-3.5" />Agenda</p><ol className="list-inside list-decimal text-ice/70">{m.agenda.map((a, i) => <li key={i}>{a}</li>)}</ol></div>
            {m.decisions.length > 0 && <div className="mt-3 text-sm"><p className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-ice/45"><Gavel className="h-3.5 w-3.5" />Decisions</p><ul className="space-y-1 text-ice/70">{m.decisions.map((d, i) => <li key={i}>• {d}</li>)}</ul></div>}
            <div className="mt-auto flex flex-wrap gap-2 pt-4">
              <Button size="sm" onClick={() => setView(m)}>View minutes</Button>
              <Button size="sm" variant="ghost" onClick={() => setMForm({ open: true, m })}><Pencil className="h-3.5 w-3.5" />Edit / record</Button>
              <Button size="sm" variant="ghost" onClick={() => setTaskPreset({ title: `Follow-up: ${m.decisions[0] ?? m.agenda[0] ?? m.title}`, description: `Follow-up action from ${m.title} (${fmtDate(m.date)}).`, related: m.title, deadline: day(7) })}><ClipboardList className="h-3.5 w-3.5" />Follow-up task</Button>
            </div>
          </Card>); })}
        {!meetings.length && <Empty title="No meetings yet" />}
      </div>}

      {tab === 'notices' && <div className="space-y-3">
        {[...state.notices].sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.date.localeCompare(a.date)).map(n => (
          <Card key={n.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start">
            <Megaphone className="h-5 w-5 shrink-0 text-cyan" />
            <div className="flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{n.title}</p>{n.pinned && <Badge tone="cyan"><Pin className="h-3 w-3" />Pinned</Badge>}<Badge>{n.audience}</Badge></div><p className="mt-1 text-sm text-ice/65">{n.body}</p><p className="mt-1 text-xs text-ice/35">{fmtDate(n.date)} · {execName(state, n.authorId)}</p></div>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" onClick={() => setNForm({ open: true, n })}><Pencil className="h-3.5 w-3.5" /></Button>
              <Button size="sm" variant="ghost" onClick={() => { update(d => { const x = d.notices.find(y => y.id === n.id)!; x.pinned = !x.pinned; }); }}><Pin className="h-3.5 w-3.5" /></Button>
              <Button size="sm" variant="danger" aria-label="Delete notice" onClick={async () => { if (await confirm({ title: 'Delete notice?', body: n.title, danger: true, confirmText: 'Delete' })) { update(d => { d.notices = d.notices.filter(x => x.id !== n.id); }); toast('Notice deleted'); } }}><Trash2 className="h-3.5 w-3.5" /></Button>
            </div>
          </Card>
        ))}
      </div>}

      {tab === 'archive' && <>
        <div className="mb-4 grid gap-2 sm:grid-cols-[2fr_1fr_auto]"><SearchBox value={q} onChange={setQ} placeholder="Search archive by title, tag or content…" /><Select value={cat} onChange={e => setCat(e.target.value)} aria-label="Category"><option value="">All categories</option>{GS_CATEGORIES.map(c => <option key={c}>{c}</option>)}</Select>
          <Button onClick={() => downloadCSV('attendance.csv', state.meetings.flatMap(m => Object.entries(m.attendance).map(([id, a]) => ({ meeting: m.title, date: m.date, executive: execName(state, id), attendance: a }))))}><Download className="h-4 w-4" />Attendance CSV</Button></div>
        <div className="grid gap-3 md:grid-cols-2">
          {archive.map(d => (
            <Card key={d.id} className="flex gap-3 p-4"><FileText className="h-8 w-8 shrink-0 text-cyan" /><div className="min-w-0"><p className="truncate font-medium">{d.name}</p><p className="text-xs text-ice/45">{d.category} · {fmtDate(d.at)} · {execName(state, d.uploadedBy)}</p>{d.content && <p className="mt-1 line-clamp-2 text-xs text-ice/55">{d.content}</p>}<div className="mt-2 flex flex-wrap gap-1">{d.tags.map(t => <span key={t} className="rounded bg-white/5 px-1.5 text-[10px] text-ice/55">#{t}</span>)}</div></div></Card>
          ))}
        </div>
        {!archive.length && <Empty title="Nothing in the archive matches" />}
      </>}

      <MeetingForm open={mForm.open} m={mForm.m} onClose={() => { setMForm({ open: false }); if (params.get('new')) setParams({}); }} />
      <NoticeForm open={nForm.open} n={nForm.n} onClose={() => setNForm({ open: false })} />
      <TaskForm open={!!taskPreset} preset={taskPreset ?? undefined} onClose={() => setTaskPreset(null)} />
      <Modal open={!!view} onClose={() => setView(null)} title={view?.title ?? ''} wide>
        {view && <div className="space-y-4 text-sm">
          <p className="text-ice/55">{fmtDate(view.date)} · {view.time} · {view.venue}</p>
          <div><p className="label">Minutes</p><p className="whitespace-pre-wrap text-ice/75">{view.minutes || 'Minutes not recorded yet.'}</p></div>
          <div><p className="label">Attendance</p><div className="flex flex-wrap gap-1.5">{Object.entries(view.attendance).map(([id, a]) => <Badge key={id} tone={a === 'Present' ? 'green' : a === 'Absent' ? 'red' : 'amber'}>{execName(state, id)} · {a}</Badge>)}{!Object.keys(view.attendance).length && <span className="text-ice/45">Not taken yet.</span>}</div></div>
        </div>}
      </Modal>
      <Modal open={docForm.open} onClose={() => setDocForm({ ...docForm, open: false })} title="Draft official document"
        footer={<><Button variant="ghost" onClick={() => setDocForm({ ...docForm, open: false })}>Cancel</Button><Button variant="gradient" disabled={docForm.name.trim().length < 3} onClick={() => { update(d => { d.documents.unshift({ id: uid('doc'), name: docForm.name.trim().endsWith('.docx') ? docForm.name.trim() : `${docForm.name.trim()}.docx`, folder: docForm.category === 'Official Letter' ? 'Letters' : docForm.category === 'Report' ? 'Reports' : 'Official', category: docForm.category, tags: [docForm.category.toLowerCase().split(' ')[0]], size: docForm.content.length * 2 + 2048, ext: 'docx', uploadedBy: user!.id, at: day(0), content: docForm.content }); }); toast('Saved to the archive'); setDocForm({ ...docForm, open: false }); }}>Save to archive</Button></>}>
        <div className="grid gap-4">
          <Field label="Document title"><Input value={docForm.name} onChange={e => setDocForm({ ...docForm, name: e.target.value })} placeholder="Letter — Request for auditorium" /></Field>
          <Field label="Category"><Select value={docForm.category} onChange={e => setDocForm({ ...docForm, category: e.target.value })}>{GS_CATEGORIES.map(c => <option key={c}>{c}</option>)}</Select></Field>
          <Field label="Content"><Textarea rows={8} value={docForm.content} onChange={e => setDocForm({ ...docForm, content: e.target.value })} placeholder={'To,\nThe Head of Department…'} /></Field>
        </div>
      </Modal>
    </>
  );
}
