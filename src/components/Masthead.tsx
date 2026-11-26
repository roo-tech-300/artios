import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, ShoppingBag, Menu, X } from 'lucide-react';
import useScrollPosition from '../hooks/useScrollPosition';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductsContext';
import { formatPrice } from '../lib/format';
import BagDrawer from './BagDrawer';
import Monogram from './Monogram';
import ProductMedia from './ProductMedia';

const links = [
  { to: '/collections/all', label: 'Shop' },
  { to: '/studio', label: 'Design studio' },
  { to: '/#story', label: 'Our story' },
];

export default function Masthead() {
  const scrolled = useScrollPosition();
  const products = useProducts();
  const { pathname } = useLocation();
  const [bagOpen, setBagOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const searchInput = useRef<HTMLInputElement>(null);
  const { count, lastAdded } = useCart();
  const overHero = pathname === '/' && !scrolled && !menuOpen;
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - last) < 6) return;
      setHidden(y > last && y > 320);
      last = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const results = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    if (!term) return [];
    return products.filter(p => [p.name, p.description, p.category, ...Object.values(p.details)].join(' ').toLocaleLowerCase().includes(term));
  }, [query, products]);

  useEffect(() => { setMenuOpen(false); }, [pathname]);
  useEffect(() => { if (lastAdded) setBagOpen(true); }, [lastAdded]);
  useEffect(() => {
    if (!searchOpen) return;
    searchInput.current?.focus();
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setSearchOpen(false); };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', esc);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', esc); };
  }, [searchOpen]);

  return <>
    <header className={`mast ${overHero ? 'is-hero' : 'is-solid'} ${scrolled ? 'is-scrolled' : ''} ${hidden && !menuOpen && !searchOpen && !bagOpen ? 'is-hidden' : ''}`}>
      <Link className="mast-brand" to="/" aria-label="Artios Fashion House home"><Monogram className="mast-mark" /><span>Artios <em>Fashion House</em></span></Link>
      <nav className={`mast-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Main navigation">
        {links.map((l, i) => <motion.div key={l.to} initial={false} animate={menuOpen ? { opacity: 1, y: 0 } : undefined} transition={{ delay: 0.05 * i }}>
          {l.to.includes('#') ? <a href={l.to}>{l.label}</a> : <NavLink to={l.to}>{l.label}</NavLink>}
        </motion.div>)}
      </nav>
      <div className="mast-actions">
        <button className="icon-button" aria-label="Search products" onClick={() => { setSearchOpen(true); setMenuOpen(false); }}><Search size={19} strokeWidth={1.35} /></button>
        <button className="icon-button bag-trigger" aria-label={`Open bag, ${count} items`} onClick={() => setBagOpen(true)}>
          <motion.span key={lastAdded} animate={lastAdded ? { scale: [1, 1.3, 1], rotate: [0, -10, 0] } : undefined} transition={{ duration: 0.5 }} style={{ display: 'grid' }}><ShoppingBag size={19} strokeWidth={1.35} /></motion.span>
          <AnimatePresence>{count > 0 && <motion.span key={count} className="bag-count" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>{count}</motion.span>}</AnimatePresence>
        </button>
        <button className="icon-button menu-trigger" aria-label="Toggle menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={21} /> : <Menu size={21} />}</button>
      </div>
    </header>

    <AnimatePresence>{searchOpen && <motion.div className="search-scrim is-open" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={e => { if (e.target === e.currentTarget) setSearchOpen(false); }}>
      <motion.section className="search-panel" role="dialog" aria-modal="true" aria-label="Search products" initial={{ y: -30 }} animate={{ y: 0 }} exit={{ y: -30 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
        <div className="search-panel-heading"><span>Search Artios</span><button className="icon-button" onClick={() => setSearchOpen(false)} aria-label="Close search"><X size={20} /></button></div>
        <label className="search-field"><Search size={19} strokeWidth={1.4} /><input ref={searchInput} type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Hoodie, flask, notepad…" aria-label="Search products" /></label>
        <div className="search-results" aria-live="polite">
          {!query.trim() ? <p className="search-hint">Search by product name or description.</p> : results.length ? results.map(p => <Link className="search-result" key={p.id} to={`/products/${p.slug}`} onClick={() => setSearchOpen(false)}><ProductMedia product={p} className="search-thumb" /><span>{p.name}</span><span>{formatPrice(p.price)}</span></Link>) : <p className="search-hint">No products found. Try another search.</p>}
        </div>
      </motion.section>
    </motion.div>}</AnimatePresence>
    <BagDrawer open={bagOpen} onClose={() => setBagOpen(false)} />
  </>;
}
