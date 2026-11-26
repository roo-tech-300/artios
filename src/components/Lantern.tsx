import { useId } from 'react';

// The Alátùpà lantern, drawn as a vector so it stays sharp at any size.
// A teal hurricane lantern with warm glass and a living flame (animated in CSS).
export default function Lantern({ className = '' }: { className?: string }) {
  const id = useId().replace(/:/g, '');
  const g = (n: string) => `${n}-${id}`;
  return <svg className={`lantern ${className}`} viewBox="0 30 220 352" role="img" aria-label="The Alátùpà lantern">
    <defs>
      <linearGradient id={g('metal')} x1="0" x2="1">
        <stop offset="0" stopColor="#0c2730" /><stop offset=".18" stopColor="#1f5563" /><stop offset=".42" stopColor="#3f8796" />
        <stop offset=".55" stopColor="#2a6b7a" /><stop offset=".8" stopColor="#163f4b" /><stop offset="1" stopColor="#0a2028" />
      </linearGradient>
      <linearGradient id={g('metalV')} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#3f8796" /><stop offset="1" stopColor="#0f303a" />
      </linearGradient>
      <linearGradient id={g('brass')} x1="0" x2="1">
        <stop offset="0" stopColor="#5a3a14" /><stop offset=".35" stopColor="#c9963f" /><stop offset=".5" stopColor="#f0cf86" />
        <stop offset=".7" stopColor="#a8742c" /><stop offset="1" stopColor="#4b2f10" />
      </linearGradient>
      <radialGradient id={g('glass')} cx="50%" cy="58%" r="62%">
        <stop offset="0" stopColor="#fff6d8" /><stop offset=".22" stopColor="#ffd27a" /><stop offset=".55" stopColor="#f39a35" stopOpacity=".92" />
        <stop offset=".85" stopColor="#b9531a" stopOpacity=".75" /><stop offset="1" stopColor="#5a2208" stopOpacity=".7" />
      </radialGradient>
      <linearGradient id={g('sheen')} x1="0" x2="1">
        <stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset=".5" stopColor="#fff" stopOpacity=".55" /><stop offset="1" stopColor="#fff" stopOpacity="0" />
      </linearGradient>
      <radialGradient id={g('flame')} cx="50%" cy="72%" r="60%">
        <stop offset="0" stopColor="#ffffff" /><stop offset=".3" stopColor="#fff1b8" /><stop offset=".65" stopColor="#ffb13b" /><stop offset="1" stopColor="#e2620f" stopOpacity="0" />
      </radialGradient>
      <radialGradient id={g('halo')}>
        <stop offset="0" stopColor="#ffb347" stopOpacity=".55" /><stop offset=".45" stopColor="#ff9a2e" stopOpacity=".18" /><stop offset="1" stopColor="#ff9a2e" stopOpacity="0" />
      </radialGradient>
      <radialGradient id={g('floor')}>
        <stop offset="0" stopColor="#ffb347" stopOpacity=".35" /><stop offset="1" stopColor="#ffb347" stopOpacity="0" />
      </radialGradient>
    </defs>

    {/* light on the floor and around the glass */}
    <ellipse cx="110" cy="370" rx="100" ry="11" fill={`url(#${g('floor')})`} />
    <circle className="lantern-halo" cx="110" cy="232" r="120" fill={`url(#${g('halo')})`} />

    {/* wire handle */}
    <path d="M44 118 C 40 40, 180 40, 176 118" fill="none" stroke="#123842" strokeWidth="5" strokeLinecap="round" />
    <path d="M44 118 C 40 40, 180 40, 176 118" fill="none" stroke="#4d98a7" strokeWidth="1.6" strokeLinecap="round" opacity=".6" transform="translate(-1 -1.5)" />

    {/* side tubes */}
    <path d="M40 132 V318 Q40 334 58 336" fill="none" stroke={`url(#${g('metal')})`} strokeWidth="11" strokeLinecap="round" />
    <path d="M180 132 V318 Q180 334 162 336" fill="none" stroke={`url(#${g('metal')})`} strokeWidth="11" strokeLinecap="round" />
    <path d="M37 136 V316" stroke="#6fb3c0" strokeWidth="1.4" opacity=".55" />
    <path d="M177 136 V316" stroke="#6fb3c0" strokeWidth="1.4" opacity=".35" />

    {/* top: finial, chimney cap, hood */}
    <circle cx="110" cy="64" r="6" fill={`url(#${g('brass')})`} />
    <rect x="96" y="68" width="28" height="14" rx="4" fill={`url(#${g('metal')})`} />
    <path d="M78 104 Q110 70 142 104 Z" fill={`url(#${g('metal')})`} />
    <path d="M30 128 Q110 88 190 128 L190 136 Q110 104 30 136 Z" fill={`url(#${g('metal')})`} />
    <path d="M36 128 Q110 94 184 128" fill="none" stroke="#7cc1cd" strokeWidth="1.2" opacity=".5" />
    <rect x="58" y="136" width="104" height="10" rx="3" fill={`url(#${g('brass')})`} />

    {/* glass globe */}
    <path className="lantern-glass" d="M66 146 C 44 190, 44 262, 70 292 L150 292 C 176 262, 176 190, 154 146 Z" fill={`url(#${g('glass')})`} />
    <path d="M78 156 C 62 196, 62 252, 80 284" fill="none" stroke={`url(#${g('sheen')})`} strokeWidth="7" strokeLinecap="round" opacity=".55" />

    {/* flame */}
    <g className="lantern-flame">
      <path d="M110 178 C 90 208, 92 238, 110 250 C 128 238, 130 208, 110 178 Z" fill={`url(#${g('flame')})`} />
      <path d="M110 208 C 102 224, 103 240, 110 247 C 117 240, 118 224, 110 208 Z" fill="#fffdf2" opacity=".92" />
    </g>
    <path d="M104 250 h12 l-2 8 h-8 z" fill="#7a4a17" opacity=".75" />

    {/* guard wires over the glass */}
    <g fill="none" stroke={`url(#${g('metalV')})`} strokeWidth="3.2" strokeLinecap="round">
      <path d="M72 148 C 56 196, 56 256, 76 290" />
      <path d="M148 148 C 164 196, 164 256, 144 290" />
      <path d="M110 146 V292" opacity=".35" />
      <path d="M58 214 Q110 236 162 214" />
    </g>

    {/* burner collar and fuel tank */}
    <rect x="62" y="290" width="96" height="12" rx="3" fill={`url(#${g('brass')})`} />
    <path d="M48 304 Q110 296 172 304 L178 352 Q110 370 42 352 Z" fill={`url(#${g('metal')})`} />
    <path d="M54 310 Q110 302 166 310" fill="none" stroke="#7cc1cd" strokeWidth="1.2" opacity=".45" />
    <path d="M44 340 Q110 354 176 340" fill="none" stroke="#0a1f26" strokeWidth="2" opacity=".6" />
    <circle cx="150" cy="326" r="7" fill={`url(#${g('brass')})`} />
    <rect x="44" y="352" width="132" height="12" rx="4" fill="#0d2a33" />
    <path d="M50 356 H170" stroke="#3f8796" strokeWidth="1" opacity=".5" />
  </svg>;
}
