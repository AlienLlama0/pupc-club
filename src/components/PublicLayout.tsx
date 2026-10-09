import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { ArrowUpRight, Menu, X, FlaskConical } from 'lucide-react';
import { useDemo } from '../store/DemoStore';

const LINKS = [
  { to: '/about', label: 'About' },
  { to: '/events', label: 'Events' },
  { to: '/executives', label: 'Executives' },
  { to: '/verify', label: 'PUPC ID' },
  { to: '/contact', label: 'Contact' },
];

export function Logo({ compact = false }: { compact?: boolean }) {
  const { state } = useDemo();
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label={`${state.club.name} home`}>
      <span className="font-display text-[28px] font-extrabold italic leading-none tracking-tight text-white sm:text-[34px]">{state.club.short}</span>
      {!compact && <span className="border-[1.5px] border-white px-1.5 py-[1px] font-display text-[11px] font-bold text-white sm:text-xs">{state.club.year}</span>}
    </Link>
  );
}

function Navbar() {
  const [open, setOpen] = useState(false);
  const { user } = useDemo();
  const loc = useLocation();
  useEffect(() => setOpen(false), [loc.pathname]);
  const pill = ({ isActive }: { isActive: boolean }) => `rounded-lg px-3 py-1.5 text-sm transition ${isActive ? 'bg-navy-900 text-white' : 'text-[#2a2a3a] hover:bg-black/5'}`;
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-gradient-to-r from-[#140608] via-[#140608] to-[#3a0b12]/95 backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between gap-4 px-4 sm:h-[86px] sm:px-8">
        <Logo />
        <nav className="hidden h-[60px] flex-1 items-center justify-center gap-3 rounded-2xl bg-pill px-6 shadow-card lg:mx-8 lg:flex xl:mx-14" aria-label="Main">
          <NavLink to="/" end className={pill}>Home</NavLink>
          {LINKS.map(l => <NavLink key={l.to} to={l.to} className={pill}>{l.label}</NavLink>)}
          {/* <NavLink to={user ? '/dashboard' : '/login'} className={pill}>{user ? 'Dashboard' : 'Account'}</NavLink> */}
        </nav>
        <div className="flex items-center gap-2">
          <Link to="https://forms.gle/9unPY3U6CxF7BbZb7" target='_blank' className="btn btn-cream hidden h-12 px-6 sm:inline-flex">Join Club <ArrowUpRight className="ml-3 h-4 w-4" /></Link>
          <button className="rounded-lg p-2 text-white hover:bg-white/10 lg:hidden" onClick={() => setOpen(o => !o)} aria-label="Toggle menu" aria-expanded={open}>
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="animate-rise mx-4 mb-4 flex flex-col gap-1 rounded-2xl bg-pill p-3 lg:hidden" aria-label="Mobile">
          <NavLink to="/" end className={pill}>Home</NavLink>
          {LINKS.map(l => <NavLink key={l.to} to={l.to} className={pill}>{l.label}</NavLink>)}
          <NavLink to={user ? '/dashboard' : '/login'} className={pill}>{user ? 'Dashboard' : 'Account / Login'}</NavLink>
          <Link to="https://forms.gle/9unPY3U6CxF7BbZb7" className="btn btn-gradient mt-2">Join Club <ArrowUpRight className="h-4 w-4" /></Link>
        </nav>
      )}
    </header>
  );
}

function Footer() {
  const { state } = useDemo();
  const c = state.club;
  return (
    <footer className="relative border-t border-white/10 bg-navy-950">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-4 py-14 sm:px-8 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-4 max-w-md text-sm leading-relaxed text-ice/55">{c.intro}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {c.socials.map(s => <a key={s.label} href={s.url} target="_blank" rel="noreferrer" className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-ice/70 hover:border-cyan/50 hover:text-cyan">{s.label}</a>)}
          </div>
        </div>
        <div>
          <p className="eyebrow mb-4">Explore</p>
          <ul className="space-y-2 text-sm text-ice/60">
            {[...LINKS, { to: 'https://forms.gle/9unPY3U6CxF7BbZb7', target:"_blank", label: 'Join the club' }, { to: '/login', label: 'Executive login' }].map(l => <li key={l.to}><Link className="hover:text-white" to={l.to}>{l.label}</Link></li>)}
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-4">Contact</p>
          <ul className="space-y-2 text-sm text-ice/60">
            <li>{c.email}</li><li>{c.phone}</li><li>{c.address}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/5 px-4 py-5 text-center text-xs text-ice/40">
        © {c.year} {c.name}
      </div>
    </footer>
  );
}

// export function DemoStrip() {
//   return (
//     <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#ff5a5f]/15 via-[#c4142f]/15 to-[#ff5a5f]/15 px-4 py-1.5 text-center text-[11px] font-medium text-ice/80">
//       <FlaskConical className="h-3.5 w-3.5 text-cyan" /> Demo Mode — sample data stored only in this browser. <Link to="/login" className="underline decoration-cyan/60 underline-offset-2 hover:text-white">Try the executive dashboard</Link>
//     </div>
//   );
// }

export default function PublicLayout() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return (
    <div className="flex min-h-screen flex-col bg-navy-900">
      {/* <DemoStrip /> */}
      <Navbar />
      <main className="flex-1"><Outlet /></main>
      <Footer />
    </div>
  );
}

/** Shared inner-page hero band in the reference style. */
export function PageHero({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <section className="relative overflow-hidden border-b border-white/5">
      <div className="grid-bg absolute inset-0" />
      <div className="absolute left-1/2 top-0 h-64 w-[60%] -translate-x-1/2 rounded-full bg-[#b3122e]/25 blur-3xl" />
      <div className="absolute -bottom-24 right-0 h-48 w-1/2 bg-ember/15 blur-3xl" />
      <div className="relative mx-auto max-w-[1280px] px-4 py-16 text-center sm:px-8 sm:py-20">
        <p className="eyebrow animate-rise">{eyebrow}</p>
        <h1 className="h-display text-glow mx-auto mt-3 max-w-3xl animate-rise text-4xl sm:text-6xl">{title}</h1>
        {sub && <p className="mx-auto mt-4 max-w-2xl animate-rise text-base font-medium text-ice/70 sm:text-lg">{sub}</p>}
      </div>
    </section>
  );
}
