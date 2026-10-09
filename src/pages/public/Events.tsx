import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CalendarDays, MapPin, Users, ArrowUpRight, ArrowLeft, Clock } from 'lucide-react';
import { PageHero } from '../../components/PublicLayout';
import { useDemo } from '../../store/DemoStore';
import { Badge, Chip, Cover, Empty, Progress } from '../../components/ui';
import { daysUntil, fmtDate } from '../../lib/util';
import type { EventType } from '../../types';
import { NotFound } from './Pages';

const TYPES: (EventType | 'All')[] = ['All', 'Workshop', 'Contest', 'Hackathon', 'Seminar', 'Social'];

export function Events() {
  const { state } = useDemo();
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [type, setType] = useState<EventType | 'All'>('All');
  const published = state.events.filter(e => e.status === 'Published');
  const list = useMemo(() => published
    .filter(e => (tab === 'upcoming' ? daysUntil(e.date) >= 0 : daysUntil(e.date) < 0))
    .filter(e => type === 'All' || e.type === type)
    .sort((a, b) => (tab === 'upcoming' ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date))), [published, tab, type]);

  return (
    <>
      <PageHero eyebrow="Events & gallery" title="Workshops, Contests & Hackathons" sub="Everything the club is running this semester — and what we’ve shipped before." />
      <section className="mx-auto max-w-[1280px] px-4 py-14 sm:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="inline-flex rounded-xl bg-pill p-1">
            {(['upcoming', 'past'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} className={`rounded-lg px-5 py-2 text-sm font-semibold capitalize ${tab === t ? 'bg-navy-900 text-white' : 'text-navy-900/70'}`}>{t}</button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">{TYPES.map(t => <Chip key={t} active={type === t} onClick={() => setType(t)}>{t}</Chip>)}</div>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {list.map(e => {
            const dd = daysUntil(e.date);
            return (
              <Link to={`/events/${e.id}`} key={e.id} className="card group overflow-hidden transition hover:-translate-y-1 hover:border-cyan/40">
                <div className="relative h-44"><Cover hue={e.hue} type={e.type} label={e.title} />
                  <span className="absolute left-4 top-4 rounded-lg bg-navy-900/80 px-2.5 py-1 text-xs font-semibold text-ice backdrop-blur">{dd === 0 ? 'Today' : dd > 0 ? `In ${dd} days` : fmtDate(e.date)}</span>
                </div>
                <div className="p-5">
                  <Badge tone="cyan">{e.type}</Badge>
                  <h3 className="mt-3 font-display text-xl font-semibold group-hover:text-cyan">{e.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-ice/60">{e.summary}</p>
                  <div className="mt-4 space-y-1 text-xs text-ice/50">
                    <p className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" />{fmtDate(e.date)} · {e.time}</p>
                    <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{e.venue}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        {!list.length && <Empty title={`No ${tab} events${type !== 'All' ? ` of type ${type}` : ''}`} body="Check back soon, or switch the filter." />}
      </section>

      <section className="mx-auto max-w-[1280px] px-4 pb-20 sm:px-8">
        <p className="eyebrow">Gallery</p>
        <h2 className="h-display mt-2 text-4xl">Moments from the club</h2>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
          {state.gallery.map((g, i) => (
            <figure key={g.id} className={`group relative overflow-hidden rounded-2xl border border-white/10 ${i % 5 === 0 ? 'md:row-span-2' : ''}`}>
              <div className={i % 5 === 0 ? 'h-48 md:h-full' : 'h-48'}><Cover hue={g.hue} image={g.image} label={g.title} className="transition duration-500 group-hover:scale-105" /></div>
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-950/90 to-transparent p-4 text-sm font-semibold">{g.title}</figcaption>
            </figure>
          ))}
        </div>
      </section>
    </>
  );
}

export function EventDetail() {
  const { id } = useParams();
  const { state } = useDemo();
  const e = state.events.find(x => x.id === id && x.status !== 'Draft');
  if (!e) return <NotFound />;
  const upcoming = daysUntil(e.date) >= 0 && e.status === 'Published';
  const photos = state.gallery.filter(g => g.eventId === e.id);
  return (
    <>
      <section className="relative h-[320px] overflow-hidden sm:h-[380px]">
        <Cover hue={e.hue} type={e.type} label={e.title} />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/60 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[1280px] px-4 pb-10 sm:px-8">
          <Link to="/events" className="mb-4 inline-flex items-center gap-1 text-sm text-ice/70 hover:text-white"><ArrowLeft className="h-4 w-4" />All events</Link>
          <div className="flex gap-2"><Badge tone="cyan">{e.type}</Badge>{e.status === 'Archived' && <Badge>Archived</Badge>}{!upcoming && <Badge>Past event</Badge>}</div>
          <h1 className="h-display text-glow mt-3 text-4xl sm:text-6xl">{e.title}</h1>
        </div>
      </section>
      <section className="mx-auto grid max-w-[1280px] gap-8 px-4 py-12 sm:px-8 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <p className="text-lg leading-relaxed text-ice/75">{e.description}</p>
          <h2 className="mt-10 font-display text-2xl font-semibold">Schedule</h2>
          <ol className="mt-4 space-y-3 border-l border-cyan/30 pl-6">
            {e.schedule.map((s, i) => (
              <li key={i} className="relative"><span className="absolute -left-[31px] top-1.5 h-2.5 w-2.5 rounded-full bg-cyan shadow-glow" />
                <p className="text-xs font-semibold uppercase tracking-wider text-cyan">{s.time}</p><p className="text-ice/80">{s.item}</p></li>
            ))}
          </ol>
          {photos.length > 0 && <>
            <h2 className="mt-10 font-display text-2xl font-semibold">Photos</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">{photos.map(g => <div key={g.id} className="h-36 overflow-hidden rounded-xl"><Cover hue={g.hue} image={g.image} label={g.title} /></div>)}</div>
          </>}
        </div>
        <aside className="card h-fit space-y-4 p-6 lg:sticky lg:top-28">
          <p className="flex items-center gap-2 text-sm"><CalendarDays className="h-4 w-4 text-cyan" />{fmtDate(e.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
          <p className="flex items-center gap-2 text-sm"><Clock className="h-4 w-4 text-cyan" />{e.time}</p>
          <p className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-cyan" />{e.venue}</p>
          <div>
            <p className="mb-2 flex items-center gap-2 text-sm"><Users className="h-4 w-4 text-cyan" />{e.registered} / {e.capacity} registered</p>
            <Progress value={(e.registered / e.capacity) * 100} />
          </div>
          {upcoming && e.registrationUrl
            ? <a href={e.registrationUrl} className="btn btn-gradient w-full">Register now <ArrowUpRight className="h-4 w-4" /></a>
            : <p className="rounded-lg bg-white/5 p-3 text-center text-sm text-ice/50">Registration closed</p>}
          <p className="text-[11px] text-ice/40">Demo: registration links point to the sample join form.</p>
        </aside>
      </section>
    </>
  );
}
