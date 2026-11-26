import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

// Full-screen product photos: arrows, keyboard, swipe, and tap/click to zoom into the detail.
export default function Lightbox({ images, index, alt, onClose }: { images: string[]; index: number | null; alt: string; onClose: () => void }) {
  const [i, setI] = useState(index ?? 0);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState('50% 50%');
  const start = useRef<number | null>(null);
  const open = index !== null;
  useEffect(() => { if (index !== null) { setI(index); setZoom(false); } }, [index]);
  const go = (d: number) => { setZoom(false); setI(n => (n + d + images.length) % images.length); };
  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1); };
    window.addEventListener('keydown', key);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', key); document.body.style.overflow = ''; };
  });
  const aim = (x: number, y: number, el: HTMLElement) => { const r = el.getBoundingClientRect(); setOrigin(`${((x - r.left) / r.width) * 100}% ${((y - r.top) / r.height) * 100}%`); };

  return <AnimatePresence>{open && <motion.div className="lightbox" role="dialog" aria-modal="true" aria-label={`${alt} photos`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}
    onPointerDown={e => { start.current = e.clientX; }}
    onPointerUp={e => { if (start.current !== null && !zoom) { const dx = e.clientX - start.current; if (Math.abs(dx) > 60) go(dx < 0 ? 1 : -1); } start.current = null; }}>
    <button className="lb-close" onClick={onClose} aria-label="Close photos"><X size={22} strokeWidth={1.4} /></button>
    {images.length > 1 && <><button className="lb-nav lb-prev" onClick={() => go(-1)} aria-label="Previous photo"><ChevronLeft size={26} strokeWidth={1.2} /></button>
      <button className="lb-nav lb-next" onClick={() => go(1)} aria-label="Next photo"><ChevronRight size={26} strokeWidth={1.2} /></button></>}
    <AnimatePresence mode="wait">
      <motion.div key={images[i]} className={`lb-stage ${zoom ? 'is-zoomed' : ''}`} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        onClick={e => { aim(e.clientX, e.clientY, e.currentTarget); setZoom(z => !z); }}
        onPointerMove={e => { if (zoom) aim(e.clientX, e.clientY, e.currentTarget); }}>
        <img src={images[i]} alt={alt} style={{ transformOrigin: origin }} draggable={false} />
      </motion.div>
    </AnimatePresence>
    <p className="lb-meta"><ZoomIn size={13} strokeWidth={1.5} /> {zoom ? 'Tap to zoom out' : 'Tap to zoom'}{images.length > 1 && <span>{i + 1} / {images.length}</span>}</p>
  </motion.div>}</AnimatePresence>;
}
