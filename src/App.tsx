import { Link, Outlet, ScrollRestoration } from 'react-router-dom';
import Masthead from './components/Masthead';
import { CartProvider } from './context/CartContext';
function Layout() { return <CartProvider><ScrollRestoration /><Masthead /><main><Outlet /></main></CartProvider>; }
export default Layout;
export function NotFound() { return <div className="not-found"><p>This page has wandered off.</p><Link to="/">Return to the Artios</Link></div>; }
