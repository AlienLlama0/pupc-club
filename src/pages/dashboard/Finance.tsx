import { useMemo, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download, Plus, Check, X, FileText, Pencil, Trash2, Eye } from 'lucide-react';
import { useDemo, useToast, notify, logActivity, execName } from '../../store/DemoStore';
import { Badge, Button, Card, DemoNotice, Empty, Field, Input, Modal, PageHeader, Progress, SearchBox, Select, SortTh, Stat, StatusBadge, Table, Tabs, Textarea, sortBy, useConfirm } from '../../components/ui';
import { BarChart } from './Overview';
import { day, downloadCSV, fmtDate, money, nowISO, parseDate, uid } from '../../lib/util';
import type { Budget, Transaction } from '../../types';

export function monthlySummary(txs: Transaction[]) {
  const map = new Map<string, { key: string; label: string; income: number; expense: number }>();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    map.set(key, { key, label: d.toLocaleDateString('en-GB', { month: 'short' }), income: 0, expense: 0 });
  }
  txs.filter(t => t.status === 'Approved').forEach(t => {
    const key = t.date.slice(0, 7);
    if (!map.has(key)) map.set(key, { key, label: parseDate(t.date).toLocaleDateString('en-GB', { month: 'short' }), income: 0, expense: 0 });
    const m = map.get(key)!; if (t.type === 'Income') m.income += t.amount; else m.expense += t.amount;
  });
  return [...map.values()].sort((a, b) => a.key.localeCompare(b.key));
}

export const budgetActual = (txs: Transaction[], id: string) => txs.filter(t => t.budgetId === id && t.type === 'Expense' && t.status === 'Approved').reduce((s, t) => s + t.amount, 0);

