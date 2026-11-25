import { useEffect, useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import type { MotionValue } from 'framer-motion';
import { ArrowDown, Plus } from 'lucide-react';
import Eyebrow from '../components/Eyebrow';
import ProductTile from '../components/ProductTile';
import Marquee from '../components/Marquee';
import GarmentPreview from '../components/GarmentPreview';
import EventBand from '../components/EventBand';
import { apparelColors } from '../data/products';
import { useProducts } from '../context/ProductsContext';
import { tagline, collectionName, marqueeLines, meaning, phrases } from '../brand';
import { store, whatsappLink } from '../config';
import useTitle from '../hooks/useTitle';

const ease = [0.16, 1, 0.3, 1] as const;

function Line({ children, delay }: { children: string; delay: number }) {
  return <span className="mask-line"><motion.span initial={{ y: '108%' }} animate={{ y: '0%' }} transition={{ duration: 1.1, delay, ease }}>{children}</motion.span></span>;
}

function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const yMain = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const move = (e: PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
  };
  return <section className="hx" ref={ref} onPointerMove={move}>
    <motion.div className="hx-bg" style={{ y: yMain }}><img src="/assets/hero.webp" alt="" /></motion.div>
    <div className="hx-light" aria-hidden="true" />
    <motion.div className="hx-copy" style={{ opacity: fade }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.2 }}><Eyebrow>Artios Fashion House · {collectionName}</Eyebrow></motion.div>
      <h1><Line delay={0.3}>{tagline.lead}</Line><Line delay={0.45}>{tagline.close}</Line></h1>
      <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.8, ease }}>A well-fitted identity, a bright-filled life. Pieces made ready to carry the light.</motion.p>
      <motion.div className="hx-ctas" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.95, ease }}>
        <Link to="/collections/all" className="solid-button light">Shop the collection</Link>
        <Link to="/studio" className="ghost-button">Design your own</Link>
      </motion.div>
    </motion.div>
    <motion.a href="#collection" className="hx-scroll" style={{ opacity: fade }}><ArrowDown size={14} strokeWidth={1.5} /> Scroll</motion.a>
  </section>;
}

function Categories() {
  const cards = [
    { label: 'Apparel', sub: 'Tees & hoodies, made to order', to: '/collections/all?category=apparel', media: <GarmentPreview garment="tee" color={apparelColors[2]} phrase={phrases[3]} /> },
    { label: 'Drinkware', sub: 'Flasks, tumblers & mugs', to: '/collections/all?category=drinkware', media: <img src="/assets/lifestyle/thermo-flask.webp" alt="" loading="lazy" /> },
    { label: 'Bags & paper', sub: 'Totes & notepads', to: '/collections/all?category=bags', media: <img src="/assets/studio/artios-notepad.webp" alt="" loading="lazy" /> },
  ];
  return <section className="cats section-wrap">
    {cards.map((c, i) => <motion.div key={c.label} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.9, delay: i * 0.1, ease }}>
      <Link to={c.to} className="cat-card"><div className="cat-media">{c.media}</div><div className="cat-info"><h3>{c.label}</h3><span>{c.sub}</span><span className="cat-go">Shop <span>↗</span></span></div></Link>
    </motion.div>)}
  </section>;
}

function StudioTeaser() {
  const [i, setI] = useState(0);
  useEffect(() => { const t = window.setInterval(() => setI(n => n + 1), 2600); return () => window.clearInterval(t); }, []);
  const color = apparelColors[i % apparelColors.length];
  const phrase = phrases[i % phrases.length];
  return <section className="teaser">
    <div className="teaser-stage">
      <div className="teaser-orbit" aria-hidden="true" />
      <GarmentPreview garment={i % 2 ? 'hoodie' : 'tee'} color={color} phrase={phrase} side={(['centre', 'left', 'right'] as const)[i % 3]} glow />
      <div className="teaser-swatches">{apparelColors.map((c, n) => <span key={c.name} className={n === i % apparelColors.length ? 'is-active' : ''} style={{ background: c.hex }} />)}</div>
    </div>
    <motion.div className="teaser-copy" initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 1, ease }}>
      <Eyebrow>The design studio</Eyebrow>
      <h2>Tailored for <em>impact.</em><br />Designed by you.</h2>
      <p>Choose your piece and colour, then pick the words you carry: “{phrase}”. Place the Artios mark top left or top right, and see it come alive before you order.</p>
      <ul><li>5 colours</li><li>5 catch phrases</li><li>Front or back</li><li>Made to order</li></ul>
      <Link to="/studio" className="solid-button">Open the design studio</Link>
    </motion.div>
  </section>;
}

function Word({ word, progress, range }: { word: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  return <motion.span style={{ opacity }}>{word} </motion.span>;
}

function Manifesto() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.55'] });
  const text = 'Artios means complete, perfectly fitted, thoroughly equipped. Alátùpà is the lantern bearer. Together they say one thing: you were made ready, and sent to illuminate.';
  const words = text.split(' ');
  return <section className="manifesto" id="story" ref={ref}>
    <div className="manifesto-inner">
      <div className="manifesto-word"><span className="greek">{meaning.greek}</span><span>{meaning.word} · {meaning.source}</span></div>
      <p className="manifesto-text">{words.map((w, n) => <Word key={n} word={w} progress={scrollYProgress} range={[n / words.length, (n + 1) / words.length]} />)}</p>
      <Link to="/studio" className="text-link light">Wear the calling <span>↗</span></Link>
    </div>
  </section>;
}

