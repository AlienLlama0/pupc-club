import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Pencil, Archive, Send, Trash2, ExternalLink, ImagePlus, Download, Undo2 } from 'lucide-react';
import { useDemo, useToast, logActivity, notify } from '../../store/DemoStore';
import { Badge, Button, Card, Cover, Empty, Field, Input, Modal, PageHeader, SearchBox, Select, StatusBadge, Tabs, Textarea, useConfirm } from '../../components/ui';
import { day, daysUntil, downloadCSV, fmtDate, uid } from '../../lib/util';
import { readImage } from './ExecutivesAdmin';
import type { ClubEvent, EventStatus, EventType } from '../../types';

const TYPES: EventType[] = ['Workshop', 'Contest', 'Hackathon', 'Seminar', 'Social'];

function EventForm({ open, onClose, ev }: { open: boolean; onClose: () => void; ev?: ClubEvent }) {
  const { update, user } = useDemo();
  const toast = useToast();
  const blank = { title: '', type: 'Workshop' as EventType, date: day(14), time: '3:00 PM', venue: '', summary: '', description: '', scheduleText: '', registrationUrl: '#/join', capacity: 60, registered: 0, featured: false, hue: Math.floor(Math.random() * 360) };
  const [f, setF] = useState(blank);
  const [err, setErr] = useState<Record<string, string>>({});
  const [k, setK] = useState('');
  if (k !== `${open}${ev?.id}`) { setK(`${open}${ev?.id}`); setF(ev ? { ...ev, scheduleText: ev.schedule.map(s => `${s.time} | ${s.item}`).join('\n') } : blank); setErr({}); }
  const save = (status?: EventStatus) => (e?: FormEvent) => {
    e?.preventDefault();
    const er: Record<string, string> = {};
    if (f.title.trim().length < 4) er.title = 'Add a title.';
    if (!f.venue.trim()) er.venue = 'Add a venue.';
    if (f.summary.trim().length < 10) er.summary = 'Write a short summary (10+ characters).';
    if (!(f.capacity > 0)) er.capacity = 'Capacity must be positive.';
    setErr(er); if (Object.keys(er).length) return;
    const schedule = f.scheduleText.split('\n').map(l => l.trim()).filter(Boolean).map(l => { const [time, ...rest] = l.split('|'); return rest.length ? { time: time.trim(), item: rest.join('|').trim() } : { time: '', item: time.trim() }; });
    const { scheduleText, ...data } = f;
    update(d => {
      if (ev) { const x = d.events.find(y => y.id === ev.id)!; Object.assign(x, { ...data, schedule }); if (status) x.status = status; }
      else { d.events.push({ ...data, id: uid('ev'), schedule, status: status ?? 'Draft' }); logActivity(d, user!.id, `created event “${data.title}”`); }
      if (status === 'Published') notify(d, 'all', 'Event published', data.title, 'event', '/dashboard/events');
    });
    toast(status === 'Published' ? 'Event published to the public site' : 'Event saved'); onClose();
  };
  return (
    <Modal open={open} onClose={onClose} title={ev ? 'Edit event' : 'Create event'} wide
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={save()}>{ev ? 'Save' : 'Save as draft'}</Button>{ev?.status !== 'Published' && <Button variant="gradient" onClick={save('Published')}><Send className="h-4 w-4" />Save & publish</Button>}</>}>
      <form onSubmit={save()} noValidate className="grid gap-4 sm:grid-cols-2">
        <Field label="Title" error={err.title} className="sm:col-span-2"><Input value={f.title} onChange={e => setF({ ...f, title: e.target.value })} /></Field>
        <Field label="Type"><Select value={f.type} onChange={e => setF({ ...f, type: e.target.value as EventType })}>{TYPES.map(t => <option key={t}>{t}</option>)}</Select></Field>
        <Field label="Venue" error={err.venue}><Input value={f.venue} onChange={e => setF({ ...f, venue: e.target.value })} /></Field>
        <Field label="Date"><Input type="date" value={f.date} onChange={e => setF({ ...f, date: e.target.value })} /></Field>
        <Field label="Time"><Input value={f.time} onChange={e => setF({ ...f, time: e.target.value })} /></Field>
        <Field label="Summary" error={err.summary} className="sm:col-span-2"><Input value={f.summary} onChange={e => setF({ ...f, summary: e.target.value })} /></Field>
        <Field label="Description" className="sm:col-span-2"><Textarea value={f.description} onChange={e => setF({ ...f, description: e.target.value })} /></Field>
        <Field label="Schedule" hint="One line per item: 10:00 AM | Opening" className="sm:col-span-2"><Textarea rows={4} value={f.scheduleText} onChange={e => setF({ ...f, scheduleText: e.target.value })} className="font-mono text-xs" /></Field>
        <Field label="Registration link"><Input value={f.registrationUrl} onChange={e => setF({ ...f, registrationUrl: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-3"><Field label="Capacity" error={err.capacity}><Input type="number" value={f.capacity} onChange={e => setF({ ...f, capacity: Number(e.target.value) })} /></Field><Field label="Registered"><Input type="number" value={f.registered} onChange={e => setF({ ...f, registered: Number(e.target.value) })} /></Field></div>
        <div className="sm:col-span-2 flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4 accent-red-500" checked={f.featured} onChange={e => setF({ ...f, featured: e.target.checked })} />Feature on home page</label>
          <label className="flex items-center gap-2 text-sm">Cover hue<input type="range" min={0} max={359} value={f.hue} onChange={e => setF({ ...f, hue: Number(e.target.value) })} className="accent-red-500" /></label>
          <div className="h-12 w-24 overflow-hidden rounded-lg"><Cover hue={f.hue} type={f.type} /></div>
        </div>
      </form>
    </Modal>
  );
}

export default function EventsAdmin() {
  const { state, update, user } = useDemo();
  const toast = useToast();
  const confirm = useConfirm();
  const [params, setParams] = useSearchParams();
  const [tab, setTab] = useState<'events' | 'gallery'>('events');
  const [form, setForm] = useState<{ open: boolean; ev?: ClubEvent }>({ open: params.get('new') === '1' });
  const [q, setQ] = useState(''); const [status, setStatus] = useState('');
  const [gForm, setGForm] = useState({ open: false, title: '', eventId: '', image: '', err: '' });
  const list = state.events.filter(e => (!q || e.title.toLowerCase().includes(q.toLowerCase())) && (!status || e.status === status)).sort((a, b) => b.date.localeCompare(a.date));
  const setEvStatus = (id: string, s: EventStatus) => { update(d => { const x = d.events.find(y => y.id === id)!; x.status = s; logActivity(d, user!.id, `${s === 'Published' ? 'published' : s === 'Archived' ? 'archived' : 'unpublished'} “${x.title}”`); }); toast(`Event ${s.toLowerCase()}`); };

  return (
    <>
      <PageHeader title="Events & Gallery" sub="Create, publish and archive events. Published events appear on the public site immediately."
        actions={<><Button onClick={() => downloadCSV('events.csv', state.events.map(e => ({ title: e.title, type: e.type, date: e.date, venue: e.venue, status: e.status, registered: e.registered, capacity: e.capacity })))}><Download className="h-4 w-4" />CSV</Button>
          {tab === 'events' ? <Button variant="gradient" onClick={() => setForm({ open: true })}><Plus className="h-4 w-4" />New event</Button> : <Button variant="gradient" onClick={() => setGForm({ open: true, title: '', eventId: '', image: '', err: '' })}><ImagePlus className="h-4 w-4" />Add photo</Button>}</>} />
      <div className="mb-5"><Tabs value={tab} onChange={setTab} tabs={[{ id: 'events', label: 'Events', count: state.events.length }, { id: 'gallery', label: 'Gallery', count: state.gallery.length }]} /></div>

      {tab === 'events' && <>
        <div className="mb-4 grid gap-2 sm:grid-cols-[2fr_1fr]"><SearchBox value={q} onChange={setQ} placeholder="Search events…" /><Select value={status} onChange={e => setStatus(e.target.value)} aria-label="Status"><option value="">All statuses</option><option>Draft</option><option>Published</option><option>Archived</option></Select></div>
        <div className="space-y-3">
          {list.map(e => { const dd = daysUntil(e.date); return (
            <Card key={e.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
              <div className="h-20 w-full shrink-0 overflow-hidden rounded-xl sm:w-32"><Cover hue={e.hue} type={e.type} /></div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2"><StatusBadge s={e.status} /><Badge tone="cyan">{e.type}</Badge>{e.featured && <Badge tone="violet">Featured</Badge>}<span className="text-xs text-ice/45">{dd >= 0 ? `in ${dd} days` : 'past'}</span></div>
                <p className="mt-1 font-display text-lg font-semibold">{e.title}</p>
                <p className="text-xs text-ice/45">{fmtDate(e.date)} · {e.time} · {e.venue} · {e.registered}/{e.capacity} registered</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Button size="sm" onClick={() => setForm({ open: true, ev: e })}><Pencil className="h-3.5 w-3.5" />Edit</Button>
                {e.status !== 'Published' && <Button size="sm" variant="gradient" onClick={() => setEvStatus(e.id, 'Published')}><Send className="h-3.5 w-3.5" />Publish</Button>}
                {e.status === 'Published' && <Button size="sm" variant="ghost" onClick={() => setEvStatus(e.id, 'Draft')}><Undo2 className="h-3.5 w-3.5" />Unpublish</Button>}
                {e.status !== 'Archived' && <Button size="sm" variant="ghost" onClick={async () => { if (await confirm({ title: 'Archive event?', body: `“${e.title}” will be hidden from the public site but kept in records.`, confirmText: 'Archive' })) setEvStatus(e.id, 'Archived'); }}><Archive className="h-3.5 w-3.5" />Archive</Button>}
                {e.status === 'Published' && <Link to={`/events/${e.id}`} target="_blank" className="btn btn-ghost btn-sm" aria-label="View on site"><ExternalLink className="h-3.5 w-3.5" /></Link>}
                <Button size="sm" variant="danger" aria-label="Delete" onClick={async () => { if (await confirm({ title: 'Delete event?', body: `Permanently delete “${e.title}” from the demo data?`, danger: true, confirmText: 'Delete' })) { update(d => { d.events = d.events.filter(x => x.id !== e.id); }); toast('Event deleted'); } }}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </Card>); })}
          {!list.length && <Empty title="No events match" />}
        </div>
      </>}

      {tab === 'gallery' && <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {state.gallery.map(g => (
          <figure key={g.id} className="card group relative overflow-hidden">
            <div className="h-40"><Cover hue={g.hue} image={g.image} label={g.title} /></div>
            <figcaption className="p-3 text-sm"><p className="font-medium">{g.title}</p><p className="text-xs text-ice/40">{state.events.find(e => e.id === g.eventId)?.title ?? 'General'}</p></figcaption>
            <button aria-label="Delete photo" onClick={async () => { if (await confirm({ title: 'Remove photo?', body: `Remove “${g.title}” from the gallery?`, danger: true, confirmText: 'Remove' })) { update(d => { d.gallery = d.gallery.filter(x => x.id !== g.id); }); toast('Photo removed'); } }} className="absolute right-2 top-2 rounded-lg bg-navy-950/80 p-1.5 text-ice/70 opacity-0 transition hover:text-ember group-hover:opacity-100 focus:opacity-100"><Trash2 className="h-4 w-4" /></button>
          </figure>
        ))}
      </div>}

      <EventForm open={form.open} ev={form.ev} onClose={() => { setForm({ open: false }); if (params.get('new')) setParams({}); }} />
      <Modal open={gForm.open} onClose={() => setGForm({ ...gForm, open: false })} title="Add gallery photo"
        footer={<><Button variant="ghost" onClick={() => setGForm({ ...gForm, open: false })}>Cancel</Button><Button variant="gradient" disabled={!gForm.title.trim()} onClick={() => { update(d => { d.gallery.unshift({ id: uid('g'), title: gForm.title.trim(), eventId: gForm.eventId || undefined, image: gForm.image || undefined, hue: Math.floor(Math.random() * 360), at: day(0) }); }); toast('Photo added to gallery'); setGForm({ ...gForm, open: false }); }}>Add</Button></>}>
        <div className="grid gap-4">
          <Field label="Caption"><Input value={gForm.title} onChange={e => setGForm({ ...gForm, title: e.target.value })} /></Field>
          <Field label="Event"><Select value={gForm.eventId} onChange={e => setGForm({ ...gForm, eventId: e.target.value })}><option value="">General</option>{state.events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}</Select></Field>
          <Field label="Image (optional)" error={gForm.err} hint="Under 400 KB. Without an image, generated cover art is used.">
            <Input type="file" accept="image/*" onChange={async e => { const file = e.target.files?.[0]; if (!file) return; try { const url = await readImage(file, 400 * 1024); setGForm(s => ({ ...s, image: url, err: '' })); } catch (x) { setGForm(s => ({ ...s, err: (x as Error).message })); } }} />
          </Field>
          {gForm.image && <img src={gForm.image} alt="Preview" className="h-40 w-full rounded-xl object-cover" />}
        </div>
      </Modal>
    </>
  );
}
