import { useId } from 'react';
import type { Garment, Swatch } from '../data/products';

export type LogoSide = 'left' | 'centre' | 'right';
export type PrintOptions = { side?: LogoSide; phrase?: string; placement?: 'front' | 'back' };
type Props = PrintOptions & { garment: Garment; color: Swatch; view?: 'front' | 'back'; backdrop?: boolean; glow?: boolean; className?: string; title?: string };

// Realistic garment photos (from the client's mockups), recoloured per swatch. Prints are layered on top.
const LANTERN = { src: '/brand/lantern.webp', w: 353, h: 225 };          // lantern with watercolour splash
const LANTERN_TALL = { src: '/brand/lantern-tall.webp', w: 164, h: 374 }; // full lantern, for vertical layouts
const LOGO = { dark: '/brand/artios-logo-dark.svg', light: '/brand/artios-logo-light.svg', w: 522.5, h: 168 };
const STACKED = { dark: '/brand/artios-stacked-dark.svg', light: '/brand/artios-stacked-light.svg', w: 387.6, h: 333.1 };

// Garment bounding boxes inside the 500 × 625 photo frame.
const BOX = {
  'tee-front': { x: 51, y: 56, w: 397.5, h: 500 },
  'tee-back': { x: 51, y: 56, w: 398, h: 500 },
  'hoodie-front': { x: 68.5, y: 56, w: 362.5, h: 512.5 },
  'hoodie-back': { x: 70, y: 56, w: 359.5, h: 512.5 },
};

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

const slug = (name: string) => name.toLowerCase();

