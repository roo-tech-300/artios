import { useEffect, useState } from 'react';
export default function useScrollPosition() {
  const [scrolled, setScrolled] = useState(() => typeof window !== 'undefined' && window.scrollY > 80);
  useEffect(() => { const update = () => setScrolled(window.scrollY > 80); window.addEventListener('scroll', update, { passive: true }); return () => window.removeEventListener('scroll', update); }, []);
  return scrolled;
}
