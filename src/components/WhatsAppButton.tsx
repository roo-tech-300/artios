import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { whatsappLink } from '../config';

// Floating "chat with us" button. Hidden where the page already has its own buy or order bar.
const HIDDEN = ['/products/', '/studio', '/checkout', '/bag', '/admin'];

export default function WhatsAppButton() {
  const { pathname } = useLocation();
  if (HIDDEN.some(p => pathname.startsWith(p))) return null;
  return <motion.a className="wa-fab" href={whatsappLink('Hello Artios, I have a question.')} target="_blank" rel="noopener noreferrer" aria-label="Chat with Artios on WhatsApp"
    initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 2.6, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
    <MessageCircle size={22} strokeWidth={1.5} /><span>Chat with us</span>
  </motion.a>;
}
