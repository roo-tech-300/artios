import type { Config } from 'tailwindcss';
export default { content: ['./index.html', './src/**/*.{ts,tsx}'], theme: { extend: { colors: { ink: 'var(--ink)', paper: 'var(--paper)', burgundy: 'var(--burgundy)', gold: 'var(--gold)', stone: 'var(--stone)', line: 'var(--line)' }, fontFamily: { serif: ['Cormorant Garamond', 'serif'], sans: ['Inter', 'sans-serif'] } } }, plugins: [] } satisfies Config;
