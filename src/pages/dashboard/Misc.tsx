import { useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Folder, FileText, FileImage, FileSpreadsheet, Upload, Download, Eye, Trash2, Bell, CheckCheck, RotateCcw, Save, Database, ShieldAlert, Plus, X } from 'lucide-react';
import { useDemo, useToast, execName } from '../../store/DemoStore';
import { Badge, Button, Card, Chip, DemoNotice, Empty, Field, Input, Modal, PageHeader, SearchBox, Select, StatusBadge, Tabs, Textarea, useConfirm } from '../../components/ui';
import { isReadBy } from '../../components/DashboardLayout';
import { day, downloadBlob, fmtDate, formatBytes, relTime, uid } from '../../lib/util';
import type { DocFile, NotifType } from '../../types';

// ---------------- Documents ----------------
const ALLOWED = ['pdf', 'docx', 'doc', 'xlsx', 'csv', 'pptx', 'png', 'jpg', 'jpeg', 'txt', 'md'];
const MAX = 5 * 1048576;
const STORE_LIMIT = 500 * 1024;
const iconFor = (ext: string) => ['png', 'jpg', 'jpeg'].includes(ext) ? FileImage : ['xlsx', 'csv'].includes(ext) ? FileSpreadsheet : FileText;

export function Documents() {
  const { state, update, user, can } = useDemo();
  const toast = useToast();
  const confirm = useConfirm();
  const [params, setParams] = useSearchParams();
  const [folder, setFolder] = useState('');
  const [q, setQ] = useState(''); const [cat, setCat] = useState(''); const [tag, setTag] = useState('');
  const [preview, setPreview] = useState<DocFile | null>(null);
  const [up, setUp] = useState({ open: params.get('upload') === '1', file: null as File | null, folder: 'General', category: 'Report', tags: '', err: '', busy: false });
  const folders = Array.from(new Set(state.documents.map(d => d.folder))).sort();
  const cats = Array.from(new Set(state.documents.map(d => d.category))).sort();
  const tags = Array.from(new Set(state.documents.flatMap(d => d.tags))).sort();
  const list = useMemo(() => state.documents.filter(d => (!folder || d.folder === folder) && (!cat || d.category === cat) && (!tag || d.tags.includes(tag)) && (!q || `${d.name} ${d.tags.join(' ')} ${d.content ?? ''}`.toLowerCase().includes(q.toLowerCase()))), [state.documents, folder, cat, tag, q]);

  const pick = (file?: File) => {
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (!ALLOWED.includes(ext)) return setUp(s => ({ ...s, file: null, err: `.${ext} files aren’t allowed. Allowed: ${ALLOWED.join(', ')}` }));
    if (file.size > MAX) return setUp(s => ({ ...s, file: null, err: `File is ${formatBytes(file.size)} — the limit is 5 MB.` }));
    setUp(s => ({ ...s, file, err: '' }));
  };
  const doUpload = (e: FormEvent) => {
    e.preventDefault();
    const file = up.file; if (!file) return setUp(s => ({ ...s, err: 'Choose a file to upload.' }));
    setUp(s => ({ ...s, busy: true }));
    const finish = (dataUrl?: string) => {
      update(d => { d.documents.unshift({ id: uid('doc'), name: file.name, folder: up.folder.trim() || 'General', category: up.category, tags: up.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean), size: file.size, ext: file.name.split('.').pop()!.toLowerCase(), uploadedBy: user!.id, at: day(0), dataUrl }); });
      toast(dataUrl ? 'Uploaded to this browser' : 'Uploaded (metadata only — file over 500 KB is not kept in local storage)', dataUrl ? 'success' : 'info');
      setUp({ open: false, file: null, folder: 'General', category: 'Report', tags: '', err: '', busy: false });
      if (params.get('upload')) setParams({});
    };
    if (file.size <= STORE_LIMIT) { const r = new FileReader(); r.onload = () => finish(String(r.result)); r.onerror = () => finish(); r.readAsDataURL(file); } else setTimeout(() => finish(), 300);
  };
  const download = async (d: DocFile) => {
    if (d.dataUrl) { const b = await (await fetch(d.dataUrl)).blob(); downloadBlob(d.name, b); }
    else downloadBlob(`${d.name}.sample.txt`, new Blob([`DEMO FILE — ${d.name}\nCategory: ${d.category}\nUploaded by ${execName(state, d.uploadedBy)} on ${d.at}\n\n${d.content || 'This is a simulated download. Real files are not stored in the frontend demo.'}`], { type: 'text/plain' }));
    toast('Download started');
  };

  return (
    <>
      <PageHeader title="Documents" sub="Folders, categories and tags for club files." actions={can('documents.manage') && <Button variant="gradient" onClick={() => setUp(s => ({ ...s, open: true }))}><Upload className="h-4 w-4" />Upload</Button>} />
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <Card className="h-fit p-3">
          <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wider text-ice/45">Folders</p>
          {['', ...folders].map(f => <button key={f || 'all'} onClick={() => setFolder(f)} className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm ${folder === f ? 'bg-cyan/10 text-cyan' : 'text-ice/70 hover:bg-white/5'}`}><Folder className="h-4 w-4" />{f || 'All files'}<span className="ml-auto text-xs text-ice/40">{f ? state.documents.filter(d => d.folder === f).length : state.documents.length}</span></button>)}
        </Card>
        <div>
          <div className="mb-3 grid gap-2 sm:grid-cols-[2fr_1fr]"><SearchBox value={q} onChange={setQ} placeholder="Search names, tags and content…" /><Select value={cat} onChange={e => setCat(e.target.value)} aria-label="Category"><option value="">All categories</option>{cats.map(c => <option key={c}>{c}</option>)}</Select></div>
          <div className="mb-4 flex flex-wrap gap-1.5">{tags.map(t => <Chip key={t} active={tag === t} onClick={() => setTag(tag === t ? '' : t)}>#{t}</Chip>)}</div>
          <div className="card divide-y divide-white/5 overflow-hidden">
            {list.map(d => { const Icon = iconFor(d.ext); return (
              <div key={d.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <Icon className="h-8 w-8 shrink-0 text-cyan" />
                <div className="min-w-0 flex-1"><p className="truncate font-medium">{d.name}</p><p className="text-xs text-ice/45">{d.folder} · {d.category} · {formatBytes(d.size)} · {execName(state, d.uploadedBy)} · {fmtDate(d.at)}</p>
                  <div className="mt-1 flex flex-wrap gap-1">{d.tags.map(t => <span key={t} className="rounded bg-white/5 px-1.5 text-[10px] text-ice/55">#{t}</span>)}</div></div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => setPreview(d)}><Eye className="h-3.5 w-3.5" />Preview</Button>
                  <Button size="sm" variant="ghost" onClick={() => download(d)} aria-label="Download"><Download className="h-3.5 w-3.5" /></Button>
                  {can('documents.manage') && <Button size="sm" variant="ghost" aria-label="Delete" onClick={async () => { if (await confirm({ title: 'Delete document?', body: `“${d.name}” will be removed from the demo archive.`, danger: true, confirmText: 'Delete' })) { update(s => { s.documents = s.documents.filter(x => x.id !== d.id); }); toast('Document deleted'); } }}><Trash2 className="h-3.5 w-3.5" /></Button>}
                </div>
              </div>); })}
            {!list.length && <div className="p-6"><Empty title="No documents found" /></div>}
          </div>
          <div className="mt-4"><DemoNotice>Files live only in this browser’s local storage and are not shared across devices or users. Files over 500 KB keep metadata only.</DemoNotice></div>
        </div>
      </div>
      <Modal open={up.open} onClose={() => { setUp(s => ({ ...s, open: false })); if (params.get('upload')) setParams({}); }} title="Upload document" footer={<><Button variant="ghost" onClick={() => setUp(s => ({ ...s, open: false }))}>Cancel</Button><Button variant="gradient" type="submit" form="up-form" disabled={up.busy}>{up.busy ? 'Uploading…' : 'Upload'}</Button></>}>
        <form id="up-form" onSubmit={doUpload} noValidate className="grid gap-4">
          <label onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); pick(e.dataTransfer.files[0]); }} className="flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-white/15 p-6 text-center hover:border-cyan/50">
            <Upload className="h-7 w-7 text-cyan" /><p className="mt-2 text-sm">{up.file ? <b>{up.file.name}</b> : 'Drop a file or click to browse'}</p><p className="text-xs text-ice/40">{up.file ? formatBytes(up.file.size) : `${ALLOWED.join(', ')} · max 5 MB`}</p>
            <input type="file" className="sr-only" onChange={e => pick(e.target.files?.[0])} />
          </label>
          {up.err && <p role="alert" className="text-sm text-[#ff8a8a]">{up.err}</p>}
          <div className="grid grid-cols-2 gap-3"><Field label="Folder"><Input list="folders" value={up.folder} onChange={e => setUp({ ...up, folder: e.target.value })} /><datalist id="folders">{folders.map(f => <option key={f} value={f} />)}</datalist></Field>
            <Field label="Category"><Input list="cats" value={up.category} onChange={e => setUp({ ...up, category: e.target.value })} /><datalist id="cats">{cats.map(f => <option key={f} value={f} />)}</datalist></Field></div>
          <Field label="Tags" hint="Comma-separated"><Input value={up.tags} onChange={e => setUp({ ...up, tags: e.target.value })} placeholder="iupc, report" /></Field>
        </form>
      </Modal>
      <Modal open={!!preview} onClose={() => setPreview(null)} title={preview?.name ?? ''} wide footer={preview && <Button onClick={() => download(preview)}><Download className="h-4 w-4" />Download</Button>}>
        {preview && (preview.dataUrl && preview.dataUrl.startsWith('data:image') ? <img src={preview.dataUrl} alt={preview.name} className="mx-auto max-h-[60vh] rounded-lg" />
          : preview.dataUrl && preview.ext === 'pdf' ? <iframe title={preview.name} src={preview.dataUrl} className="h-[60vh] w-full rounded-lg bg-white" />
          : preview.content ? <div className="rounded-xl bg-white p-6 font-serif text-sm leading-relaxed text-neutral-800"><p className="mb-3 text-xs uppercase tracking-wider text-neutral-500">Sample document · {preview.category}</p><p className="whitespace-pre-wrap">{preview.content}</p></div>
          : <Empty title="Preview not available" body="This demo can preview images, small PDFs and sample text documents." />)}
      </Modal>
    </>
  );
}

// ---------------- Notifications ----------------
const TYPE_LABEL: Record<NotifType, string> = { task: 'Task', deadline: 'Deadline', meeting: 'Meeting', event: 'Event', review: 'Review', system: 'System' };
export function Notifications() {
  const { state, update, user } = useDemo();
  const nav = useNavigate();
  const toast = useToast();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [type, setType] = useState('');
  const mine = state.notifications.filter(n => (n.userId === user!.id || n.userId === 'all') && (filter === 'all' || !isReadBy(n, user!.id)) && (!type || n.type === type));
  const mark = (ids: string[]) => update(d => d.notifications.forEach(n => { if (!ids.includes(n.id)) return; if (n.userId === 'all') n.readBy = Array.from(new Set([...(n.readBy ?? []), user!.id])); else n.read = true; }));
  const unreadCount = state.notifications.filter(n => (n.userId === user!.id || n.userId === 'all') && !isReadBy(n, user!.id)).length;
  return (
    <>
      <PageHeader title="Notifications" sub={`${unreadCount} unread · task assignments, deadlines, meetings, events and review requests`} actions={<Button onClick={() => { mark(mine.map(n => n.id)); toast('All marked as read'); }}><CheckCheck className="h-4 w-4" />Mark all read</Button>} />
      <div className="mb-4 flex flex-wrap items-center gap-3"><Tabs value={filter} onChange={setFilter} tabs={[{ id: 'all', label: 'All' }, { id: 'unread', label: 'Unread', count: unreadCount }]} />
        <Select value={type} onChange={e => setType(e.target.value)} className="!w-44" aria-label="Type"><option value="">All types</option>{Object.entries(TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</Select></div>
      <div className="card divide-y divide-white/5 overflow-hidden">
        {mine.map(n => { const read = isReadBy(n, user!.id); return (
          <div key={n.id} className={`flex items-start gap-3 p-4 ${read ? '' : 'bg-cyan/[.04]'}`}>
            <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${read ? 'bg-white/10' : 'bg-cyan'}`} />
            <button className="min-w-0 flex-1 text-left" onClick={() => { mark([n.id]); if (n.link) nav(n.link); }}>
              <div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{n.title}</p><Badge>{TYPE_LABEL[n.type]}</Badge></div>
              <p className="text-sm text-ice/60">{n.body}</p><p className="text-xs text-ice/35">{relTime(n.at)}</p>
            </button>
            {!read && <Button size="sm" variant="ghost" onClick={() => mark([n.id])}>Mark read</Button>}
            {n.userId !== 'all' && <Button size="sm" variant="ghost" aria-label="Dismiss" onClick={() => update(d => { d.notifications = d.notifications.filter(x => x.id !== n.id); })}><X className="h-3.5 w-3.5" /></Button>}
          </div>); })}
        {!mine.length && <div className="p-6"><Empty title="You’re all caught up" /></div>}
      </div>
      <div className="mt-4"><DemoNotice>Notifications are generated in this browser only — other devices and users won’t receive them.</DemoNotice></div>
    </>
  );
}

