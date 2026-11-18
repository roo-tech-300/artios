import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

const ease = [0.76, 0, 0.24, 1] as const;

// Opening sequence: the gold thread is drawn through the needle, the wordmark appears, then the curtain lifts.
// Runs once per browser session and can be skipped with a tap.
export default function Intro() {
  const reduce = useReducedMotion();
  const [show, setShow] = useState(() => {
    try { return !sessionStorage.getItem('artios-intro'); } catch { return false; }
  });
  useEffect(() => {
    if (!show) return;
    try { sessionStorage.setItem('artios-intro', '1'); } catch { /* ignore */ }
    const t = window.setTimeout(() => setShow(false), reduce ? 300 : 2300);
    return () => window.clearTimeout(t);
  }, [show, reduce]);

  return <AnimatePresence>{show && <motion.div className="intro" onClick={() => setShow(false)} exit={{ y: '-100%' }} transition={{ duration: 0.9, ease }}>
    <svg className="intro-mark" viewBox="30 18 160 204" aria-hidden="true">
      <motion.g initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} fill="#F3EEE4">
        <path fillRule="evenodd" d="M103 30 A9 9 0 0 1 121 30 V160 L112 214 L103 160 Z M109.5 37 A2.5 2.5 0 0 1 114.5 37 V70 A2.5 2.5 0 0 1 109.5 70 Z" />
      </motion.g>
      <motion.path d="M112 38 L44 190" stroke="#C9A66B" strokeWidth="4.2" strokeLinecap="round" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.9, delay: 0.45, ease: [0.65, 0, 0.35, 1] }} />
      <motion.circle cx="44" cy="190" r="5.4" fill="#C9A66B" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.35, delay: 1.3 }} style={{ transformOrigin: '44px 190px' }} />
      <motion.g fill="#F3EEE4" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 1.05 }}>
        <path d="M121 25 H178 V51 H175 C174 39 170 31 160 31 H121 Z" /><path d="M121 117 H156 V108 H159 V132 H156 V123 H121 Z" /><path d="M103 117 H76 V122.5 H103 Z" />
      </motion.g>
    </svg>
    <motion.p className="intro-word" initial={{ opacity: 0, letterSpacing: '0.6em' }} animate={{ opacity: 1, letterSpacing: '0.32em' }} transition={{ duration: 1.1, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}>ARTIOS</motion.p>
    <motion.p className="intro-sub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 1.5 }}>Wear the calling</motion.p>
  </motion.div>}</AnimatePresence>;
}
