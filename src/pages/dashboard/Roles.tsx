import { useState, type FormEvent } from 'react';
import { Plus, Pencil, Power, Users, ShieldAlert } from 'lucide-react';
import { useDemo, useToast, logActivity, notify } from '../../store/DemoStore';
import { Avatar, Badge, Button, Card, DemoNotice, Field, Input, Modal, PageHeader, Tabs, Textarea, useConfirm } from '../../components/ui';
import { PERMISSIONS, uid } from '../../lib/util';
import type { Permission, Role } from '../../types';

const COLORS = ['#ff5a5f', '#c4142f', '#4ade80', '#f4c95d', '#fb923c', '#f472b6', '#ff6b6b', '#94a3b8', '#2dd4bf'];

function RoleForm({ open, onClose, role }: { open: boolean; onClose: () => void; role?: Role }) {
  const { state, update, user } = useDemo();
  const toast = useToast();
  const blank = { name: '', description: '', permissions: ['dashboard.view', 'tasks.view'] as Permission[], color: COLORS[0] };
  const [f, setF] = useState(blank);
  const [err, setErr] = useState('');
  const [k, setK] = useState('');
  if (k !== `${open}${role?.id}`) { setK(`${open}${role?.id}`); setF(role ? { name: role.name, description: role.description, permissions: role.permissions, color: role.color } : blank); setErr(''); }
  const groups = Array.from(new Set(PERMISSIONS.map(p => p.group)));
  const toggle = (p: Permission) => setF(s => ({ ...s, permissions: s.permissions.includes(p) ? s.permissions.filter(x => x !== p) : [...s.permissions, p] }));
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const name = f.name.trim();
    if (name.length < 2) return setErr('Type a role name (2+ characters).');
    if (state.roles.some(r => r.name.toLowerCase() === name.toLowerCase() && r.id !== role?.id)) return setErr('A role with this name already exists.');
    update(d => {
      if (role) Object.assign(d.roles.find(r => r.id === role.id)!, { ...f, name });
      else { d.roles.push({ id: uid('r'), ...f, name, active: true }); logActivity(d, user!.id, `created the role “${name}”`); }
    });
    toast(role ? 'Role updated — dashboards refresh instantly' : `Role “${name}” created`); onClose();
  };
  return (
    <Modal open={open} onClose={onClose} title={role ? `Edit role` : 'Create role'} wide footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button variant="gradient" type="submit" form="role-form">Save role</Button></>}>
      <form id="role-form" onSubmit={submit} noValidate className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
          <Field label="Role name" error={err}><Input autoFocus value={f.name} onChange={e => setF({ ...f, name: e.target.value })} placeholder="e.g. Media & PR Lead" /></Field>
          <div><span className="label">Badge colour</span><div className="flex flex-wrap gap-1.5">{COLORS.map(c => <button type="button" key={c} onClick={() => setF({ ...f, color: c })} className={`h-7 w-7 rounded-full ring-2 ${f.color === c ? 'ring-white' : 'ring-transparent'}`} style={{ background: c }} aria-label={`Colour ${c}`} />)}</div></div>
        </div>
        <Field label="Description"><Textarea rows={2} value={f.description} onChange={e => setF({ ...f, description: e.target.value })} /></Field>
        <div>
          <span className="label">Module access & demo permissions</span>
          <div className="grid gap-3 sm:grid-cols-2">
            {groups.map(g => (
              <div key={g} className="rounded-xl border border-white/10 p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-cyan">{g}</p>
                {PERMISSIONS.filter(p => p.group === g).map(p => (
                  <label key={p.key} className="flex items-center gap-2 py-1 text-sm text-ice/80"><input type="checkbox" className="h-4 w-4 accent-red-500" checked={f.permissions.includes(p.key)} onChange={() => toggle(p.key)} disabled={p.key === 'dashboard.view'} />{p.label}</label>
                ))}
              </div>
            ))}
          </div>
        </div>
      </form>
    </Modal>
  );
}

