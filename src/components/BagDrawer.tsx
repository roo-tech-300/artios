import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { describeOptions, useCart } from '../context/CartContext';
import { formatPrice } from '../lib/format';
import QuantityStepper from './QuantityStepper';
import ProductMedia from './ProductMedia';

export default function BagDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { items, removeItem, updateQty, subtotal } = useCart();
  useEffect(() => {
    if (!open) return;
    const close = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', close);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', close); document.body.style.overflow = ''; };
  }, [open, onClose]);

  return <AnimatePresence>{open && <motion.div className="drawer-scrim is-open" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
    <motion.aside className="bag-drawer drawer-v2" aria-label="Shopping bag" aria-modal="true" role="dialog" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}>
      <div className="drawer-heading"><h2>Your bag</h2><button className="icon-button" onClick={onClose} aria-label="Close bag"><X size={19} strokeWidth={1.4} /></button></div>
      {items.length ? <>
        <div className="drawer-lines">{items.map(({ key, product, quantity, options }, i) => <motion.article className="bag-line" key={key} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.05 }}>
          <ProductMedia product={product} options={options} className="line-media" />
          <div className="bag-line-info">
            <Link to={`/products/${product.slug}`} onClick={onClose}>{product.name}</Link>
            <p>{formatPrice(product.price)}</p>
            {describeOptions(options).length > 0 && <ul className="line-opts">{describeOptions(options).map(o => <li key={o}>{o}</li>)}</ul>}
            <QuantityStepper quantity={quantity} onChange={qty => updateQty(key, qty)} />
            <button className="text-link remove-link" onClick={() => removeItem(key)}>Remove</button>
          </div>
        </motion.article>)}</div>
        <div className="drawer-bottom">
          <div className="subtotal"><span>Subtotal</span><strong>{formatPrice(subtotal())}</strong></div>
          <p className="drawer-note">Delivery fee confirmed on WhatsApp.</p>
          <Link to="/checkout" className="solid-button full-button" onClick={onClose}>Checkout</Link>
          <Link to="/bag" className="drawer-viewbag" onClick={onClose}>View bag</Link>
        </div>
      </> : <div className="empty-bag"><p>Your bag is empty.</p><Link to="/collections/all" className="text-link" onClick={onClose}>Shop all</Link><Link to="/studio" className="text-link" onClick={onClose}>Design your own</Link></div>}
    </motion.aside>
  </motion.div>}</AnimatePresence>;
}