export default function GarmentPreview({ garment, color, side = 'centre', phrase, placement = 'front', view = 'front', glow = false, className = '', title }: Props) {
  const id = useId().replace(/:/g, '');
  const box = BOX[`${garment}-${view}`];
  const bw = box.w;
  const ink = color.dark ? '#F3EEE4' : '#141212';
  const logo = color.dark ? LOGO.light : LOGO.dark;
  const stacked = color.dark ? STACKED.light : STACKED.dark;
  const blend = color.dark ? undefined : { mixBlendMode: 'multiply' as const };
  const photo = `/garments/${garment}-${view}-${slug(color.name)}.webp`;
  const shade = `/garments/${garment}-${view}-shade.webp`;
  const frontPhrase = phrase && placement === 'front' ? phrase : undefined;
  const backPhrase = phrase && placement === 'back' ? phrase : undefined;
  const isTee = garment === 'tee';

  const glowAt = (cx: number, cy: number, r: number) => glow ? <circle className="lantern-glow" cx={cx} cy={cy} r={r} fill={`url(#glow-${id})`} /> : null;
  const phraseLines = (text: string, cx: number, top: number, size: number, max: number, italic = true) =>
    splitLines(text, max).map((l, i) => <text key={i} x={cx} y={top + i * size * 1.2} textAnchor="middle" fontFamily="'Cormorant Garamond', serif" fontStyle={italic ? 'italic' : 'normal'} fontWeight={500} fontSize={size} fill={ink}>{l}</text>);

  // Lantern + ALÁTÙPÀ + Artios mark, as one lockup. Returns the bottom y so phrases can follow.
  const lockup = (cx: number, top: number, lw: number) => {
    const lh = (lw * LANTERN.h) / LANTERN.w, logoW = lw * 1.1, logoH = (logoW * LOGO.h) / LOGO.w;
    return { bottom: top + lw * 1.0 + logoH + 6, el: <>
      {glowAt(cx, top + lh * 0.62, lw * 0.42)}
      <image href={LANTERN.src} x={cx - lw / 2} y={top} width={lw} height={lh} />
      <text x={cx} y={top + lw * 0.943} textAnchor="middle" fontFamily="'Bebas Neue', Impact, sans-serif" fontSize={lw * 0.36} letterSpacing={lw * 0.017} fill={ink}>ALÁTÙPÀ</text>
      <image href={logo} x={cx - logoW / 2} y={top + lw * 1.02} width={logoW} height={logoH} />
    </> };
  };

  const front = () => {
    if (side === 'centre') {
      const w = bw * (isTee ? 0.27 : 0.25), h = (w * STACKED.h) / STACKED.w;
      const cx = box.x + bw / 2, top = box.y + box.h * (isTee ? 0.16 : 0.3);
      return <>
        <image href={stacked} x={cx - w / 2} y={top} width={w} height={h} />
        {frontPhrase && phraseLines(frontPhrase, cx, top + h + bw * 0.06, bw * 0.036, 26)}
      </>;
    }
    const cx = box.x + bw * (side === 'left' ? (isTee ? 0.33 : 0.34) : (isTee ? 0.67 : 0.66));
    const top = box.y + box.h * (isTee ? 0.19 : 0.32);
    const l = lockup(cx, top, bw * 0.19);
    return <>{l.el}{frontPhrase && phraseLines(frontPhrase, cx, l.bottom + bw * 0.04, bw * 0.027, 19)}</>;
  };

  const back = () => {
    const cx = box.x + bw / 2;
    if (side === 'centre') {
      if (isTee) {
        const lw = bw * 0.44, top = box.y + box.h * 0.11;
        const l = lockupBackTee(cx, top, lw);
        return <>{l.el}{backPhrase && phraseLines(backPhrase, cx, l.bottom + bw * 0.08, bw * 0.06, 18)}</>;
      }
      // Hoodie back, as in the mockup: vertical ALÁTÙPÀ beside a tall lantern.
      const lw = bw * 0.2, lh = (lw * LANTERN_TALL.h) / LANTERN_TALL.w, top = box.y + box.h * 0.3, lx = cx - lw * 0.15;
      const fs = lh * 0.345;
      return <>
        {glowAt(lx + lw / 2, top + lh * 0.62, lw * 0.6)}
        <image href={LANTERN_TALL.src} x={lx} y={top} width={lw} height={lh} />
        <text transform={`translate(${lx - 2} ${top + lh / 2}) rotate(-90)`} textAnchor="middle" fontFamily="'Bebas Neue', Impact, sans-serif" fontSize={fs} letterSpacing={fs * 0.02} fill={ink}>ALÁTÙPÀ</text>
        {backPhrase && phraseLines(backPhrase, cx, top + lh + bw * 0.1, bw * 0.055, 18)}
      </>;
    }
    // Corner layouts: small Artios mark at the neck, optional large phrase on the back.
    const nw = bw * 0.16, nh = (nw * LOGO.h) / LOGO.w, ny = box.y + box.h * (isTee ? 0.07 : 0.27);
    return <>
      <image href={logo} x={cx - nw / 2} y={ny} width={nw} height={nh} opacity={0.92} />
      {backPhrase && <>
        {glowAt(cx, ny + nh + bw * 0.16, bw * 0.08)}
        <image href={LANTERN.src} x={cx - bw * 0.1} y={ny + nh + bw * 0.08} width={bw * 0.2} height={bw * 0.2 * LANTERN.h / LANTERN.w} />
        {phraseLines(backPhrase, cx, ny + nh + bw * 0.32, bw * 0.072, 15)}
        <text x={cx} y={ny + nh + bw * 0.32 + splitLines(backPhrase, 15).length * bw * 0.086 + bw * 0.02} textAnchor="middle" fontFamily="Inter, sans-serif" fontSize={bw * 0.022} letterSpacing={bw * 0.009} fill={ink} opacity={0.85}>ARTIOS · ALÁTÙPÀ</text>
      </>}
    </>;
  };

  function lockupBackTee(cx: number, top: number, lw: number) {
    const lh = (lw * LANTERN.h) / LANTERN.w;
    return { bottom: top + lw * 0.943, el: <>
      {glowAt(cx, top + lh * 0.62, lw * 0.4)}
      <image href={LANTERN.src} x={cx - lw / 2} y={top} width={lw} height={lh} />
      <text x={cx} y={top + lw * 0.943} textAnchor="middle" fontFamily="'Bebas Neue', Impact, sans-serif" fontSize={lw * 0.36} letterSpacing={lw * 0.012} fill={ink}>ALÁTÙPÀ</text>
    </> };
  }

  return <svg className={`garment ${className}`} viewBox="0 0 500 625" role="img" aria-label={title ?? `${color.name} ${isTee ? 'T-shirt' : 'hoodie'}, ${view} view`}>
    <defs>
      <radialGradient id={`glow-${id}`}><stop offset="0" stopColor="#FFB347" stopOpacity=".5" /><stop offset="1" stopColor="#FFB347" stopOpacity="0" /></radialGradient>
      {/* Makes the print sit in the fabric: follows the folds, picks up the garment's light and shadow, loses vector-sharp edges. */}
      <filter id={`fab-${id}`} x="0" y="0" width="500" height="625" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        <feImage href={shade} x="0" y="0" width="500" height="625" preserveAspectRatio="none" result="shade" />
        <feGaussianBlur in="shade" stdDeviation="3" result="sblur" />
        <feDisplacementMap in="SourceGraphic" in2="sblur" scale="5" xChannelSelector="R" yChannelSelector="R" result="warp" />
        <feGaussianBlur in="warp" stdDeviation="0.35" result="soft" />
        <feBlend in="shade" in2="soft" mode="soft-light" result="lit1" />
        <feBlend in="shade" in2="lit1" mode="soft-light" result="lit" />
        <feComposite in="lit" in2="soft" operator="in" />
      </filter>
    </defs>
    <rect width="500" height="625" fill="#EDE5DA" />
    <image key={photo} className="g-photo" href={photo} x="0" y="0" width="500" height="625" preserveAspectRatio="xMidYMid slice" />
    <g className="g-print" style={blend} opacity={color.dark ? 0.92 : 0.95} filter={`url(#fab-${id})`}>{view === 'front' ? front() : back()}</g>
  </svg>;
}
