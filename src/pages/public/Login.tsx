import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, KeyRound, Copy, ShieldAlert } from 'lucide-react';
import { useDemo, useToast } from '../../store/DemoStore';
import { Avatar, Button, Field, Input } from '../../components/ui';
import { isEmail } from '../../lib/util';

export default function Login() {
  const { state, login, loginAs, user } = useDemo();
  const toast = useToast();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [err, setErr] = useState<{ email?: string; pw?: string; form?: string }>({});
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;
  const accounts = state.executives.filter(e => e.password);
  const roleName = (id: string) => state.roles.find(r => r.id === id)?.name ?? '';

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const er: typeof err = {};
    if (!isEmail(email)) er.email = 'Enter a valid email address.';
    if (!pw) er.pw = 'Enter your password.';
    setErr(er);
    if (Object.keys(er).length) return;
    setBusy(true);
    setTimeout(() => {
      const r = login(email, pw, remember);
      setBusy(false);
      if (!r.ok) { setErr({ form: r.error }); return; }
      toast('Signed in to the demo dashboard');
      nav('/dashboard');
    }, 400);
  };

  const quick = (id: string) => { loginAs(id); const ex = state.executives.find(x => x.id === id); toast(`Signed in as ${ex?.name}`); nav('/dashboard'); };
  const fill = (em: string, p: string) => { setEmail(em); setPw(p); setErr({}); };

  return (
    <section className="relative overflow-hidden">
      <div className="grid-bg absolute inset-0" />
      <div className="absolute left-1/4 top-0 h-72 w-1/2 rounded-full bg-[#b3122e]/25 blur-3xl" />
      <div className="absolute -bottom-20 right-0 h-48 w-1/2 bg-ember/15 blur-3xl" />
      <div className="relative mx-auto grid max-w-[1280px] gap-8 px-4 py-14 sm:px-8 lg:grid-cols-[1fr_1.15fr]">
        <div className="card h-fit p-6 sm:p-8">
          <p className="eyebrow">Executive access</p>
          <h1 className="h-display mt-2 text-4xl">Sign in</h1>
          <p className="mt-2 text-sm text-ice/55">Use any demo account. Quick-login buttons are on the right.</p>
          <form onSubmit={submit} noValidate className="mt-6 space-y-4">
            {err.form && <div role="alert" className="rounded-lg border border-ember/40 bg-ember/10 px-3 py-2.5 text-sm text-red-100">{err.form}</div>}
            <Field label="Email" error={err.email}><Input type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} placeholder="president@club.demo" /></Field>
            <Field label="Password" error={err.pw}>
              <div className="relative">
                <Input type={show ? 'text' : 'password'} autoComplete="current-password" value={pw} onChange={e => setPw(e.target.value)} className="pr-10" />
                <button type="button" onClick={() => setShow(s => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-ice/50 hover:text-ice" aria-label={show ? 'Hide password' : 'Show password'}>{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
              </div>
            </Field>
            <label className="flex items-center gap-2 text-sm text-ice/70"><input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="h-4 w-4 accent-red-500" />Remember me on this browser</label>
            <Button variant="gradient" type="submit" disabled={busy} className="h-12 w-full">{busy ? 'Signing in…' : <>Sign in <LogIn className="h-4 w-4" /></>}</Button>
          </form>
          <div className="mt-6 flex gap-2 rounded-xl border border-amber-400/25 bg-amber-400/[.06] p-3 text-xs text-amber-100/80">
            <ShieldAlert className="h-4 w-4 shrink-0 text-amber-300" />
            <p>Demo Mode: this is a front-end mock login, not secure authentication. These public credentials must never be used in a deployed production system.</p>
          </div>
        </div>

        <div className="card p-6 sm:p-8">
          <div className="flex items-center gap-2"><KeyRound className="h-5 w-5 text-cyan" /><h2 className="font-display text-2xl font-semibold">Demo credentials</h2></div>
          <p className="mt-1 text-sm text-ice/55">Click <b>Enter</b> to log straight in, or the copy icon to fill the form.</p>
          <ul className="mt-5 divide-y divide-white/5">
            {accounts.map(a => (
              <li key={a.id} className="flex items-center gap-3 py-3">
                <Avatar name={a.name} hue={a.hue} photo={a.photo} size={38} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{a.roleIds.map(roleName).join(', ') || 'No role'} <span className="font-normal text-ice/45">· {a.name}</span></p>
                  <p className="truncate font-mono text-xs text-ice/55">{a.email} · {a.password}</p>
                </div>
                <button onClick={() => {
  if (a.email && a.password) {
    fill(a.email, a.password);
  }
}} className="rounded-md p-2 text-ice/50 hover:bg-white/5 hover:text-cyan" aria-label={`Fill credentials for ${a.name}`}><Copy className="h-4 w-4" /></button>
                <Button size="sm" variant="cream" onClick={() => quick(a.id)}>Enter</Button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