function Editorial() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y1 = useTransform(scrollYProgress, [0, 1], ['8%', '-8%']);
  const y2 = useTransform(scrollYProgress, [0, 1], ['-6%', '14%']);
  return <section className="editorial section-wrap" ref={ref}>
    <motion.figure style={{ y: y1 }} className="ed-a"><img src="/assets/lifestyle/artios-notepad.webp" alt="Artios notepad with the Alátùpà lantern" loading="lazy" /></motion.figure>
    <div className="ed-copy">
      <Eyebrow>Light bearer</Eyebrow>
      <h2>Light is my<br /><em>signature style.</em></h2>
      <p>Every piece carries the Alátùpà lantern, a reminder that you were not made to blend in. Wear it to work, to church, to the studio, to wherever your assignment takes you.</p>
      <Link to="/collections/all" className="text-link">Shop the collection <span>↗</span></Link>
    </div>
    <motion.figure style={{ y: y2 }} className="ed-b"><img src="/assets/lifestyle/artios-mug.webp" alt="Artios mug" loading="lazy" /></motion.figure>
  </section>;
}

const steps = [
  { n: '01', t: 'Choose or design', s: 'Pick a piece, or open the studio and choose your colour, words and logo placement.' },
  { n: '02', t: 'Check out and transfer', s: 'Add your delivery details and transfer the total to our account, shown at checkout.' },
  { n: '03', t: 'Send it on WhatsApp', s: 'Your full order opens in WhatsApp. Send it with your receipt and we confirm, make and deliver.' },
];

function HowItWorks() {
  return <section className="how section-wrap" aria-labelledby="how-title">
    <div className="block-head"><div><Eyebrow>Ordering is simple</Eyebrow><h2 id="how-title">From your bag to your door</h2></div><a className="text-link" href={whatsappLink('Hello Artios, I would like help with an order.')} target="_blank" rel="noopener noreferrer">Ask us anything <span>↗</span></a></div>
    <ol className="how-steps">{steps.map((st, i) => <motion.li key={st.n} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.8, delay: i * 0.1, ease }}>
      <span className="how-n">{st.n}</span><h3>{st.t}</h3><p>{st.s}</p>
    </motion.li>)}</ol>
  </section>;
}

const faqs = [
  { q: 'How do I place an order?', a: 'Add your pieces to the bag and go to checkout. Fill in your delivery details, transfer the total to our account, then send the order on WhatsApp with your receipt. We confirm everything with you in that chat.' },
  { q: 'Can I customise my T-shirt or hoodie?', a: 'Yes. Choose from five colours and five catch phrases, put the Artios mark on the left, centre or right, and place your phrase under the logo or large on the back. Anything else, write it in the note at checkout.' },
  { q: 'Do you deliver outside Minna?', a: 'We deliver across Nigeria. The delivery fee depends on where you are, and we confirm it with you on WhatsApp before your order is sent out.' },
  { q: 'How long will my order take?', a: 'Apparel is made to order, so timing depends on your piece and quantity. We give you a date when we confirm your payment.' },
  { q: 'Which size should I choose?', a: 'Every T-shirt and hoodie page has a size guide. If you are between sizes, take the larger one, or message us and we will help you choose.' },
  { q: 'Can I visit you?', a: `Our studio is at ${store.address}. Send us a message on WhatsApp to arrange a visit.` },
];

function Faq() {
  return <section className="faq section-wrap" aria-labelledby="faq-title">
    <div className="faq-head"><Eyebrow>Good to know</Eyebrow><h2 id="faq-title">Questions, answered</h2><p>Still wondering? <a href={whatsappLink('Hello Artios, I have a question.')} target="_blank" rel="noopener noreferrer">Chat with us on WhatsApp</a> or call {store.phoneDisplay}.</p></div>
    <div className="faq-list">{faqs.map(f => <details key={f.q} className="faq-item"><summary>{f.q}<Plus size={18} strokeWidth={1.3} /></summary><p>{f.a}</p></details>)}</div>
  </section>;
}

export default function Home() {
  useTitle();
  const products = useProducts();
  const featured = products.filter(p => p.featured).slice(0, 4);
  return <>
    <Hero />
    <Marquee items={marqueeLines} />
    <section className="section-wrap home-collection" id="collection">
      <div className="block-head"><div><Eyebrow>{collectionName}</Eyebrow><h2>Pieces of permanence</h2></div><Link to="/collections/all" className="text-link">Shop all <span>↗</span></Link></div>
      <div className="grid-products">{featured.map((p, i) => <ProductTile key={p.id} product={p} index={i} />)}</div>
    </section>
    <EventBand />
    <Categories />
    <StudioTeaser />
    <Editorial />
    <Manifesto />
    <HowItWorks />
    <Faq />
  </>;
}
