import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowDown, Code2, Trophy, Presentation, FolderGit2, CalendarDays, MapPin, Medal, Users, Star, Code } from 'lucide-react';
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
    { icon: Code, title: 'Competitive Programming', text: 'Weekly Regular Class,  Focused Training, Team Practice, And Contest Simulations To Prepare For IUPC And ICPC With Confidence. And Coached ICPC Teams Every Season.' },
    { icon: Presentation, title: 'Workshops', text: 'Hands-on sessions on Git, web, ML and cloud led by seniors and alumni.' },
    { icon: Code2, title: 'Web Development', text: 'Learn modern web technologies, build responsive websites and full-stack applications, and bring creative ideas to life.' },
    { icon: FolderGit2, title: 'Projects & Hackathons', text: 'Build innovative solutions, collaborate on real-world projects, and participate in hackathons to turn ideas into impact.' },
  ];
  const stats = [
    { v: `200+`, l: 'Members' },
    { v: `20`, l: 'Events hosted' },
    { v: '10+', l: 'Coding Competition' },
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
              <div className="h-44"><Cover hue={e.hue} type={e.type} label={e.title} image={e.image} /></div>
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
          {/* Left side */}
          <div>
            <p className="eyebrow">Community</p>
            <h2 className="h-display mt-3 text-4xl">Join Us</h2>
            <p className="mt-3 text-ice/60">
              Stay connected with the team. Join our communities to get contest updates, 
              Hackathons and upcoming contest update, practice resources, and hang out with fellow programmers.
            </p>
          </div>

          {/* Right side – Join buttons */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Discord */}
            <a
              href="https://discord.gg/sKRpJBPu2"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-navy-900/60 p-4 transition hover:border-cyan/40 hover:bg-navy-900"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#5865F2]/20">
                {/* Discord icon (lucide doesn't have one by default, so using a simple SVG) */}
                <svg className="h-5 w-5 text-[#5865F2]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </div>
              <div>
                <p className="font-semibold">Discord</p>
                <p className="text-sm text-ice/55">Join our server</p>
              </div>
            </a>

            {/* WhatsApp */}
            <a
              href="https://chat.whatsapp.com/JlZzAMOmJzK9sAurjKQriV"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-navy-900/60 p-4 transition hover:border-cyan/40 hover:bg-navy-900"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#25D366]/20">
                <svg className="h-5 w-5 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                </svg>
              </div>
              <div>
                <p className="font-semibold">WhatsApp</p>
                <p className="text-sm text-ice/55">Join the group</p>
              </div>
            </a>

            {/* Facebook Group */}
            <a
              href="https://www.facebook.com/groups/1409815747599534"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-navy-900/60 p-4 transition hover:border-cyan/40 hover:bg-navy-900"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1877F2]/20">
                <svg className="h-5 w-5 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>
              <div>
                <p className="font-semibold">Facebook Group</p>
                <p className="text-sm text-ice/55">Join the community</p>
              </div>
            </a>

            {/* Facebook Page */}
            <a
              href="https://www.facebook.com/profile.php?id=61555818638807"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-navy-900/60 p-4 transition hover:border-cyan/40 hover:bg-navy-900"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1877F2]/20">
                <svg className="h-5 w-5 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>
              <div>
                <p className="font-semibold">Facebook Page</p>
                <p className="text-sm text-ice/55">Follow us</p>
              </div>
            </a>
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
