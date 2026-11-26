import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarPlus, MapPin, Clock, Sparkles, MessageCircle } from 'lucide-react';
import Eyebrow from './Eyebrow';
import Lantern from './Lantern';
import { event, eventPhase, downloadInvite, googleCalendarLink } from '../event';
import { whatsappLink } from '../config';

const ease = [0.16, 1, 0.3, 1] as const;

function useNow(every = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const t = window.setInterval(() => setNow(Date.now()), every); return () => window.clearInterval(t); }, [every]);
  return now;
}

function Countdown({ now }: { now: number }) {
  const left = Math.max(0, Date.parse(event.startsAt) - now);
  const parts = [
    { v: Math.floor(left / 86400000), l: 'Days' },
    { v: Math.floor(left / 3600000) % 24, l: 'Hours' },
    { v: Math.floor(left / 60000) % 60, l: 'Minutes' },
    { v: Math.floor(left / 1000) % 60, l: 'Seconds' },
  ];
  return <div className="ev-count" role="timer" aria-label={`${parts[0].v} days, ${parts[1].v} hours and ${parts[2].v} minutes to go`}>
    {parts.map(p => <div key={p.l}><strong>{String(p.v).padStart(2, '0')}</strong><span>{p.l}</span></div>)}
  </div>;
}

// Home-page invitation to Alátùpà – Light Bearer. Disappears on its own after the event.
export default function EventBand() {
  const now = useNow();
  const phase = eventPhase(now);
  if (phase === 'over') return null;
  const rsvp = whatsappLink(`Hello Artios, I would love to attend ${event.name} on ${event.dateLabel} at ${event.venue}, ${event.city}. Please save me a seat.`);
  return <section className="ev" id="alatupa" aria-labelledby="ev-title">
    <div className="ev-glow" aria-hidden="true" />
    <motion.figure className="ev-lantern" aria-hidden="true" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 1.4, ease }}>
      <Lantern />
      <figcaption><span>27</span> November · Minna</figcaption>
    </motion.figure>
    <motion.div className="ev-copy" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 1, ease }}>
      <Eyebrow>{phase === 'live' ? 'Happening now · You are invited' : 'An evening by Artios · You are invited'}</Eyebrow>
      <h2 id="ev-title">Alátùpà <em>– Light Bearer</em></h2>
      <p className="ev-blurb">{event.blurb}</p>
      {phase === 'upcoming' ? <Countdown now={now} /> : <p className="ev-live"><span className="ev-dot" /> Doors are open. Come as you are, come dressed to shine.</p>}
      <ul className="ev-facts">
        <li><Clock size={16} strokeWidth={1.3} /><div><strong>{event.dateLabel}</strong><span>{event.timeLabel}</span></div></li>
        <li><MapPin size={16} strokeWidth={1.3} /><div><strong>{event.venue}</strong><span>{event.city}</span></div></li>
        <li><Sparkles size={16} strokeWidth={1.3} /><div><strong>Dress code</strong><span>{event.dressCode}</span></div></li>
      </ul>
      <div className="ev-ctas">
        <a className="solid-button light" href={rsvp} target="_blank" rel="noopener noreferrer"><MessageCircle size={15} strokeWidth={1.5} style={{ marginRight: 10 }} />RSVP on WhatsApp</a>
        <button type="button" className="ghost-button" onClick={downloadInvite}><CalendarPlus size={15} strokeWidth={1.5} style={{ marginRight: 10 }} />Add to calendar</button>
      </div>
      <a className="ev-gcal" href={googleCalendarLink()} target="_blank" rel="noopener noreferrer">or add it to Google Calendar ↗</a>
    </motion.div>
  </section>;
}
