import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Target, Eye, History, CheckCircle2, ShieldCheck, ShieldAlert, SearchX, Send, Mail, Phone, MapPin, BadgeCheck } from 'lucide-react';
import { PageHero } from '../../components/PublicLayout';
import { useDemo } from '../../store/DemoStore';
import { Avatar, Badge, Button, Field, Input, Textarea, DemoNotice } from '../../components/ui';
import { fmtDate, isEmail, nowISO, uid } from '../../lib/util';

export function About() {
  const { state } = useDemo();
  const c = state.club;
  const activities = ['Weekly problem-solving sessions', 'Semester-long workshop series', 'Intra & inter-university contests', '24-hour campus hackathons', 'Open-source project squads', 'Alumni tech talks & career nights'];
  return (
    <>
      <PageHero eyebrow="About us" title={c.name} sub={c.slogan} />
      <section className="mx-auto max-w-[1280px] px-4 py-16 sm:px-8">
        <p className="mx-auto max-w-3xl text-center text-lg leading-relaxed text-ice/70">{c.intro}</p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[{ icon: Target, t: 'Mission', b: c.mission }, { icon: Eye, t: 'Vision', b: c.vision }, { icon: History, t: 'History', b: c.history }].map(x => (
            <div key={x.t} className="card p-7">
              <x.icon className="h-7 w-7 text-cyan" />
              <h2 className="mt-4 font-display text-2xl font-semibold">{x.t}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ice/60">{x.b}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <div className="card p-7">
            <p className="eyebrow">Goals</p>
            <ul className="mt-4 space-y-3">
              {c.goals.map(g => <li key={g} className="flex gap-3 text-ice/75"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-cyan" />{g}</li>)}
            </ul>
          </div>
          <div className="card p-7">
            <p className="eyebrow">Activities</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {activities.map(a => <div key={a} className="rounded-xl border border-white/10 bg-navy-900/60 px-4 py-3 text-sm text-ice/75">{a}</div>)}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export function Executives() {
  const { state } = useDemo();
  const list = state.executives.filter(e => e.showOnSite).sort((a, b) => a.order - b.order);
  return (
    <>
      <PageHero eyebrow="Executive panel" title="Meet the Committee" sub="The students who plan the contests, run the workshops and keep the club shipping." />
      <section className="mx-auto max-w-[1280px] px-4 py-16 sm:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map(e => (
            <article key={e.id} className="card group p-6 text-center transition hover:-translate-y-1 hover:border-cyan/40">
              <div className="mx-auto w-fit rounded-full bg-gradient-to-br from-[#ff5a5f] to-[#c4142f] p-[3px]"><div className="rounded-full bg-navy-900 p-1"><Avatar name={e.name} hue={e.hue} photo={e.photo} size={96} /></div></div>
              <h2 className="mt-4 font-display text-xl font-semibold">{e.name}</h2>
              <p className="text-sm font-semibold text-cyan">{e.designation}</p>
              <p className="mt-1 text-xs text-ice/40">{e.department} · Batch {e.batch}</p>
              <p className="mt-3 text-sm leading-relaxed text-ice/60">{e.bio}</p>
            </article>
          ))}
        </div>
        <p className="mt-10 text-center text-xs text-ice/40">Profiles are sample data — editable from Dashboard → Executives (GS, President or Super Admin).</p>
      </section>
    </>
  );
}

export function Verify() {
  const { state } = useDemo();
  const [q, setQ] = useState('');
  const [result, setResult] = useState<null | { found: false } | { found: true; id: string; name: string; dept: string; batch: string; status: 'Active' | 'Inactive'; joined: string }>(null);
  const [loading, setLoading] = useState(false);
  const run = (id: string) => {
    const v = id.trim().toUpperCase();
    setQ(v);
    if (!v) return;
    setLoading(true);
    setTimeout(() => {
      const m = state.members.find(x => x.id.toUpperCase() === v);
      // Only approved public fields are exposed — never email, phone or student ID.
      setResult(m ? { found: true, id: m.id, name: m.name, dept: m.department, batch: m.batch, status: m.status, joined: m.joinedAt } : { found: false });
      setLoading(false);
    }, 450);
  };
  const samples = ['PUPC-2025-014', 'PUPC-2023-007', 'PUPC-0000-000'];
  return (
    <>
      <PageHero eyebrow="Member verification" title="Verify a Member ID" sub="Check whether a member ID belongs to a current club member." />
      <section className="mx-auto max-w-2xl px-4 py-16 sm:px-8">
        <form onSubmit={e => { e.preventDefault(); run(q); }} className="card flex flex-col gap-3 p-5 sm:flex-row">
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder="e.g. PUPC-2025-014" aria-label="Member ID" className="font-mono uppercase" />
          <Button variant="gradient" type="submit" disabled={loading} className="sm:w-40">{loading ? 'Checking…' : 'Verify'}</Button>
        </form>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-ice/50">
          Sample IDs:
          {samples.map(s => <button key={s} onClick={() => run(s)} className="rounded-md border border-white/10 px-2 py-1 font-mono text-ice/70 hover:border-cyan/50 hover:text-cyan">{s}</button>)}
        </div>
        <div className="mt-8" aria-live="polite">
          {result && !loading && (result.found ? (
            <div className={`card animate-rise p-6 ${result.status === 'Active' ? 'border-emerald-400/30' : 'border-amber-400/30'}`}>
              <div className="flex items-center gap-3">
                {result.status === 'Active' ? <ShieldCheck className="h-9 w-9 text-emerald-300" /> : <ShieldAlert className="h-9 w-9 text-amber-300" />}
                <div>
                  <p className="font-display text-2xl font-semibold">{result.status === 'Active' ? 'Active Member' : 'Inactive Member'}</p>
                  <p className="font-mono text-sm text-ice/50">{result.id}</p>
                </div>
                {result.status === 'Active' && <Badge tone="green" className="ml-auto"><BadgeCheck className="h-3.5 w-3.5" />Verified</Badge>}
              </div>
              <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-white/10 pt-5 text-sm">
                <div><dt className="text-ice/40">Name</dt><dd className="font-semibold">{result.name}</dd></div>
                <div><dt className="text-ice/40">Department</dt><dd className="font-semibold">{result.dept}</dd></div>
                <div><dt className="text-ice/40">Batch</dt><dd className="font-semibold">{result.batch}</dd></div>
                <div><dt className="text-ice/40">Member since</dt><dd className="font-semibold">{fmtDate(result.joined)}</dd></div>
              </dl>
            </div>
          ) : (
            <div className="card animate-rise flex items-center gap-3 border-ember/30 p-6">
              <SearchX className="h-9 w-9 text-[#ff8a8a]" />
              <div><p className="font-display text-2xl font-semibold">Member Not Found</p><p className="text-sm text-ice/55">No member is registered with ID <span className="font-mono">{q}</span>.</p></div>
            </div>
          ))}
        </div>
        <div className="mt-8"><DemoNotice>Demo verification against sample data stored in this browser. Only public fields are shown; contact details and student IDs are never exposed.</DemoNotice></div>
      </section>
    </>
  );
}

export function Contact() {
  const { state, update } = useDemo();
  const c = state.club;
  const [f, setF] = useState({ name: '', email: '', subject: '', message: '' });
  const [err, setErr] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (f.name.trim().length < 2) er.name = 'Please enter your name.';
    if (!isEmail(f.email)) er.email = 'Enter a valid email address.';
    if (!f.subject.trim()) er.subject = 'Add a subject.';
    if (f.message.trim().length < 10) er.message = 'Message should be at least 10 characters.';
    setErr(er);
    if (Object.keys(er).length) return;
    update(d => { d.messages.unshift({ id: uid('msg'), ...f, at: nowISO() }); });
    setSent(true); setF({ name: '', email: '', subject: '', message: '' });
  };
  return (
    <>
      <PageHero eyebrow="Contact" title="Get in Touch" sub="Questions about membership, sponsorship or collaborations? Send us a message." />
      <section className="mx-auto grid max-w-[1280px] gap-8 px-4 py-16 sm:px-8 lg:grid-cols-[1fr_1.5fr]">
        <div className="space-y-4">
          {[{ i: Mail, t: c.email }, { i: Phone, t: c.phone }, { i: MapPin, t: c.address }].map(x => (
            <div key={x.t} className="card flex items-center gap-4 p-5"><x.i className="h-5 w-5 text-cyan" /><span className="text-sm text-ice/75">{x.t}</span></div>
          ))}
          <div className="card p-5">
            <p className="eyebrow mb-3">Follow us</p>
            <div className="flex flex-wrap gap-2">{c.socials.map(s => <a key={s.label} href={s.url} target="_blank" rel="noreferrer" className="btn btn-dark btn-sm">{s.label}</a>)}</div>
            <p className="mt-3 text-xs text-ice/40">Links are configurable in Dashboard → Settings.</p>
          </div>
        </div>
        <div className="card p-6 sm:p-8">
          {sent ? (
            <div className="flex flex-col items-center py-10 text-center">
              <CheckCircle2 className="h-12 w-12 text-emerald-300" />
              <h2 className="mt-4 font-display text-2xl font-semibold">Message received (demo)</h2>
              <p className="mt-2 max-w-sm text-sm text-ice/60">In this demo, your message is saved only in this browser. A production version would email the club.</p>
              <Button className="mt-6" onClick={() => setSent(false)}>Send another</Button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
              <Field label="Name" error={err.name}><Input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></Field>
              <Field label="Email" error={err.email}><Input type="email" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} /></Field>
              <Field label="Subject" error={err.subject} className="sm:col-span-2"><Input value={f.subject} onChange={e => setF({ ...f, subject: e.target.value })} /></Field>
              <Field label="Message" error={err.message} className="sm:col-span-2"><Textarea rows={6} value={f.message} onChange={e => setF({ ...f, message: e.target.value })} /></Field>
              <div className="sm:col-span-2"><Button variant="gradient" type="submit" className="w-full sm:w-auto"><Send className="h-4 w-4" />Send message</Button></div>
            </form>
          )}
        </div>
      </section>
    </>
  );
}

export function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-32 text-center">
      <p className="font-display text-8xl font-bold text-ice/10">404</p>
      <h1 className="h-display mt-2 text-3xl">Page not found</h1>
      <Link to="/" className="btn btn-gradient mt-6">Back home</Link>
    </div>
  );
}
