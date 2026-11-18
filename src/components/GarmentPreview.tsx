import { useId } from 'react';
import type { Garment, Swatch } from '../data/products';

export type PrintOptions = { side?: 'left' | 'right'; phrase?: string; placement?: 'front' | 'back' };
type Props = PrintOptions & { garment: Garment; color: Swatch; view?: 'front' | 'back'; backdrop?: boolean; glow?: boolean; className?: string; title?: string };

const LANTERN = { src: '/brand/lantern.webp', w: 353, h: 225 };
const LOGO = { dark: '/brand/artios-logo-dark.svg', light: '/brand/artios-logo-light.svg', w: 522.5, h: 168 };

export function splitLines(text: string, max: number) {
  // Break at natural pauses (; or .) first, then wrap each part by length.
  const lines: string[] = [];
  for (const part of text.split(/(?<=[;.])\s+/)) {
    let line = '';
    for (const word of part.split(/\s+/)) {
      if (line && (line + ' ' + word).length > max) { lines.push(line); line = word; } else line = line ? `${line} ${word}` : word;
    }
    if (line) lines.push(line);
  }
  return lines;
}

const SHAPES = {
  tee: {
    body: 'M198 58 C212 100 288 100 302 58 L372 80 Q420 100 462 150 L428 232 L382 208 L384 525 Q250 537 116 525 L118 208 L72 232 L38 150 Q80 100 128 80 Z',
    chestTop: 128, chestX: { left: 186, right: 314 }, backTop: 118, neckLogoY: 84,
  },
  hoodie: {
    body: 'M175 92 L128 104 Q78 122 62 190 L36 470 L84 480 L104 262 L108 488 L108 522 Q250 532 392 522 L392 488 L396 262 L416 480 L464 470 L438 190 Q422 122 372 104 L325 92 Z',
    chestTop: 182, chestX: { left: 180, right: 320 }, backTop: 150, neckLogoY: 112,
  },
};

