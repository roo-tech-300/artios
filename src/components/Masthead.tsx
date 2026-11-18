import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, Menu, X } from 'lucide-react';
import useScrollPosition from '../hooks/useScrollPosition';
import { useCart } from '../context/CartContext';
import products from '../data/products';
import { formatPrice } from '../lib/format';
import BagDrawer from './BagDrawer';
import Monogram from './Monogram';

export default function Masthead() {
  const scrolled = useScrollPosition();
  const { pathname } = useLocation();
  const [bagOpen, setBagOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const searchInput = useRef<HTMLInputElement>(null);
  const { items } = useCart();
  const count = items.reduce((n, item) => n + item.quantity, 0);
  const heroHeader = pathname === '/' || pathname === '/collections/all';
  const results = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    if (!term) return [];
    return products.filter(product => [product.name, product.description, product.category, ...Object.values(product.details)].join(' ').toLocaleLowerCase().includes(term));
  }, [query]);

  useEffect(() => { const closeMenu = () => setMenuOpen(false); window.addEventListener('resize', closeMenu); return () => window.removeEventListener('resize', closeMenu); }, []);
  useEffect(() => {
    if (!searchOpen) return;
    searchInput.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setSearchOpen(false); };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', closeOnEscape); };
  }, [searchOpen]);

  return <>
    <header className={`masthead ${!heroHeader || scrolled ? 'masthead-paper' : ''}`}>
      <Link className="wordmark" to="/" aria-label="Artios Fashion House home"><Monogram className="wordmark-mark" /><span>Artios Fashion House</span></Link>
      <nav className={menuOpen ? 'nav-open' : ''} aria-label="Main navigation">
        <Link to="/collections/all" onClick={() => setMenuOpen(false)}>Shop all</Link>
        <a href="/#maison" onClick={() => setMenuOpen(false)}>About</a>
      </nav>
      <div className="masthead-actions">
        <button className="icon-button search-button" aria-label="Search products" onClick={() => { setSearchOpen(true); setMenuOpen(false); }}><Search size={19} strokeWidth={1.35} /></button>
        <button className="icon-button bag-trigger" aria-label={`Open bag, ${count} items`} onClick={() => setBagOpen(true)}><ShoppingBag size={19} strokeWidth={1.35} />{count > 0 && <span className="bag-count">{count}</span>}</button>
        <button className="icon-button menu-trigger" aria-label="Toggle menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={21} /> : <Menu size={21} />}</button>
      </div>
    </header>
    <div className={`search-scrim ${searchOpen ? 'is-open' : ''}`} aria-hidden={!searchOpen} onMouseDown={event => { if (event.target === event.currentTarget) setSearchOpen(false); }}>
      <section className="search-panel" role="dialog" aria-modal="true" aria-label="Search products">
        <div className="search-panel-heading"><span>Search Artios</span><button className="icon-button" onClick={() => setSearchOpen(false)} aria-label="Close search"><X size={20} /></button></div>
        <label className="search-field"><Search size={19} strokeWidth={1.4} /><input ref={searchInput} type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="What are you looking for?" aria-label="Search products" /></label>
        <div className="search-results" aria-live="polite">
          {!query.trim() ? <p className="search-hint">Search by product name or description.</p> : results.length ? results.map(product => <Link className="search-result" key={product.id} to={`/products/${product.slug}`} onClick={() => setSearchOpen(false)}><img src={product.images[0]} alt="" /><span>{product.name}</span><span>{formatPrice(product.price)}</span></Link>) : <p className="search-hint">No products found. Try another search.</p>}
        </div>
        {query.trim() && results.length > 0 && <Link className="search-all-link" to="/collections/all" onClick={() => setSearchOpen(false)}>Browse all products</Link>}
      </section>
    </div>
    <BagDrawer open={bagOpen} onClose={() => setBagOpen(false)} />
  </>;
}