export default function Roles() {
  const { state, update, user } = useDemo();
  const toast = useToast();
  const confirm = useConfirm();
  const [tab, setTab] = useState<'roles' | 'assign'>('roles');
  const [form, setForm] = useState<{ open: boolean; role?: Role }>({ open: false });
  const [quickName, setQuickName] = useState('');
  const [viewRole, setViewRole] = useState<Role | null>(null);

  const quickCreate = (e: FormEvent) => {
    e.preventDefault();
    const name = quickName.trim();
    if (name.length < 2) { toast('Type a role name first', 'error'); return; }
    if (state.roles.some(r => r.name.toLowerCase() === name.toLowerCase())) { toast('That role already exists', 'error'); return; }
    update(d => { d.roles.push({ id: uid('r'), name, description: 'Custom role created in the demo.', permissions: ['dashboard.view', 'tasks.view'], active: true, color: COLORS[d.roles.length % COLORS.length] }); logActivity(d, user!.id, `created the role “${name}”`); });
    setQuickName(''); toast(`Role “${name}” created — configure its permissions with Edit`);
  };

  const toggleActive = async (r: Role) => {
    if (r.id === 'r-super' && r.active) { toast('Keep Super Admin active so you can still manage roles.', 'error'); return; }
    if (r.active && !(await confirm({ title: `Deactivate “${r.name}”?`, body: `${state.executives.filter(e => e.roleIds.includes(r.id)).length} executive(s) will immediately lose the access this role grants. You can reactivate it later.`, danger: true, confirmText: 'Deactivate' }))) return;
    update(d => { const x = d.roles.find(y => y.id === r.id)!; x.active = !x.active; });
    toast(`${r.name} ${r.active ? 'deactivated' : 'reactivated'}`);
  };

  const toggleAssign = (execId: string, roleId: string) => {
    const ex = state.executives.find(e => e.id === execId)!;
    const has = ex.roleIds.includes(roleId);
    if (has && execId === user!.id && roleId === 'r-super') { toast('You can’t remove your own Super Admin role in the demo.', 'error'); return; }
    update(d => {
      const x = d.executives.find(e => e.id === execId)!;
      x.roleIds = has ? x.roleIds.filter(r => r !== roleId) : [...x.roleIds, roleId];
      const rn = d.roles.find(r => r.id === roleId)!.name;
      if (!has) notify(d, [execId], 'New role assigned', `You now have the “${rn}” role.`, 'system', '/dashboard');
      logActivity(d, user!.id, `${has ? 'removed' : 'assigned'} “${rn}” ${has ? 'from' : 'to'} ${x.name}`);
    });
    toast(`${has ? 'Removed' : 'Assigned'} role`);
  };

  return (
    <>
      <PageHeader title="Roles & Access" sub="Roles are editable templates. Create any role by name, choose what it can access, and assign it to executives." actions={<Button variant="gradient" onClick={() => setForm({ open: true })}><Plus className="h-4 w-4" />Create role</Button>} />
      <div className="mb-5"><DemoNotice><b>Permissions are simulated client-side.</b> They control what this demo shows, but anyone can bypass them in the browser. A production version must enforce them on the server.</DemoNotice></div>
      <div className="mb-5"><Tabs value={tab} onChange={setTab} tabs={[{ id: 'roles', label: 'Roles', count: state.roles.length }, { id: 'assign', label: 'Assign to executives' }]} /></div>

      {tab === 'roles' && <>
        <form onSubmit={quickCreate} className="card mb-5 flex flex-col gap-2 p-4 sm:flex-row sm:items-center">
          <p className="text-sm font-semibold sm:w-48">Quick-create a role</p>
          <Input value={quickName} onChange={e => setQuickName(e.target.value)} placeholder="Type a role name, e.g. Media & PR Lead" />
          <Button type="submit" variant="cream">Create</Button>
        </form>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {state.roles.map(r => { const holders = state.executives.filter(e => e.roleIds.includes(r.id)); return (
            <Card key={r.id} className={`flex flex-col p-5 ${r.active ? '' : 'opacity-55'}`}>
              <div className="flex items-start gap-3">
                <span className="mt-1 h-3 w-3 shrink-0 rounded-full" style={{ background: r.color }} />
                <div className="min-w-0 flex-1"><p className="font-display text-lg font-semibold">{r.name}</p><p className="text-sm text-ice/55">{r.description}</p></div>
                {!r.active && <Badge tone="red">Inactive</Badge>}
              </div>
              <div className="mt-3 flex flex-wrap gap-1">{r.permissions.map(p => <span key={p} className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-ice/55">{p}</span>)}</div>
              <div className="mt-auto flex items-center gap-2 pt-4">
                <button onClick={() => setViewRole(r)} className="flex items-center gap-2 text-xs text-ice/60 hover:text-cyan"><div className="flex -space-x-2">{holders.slice(0, 4).map(h => <span key={h.id} className="rounded-full ring-2 ring-navy-800"><Avatar name={h.name} hue={h.hue} size={22} /></span>)}</div><Users className="h-3.5 w-3.5" />{holders.length}</button>
                <div className="ml-auto flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => setForm({ open: true, role: r })}><Pencil className="h-3.5 w-3.5" />Edit</Button>
                  <Button size="sm" variant={r.active ? 'danger' : 'dark'} onClick={() => toggleActive(r)}><Power className="h-3.5 w-3.5" />{r.active ? 'Deactivate' : 'Activate'}</Button>
                </div>
              </div>
            </Card>); })}
        </div>
      </>}

      {tab === 'assign' && <div className="card overflow-hidden"><div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead className="border-b border-white/10"><tr><th className="th sticky left-0 bg-navy-800">Executive</th>{state.roles.map(r => <th key={r.id} className="th text-center normal-case"><span className="inline-block max-w-[110px] leading-tight" style={{ color: r.active ? r.color : undefined }}>{r.name}</span></th>)}</tr></thead>
          <tbody className="divide-y divide-white/5">
            {state.executives.map(e => (
              <tr key={e.id} className="hover:bg-white/[.02]">
                <td className="td sticky left-0 bg-navy-800"><div className="flex items-center gap-2"><Avatar name={e.name} hue={e.hue} size={28} /><div><p className="font-medium">{e.name}</p><p className="text-xs text-ice/40">{e.designation}</p></div></div></td>
                {state.roles.map(r => <td key={r.id} className="td text-center"><input type="checkbox" aria-label={`${r.name} for ${e.name}`} className="h-4 w-4 accent-red-500" checked={e.roleIds.includes(r.id)} onChange={() => toggleAssign(e.id, r.id)} /></td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div><p className="flex items-center gap-2 border-t border-white/10 p-4 text-xs text-ice/50"><ShieldAlert className="h-4 w-4" />Changes apply immediately — log in as that executive to see their dashboard update.</p></div>}

      <RoleForm open={form.open} role={form.role} onClose={() => setForm({ open: false })} />
      <Modal open={!!viewRole} onClose={() => setViewRole(null)} title={viewRole ? `Members with “${viewRole.name}”` : ''}>
        <ul className="space-y-2">{viewRole && state.executives.filter(e => e.roleIds.includes(viewRole.id)).map(e => <li key={e.id} className="flex items-center gap-3 rounded-lg bg-white/5 p-3"><Avatar name={e.name} hue={e.hue} size={30} /><div><p className="font-medium">{e.name}</p><p className="text-xs text-ice/45">{e.email}</p></div></li>)}
          {viewRole && !state.executives.some(e => e.roleIds.includes(viewRole.id)) && <li className="text-sm text-ice/50">Nobody holds this role yet. Use the “Assign to executives” tab.</li>}</ul>
      </Modal>
    </>
  );
}