/** Any executive can request a reimbursement; only finance.approve can decide it. */
export function ReimbursementForm({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, update, user } = useDemo();
  const toast = useToast();
  const [f, setF] = useState({ description: '', amount: '', budgetId: '', date: day(0), receiptName: '' });
  const [err, setErr] = useState<Record<string, string>>({});
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (f.description.trim().length < 4) er.description = 'Describe the expense.';
    if (!(Number(f.amount) > 0)) er.amount = 'Enter an amount greater than 0.';
    if (!f.budgetId) er.budgetId = 'Choose a budget.';
    if (!f.receiptName) er.receiptName = 'Attach a receipt (demo: file name only).';
    setErr(er); if (Object.keys(er).length) return;
    update(d => {
      d.reimbursements.unshift({ id: uid('rb'), requesterId: user!.id, description: f.description.trim(), amount: Number(f.amount), date: f.date, budgetId: f.budgetId, receiptName: f.receiptName, status: 'Pending' });
      const approvers = d.executives.filter(x => x.roleIds.some(r => d.roles.find(ro => ro.id === r)?.permissions.includes('finance.approve'))).map(x => x.id);
      notify(d, approvers, 'Reimbursement request', `${user!.name} requested ${money(Number(f.amount))}.`, 'review', '/dashboard/finance?tab=reimbursements');
    });
    toast('Reimbursement request sent to the Treasurer'); setF({ description: '', amount: '', budgetId: '', date: day(0), receiptName: '' }); onClose();
  };
  return (
    <Modal open={open} onClose={onClose} title="Request reimbursement" footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button variant="gradient" type="submit" form="rb-form">Submit request</Button></>}>
      <form id="rb-form" onSubmit={submit} noValidate className="grid gap-4">
        <Field label="What did you pay for?" error={err.description}><Input value={f.description} onChange={e => setF({ ...f, description: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Amount (৳)" error={err.amount}><Input type="number" min={1} value={f.amount} onChange={e => setF({ ...f, amount: e.target.value })} /></Field>
          <Field label="Date"><Input type="date" value={f.date} onChange={e => setF({ ...f, date: e.target.value })} /></Field>
        </div>
        <Field label="Budget" error={err.budgetId}><Select value={f.budgetId} onChange={e => setF({ ...f, budgetId: e.target.value })}><option value="">Select…</option>{state.budgets.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</Select></Field>
        <Field label="Receipt" error={err.receiptName} hint="Images or PDF, max 5 MB. Demo keeps only the file name.">
          <Input type="file" accept="image/*,.pdf" onChange={e => { const file = e.target.files?.[0]; if (!file) return; if (file.size > 5 * 1048576) { setErr({ ...err, receiptName: 'File is larger than 5 MB.' }); return; } setF({ ...f, receiptName: file.name }); setErr({ ...err, receiptName: '' }); }} />
        </Field>
      </form>
    </Modal>
  );
}

function TxForm({ open, onClose, tx }: { open: boolean; onClose: () => void; tx?: Transaction }) {
  const { state, update, user } = useDemo();
  const toast = useToast();
  const blank = { date: day(0), description: '', category: 'Food', type: 'Expense' as 'Income' | 'Expense', amount: '', budgetId: '', receipt: '' };
  const [f, setF] = useState(blank);
  const [k, setK] = useState('');
  const key = `${open}${tx?.id}`;
  if (k !== key) { setK(key); setF(tx ? { ...tx, amount: String(tx.amount), budgetId: tx.budgetId ?? '', receipt: tx.receipt ?? '' } : blank); }
  const [err, setErr] = useState<Record<string, string>>({});
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (f.description.trim().length < 3) er.description = 'Add a description.';
    if (!(Number(f.amount) > 0)) er.amount = 'Amount must be greater than 0.';
    setErr(er); if (Object.keys(er).length) return;
    update(d => {
      const data = { date: f.date, description: f.description.trim(), category: f.category, type: f.type, amount: Number(f.amount), budgetId: f.budgetId || undefined, receipt: f.receipt || undefined };
      if (tx) Object.assign(d.transactions.find(t => t.id === tx.id)!, data);
      else { d.transactions.unshift({ id: uid('tx'), ...data, status: 'Approved', recordedBy: user!.id }); logActivity(d, user!.id, `recorded ${f.type.toLowerCase()} “${data.description}” (${money(data.amount)})`); }
    });
    toast(tx ? 'Transaction updated' : 'Transaction recorded'); onClose();
  };
  const cats = ['Membership', 'Sponsorship', 'Grant', 'Registration', 'Food', 'Prizes', 'Printing', 'Merchandise', 'Venue', 'Software', 'Speakers', 'Supplies', 'Other'];
  return (
    <Modal open={open} onClose={onClose} title={tx ? 'Edit transaction' : 'Record transaction'} footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button variant="gradient" type="submit" form="tx-form">Save</Button></>}>
      <form id="tx-form" onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
        <Field label="Type"><Select value={f.type} onChange={e => setF({ ...f, type: e.target.value as 'Income' | 'Expense' })}><option>Income</option><option>Expense</option></Select></Field>
        <Field label="Date"><Input type="date" value={f.date} onChange={e => setF({ ...f, date: e.target.value })} /></Field>
        <Field label="Description" error={err.description} className="sm:col-span-2"><Input value={f.description} onChange={e => setF({ ...f, description: e.target.value })} /></Field>
        <Field label="Amount (৳)" error={err.amount}><Input type="number" value={f.amount} onChange={e => setF({ ...f, amount: e.target.value })} /></Field>
        <Field label="Category"><Select value={f.category} onChange={e => setF({ ...f, category: e.target.value })}>{cats.map(c => <option key={c}>{c}</option>)}</Select></Field>
        <Field label="Budget (optional)"><Select value={f.budgetId} onChange={e => setF({ ...f, budgetId: e.target.value })}><option value="">None</option>{state.budgets.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</Select></Field>
        <Field label="Receipt reference"><Input value={f.receipt} onChange={e => setF({ ...f, receipt: e.target.value })} placeholder="RCPT-0500.pdf" /></Field>
      </form>
    </Modal>
  );
}

function BudgetForm({ open, onClose, budget }: { open: boolean; onClose: () => void; budget?: Budget }) {
  const { update } = useDemo();
  const toast = useToast();
  const [f, setF] = useState({ name: '', kind: 'Event' as Budget['kind'], allocated: '' });
  const [k, setK] = useState('');
  if (k !== `${open}${budget?.id}`) { setK(`${open}${budget?.id}`); setF(budget ? { ...budget, allocated: String(budget.allocated) } : { name: '', kind: 'Event', allocated: '' }); }
  const ok = f.name.trim().length > 2 && Number(f.allocated) > 0;
  return (
    <Modal open={open} onClose={onClose} title={budget ? 'Edit budget' : 'New budget'} footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button variant="gradient" disabled={!ok} onClick={() => { update(d => { if (budget) Object.assign(d.budgets.find(b => b.id === budget.id)!, { name: f.name.trim(), kind: f.kind, allocated: Number(f.allocated) }); else d.budgets.push({ id: uid('b'), name: f.name.trim(), kind: f.kind, allocated: Number(f.allocated) }); }); toast('Budget saved'); onClose(); }}>Save</Button></>}>
      <div className="grid gap-4">
        <Field label="Name"><Input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Kind"><Select value={f.kind} onChange={e => setF({ ...f, kind: e.target.value as Budget['kind'] })}><option>Event</option><option>Project</option></Select></Field>
          <Field label="Allocated (৳)"><Input type="number" value={f.allocated} onChange={e => setF({ ...f, allocated: e.target.value })} /></Field>
        </div>
      </div>
    </Modal>
  );
}

