import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../lib/format';
import QuantityStepper from './QuantityStepper';
export default function BagDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { items, removeItem, updateQty, subtotal } = useCart();
  useEffect(() => { if (!open) return; const close = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); }; window.addEventListener('keydown', close); document.body.style.overflow = 'hidden'; return () => { window.removeEventListener('keydown', close); document.body.style.overflow = ''; }; }, [open, onClose]);
  return <div className={`drawer-scrim ${open ? 'is-open' : ''}`} onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }} aria-hidden={!open}><aside className="bag-drawer" aria-label="Shopping bag" aria-modal="true" role="dialog"><div className="drawer-heading"><h2>Your bag</h2><button className="icon-button" onClick={onClose} aria-label="Close bag"><X size={19} strokeWidth={1.4} /></button></div>{items.length ? <><div className="drawer-lines">{items.map(({ product, quantity }) => <article className="bag-line" key={product.id}><img src={product.images[0]} alt={product.name} /><div className="bag-line-info"><Link to={`/products/${product.slug}`} onClick={onClose}>{product.name}</Link><p>{formatPrice(product.price)}</p><QuantityStepper quantity={quantity} onChange={qty => updateQty(product.id, qty)} /><button className="text-link remove-link" onClick={() => removeItem(product.id)}>Remove</button></div></article>)}</div><div className="drawer-bottom"><div className="subtotal"><span>Subtotal</span><strong>{formatPrice(subtotal())}</strong></div><Link to="/checkout" className="outline-button full-button" onClick={onClose}>Proceed to Checkout</Link></div></> : <div className="empty-bag"><p>Your bag is empty.</p><Link to="/collections/all" className="text-link" onClick={onClose}>Shop all</Link></div>}</aside></div>;
}
