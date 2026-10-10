import { useState, type FormEvent } from 'react';
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { useDemo, useToast } from '../../store/DemoStore';
import { Avatar, Badge, Button, Card, Field, Input, Modal, PageHeader, Textarea, useConfirm } from '../../components/ui';
import { isEmail, uid } from '../../lib/util';
import type { Executive } from '../../types';

export function readImage(file: File, maxBytes: number): Promise<string> {
  return new Promise((res, rej) => {
    if (!file.type.startsWith('image/')) return rej(new Error('Please choose an image file.'));
    if (file.size > maxBytes) return rej(new Error(`Image must be under ${Math.round(maxBytes / 1024)} KB in the demo (local storage is small).`));
    const r = new FileReader(); r.onload = () => res(String(r.result)); r.onerror = () => rej(new Error('Could not read file.')); r.readAsDataURL(file);
  });
}

function ExecForm({ open, onClose, ex }: { open: boolean; onClose: () => void; ex?: Executive }) {
  const { state, update } = useDemo();
  const toast = useToast();
  const blank = { name: '', email: '', designation: '', bio: '', department: 'CSE', batch: '', phone: '', photo: '' as string | undefined, showOnSite: true, order: state.executives.length + 1 };
  const [f, setF] = useState(blank);
  const [err, setErr] = useState<Record<string, string>>({});
  const [k, setK] = useState('');
  if (k !== `${open}${ex?.id}`) { setK(`${open}${ex?.id}`); 
  setF(
  ex
    ? {
        name: ex.name,
        email: ex.email ?? "",
        designation: ex.designation,
        bio: ex.bio ?? "",
        department: ex.department ?? "",
        batch: ex.batch ?? "",
        phone: ex.phone ?? "",
        photo: ex.photo,
        showOnSite: ex.showOnSite,
        order: ex.order,
      }
    : blank
);
  setErr({}); }
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (f.name.trim().length < 3) er.name = 'Enter a name.';
    if (!isEmail(f.email)) er.email = 'Enter a valid email.';
    else if (
      state.executives.some(
        x =>
          x.email?.toLowerCase() === f.email.toLowerCase() &&
          x.id !== ex?.id
      )
    ) {
      er.email = "Email already used.";
    }
    if (!f.designation.trim()) er.designation = 'Add a designation.';
    setErr(er); if (Object.keys(er).length) return;
    update(d => {
      if (ex) Object.assign(d.executives.find(x => x.id === ex.id)!, f);
      else d.executives.push({ ...f, id: uid('e'), roleIds: ['r-exec'], hue: Math.floor(Math.random() * 360) });
    });
    toast(ex ? 'Profile updated' : 'Executive added (Executive Member role)'); onClose();
  };
  return (
    <Modal open={open} onClose={onClose} title={ex ? 'Edit executive profile' : 'Add executive'} wide footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button variant="gradient" type="submit" form="ex-form">Save</Button></>}>
      <form id="ex-form" onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-4 sm:col-span-2">
          <Avatar name={f.name || '?'} hue={ex?.hue ?? 200} photo={f.photo} size={72} />
          <div className="flex-1"><Field label="Photo" error={err.photo} hint="JPG/PNG under 200 KB (demo stores it in local storage).">
            <Input type="file" accept="image/*" onChange={async e => { const file = e.target.files?.[0]; if (!file) return; try { const url = await readImage(file, 200 * 1024); setF(s => ({ ...s, photo: url })); setErr(s => ({ ...s, photo: '' })); } catch (x) { setErr(s => ({ ...s, photo: (x as Error).message })); } }} />
          </Field>{f.photo && <button type="button" onClick={() => setF({ ...f, photo: undefined })} className="mt-1 text-xs text-[#ff8a8a]">Remove photo</button>}</div>
        </div>
        <Field label="Name" error={err.name}><Input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></Field>
        <Field label="Designation" error={err.designation}><Input value={f.designation} onChange={e => setF({ ...f, designation: e.target.value })} /></Field>
        <Field label="Email" error={err.email}><Input value={f.email} onChange={e => setF({ ...f, email: e.target.value })} /></Field>
        <Field label="Phone (private)"><Input value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} /></Field>
        <Field label="Department"><Input value={f.department} onChange={e => setF({ ...f, department: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-3"><Field label="Batch"><Input value={f.batch} onChange={e => setF({ ...f, batch: e.target.value })} /></Field><Field label="Display order"><Input type="number" value={f.order} onChange={e => setF({ ...f, order: Number(e.target.value) })} /></Field></div>
        <Field label="Biography" className="sm:col-span-2"><Textarea value={f.bio} onChange={e => setF({ ...f, bio: e.target.value })} /></Field>
        <label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" className="h-4 w-4 accent-red-500" checked={f.showOnSite} onChange={e => setF({ ...f, showOnSite: e.target.checked })} />Show on public Executive Panel</label>
      </form>
    </Modal>
  );
}

export default function ExecutivesAdmin() {
  const { state, update, user } = useDemo();
  const toast = useToast();
  const confirm = useConfirm();
  const [form, setForm] = useState<{ open: boolean; ex?: Executive }>({ open: false });
  const list = [...state.executives].sort((a, b) => a.order - b.order);
  return (
    <>
      <PageHeader title="Executive Panel" sub="Edit committee profiles shown on the public website. Roles are managed in Roles & Access." actions={<Button variant="gradient" onClick={() => setForm({ open: true })}><Plus className="h-4 w-4" />Add executive</Button>} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.map(e => (
          <Card key={e.id} className="p-5">
            <div className="flex items-start gap-4">
              <Avatar name={e.name} hue={e.hue} photo={e.photo} size={56} />
              <div className="min-w-0 flex-1"><p className="font-display text-lg font-semibold">{e.name}</p><p className="text-sm text-cyan">{e.designation}</p><p className="text-xs text-ice/40">{e.email}</p></div>
              {e.showOnSite ? <Badge tone="green"><Eye className="h-3 w-3" />Public</Badge> : <Badge><EyeOff className="h-3 w-3" />Hidden</Badge>}
            </div>
            <p className="mt-3 line-clamp-2 text-sm text-ice/55">{e.bio}</p>
            <div className="mt-3 flex flex-wrap gap-1">{e.roleIds.map(r => { const ro = state.roles.find(x => x.id === r); return ro ? <span key={r} className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ color: ro.color, background: `${ro.color}1a` }}>{ro.name}</span> : null; })}</div>
            <div className="mt-4 flex gap-2">
              <Button size="sm" onClick={() => setForm({ open: true, ex: e })}><Pencil className="h-3.5 w-3.5" />Edit</Button>
              <Button size="sm" variant="ghost" onClick={() => { update(d => { const x = d.executives.find(y => y.id === e.id)!; x.showOnSite = !x.showOnSite; }); toast(e.showOnSite ? 'Hidden from public site' : 'Shown on public site'); }}>{e.showOnSite ? 'Hide' : 'Show'}</Button>
              {e.id !== user!.id && <Button size="sm" variant="danger" aria-label="Remove" onClick={async () => { if (await confirm({ title: `Remove ${e.name}?`, body: 'They will be removed from the committee and unassigned from tasks.', danger: true, confirmText: 'Remove' })) { update(d => { d.executives = d.executives.filter(x => x.id !== e.id); d.tasks.forEach(t => { t.assigneeIds = t.assigneeIds.filter(a => a !== e.id); }); }); toast('Executive removed'); } }}><Trash2 className="h-3.5 w-3.5" /></Button>}
            </div>
          </Card>
        ))}
      </div>
      <ExecForm open={form.open} ex={form.ex} onClose={() => setForm({ open: false })} />
    </>
  );
}
