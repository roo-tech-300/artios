// The Alátùpà – Light Bearer event. Change the details here and the home page, notice bar and
// calendar invite all update. The event section hides itself once `endsAt` has passed.
export const event = {
  name: 'Alátùpà – Light Bearer',
  blurb: 'A celebration of fashion, music, business and outstanding women: purpose, excellence, entrepreneurship and women making meaningful impact in society.',
  startsAt: '2026-11-27T15:00:00+01:00', // West Africa Time
  endsAt: '2026-11-27T20:00:00+01:00',
  dateLabel: 'Friday, 27 November 2026',
  shortDate: '27 Nov',
  timeLabel: '3:00 PM prompt',
  venue: 'Women Multipurpose Centre, Old Secretariat',
  city: 'Minna, Niger State',
  dressCode: 'Come dressed fashionably',
};

export type EventPhase = 'upcoming' | 'live' | 'over';
export function eventPhase(now = Date.now()): EventPhase {
  if (now >= Date.parse(event.endsAt)) return 'over';
  if (now >= Date.parse(event.startsAt)) return 'live';
  return 'upcoming';
}

const stamp = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

export function googleCalendarLink() {
  const q = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${event.name} · Artios Fashion House`,
    dates: `${stamp(event.startsAt)}/${stamp(event.endsAt)}`,
    location: `${event.venue}, ${event.city}`,
    details: `${event.blurb}\n\nDress code: ${event.dressCode}.`,
  });
  return `https://calendar.google.com/calendar/render?${q.toString()}`;
}

// A standard .ics invite, so iPhone, Android and desktop calendars can all add it.
export function downloadInvite() {
  const esc = (s: string) => s.replace(/[\\,;]/g, m => `\\${m}`).replace(/\n/g, '\\n');
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Artios Fashion House//Alatupa//EN', 'BEGIN:VEVENT',
    `UID:alatupa-2026@artiosfashion.xyz`, `DTSTAMP:${stamp(new Date().toISOString())}`,
    `DTSTART:${stamp(event.startsAt)}`, `DTEND:${stamp(event.endsAt)}`,
    `SUMMARY:${esc(`${event.name} · Artios Fashion House`)}`,
    `LOCATION:${esc(`${event.venue}, ${event.city}`)}`,
    `DESCRIPTION:${esc(`${event.blurb}\n\nDress code: ${event.dressCode}.`)}`,
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: 'alatupa-light-bearer.ics' });
  document.body.appendChild(a); a.click(); a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}
