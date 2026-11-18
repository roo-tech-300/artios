import { Link, Outlet, ScrollRestoration } from 'react-router-dom';
import Masthead from './components/Masthead';
import Footer from './components/Footer';
import { CartProvider } from './context/CartContext';

function Layout() { return <CartProvider><ScrollRestoration /><Masthead /><main><Outlet /></main><Footer /></CartProvider>; }
export default Layout;
export function NotFound() { return <div className="not-found"><p>This page has wandered off.</p><Link to="/">Return to Artios</Link></div>; }
