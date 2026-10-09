import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowUpRight } from 'lucide-react';
import { PageHero } from '../../components/PublicLayout';
import { useDemo, notify, logActivity } from '../../store/DemoStore';
import { Button, Chip, Field, Input, Select, Textarea, DemoNotice } from '../../components/ui';
import { isEmail, nowISO, uid } from '../../lib/util';

export const DEPARTMENTS = ['CSE', 'SWE', 'EEE', 'ICT', 'Mathematics', 'BBA', 'Other'];
export const INTERESTS = ['Competitive Programming', 'Web Development', 'App Development', 'Machine Learning', 'Cyber Security', 'Open Source', 'Game Dev', 'UI/UX Design'];

const empty = { name: '', studentId: '', email: '', phone: '', department: '', batch: '', interests: [] as string[], reason: '' };

export default function Join() {
  const { state, update } = useDemo();
  const [f, setF] = useState(empty);
  const [err, setErr] = useState<Record<string, string>>({});
  const [done, setDone] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const FORM_URL = "https://docs.google.com/forms/u/2/d/e/1FAIpQLSc2S75iEEjrUBgXDSZUcrqZwDwMUyxm-msgR2llAnCj3pGQzw/formResponse";

  const validate = () => {
    const e: Record<string, string> = {};
    if (f.name.trim().length < 3) e.name = 'Enter your full name.';
    if (!/^\d{6,10}$/.test(f.studentId.trim())) e.studentId = 'Student ID should be 6–10 digits.';
    else if (state.members.some(m => m.studentId === f.studentId.trim()) || state.applications.some(a => a.studentId === f.studentId.trim() && a.status === 'Pending'))
      e.studentId = 'This student ID already has a membership or pending application.';
    if (!isEmail(f.email)) e.email = 'Enter a valid email address.';
    if (!/^\+?[\d\s-]{10,16}$/.test(f.phone.trim())) e.phone = 'Enter a valid phone number.';
    if (!f.department) e.department = 'Choose your department.';
    if (!/^20\d{2}$/.test(f.batch.trim())) e.batch = 'Batch should be a year, e.g. 2026.';
    if (!f.interests.length) e.interests = 'Pick at least one interest.';
    if (f.reason.trim().length < 20) e.reason = 'Tell us a little more (20+ characters).';
    return e;
  };

  const submit = (ev: FormEvent) => {
    ev.preventDefault();
    const e = validate(); setErr(e);
    if (Object.keys(e).length) { document.querySelector('[data-err="1"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
    setBusy(true);
    setTimeout(() => {
      const id = uid('a');
      update(d => {
        d.applications.unshift({ id, ...f, name: f.name.trim(), studentId: f.studentId.trim(), email: f.email.trim(), submittedAt: nowISO(), status: 'Pending' });
        const reviewers = d.executives.filter(x => x.roleIds.some(r => d.roles.find(ro => ro.id === r)?.permissions.includes('members.manage'))).map(x => x.id);
        notify(d, reviewers, 'New membership application', `${f.name.trim()} applied to join the club.`, 'system', '/dashboard/members');
        logActivity(d, 'e-gs', `received a new membership application from ${f.name.trim()}`);
      });
      setDone(f.name.trim()); setF(empty); setBusy(false);
    }, 600);
  };

  const toggle = (i: string) => setF(s => ({ ...s, interests: s.interests.includes(i) ? s.interests.filter(x => x !== i) : [...s.interests, i] }));

  return (
    <>
      <PageHero eyebrow="Member registration" title="Join the Club" sub="Membership is open to all students. Applications are reviewed by the executive committee." />
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-8">
        <div>
          <a href='https://forms.gle/9unPY3U6CxF7BbZb7'>Click to join our club</a>
        </div>
        {/* {done ? (
          <div className="card animate-rise p-10 text-center">
            <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-300" />
            <h2 className="mt-4 font-display text-3xl font-semibold">Application submitted</h2>
            <p className="mx-auto mt-3 max-w-md text-ice/65">Thanks, {done}! Your application is now <b className="text-amber-300">Pending</b>. Executives will review it and issue a member ID once approved.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link to="/login" className="btn btn-gradient">Review it as an admin <ArrowUpRight className="h-4 w-4" /></Link>
              <Button onClick={() => setDone(null)}>Submit another</Button>
            </div>
            <p className="mt-4 text-xs text-ice/40">Tip: log in as General Secretary or Super Admin → Members to approve it.</p>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="card grid gap-5 p-6 sm:grid-cols-2 sm:p-8">
            {([['name', 'Full name', 'text'], ['studentId', 'Student ID', 'text'], ['email', 'Email', 'email'], ['phone', 'Phone', 'tel'], ['batch', 'Batch (year)', 'text']] as const).map(([k, l, t]) => (
              <Field key={k} label={l} error={err[k]}>
                <Input data-err={err[k] ? 1 : 0} type={t} value={f[k]} onChange={e => setF({ ...f, [k]: e.target.value })} placeholder={k === 'batch' ? '2026' : k === 'phone' ? '+880 1XXX-XXXXXX' : ''} />
              </Field>
            ))}
            <Field label="Department" error={err.department}>
              <Select data-err={err.department ? 1 : 0} value={f.department} onChange={e => setF({ ...f, department: e.target.value })}>
                <option value="">Select…</option>{DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
              </Select>
            </Field>
            <div className="sm:col-span-2" data-err={err.interests ? 1 : 0}>
              <span className="label">Programming interests</span>
              <div className="flex flex-wrap gap-2">{INTERESTS.map(i => <Chip key={i} active={f.interests.includes(i)} onClick={() => toggle(i)}>{i}</Chip>)}</div>
              {err.interests && <span className="mt-1 block text-xs text-[#ff8a8a]">{err.interests}</span>}
            </div>
            <Field label="Why do you want to join?" error={err.reason} className="sm:col-span-2">
              <Textarea data-err={err.reason ? 1 : 0} value={f.reason} onChange={e => setF({ ...f, reason: e.target.value })} />
            </Field>
            <div className="sm:col-span-2"><DemoNotice>Demo Mode: please don’t enter real personal information. Submissions are stored only in this browser’s local storage.</DemoNotice></div>
            <div className="sm:col-span-2"><Button variant="gradient" type="submit" disabled={busy} className="h-12 w-full sm:w-56">{busy ? 'Submitting…' : 'Submit application'}<ArrowUpRight className="h-4 w-4" /></Button></div>
          </form>
        )} */}
      </section>
    </>
  );
}
