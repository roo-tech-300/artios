import { useEffect, useState } from 'react';
import type { RefObject } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { formatPrice } from '../lib/format';

// Phone-only bar that appears once the main "Add to bag" button scrolls out of view.
export default function StickyBuy({ target, name, price, label, onClick }: { target: RefObject<HTMLElement | null>; name: string; price: number; label: string; onClick: () => void }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const el = target.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([entry]) => setShow(!entry.isIntersecting && entry.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, [target]);
  return <AnimatePresence>{show && <motion.div className="sticky-buy" initial={{ y: '110%' }} animate={{ y: 0 }} exit={{ y: '110%' }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}>
    <div><span>{name}</span><strong>{formatPrice(price)}</strong></div>
    <button className="solid-button" onClick={onClick}>{label}</button>
  </motion.div>}</AnimatePresence>;
}
