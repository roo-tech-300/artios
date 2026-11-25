import { Link } from 'react-router-dom';
import Eyebrow from './Eyebrow';
import Monogram from './Monogram';
import { Instagram } from 'lucide-react';
import { store, socials, whatsappLink } from '../config';

export default function Footer() {
  return <footer className="site-footer">
    <div className="footer-top">
      <div className="footer-brand">
        <Link to="/" className="footer-wordmark"><Monogram className="footer-mark" />Artios Fashion House</Link>
        <p>Wear the calling. Made ready, sent to illuminate.</p>
        <a className="footer-social" href={socials.instagram.url} target="_blank" rel="noopener noreferrer"><Instagram size={16} strokeWidth={1.4} />{socials.instagram.handle}</a>
      </div>
      <div><Eyebrow>Shop</Eyebrow><Link to="/collections/all">Shop all</Link><Link to="/studio">Design studio</Link><Link to="/#story">Our story</Link><Link to="/bag">Your bag</Link></div>
      <div><Eyebrow>Client services</Eyebrow><a href={whatsappLink()} target="_blank" rel="noopener noreferrer">WhatsApp us</a><a href={store.phoneHref}>{store.phoneDisplay}</a><a href={`mailto:${store.email}`}>{store.email}</a><a href={socials.instagram.url} target="_blank" rel="noopener noreferrer">Instagram</a></div>
      <div><Eyebrow>Visit</Eyebrow><p className="footer-address">{store.address}</p></div>
    </div>
    <div className="newsletter">
      <p className="newsletter-title">Questions about an order or sizing?</p>
      <a className="text-link footer-whatsapp" href={whatsappLink('Hello Artios, I have a question.')} target="_blank" rel="noopener noreferrer">Chat with us on WhatsApp <span>↗</span></a>
    </div>
    <p className="footer-bottom">© Artios Fashion House {new Date().getFullYear()} <span>Minna, Niger State · Made with care</span></p>
  </footer>;
}