type FTab = 'overview' | 'ledger' | 'budgets' | 'reimbursements' | 'receipts';
export default function Finance() {
  const { state, update, user, can } = useDemo();
  const toast = useToast();
  const confirm = useConfirm();
  const [params, setParams] = useSearchParams();
  const tab = (params.get('tab') as FTab) || 'overview';
  const setTab = (t: FTab) => setParams({ tab: t });
  const [txForm, setTxForm] = useState<{ open: boolean; tx?: Transaction }>({ open: params.get('new') === '1' });
  const [bForm, setBForm] = useState<{ open: boolean; b?: Budget }>({ open: false });
  const [rbOpen, setRbOpen] = useState(false);
  const [preview, setPreview] = useState<Transaction | null>(null);
  const [q, setQ] = useState(''); const [type, setType] = useState(''); const [status, setStatus] = useState(''); const [budget, setBudget] = useState('');
  const [sort, setSort] = useState<{ k: string; dir: 1 | -1 }>({ k: 'date', dir: -1 });
  const approver = can('finance.approve');

  const approved = state.transactions.filter(t => t.status === 'Approved');
  const income = approved.filter(t => t.type === 'Income').reduce((s, t) => s + t.amount, 0);
  const expense = approved.filter(t => t.type === 'Expense').reduce((s, t) => s + t.amount, 0);
  const pendingTx = state.transactions.filter(t => t.status === 'Pending');
  const pendingRb = state.reimbursements.filter(r => r.status === 'Pending');
  const months = monthlySummary(state.transactions);
  const ledger = useMemo(() => sortBy(state.transactions.filter(t =>
    (!q || `${t.description} ${t.category} ${t.receipt ?? ''}`.toLowerCase().includes(q.toLowerCase())) && (!type || t.type === type) && (!status || t.status === status) && (!budget || t.budgetId === budget)), sort), [state.transactions, q, type, status, budget, sort]);
  const bName = (id?: string) => state.budgets.find(b => b.id === id)?.name ?? '—';

  const decideTx = (id: string, s: 'Approved' | 'Rejected') => { update(d => { const t = d.transactions.find(x => x.id === id)!; t.status = s; logActivity(d, user!.id, `${s.toLowerCase()} transaction “${t.description}”`); }); toast(`Transaction ${s.toLowerCase()}`); };
  const decideRb = (id: string, s: 'Approved' | 'Rejected') => {
    update(d => {
      const r = d.reimbursements.find(x => x.id === id)!; r.status = s; r.note = s === 'Approved' ? 'Approved — added to ledger' : 'Rejected by Treasurer';
      if (s === 'Approved') d.transactions.unshift({ id: uid('tx'), date: day(0), description: `Reimbursement: ${r.description}`, category: 'Reimbursement', type: 'Expense', amount: r.amount, budgetId: r.budgetId, receipt: r.receiptName, status: 'Approved', recordedBy: user!.id });
      notify(d, [r.requesterId], `Reimbursement ${s.toLowerCase()}`, `${r.description} — ${money(r.amount)}`, 'review');
    });
    toast(`Reimbursement ${s.toLowerCase()}`);
  };

  return (
    <>
      <PageHeader title="Treasury" sub="Ledger, budgets and reimbursements — mock financial data for demonstration only."
        actions={<>
          <Button onClick={() => setRbOpen(true)}>Request reimbursement</Button>
          {approver && <Button variant="gradient" onClick={() => setTxForm({ open: true })}><Plus className="h-4 w-4" />Record transaction</Button>}
        </>} />
      <div className="mb-5"><Tabs value={tab} onChange={setTab} tabs={[{ id: 'overview', label: 'Overview' }, { id: 'ledger', label: 'Ledger', count: state.transactions.length }, { id: 'budgets', label: 'Budgets' }, { id: 'reimbursements', label: 'Reimbursements', count: pendingRb.length }, { id: 'receipts', label: 'Receipts' }]} /></div>

      {tab === 'overview' && <>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Stat label="Total income" value={money(income)} accent="#4ade80" />
          <Stat label="Total expenses" value={money(expense)} accent="#c4142f" />
          <Stat label="Balance" value={money(income - expense)} />
          <Stat label="Awaiting approval" value={pendingTx.length + pendingRb.length} sub={`${pendingTx.length} transactions · ${pendingRb.length} reimbursements`} accent="#f4c95d" />
        </div>
        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <Card className="p-5"><h2 className="mb-4 font-display text-xl font-semibold">Monthly income vs expense</h2><BarChart data={months.slice(-6).map(m => ({ label: m.label, a: m.income, b: m.expense }))} /></Card>
          <Card className="p-5">
            <h2 className="mb-4 font-display text-xl font-semibold">Budget vs actual</h2>
            <div className="space-y-4">{state.budgets.map(b => { const a = budgetActual(state.transactions, b.id); const pct = (a / b.allocated) * 100; return (
              <div key={b.id}><div className="mb-1 flex justify-between text-sm"><span>{b.name} <span className="text-xs text-ice/40">· {b.kind}</span></span><span className={pct > 100 ? 'text-[#ff8a8a]' : 'text-ice/60'}>{money(a)} / {money(b.allocated)}</span></div><Progress value={pct} tone={pct > 100 ? 'red' : pct > 85 ? 'gradient' : 'green'} /></div>); })}</div>
          </Card>
        </div>
        <Card className="mt-6 p-5">
          <div className="mb-3 flex items-center justify-between"><h2 className="font-display text-xl font-semibold">Monthly summaries</h2><Button size="sm" onClick={() => downloadCSV('monthly-summary.csv', months.map(m => ({ month: m.key, income: m.income, expense: m.expense, net: m.income - m.expense })))}><Download className="h-3.5 w-3.5" />CSV</Button></div>
          <div className="overflow-x-auto"><table className="w-full min-w-[480px]"><thead><tr><th className="th">Month</th><th className="th">Income</th><th className="th">Expense</th><th className="th">Net</th></tr></thead>
            <tbody className="divide-y divide-white/5">{[...months].reverse().map(m => <tr key={m.key}><td className="td">{parseDate(m.key + '-01').toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</td><td className="td text-emerald-300">{money(m.income)}</td><td className="td text-[#ffb3ad]">{money(m.expense)}</td><td className={`td font-semibold ${m.income - m.expense < 0 ? 'text-[#ff8a8a]' : ''}`}>{money(m.income - m.expense)}</td></tr>)}</tbody></table></div>
        </Card>
      </>}

      {tab === 'ledger' && <>
        <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_auto]">
          <SearchBox value={q} onChange={setQ} placeholder="Search ledger…" />
          <Select value={type} onChange={e => setType(e.target.value)} aria-label="Type"><option value="">Income & expense</option><option>Income</option><option>Expense</option></Select>
          <Select value={status} onChange={e => setStatus(e.target.value)} aria-label="Status"><option value="">All statuses</option><option>Approved</option><option>Pending</option><option>Rejected</option></Select>
          <Select value={budget} onChange={e => setBudget(e.target.value)} aria-label="Budget"><option value="">All budgets</option>{state.budgets.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</Select>
          <Button onClick={() => downloadCSV('ledger.csv', ledger.map(t => ({ date: t.date, description: t.description, category: t.category, type: t.type, amount: t.amount, budget: bName(t.budgetId), status: t.status, receipt: t.receipt ?? '', recorded_by: execName(state, t.recordedBy) })))}><Download className="h-4 w-4" />CSV</Button>
        </div>
        <Table empty={!ledger.length} head={<><SortTh label="Date" k="date" sort={sort} setSort={setSort} /><SortTh label="Description" k="description" sort={sort} setSort={setSort} /><th className="th">Budget</th><SortTh label="Amount" k="amount" sort={sort} setSort={setSort} /><SortTh label="Status" k="status" sort={sort} setSort={setSort} /><th className="th">Actions</th></>}>
          {ledger.map(t => (
            <tr key={t.id} className="hover:bg-white/[.02]">
              <td className="td whitespace-nowrap">{fmtDate(t.date)}</td>
              <td className="td"><p className="font-medium">{t.description}</p><p className="text-xs text-ice/40">{t.category}{t.receipt && <> · <button className="text-cyan hover:underline" onClick={() => setPreview(t)}>{t.receipt}</button></>}</p></td>
              <td className="td text-xs">{bName(t.budgetId)}</td>
              <td className={`td whitespace-nowrap font-semibold ${t.type === 'Income' ? 'text-emerald-300' : 'text-ice'}`}>{t.type === 'Income' ? '+' : '−'}{money(t.amount)}</td>
              <td className="td"><StatusBadge s={t.status} /></td>
              <td className="td"><div className="flex gap-1">
                {approver && t.status === 'Pending' && <><Button size="sm" variant="gradient" onClick={() => decideTx(t.id, 'Approved')} aria-label="Approve"><Check className="h-3.5 w-3.5" /></Button><Button size="sm" variant="danger" onClick={() => decideTx(t.id, 'Rejected')} aria-label="Reject"><X className="h-3.5 w-3.5" /></Button></>}
                {approver && <Button size="sm" variant="ghost" onClick={() => setTxForm({ open: true, tx: t })} aria-label="Edit"><Pencil className="h-3.5 w-3.5" /></Button>}
                {approver && <Button size="sm" variant="ghost" aria-label="Delete" onClick={async () => { if (await confirm({ title: 'Delete transaction?', body: `Remove “${t.description}” (${money(t.amount)}) from the ledger?`, danger: true, confirmText: 'Delete' })) { update(d => { d.transactions = d.transactions.filter(x => x.id !== t.id); }); toast('Transaction deleted'); } }}><Trash2 className="h-3.5 w-3.5" /></Button>}
              </div></td>
            </tr>
          ))}
        </Table>
      </>}

      {tab === 'budgets' && <>
        {approver && <div className="mb-4 flex justify-end"><Button variant="gradient" onClick={() => setBForm({ open: true })}><Plus className="h-4 w-4" />New budget</Button></div>}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {state.budgets.map(b => { const a = budgetActual(state.transactions, b.id); const pct = (a / b.allocated) * 100; const lines = state.transactions.filter(t => t.budgetId === b.id); return (
            <Card key={b.id} className="p-5">
              <div className="flex items-start justify-between"><div><Badge tone={b.kind === 'Event' ? 'cyan' : 'violet'}>{b.kind}</Badge><h3 className="mt-2 font-display text-lg font-semibold">{b.name}</h3></div>
                {approver && <div className="flex"><Button size="sm" variant="ghost" onClick={() => setBForm({ open: true, b })} aria-label="Edit budget"><Pencil className="h-3.5 w-3.5" /></Button><Button size="sm" variant="ghost" aria-label="Delete budget" onClick={async () => { if (await confirm({ title: 'Delete budget?', body: `Transactions linked to “${b.name}” will be kept but unlinked.`, danger: true, confirmText: 'Delete' })) { update(d => { d.budgets = d.budgets.filter(x => x.id !== b.id); d.transactions.forEach(t => { if (t.budgetId === b.id) t.budgetId = undefined; }); }); toast('Budget deleted'); } }}><Trash2 className="h-3.5 w-3.5" /></Button></div>}</div>
              <p className="mt-3 font-display text-2xl font-bold">{money(a)} <span className="text-sm font-normal text-ice/45">of {money(b.allocated)}</span></p>
              <div className="mt-2"><Progress value={pct} tone={pct > 100 ? 'red' : 'gradient'} /></div>
              <p className={`mt-2 text-xs ${pct > 100 ? 'text-[#ff8a8a]' : 'text-ice/50'}`}>{pct > 100 ? `Over budget by ${money(a - b.allocated)}` : `${money(b.allocated - a)} remaining`} · {lines.length} transactions</p>
            </Card>); })}
        </div>
        {!state.budgets.length && <Empty title="No budgets yet" />}
      </>}

      {tab === 'reimbursements' && <>
        <Table empty={!state.reimbursements.length} head={<><th className="th">Requester</th><th className="th">Expense</th><th className="th">Budget</th><th className="th">Amount</th><th className="th">Receipt</th><th className="th">Status</th><th className="th">Decision</th></>}>
          {state.reimbursements.map(r => (
            <tr key={r.id}>
              <td className="td">{execName(state, r.requesterId)}</td>
              <td className="td"><p>{r.description}</p><p className="text-xs text-ice/40">{fmtDate(r.date)}</p></td>
              <td className="td text-xs">{bName(r.budgetId)}</td>
              <td className="td font-semibold">{money(r.amount)}</td>
              <td className="td text-xs text-cyan">{r.receiptName}</td>
              <td className="td"><StatusBadge s={r.status} />{r.note && <p className="mt-1 text-[11px] text-ice/40">{r.note}</p>}</td>
              <td className="td">{r.status === 'Pending' && approver ? <div className="flex gap-1"><Button size="sm" variant="gradient" onClick={() => decideRb(r.id, 'Approved')}>Approve</Button><Button size="sm" variant="danger" onClick={() => decideRb(r.id, 'Rejected')}>Reject</Button></div> : <span className="text-xs text-ice/35">—</span>}</td>
            </tr>
          ))}
        </Table>
        <div className="mt-3 flex justify-end"><Button size="sm" onClick={() => downloadCSV('reimbursements.csv', state.reimbursements.map(r => ({ requester: execName(state, r.requesterId), description: r.description, amount: r.amount, date: r.date, budget: bName(r.budgetId), receipt: r.receiptName, status: r.status })))}><Download className="h-3.5 w-3.5" />CSV</Button></div>
      </>}

      {tab === 'receipts' && <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {state.transactions.filter(t => t.receipt).map(t => (
          <button key={t.id} onClick={() => setPreview(t)} className="card p-4 text-left transition hover:border-cyan/40">
            <FileText className="h-7 w-7 text-cyan" /><p className="mt-3 font-mono text-sm">{t.receipt}</p><p className="truncate text-xs text-ice/50">{t.description}</p><p className="mt-1 text-xs text-ice/40">{fmtDate(t.date)} · {money(t.amount)}</p>
          </button>
        ))}
      </div>}

      <div className="mt-6"><DemoNotice>Financial records are mock data stored in this browser. Do not enter real club finances; approvals here are not audited or secured.</DemoNotice></div>
      <TxForm open={txForm.open} tx={txForm.tx} onClose={() => { setTxForm({ open: false }); if (params.get('new')) setParams({ tab }); }} />
      <BudgetForm open={bForm.open} budget={bForm.b} onClose={() => setBForm({ open: false })} />
      <ReimbursementForm open={rbOpen} onClose={() => setRbOpen(false)} />
      <Modal open={!!preview} onClose={() => setPreview(null)} title="Receipt preview (sample)">
        {preview && <div className="mx-auto max-w-xs rounded-lg bg-white p-5 font-mono text-xs text-neutral-800 shadow-xl">
          <p className="text-center text-sm font-bold">SAMPLE VENDOR LTD.</p><p className="text-center text-[10px]">Demo receipt — not a real document</p>
          <hr className="my-3 border-dashed border-neutral-400" />
          <p>No: {preview.receipt}</p><p>Date: {fmtDate(preview.date)}</p><p className="mt-2">{preview.description}</p>
          <hr className="my-3 border-dashed border-neutral-400" />
          <p className="flex justify-between font-bold"><span>TOTAL</span><span>{money(preview.amount)}</span></p>
          <p className="mt-3 text-center text-[10px]">Recorded by {execName(state, preview.recordedBy)} · {nowISO().slice(0, 10)}</p>
        </div>}
        <div className="mt-4 flex justify-center"><Button size="sm" onClick={() => toast('Simulated download — demo receipts are generated previews', 'info')}><Eye className="h-3.5 w-3.5" />Download (simulated)</Button></div>
      </Modal>
    </>
  );
}