// ---------------- Settings ----------------
export function Settings() {
  const { state, update, reset, storageWarning } = useDemo();
  const toast = useToast();
  const confirm = useConfirm();
  const [c, setC] = useState(state.club);
  const [goalsText, setGoalsText] = useState(state.club.goals.join('\n'));
  const save = (e: FormEvent) => {
    e.preventDefault();
    if (!c.name.trim() || !c.short.trim()) { toast('Club name and short name are required', 'error'); return; }
    update(d => { d.club = { ...c, goals: goalsText.split('\n').map(g => g.trim()).filter(Boolean), socials: c.socials.filter(s => s.label.trim() && s.url.trim()) }; });
    toast('Club information updated across the public site');
  };
  const txt = (k: keyof typeof c, label: string, area = false) => (
    <Field label={label} className={area ? 'sm:col-span-2' : ''}>{area ? <Textarea rows={3} value={c[k] as string} onChange={e => setC({ ...c, [k]: e.target.value })} /> : <Input value={c[k] as string} onChange={e => setC({ ...c, [k]: e.target.value })} />}</Field>
  );
  return (
    <>
      <PageHeader title="Settings" sub="Editable sample club information and demo data controls." />
      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <form onSubmit={save} className="card grid gap-4 p-6 sm:grid-cols-2">
          <h2 className="font-display text-xl font-semibold sm:col-span-2">Club information</h2>
          {txt('name', 'Club name')}{txt('short', 'Logo text (short name)')}{txt('heroTitle', 'Hero headline')}{txt('year', 'Year badge')}
          {txt('slogan', 'Slogan', true)}{txt('intro', 'Introduction', true)}{txt('mission', 'Mission', true)}{txt('vision', 'Vision', true)}{txt('history', 'History', true)}
          <Field label="Goals (one per line)" className="sm:col-span-2"><Textarea rows={4} value={goalsText} onChange={e => setGoalsText(e.target.value)} /></Field>
          {txt('email', 'Email')}{txt('phone', 'Phone')}{txt('address', 'Address', true)}
          <div className="sm:col-span-2"><span className="label">Social links</span>
            <div className="space-y-2">{c.socials.map((s, i) => <div key={i} className="flex gap-2"><Input value={s.label} onChange={e => setC({ ...c, socials: c.socials.map((x, j) => j === i ? { ...x, label: e.target.value } : x) })} className="!w-40" aria-label="Label" /><Input value={s.url} onChange={e => setC({ ...c, socials: c.socials.map((x, j) => j === i ? { ...x, url: e.target.value } : x) })} aria-label="URL" /><Button type="button" size="sm" variant="ghost" aria-label="Remove link" onClick={() => setC({ ...c, socials: c.socials.filter((_, j) => j !== i) })}><X className="h-4 w-4" /></Button></div>)}</div>
            <Button type="button" size="sm" className="mt-2" onClick={() => setC({ ...c, socials: [...c.socials, { label: '', url: 'https://' }] })}><Plus className="h-3.5 w-3.5" />Add link</Button></div>
          <div className="sm:col-span-2"><Button variant="gradient" type="submit"><Save className="h-4 w-4" />Save club info</Button></div>
        </form>
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="flex items-center gap-2 font-display text-xl font-semibold"><Database className="h-5 w-5 text-cyan" />Demo data</h2>
            <p className="mt-2 text-sm text-ice/60">All changes are saved to this browser’s local storage. Reset restores the original sample data for every module.</p>
            {storageWarning && <p className="mt-2 text-sm text-amber-300">Local storage is full or blocked — recent changes may not survive a refresh.</p>}
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="danger" onClick={async () => { if (await confirm({ title: 'Reset all demo data?', body: 'Every change (tasks, members, roles, finances, uploads) will be replaced with the original sample data. You will stay logged in.', danger: true, confirmText: 'Reset demo' })) { reset(); setC(state.club); toast('Demo data restored'); setTimeout(() => window.location.reload(), 400); } }}><RotateCcw className="h-4 w-4" />Reset demo data</Button>
              <Button onClick={() => { downloadBlob('club-demo-data.json', new Blob([JSON.stringify(state, (k, v) => (k === 'password' || k === 'dataUrl' ? undefined : v), 2)], { type: 'application/json' })); toast('Exported JSON'); }}><Download className="h-4 w-4" />Export JSON</Button>
            </div>
          </Card>
          <Card className="border-amber-400/25 p-6">
            <h2 className="flex items-center gap-2 font-display text-xl font-semibold"><ShieldAlert className="h-5 w-5 text-amber-300" />Demo security disclaimer</h2>
            <ul className="mt-3 list-inside list-disc space-y-1.5 text-sm text-ice/65">
              <li>Demo credentials are public sample credentials.</li>
              <li>Frontend role checks can be bypassed.</li>
              <li>Local storage is not secure storage.</li>
              <li>Financial records and private documents are mock data.</li>
              <li>No real membership verification or secure authentication is provided.</li>
              <li>Do not store real personal information or confidential club finances here.</li>
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}

// ---------------- Global search ----------------
export function SearchResults() {
  const { state, can } = useDemo();
  const [params] = useSearchParams();
  const q = (params.get('q') ?? '').toLowerCase();
  const has = (s: string) => s.toLowerCase().includes(q);
  const groups = [
    { label: 'Tasks', show: can('tasks.view'), items: state.tasks.filter(t => has(`${t.title} ${t.description} ${t.related}`)).map(t => ({ k: t.id, title: t.title, sub: `${t.status} · due ${fmtDate(t.deadline)}`, to: `/dashboard/tasks?task=${t.id}` })) },
    { label: 'Members', show: can('members.manage'), items: state.members.filter(m => has(`${m.name} ${m.id} ${m.email}`)).map(m => ({ k: m.id, title: `${m.name} (${m.id})`, sub: `${m.department} · ${m.status}`, to: '/dashboard/members' })) },
    { label: 'Events', show: true, items: state.events.filter(e => has(`${e.title} ${e.summary}`)).map(e => ({ k: e.id, title: e.title, sub: `${e.status} · ${fmtDate(e.date)}`, to: can('events.manage') ? '/dashboard/events' : `/events/${e.id}` })) },
    { label: 'Meetings', show: can('secretariat.manage'), items: state.meetings.filter(m => has(`${m.title} ${m.minutes} ${m.agenda.join(' ')}`)).map(m => ({ k: m.id, title: m.title, sub: fmtDate(m.date), to: '/dashboard/secretariat' })) },
    { label: 'Documents', show: true, items: state.documents.filter(d => has(`${d.name} ${d.tags.join(' ')} ${d.content ?? ''}`)).map(d => ({ k: d.id, title: d.name, sub: d.category, to: '/dashboard/documents' })) },
    { label: 'Transactions', show: can('finance.view'), items: state.transactions.filter(t => has(`${t.description} ${t.category}`)).map(t => ({ k: t.id, title: t.description, sub: `${t.type} · ${fmtDate(t.date)}`, to: '/dashboard/finance?tab=ledger' })) },
  ].filter(g => g.show && g.items.length);
  return (
    <>
      <PageHeader title={`Search: “${params.get('q') ?? ''}”`} sub={`${groups.reduce((s, g) => s + g.items.length, 0)} results across modules you can access`} />
      <div className="space-y-5">
        {groups.map(g => <Card key={g.label} className="p-5"><p className="eyebrow mb-3">{g.label}</p><ul className="divide-y divide-white/5">{g.items.slice(0, 10).map(i => <li key={i.k}><Link to={i.to} className="block py-2.5 hover:text-cyan"><p className="font-medium">{i.title}</p><p className="text-xs text-ice/45">{i.sub}</p></Link></li>)}</ul></Card>)}
        {!groups.length && <Empty title="No results" body="Try another keyword." />}
      </div>
    </>
  );
}

