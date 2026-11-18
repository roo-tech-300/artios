import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { Garment } from '../data/products';
import { whatsappLink } from '../config';

const charts: Record<Garment, { head: string[]; rows: string[][] }> = {
  tee: { head: ['Size', 'Chest width', 'Length'], rows: [['S', '48 cm', '69 cm'], ['M', '51 cm', '72 cm'], ['L', '54 cm', '74 cm'], ['XL', '57 cm', '76 cm'], ['XXL', '60 cm', '78 cm']] },
  hoodie: { head: ['Size', 'Chest width', 'Length'], rows: [['S', '54 cm', '66 cm'], ['M', '57 cm', '69 cm'], ['L', '60 cm', '71 cm'], ['XL', '63 cm', '73 cm'], ['XXL', '66 cm', '75 cm']] },
};

export default function SizeGuide({ open, onClose, garment }: { open: boolean; onClose: () => void; garment: Garment }) {
  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [open, onClose]);
  const chart = charts[garment];
  return <AnimatePresence>{open && <motion.div className="modal-scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
    <motion.div className="modal-panel" role="dialog" aria-modal="true" aria-label="Size guide" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}>
      <div className="modal-head"><h2>Size guide</h2><button className="icon-button" onClick={onClose} aria-label="Close size guide"><X size={20} /></button></div>
      <p className="modal-note">Measured flat, armpit to armpit, and from the shoulder to the hem. Measurements are approximate.</p>
      <table className="size-table"><thead><tr>{chart.head.map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{chart.rows.map(r => <tr key={r[0]}>{r.map((c, i) => <td key={i}>{c}</td>)}</tr>)}</tbody></table>
      <p className="modal-note">Between sizes? Take the larger size for a relaxed fit. <a href={whatsappLink(`Hello Artios, I need help choosing a size for the ${garment === 'tee' ? 'T-shirt' : 'hoodie'}.`)} target="_blank" rel="noopener noreferrer">Ask us on WhatsApp</a> and we’ll help you choose.</p>
    </motion.div>
  </motion.div>}</AnimatePresence>;
}
