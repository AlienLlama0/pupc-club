import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowDown, Code2, Trophy, Presentation, FolderGit2, CalendarDays, MapPin, Medal, Users, Star } from 'lucide-react';
import { useDemo } from '../../store/DemoStore';
import { Cover, Badge } from '../../components/ui';
import { daysUntil, fmtDate } from '../../lib/util';

function HeroBackdrop() {
  // Recreates the reference photo's mood without a stock photo: dark arena, light bars,
  // blurred hardware silhouette (here: a code terminal + keyboard), red floor glow.
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[radial-gradient(90%_70%_at_50%_35%,#4a0d16_0%,#22070b_45%,#0b0304_100%)]" />
      <div className="grid-bg absolute inset-0 opacity-60" />
      {/* ceiling light bars */}
      <div className="absolute left-[5%] top-[6%] h-2 w-16 rounded-full bg-white/25 blur-[3px]" />
      <div className="absolute left-[15%] top-[7%] h-2.5 w-40 animate-drift rounded-full bg-white/20 blur-[3px]" />
      <div className="absolute left-[34%] top-[8%] h-2 w-24 rounded-full bg-white/15 blur-[3px]" />
      <div className="absolute right-[18%] top-[9%] h-2 w-36 rounded-full bg-white/20 blur-[3px]" />
      <div className="absolute right-[6%] top-[9%] h-2 w-16 rounded-full bg-white/25 blur-[3px]" />
      <div className="absolute left-[12%] top-[19%] h-1.5 w-28 rounded-full bg-white/10 blur-[2px]" />
      <div className="absolute right-[24%] top-[13%] h-1.5 w-20 rounded-full bg-white/10 blur-[2px]" />
      {/* hardware silhouette, bottom right like the reference robot */}
      <div className="absolute">
        <img
          src="hero.jpeg"
          alt=""
          aria-hidden="true"
          draggable={false}
          className="h-auto w-full object-contain opacity-10 blur-[1.5px] mix-blend-screen"
        />

        {/* Red atmospheric overlay */}
        <div className="pointer-events-none absolute inset-0 bg-[#8b1025]/20 mix-blend-color" />

        {/* Fade image into the dark background */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0b0304] via-transparent to-[#0b0304]/50" />
      </div>

      {/* red floor glow (reference has red edge lighting) */}
      <div className="absolute -bottom-10 left-0 h-40 w-[45%] bg-ember/35 blur-3xl" />
      <div className="absolute -bottom-16 right-0 h-48 w-[40%] bg-ember/40 blur-3xl" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-ember/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#120607]/70" />
      <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_45%,transparent_0%,rgba(10,3,4,.6)_100%)]" />
    </div>
  );
}

