import { Link, Outlet, ScrollRestoration, useLocation } from 'react-router-dom';
import { MotionConfig, motion } from 'framer-motion';
import Masthead from './components/Masthead';
import Footer from './components/Footer';
import Intro from './components/Intro';
import Marquee from './components/Marquee';
import { CartProvider } from './context/CartContext';
import WhatsAppButton from './components/WhatsAppButton';
import ScrollThread from './components/ScrollThread';
import useSmoothScroll from './hooks/useSmoothScroll';
import { event, eventPhase } from './event';
import { ProductsProvider } from './context/ProductsContext';

const baseNotices = ['Order on WhatsApp', 'Delivery across Nigeria', 'Apparel made to order in 5 colours', 'Design your own in the studio', 'Pay by bank transfer'];

function Layout() {
  const { pathname } = useLocation();
  useSmoothScroll();
  const notices = eventPhase() === 'over' ? baseNotices : [`${event.name} · ${event.shortDate} · ${event.city}`, ...baseNotices];
  return <MotionConfig reducedMotion="user">
    <ProductsProvider><CartProvider>
      <ScrollRestoration />
      <Intro />
      <ScrollThread />
      <div className="notice-bar"><Marquee items={notices} tone="gold" speed={46} /></div>
      <Masthead />
      <motion.main key={pathname} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}><Outlet /></motion.main>
      <Footer />
      <WhatsAppButton />
    </CartProvider></ProductsProvider>
  </MotionConfig>;
}
export default Layout;
export function NotFound() { return <div className="not-found"><p>This page has wandered off.</p><Link to="/">Return to Artios</Link></div>; }
