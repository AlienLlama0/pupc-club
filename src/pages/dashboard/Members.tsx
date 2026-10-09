import { useMemo, useState } from 'react';
import { Check, X, Download, Mail, BadgeCheck, Copy } from 'lucide-react';
import { useDemo, useToast, logActivity, execName } from '../../store/DemoStore';
import { Badge, Button, Card, Empty, Modal, PageHeader, SearchBox, Select, SortTh, StatusBadge, Table, Tabs, sortBy, useConfirm } from '../../components/ui';
import { downloadCSV, fmtDate, relTime, today } from '../../lib/util';
import type { DemoState } from '../../types';

/** Next sequential public ID for the current year, e.g. PUPC-2026-004. */
export function nextMemberId(d: DemoState) {
  const y = new Date().getFullYear();
  const prefix = `${d.club.short}-${y}-`;
  const used = d.members.filter(m => m.id.startsWith(prefix)).map(m => Number(m.id.slice(prefix.length)) || 0);
  return prefix + String((used.length ? Math.max(...used) : 0) + 1).padStart(3, '0');
}

export default function Members() {
  const { state, update, user } = useDemo();
  const toast = useToast();
  const confirm = useConfirm();
  const [tab, setTab] = useState<'applications' | 'members' | 'messages'>('applications');
  const [appFilter, setAppFilter] = useState<'Pending' | 'Approved' | 'Rejected' | ''>('Pending');
  const [issued, setIssued] = useState<{ name: string; id: string } | null>(null);
  const [q, setQ] = useState(''); const [dept, setDept] = useState(''); const [status, setStatus] = useState('');
  const [sort, setSort] = useState<{ k: string; dir: 1 | -1 }>({ k: 'id', dir: 1 });

  const apps = state.applications.filter(a => !appFilter || a.status === appFilter);
  const members = useMemo(() => sortBy(state.members.filter(m =>
    (!q || `${m.name} ${m.id} ${m.email} ${m.studentId}`.toLowerCase().includes(q.toLowerCase())) && (!dept || m.department === dept) && (!status || m.status === status)), sort), [state.members, q, dept, status, sort]);
  const depts = Array.from(new Set(state.members.map(m => m.department)));

  const approve = (id: string) => {
    let memberId = '', name = '';
    update(d => {
      const a = d.applications.find(x => x.id === id)!;
      memberId = nextMemberId(d); name = a.name;
      a.status = 'Approved'; a.memberId = memberId; a.reviewedBy = user!.id;
      d.members.push({ id: memberId, name: a.name, studentId: a.studentId, email: a.email, phone: a.phone, department: a.department, batch: a.batch, interests: a.interests, status: 'Active', joinedAt: today() });
      logActivity(d, user!.id, `approved ${a.name}'s membership (${memberId})`);
    });
    setTimeout(() => setIssued({ name, id: memberId }), 0);
  };
  const reject = async (id: string) => {
    const a = state.applications.find(x => x.id === id)!;
    if (!(await confirm({ title: 'Reject application?', body: `${a.name}'s application will be marked as rejected.`, danger: true, confirmText: 'Reject' }))) return;
    update(d => { const x = d.applications.find(y => y.id === id)!; x.status = 'Rejected'; x.reviewedBy = user!.id; logActivity(d, user!.id, `rejected the application from ${x.name}`); });
    toast('Application rejected', 'info');
  };

  return (
    <>
      <PageHeader title="Members" sub="Review registrations, issue member IDs and manage the membership roster." />
      <div className="mb-5"><Tabs value={tab} onChange={setTab} tabs={[{ id: 'applications', label: 'Applications', count: state.applications.filter(a => a.status === 'Pending').length }, { id: 'members', label: 'Members', count: state.members.length }, { id: 'messages', label: 'Contact messages', count: state.messages.length }]} /></div>

      {tab === 'applications' && <>
        <div className="mb-4 flex flex-wrap gap-2">{(['Pending', 'Approved', 'Rejected', ''] as const).map(s => <Button key={s || 'all'} size="sm" variant={appFilter === s ? 'cream' : 'dark'} onClick={() => setAppFilter(s)}>{s || 'All'} ({s ? state.applications.filter(a => a.status === s).length : state.applications.length})</Button>)}</div>
        <div className="grid gap-4 lg:grid-cols-2">
          {apps.map(a => (
            <Card key={a.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div><p className="font-display text-lg font-semibold">{a.name}</p><p className="text-xs text-ice/45">{a.department} · Batch {a.batch} · ID {a.studentId} · applied {relTime(a.submittedAt)}</p></div>
                <StatusBadge s={a.status} />
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">{a.interests.map(i => <Badge key={i} tone="cyan">{i}</Badge>)}</div>
              <p className="mt-3 rounded-lg bg-white/[.03] p-3 text-sm text-ice/70">“{a.reason}”</p>
              <p className="mt-2 text-xs text-ice/40">{a.email} · {a.phone}</p>
              {a.status === 'Pending' ? (
                <div className="mt-4 flex gap-2"><Button size="sm" variant="gradient" onClick={() => approve(a.id)}><Check className="h-3.5 w-3.5" />Approve & issue ID</Button><Button size="sm" variant="danger" onClick={() => reject(a.id)}><X className="h-3.5 w-3.5" />Reject</Button></div>
              ) : <p className="mt-4 text-xs text-ice/45">{a.status} by {a.reviewedBy ? execName(state, a.reviewedBy) : '—'}{a.memberId && <> · Member ID <span className="font-mono text-cyan">{a.memberId}</span></>}</p>}
            </Card>
          ))}
        </div>
        {!apps.length && <Empty title="No applications here" body="New submissions from the public Join page will appear as Pending." />}
      </>}

      {tab === 'members' && <>
        <div className="mb-4 grid gap-2 sm:grid-cols-[2fr_1fr_1fr_auto]">
          <SearchBox value={q} onChange={setQ} placeholder="Search name, ID, email…" />
          <Select value={dept} onChange={e => setDept(e.target.value)} aria-label="Department"><option value="">All departments</option>{depts.map(d => <option key={d}>{d}</option>)}</Select>
          <Select value={status} onChange={e => setStatus(e.target.value)} aria-label="Status"><option value="">All statuses</option><option>Active</option><option>Inactive</option></Select>
          <Button onClick={() => downloadCSV('members.csv', members.map(m => ({ member_id: m.id, name: m.name, student_id: m.studentId, email: m.email, phone: m.phone, department: m.department, batch: m.batch, interests: m.interests, status: m.status, joined: m.joinedAt })))}><Download className="h-4 w-4" />CSV</Button>
        </div>
        <Table empty={!members.length} head={<><SortTh label="Member ID" k="id" sort={sort} setSort={setSort} /><SortTh label="Name" k="name" sort={sort} setSort={setSort} /><SortTh label="Dept" k="department" sort={sort} setSort={setSort} /><SortTh label="Batch" k="batch" sort={sort} setSort={setSort} /><th className="th">Interests</th><SortTh label="Status" k="status" sort={sort} setSort={setSort} /><th className="th">Action</th></>}>
          {members.map(m => (
            <tr key={m.id} className="hover:bg-white/[.02]">
              <td className="td font-mono text-xs text-cyan">{m.id}</td>
              <td className="td"><p className="font-medium">{m.name}</p><p className="text-xs text-ice/40">{m.email}</p></td>
              <td className="td">{m.department}</td><td className="td">{m.batch}</td>
              <td className="td text-xs text-ice/55">{m.interests.join(', ')}</td>
              <td className="td"><StatusBadge s={m.status} /></td>
              <td className="td"><Button size="sm" variant="ghost" onClick={() => { update(d => { const x = d.members.find(y => y.id === m.id)!; x.status = x.status === 'Active' ? 'Inactive' : 'Active'; }); toast(`${m.name} marked ${m.status === 'Active' ? 'Inactive' : 'Active'}`); }}>{m.status === 'Active' ? 'Deactivate' : 'Activate'}</Button></td>
            </tr>
          ))}
        </Table>
      </>}

      {tab === 'messages' && <div className="space-y-3">
        {state.messages.map(m => <Card key={m.id} className="p-4"><div className="flex items-center gap-2"><Mail className="h-4 w-4 text-cyan" /><p className="font-semibold">{m.subject}</p><span className="ml-auto text-xs text-ice/40">{relTime(m.at)}</span></div><p className="mt-1 text-xs text-ice/45">{m.name} · {m.email}</p><p className="mt-2 text-sm text-ice/70">{m.message}</p></Card>)}
        {!state.messages.length && <Empty title="No contact messages yet" body="Messages sent from the public Contact page appear here." />}
      </div>}

      <Modal open={!!issued} onClose={() => setIssued(null)} title="Member ID issued" footer={<Button variant="gradient" onClick={() => setIssued(null)}>Done</Button>}>
        {issued && <div className="text-center">
          <BadgeCheck className="mx-auto h-12 w-12 text-emerald-300" />
          <p className="mt-3 text-ice/70">{issued.name} is now an active member.</p>
          <div className="mx-auto mt-4 flex w-fit items-center gap-2 rounded-xl border border-cyan/40 bg-cyan/10 px-5 py-3"><span className="font-mono text-2xl font-bold text-cyan">{issued.id}</span>
            <button onClick={() => { navigator.clipboard?.writeText(issued.id).catch(() => {}); toast('Copied'); }} aria-label="Copy ID" className="text-ice/60 hover:text-white"><Copy className="h-4 w-4" /></button></div>
          <p className="mt-3 text-xs text-ice/45">Try it on the public Verify ID page.</p>
        </div>}
      </Modal>
    </>
  );
}

