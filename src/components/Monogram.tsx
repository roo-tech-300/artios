// Artios needle-and-thread monogram. The needle and F follow the text colour; the thread stays gold.
export default function Monogram({ className = '' }: { className?: string }) {
  return <svg className={className} viewBox="40 22 142 198" aria-hidden="true" focusable="false">
    <g fill="var(--gold)"><path d="M117.89 40.91 L45.89 190.91 L42.11 189.09 L114.11 39.09 Z" /><circle cx="44" cy="190" r="5.2" /></g>
    <g fill="currentColor"><path fillRule="evenodd" d="M103 30 A9 9 0 0 1 121 30 V160 L112 214 L103 160 Z M109.5 37 A2.5 2.5 0 0 1 114.5 37 V70 A2.5 2.5 0 0 1 109.5 70 Z" /><path d="M121 25 H178 V51 H175 C174 39 170 31 160 31 H121 Z" /><path d="M121 117 H156 V108 H159 V132 H156 V123 H121 Z" /><path d="M103 117 H76 V122.5 H103 Z" /></g>
  </svg>;
}
