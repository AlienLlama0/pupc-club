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
  const all = state.executives.filter(e => e.showOnSite);

  const terms = [...new Set(all.map((e: any) => e.term || '2026-2027'))];
  const [activeTerm, setActiveTerm] = useState(terms[0] || '2026-2027');

  const list = all
    .filter((e: any) => (e.term || '2026-2027') === activeTerm)
    .sort((a, b) => a.order - b.order);

  return (
    <>
      <PageHero
        eyebrow="Executive panel"
        title="Meet the Committee"
        sub="The students who plan the contests, run the workshops and keep the club shipping."
      />
      <section className="mx-auto max-w-[1280px] px-4 py-16 sm:px-8">

        {/* Year buttons — syllabus এর Day বাটনের মতো */}
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {terms.map(t => (
            <button
              key={t}
              onClick={() => setActiveTerm(t)}
              className={`rounded-lg px-5 py-2 text-sm font-semibold transition ${
                activeTerm === t
                  ? 'bg-cyan text-navy-950'
                  : 'bg-white/10 text-ice/70 hover:bg-white/15'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map(e => (
            <article key={e.id} className="card group p-6 text-center transition hover:-translate-y-1 hover:border-cyan/40">
              <div className="mx-auto w-fit rounded-full bg-gradient-to-br from-[#ff5a5f] to-[#c4142f] p-[3px]">
                <div className="rounded-full bg-navy-900 p-1">
                  <Avatar name={e.name} hue={e.hue} photo={(e as any).photo} size={96} />
                </div>
              </div>
              <h2 className="mt-4 font-display text-xl font-semibold">{e.name}</h2>
              <p className="text-sm font-semibold text-cyan">{e.designation}</p>
              {(e.designation !== "Moderator" && e.designation !== "Co-Moderator") && (<p className="mt-1 text-xs text-ice/40">{e.department} · Batch {e.batch}</p>)}
              
              <p className="mt-3 text-sm leading-relaxed text-ice/60">{e.bio}</p>
            </article>
          ))}
        </div>

        {list.length === 0 && (
          <p className="mt-10 text-center text-ice/50">No executives for this term yet.</p>
        )}

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