export default function Home() {
  const { state } = useDemo();
  const c = state.club;
  const upcoming = state.events.filter(e => e.status === 'Published' && daysUntil(e.date) >= 0).sort((a, b) => a.date.localeCompare(b.date));
  const featured = [...upcoming.filter(e => e.featured), ...upcoming.filter(e => !e.featured)].slice(0, 3);
  const activeMembers = state.members.filter(m => m.status === 'Active').length;
  const words = c.heroTitle.split(' ');
  const mid = Math.ceil(words.length / 2);

  const highlights = [
    { icon: Code2, title: 'Programming', text: 'Weekly study circles in C++, Python and JavaScript — from syntax to system design.' },
    { icon: Trophy, title: 'Competitive Programming', text: 'Structured ladders, mock contests and coached ICPC teams every season.' },
    { icon: Presentation, title: 'Workshops', text: 'Hands-on sessions on Git, web, ML and cloud led by seniors and alumni.' },
    { icon: FolderGit2, title: 'Projects', text: 'Build real, open-source tools for campus with code review and mentorship.' },
  ];
  const stats = [
    { v: `200+`, l: 'Members' },
    { v: `20`, l: 'Events hosted' },
    { v: '5+', l: 'Coding Competition' },
    { v: '100+', l: 'Contest Participation' },
  ];
  const achievements = [
    { icon: Medal, title: '2nd Place — Inter-University Contest (Spring)', text: '8 problems solved, out of 64 participating teams.' },
    { icon: Star, title: 'ICPC Dhaka Regional — every year since 2019', text: 'Consistent top-30 finishes for our senior teams.' },
    { icon: Users, title: '140+ freshers in a single contest', text: "Freshers' Coding Fiesta became our most attended event." },
  ];

  return (
    <>
      <section className="relative flex min-h-[calc(100svh-110px)] items-center overflow-hidden">
        <HeroBackdrop />
        <div className="relative mx-auto w-full max-w-[1280px] px-4 py-20 text-center sm:px-8">
          <h1 className="text-glow mx-auto max-w-5xl animate-rise font-display text-[44px] font-bold leading-[1.05] tracking-[-0.01em] text-ice sm:text-7xl lg:text-[76px]">
            {words.slice(0, mid).join(' ')}<br className="hidden sm:block" /> {words.slice(mid).join(' ')}
          </h1>
          <p className="mx-auto mt-8 max-w-xl animate-rise text-xl font-bold leading-snug text-ice sm:text-[26px]" style={{ animationDelay: '.1s' }}>{c.slogan}</p>
          <div className="mt-10 flex animate-rise flex-wrap items-center justify-center gap-4 sm:gap-7" style={{ animationDelay: '.2s' }}>
            <Link to="https://forms.gle/9unPY3U6CxF7BbZb7" target='_blank' className="btn btn-gradient h-[52px] min-w-[170px] justify-between gap-8 whitespace-nowrap px-6">Join Our Club <ArrowUpRight className="h-4 w-4" /></Link>
            <Link to="/events" className="btn btn-dark h-[52px] min-w-[172px] justify-between gap-8 whitespace-nowrap px-6">Explore Events <ArrowDown className="h-4 w-4" /></Link>
          </div>
          <Link to="/executives" className="mt-6 inline-block animate-rise text-sm font-semibold text-ice/70 underline decoration-ice/30 underline-offset-4 hover:text-white" style={{ animationDelay: '.3s' }}>Meet Our Team →</Link>
          <a href="#highlights" className="mx-auto mt-10 flex h-12 w-14 animate-bob items-center justify-center border border-cyan/50 bg-navy-900/40" aria-label="Scroll to highlights"><ArrowDown className="h-4 w-4 text-cyan" /></a>
        </div>
      </section>

      <section id="highlights" className="mx-auto max-w-[1280px] px-4 py-20 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-end">
          <div>
            <p className="eyebrow">Who we are</p>
            <h2 className="h-display mt-3 text-4xl sm:text-5xl">Code. Compete. Create.</h2>
          </div>
          <div className="space-y-3 text-ice/65">
            <p>{c.intro}</p>
            <p><span className="font-semibold text-ice">Our mission: </span>{c.mission}</p>
          </div>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map(h => (
            <div key={h.title} className="card group p-6 transition hover:-translate-y-1 hover:border-cyan/40">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#ff5a5f] to-[#c4142f] text-navy-900"><h.icon className="h-5 w-5" /></span>
              <h3 className="mt-5 font-display text-xl font-semibold">{h.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ice/60">{h.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-white/5 bg-navy-950/60">
        <div className="mx-auto grid max-w-[1280px] grid-cols-2 gap-6 px-4 py-12 sm:px-8 md:grid-cols-4">
          {stats.map(s => (
            <div key={s.l} className="text-center">
              <p className="font-display text-4xl font-bold text-ice sm:text-5xl">{s.v}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-4 py-20 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="eyebrow">Featured events</p><h2 className="h-display mt-3 text-4xl">What’s coming up</h2></div>
          <Link to="/events" className="btn btn-dark">All events <ArrowUpRight className="h-4 w-4" /></Link>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {featured.map(e => (
            <Link to={`/events/${e.id}`} key={e.id} className="card group overflow-hidden transition hover:-translate-y-1 hover:border-cyan/40">
              <div className="h-44"><Cover hue={e.hue} type={e.type} label={e.title} /></div>
              <div className="p-5">
                <div className="flex items-center gap-2"><Badge tone="cyan">{e.type}</Badge>{e.featured && <Badge tone="violet">Featured</Badge>}</div>
                <h3 className="mt-3 font-display text-xl font-semibold group-hover:text-cyan">{e.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-ice/60">{e.summary}</p>
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ice/50">
                  <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{fmtDate(e.date)} · {e.time}</span>
                  <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{e.venue}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-4 pb-20 sm:px-8">
        <div className="card grid gap-8 overflow-hidden p-8 sm:p-10 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <p className="eyebrow">Achievements</p>
            <h2 className="h-display mt-3 text-4xl">Proof of work</h2>
            <p className="mt-3 text-ice/60">{c.history}</p>
          </div>
          <div className="space-y-4">
            {achievements.map(a => (
              <div key={a.title} className="flex gap-4 rounded-xl border border-white/10 bg-navy-900/60 p-4">
                <a.icon className="mt-0.5 h-6 w-6 shrink-0 text-cyan" />
                <div><p className="font-semibold">{a.title}</p><p className="text-sm text-ice/55">{a.text}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#ff5a5f]/20 via-[#e0283f]/20 to-[#c4142f]/20" />
        <div className="grid-bg absolute inset-0" />
        <div className="relative mx-auto flex max-w-[1280px] flex-col items-center gap-6 px-4 py-16 text-center sm:px-8">
          <h2 className="h-display text-glow text-4xl sm:text-5xl">Ready to write your first commit with us?</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="https://forms.gle/9unPY3U6CxF7BbZb7" target='_blank' className="btn btn-gradient h-[52px] px-7">Join Our Club <ArrowUpRight className="h-4 w-4" /></Link>
            <Link to="/executives" className="btn btn-dark h-[52px] px-7">Meet Our Team</Link>
          </div>
        </div>
      </section>
    </>
  );
}
