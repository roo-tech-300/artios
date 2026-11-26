import { useEffect } from 'react';
import Lenis from 'lenis';

// Weighted, inertial scrolling on desktop (wheel and trackpad), like the best fashion sites.
// Off for touch screens and for people who prefer reduced motion. Pauses while a drawer or
// modal locks the page, and never hijacks scrolling inside panels that scroll on their own.
export default function useSmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if (location.pathname.startsWith('/admin')) return;
    const lenis = new Lenis({
      duration: 1.15,
      easing: t => 1 - Math.pow(1 - t, 4),
      anchors: true,
      prevent: (node: HTMLElement) => {
        for (let n: HTMLElement | null = node; n && n !== document.body; n = n.parentElement) {
          const oy = getComputedStyle(n).overflowY;
          if ((oy === 'auto' || oy === 'scroll') && n.scrollHeight > n.clientHeight) return true;
        }
        return false;
      },
    });
    let raf = 0;
    const loop = (time: number) => { lenis.raf(time); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    // Drawers, search and modals set body overflow hidden: pause smooth scroll while they are open.
    const sync = () => (document.body.style.overflow === 'hidden' ? lenis.stop() : lenis.start());
    const mo = new MutationObserver(sync);
    mo.observe(document.body, { attributes: true, attributeFilter: ['style'] });
    return () => { cancelAnimationFrame(raf); mo.disconnect(); lenis.destroy(); };
  }, []);
}
