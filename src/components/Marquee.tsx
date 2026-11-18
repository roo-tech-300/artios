import Monogram from './Monogram';

// Endless scrolling band of phrases. Content is duplicated so the loop is seamless.
export default function Marquee({ items, tone = 'ink', speed = 38 }: { items: string[]; tone?: 'ink' | 'paper' | 'gold'; speed?: number }) {
  const row = <div className="marquee-row" aria-hidden="true">{items.map((item, i) => <span key={i}>{item}<Monogram className="marquee-mark" /></span>)}</div>;
  return <div className={`marquee marquee-${tone}`} style={{ ['--marquee-speed' as string]: `${speed}s` }}>
    <p className="sr-only">{items.join(' · ')}</p>
    <div className="marquee-track">{row}{row}</div>
  </div>;
}