export default function GarmentPreview({ garment, color, side = 'left', phrase, placement = 'front', view = 'front', backdrop = true, glow = false, className = '', title }: Props) {
  const id = useId().replace(/:/g, '');
  const shape = SHAPES[garment];
  const ink = color.dark ? '#F3EEE4' : '#151313';
  const logo = color.dark ? LOGO.light : LOGO.dark;
  const line = color.dark ? 'rgba(255,255,255,.16)' : 'rgba(0,0,0,.16)';
  const showFrontPhrase = phrase && placement === 'front';
  const showBackPhrase = phrase && placement === 'back';

  const chest = (cx: number, top: number) => {
    const lw = 70, lh = (lw * LANTERN.h) / LANTERN.w, logoW = 78, logoH = (logoW * LOGO.h) / LOGO.w;
    const lines = showFrontPhrase ? splitLines(phrase!, 20) : [];
    return <g className="g-print">
      {glow && <circle className="lantern-glow" cx={cx} cy={top + lh * 0.62} r={30} fill={`url(#glow-${id})`} />}
      <image href={LANTERN.src} x={cx - lw / 2} y={top} width={lw} height={lh} />
      <text x={cx} y={top + 66} textAnchor="middle" fontFamily="'Bebas Neue', Impact, sans-serif" fontSize={25} letterSpacing={1.2} fill={ink}>ALÁTÙPÀ</text>
      <image href={logo} x={cx - logoW / 2} y={top + 72} width={logoW} height={logoH} />
      {lines.map((l, i) => <text key={i} x={cx} y={top + 112 + i * 12.5} textAnchor="middle" fontFamily="'Cormorant Garamond', serif" fontStyle="italic" fontSize={10.5} fill={ink}>{i === 0 ? '“' : ''}{l}{i === lines.length - 1 ? '”' : ''}</text>)}
    </g>;
  };

  const back = () => {
    const top = shape.backTop;
    const logoW = 56, logoH = (logoW * LOGO.h) / LOGO.w;
    if (!showBackPhrase) return <image href={logo} x={250 - logoW / 2} y={shape.neckLogoY} width={logoW} height={logoH} opacity={0.9} />;
    const lines = splitLines(phrase!, 15);
    const lw = 66, lh = (lw * LANTERN.h) / LANTERN.w;
    return <g className="g-print">
      <image href={logo} x={250 - logoW / 2} y={shape.neckLogoY} width={logoW} height={logoH} opacity={0.9} />
      {glow && <circle className="lantern-glow" cx={250} cy={top + 34 + lh * 0.62} r={30} fill={`url(#glow-${id})`} />}
      <image href={LANTERN.src} x={250 - lw / 2} y={top + 34} width={lw} height={lh} />
      {lines.map((l, i) => <text key={i} x={250} y={top + 118 + i * 35} textAnchor="middle" fontFamily="'Cormorant Garamond', serif" fontStyle="italic" fontWeight={500} fontSize={31} fill={ink}>{l}</text>)}
      <text x={250} y={top + 118 + lines.length * 35 + 8} textAnchor="middle" fontFamily="Inter, sans-serif" fontSize={8.5} letterSpacing={3.4} fill={ink} opacity={0.8}>ARTIOS · ALÁTÙPÀ</text>
    </g>;
  };

  return <svg className={`garment ${className}`} viewBox="0 0 500 625" role="img" aria-label={title ?? `${color.name} ${garment === 'tee' ? 'T-shirt' : 'hoodie'}, ${view} view`}>
    <defs>
      <radialGradient id={`bd-${id}`} cx="50%" cy="42%" r="75%"><stop offset="0" stopColor="#F3EDE4" /><stop offset="1" stopColor="#E7DED4" /></radialGradient>
      <linearGradient id={`sh-${id}`} x1="0" x2="1"><stop offset="0" stopColor="#000" stopOpacity=".26" /><stop offset=".2" stopColor="#000" stopOpacity="0" /><stop offset=".8" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".26" /></linearGradient>
      <radialGradient id={`hl-${id}`} cx="45%" cy="30%" r="60%"><stop offset="0" stopColor="#fff" stopOpacity={color.dark ? '.10' : '.18'} /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient>
      <radialGradient id={`glow-${id}`}><stop offset="0" stopColor="#FFB347" stopOpacity=".55" /><stop offset="1" stopColor="#FFB347" stopOpacity="0" /></radialGradient>
      <filter id={`ds-${id}`} x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#3b2f22" floodOpacity=".18" /></filter>
    </defs>
    {backdrop && <rect width="500" height="625" fill={`url(#bd-${id})`} />}
    <g transform="translate(0 46)">
      {garment === 'hoodie' && <path d={view === 'front' ? 'M166 104 C158 34 342 34 334 104 Z' : 'M164 108 C150 16 350 16 336 108 Z'} className="g-fill" fill={color.hex} filter={`url(#ds-${id})`} />}
      <path d={shape.body} className="g-fill" fill={color.hex} filter={`url(#ds-${id})`} />
      <path d={shape.body} fill={`url(#sh-${id})`} />
      <path d={shape.body} fill={`url(#hl-${id})`} />
      {garment === 'tee' && view === 'front' && <>
        <path d="M198 58 C215 70 285 70 302 58 C288 100 212 100 198 58 Z" fill="#000" opacity=".3" />
        <path d="M194 56 C210 106 290 106 306 56 L299 58 C286 95 214 95 201 58 Z" className="g-fill" fill={color.hex} /><path d="M194 56 C210 106 290 106 306 56 L299 58 C286 95 214 95 201 58 Z" fill="#000" opacity=".12" />
      </>}
      {garment === 'tee' && view === 'back' && <path d="M194 56 C212 78 288 78 306 56 L300 60 C285 71 215 71 200 60 Z" fill="#000" opacity=".16" />}
      {garment === 'tee' && <g fill="none" stroke={line} strokeWidth="1.4">
        <path d="M128 80 Q122 150 118 208" /><path d="M372 80 Q378 150 382 208" />
        <path d="M80 216 L119 196" strokeDasharray="3 3" /><path d="M420 216 L381 196" strokeDasharray="3 3" />
        <path d="M118 510 Q250 522 382 510" strokeDasharray="3 3" />
        <path d="M170 300 Q182 400 166 500" opacity=".5" /><path d="M332 286 Q320 390 338 500" opacity=".5" />
      </g>}
      {garment === 'hoodie' && <>
        <g fill="#000" opacity=".14"><path d="M38 446 L87 456 L84 480 L36 470 Z" /><path d="M462 446 L413 456 L416 480 L464 470 Z" /><path d="M108 488 Q250 498 392 488 L392 522 Q250 532 108 522 Z" /></g>
        <g fill="none" stroke={line} strokeWidth="1.4">
          <path d="M128 104 Q140 190 104 262" /><path d="M372 104 Q360 190 396 262" />
          {view === 'front' && <path d="M150 372 Q250 366 350 372 L376 470 Q250 476 124 470 Z" />}
          {view === 'back' && <path d="M250 40 L250 106" />}
        </g>
        {view === 'front' && <>
          <path d="M150 372 Q250 366 350 372 L376 470 Q250 476 124 470 Z" fill="#000" opacity=".06" />
          <path d="M194 102 C200 60 300 60 306 102 C292 130 208 130 194 102 Z" fill="#000" opacity=".42" />
          <path d="M190 96 C196 120 222 146 252 156 L250 168 C214 156 188 128 182 100 Z" className="g-fill" fill={color.hex} /><path d="M190 96 C196 120 222 146 252 156 L250 168 C214 156 188 128 182 100 Z" fill="#000" opacity=".1" />
          <path d="M310 96 C304 120 278 146 248 156 L250 168 C286 156 312 128 318 100 Z" className="g-fill" fill={color.hex} /><path d="M310 96 C304 120 278 146 248 156 L250 168 C286 156 312 128 318 100 Z" fill="#fff" opacity=".05" />
          <g stroke={color.dark ? '#E9E2D6' : '#2a2522'} strokeWidth="3.2" strokeLinecap="round"><path d="M232 152 L227 232" /><path d="M268 152 L273 232" /></g>
          <g fill={color.dark ? '#E9E2D6' : '#2a2522'}><rect x="223.5" y="230" width="7" height="13" rx="2" /><rect x="269.5" y="230" width="7" height="13" rx="2" /></g>
        </>}
      </>}
      {view === 'front' ? chest(shape.chestX[side], shape.chestTop) : back()}
    </g>
  </svg>;
}
