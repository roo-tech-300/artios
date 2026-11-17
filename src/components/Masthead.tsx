import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, Menu, X } from 'lucide-react';
import useScrollPosition from '../hooks/useScrollPosition';
import { useCart } from '../context/CartContext';
import BagDrawer from './BagDrawer';
export default function Masthead() {
  const scrolled = useScrollPosition(); const { pathname } = useLocation(); const [bagOpen, setBagOpen] = useState(false); const [menuOpen, setMenuOpen] = useState(false); const { items } = useCart(); const count = items.reduce((n, item) => n + item.quantity, 0);
  const heroHeader = pathname === '/' || pathname === '/collections/all';
  useEffect(() => { const closeMenu = () => setMenuOpen(false); window.addEventListener('resize', closeMenu); return () => window.removeEventListener('resize', closeMenu); }, []);
  return <><header className={`masthead ${!heroHeader || scrolled ? 'masthead-paper' : ''}`}><Link className="wordmark" to="/">Artios Fashion House</Link><nav className={menuOpen ? 'nav-open' : ''} aria-label="Main navigation"><Link to="/collections/all" onClick={() => setMenuOpen(false)}>Shop all</Link><a href="/#maison" onClick={() => setMenuOpen(false)}>About</a></nav><div className="masthead-actions"><button className="icon-button search-button" aria-label="Search"><Search size={19} strokeWidth={1.35} /></button><button className="icon-button bag-trigger" aria-label={`Open bag, ${count} items`} onClick={() => setBagOpen(true)}><ShoppingBag size={19} strokeWidth={1.35} />{count > 0 && <span className="bag-count">{count}</span>}</button><button className="icon-button menu-trigger" aria-label="Toggle menu" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={21} /> : <Menu size={21} />}</button></div></header><BagDrawer open={bagOpen} onClose={() => setBagOpen(false)} /></>;
}
