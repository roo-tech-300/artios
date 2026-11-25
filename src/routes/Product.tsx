import { useEffect, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Eyebrow from '../components/Eyebrow';
import ProductTile from '../components/ProductTile';
import Configurator from '../components/Configurator';
import StickyBuy from '../components/StickyBuy';
import { useProducts } from '../context/ProductsContext';
import type { Product } from '../data/products';
import { formatPrice } from '../lib/format';
import { useCart } from '../context/CartContext';
import { store, whatsappLink } from '../config';
import useTitle from '../hooks/useTitle';

function Info({ product }: { product: Product }) {
  return <div className="pdp-accordion">
    <details open><summary>Details</summary><dl>{Object.entries(product.details).map(([k, v]) => v && <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl></details>
    <details><summary>Delivery &amp; payment</summary><p>We deliver across Nigeria. The delivery fee depends on your location and is confirmed on WhatsApp before dispatch. Pay by bank transfer to {store.bank.bankName} and send your receipt in the chat.</p></details>
    <details><summary>Questions?</summary><p><a href={whatsappLink(`Hello Artios, I have a question about the ${product.name}.`)} target="_blank" rel="noopener noreferrer">Chat with us on WhatsApp</a> or call <a href={store.phoneHref}>{store.phoneDisplay}</a>.</p></details>
  </div>;
}

function Heading({ product }: { product: Product }) {
  return <div className="pdp-head">
    <Eyebrow>{product.category}</Eyebrow>
    <h1>{product.name}</h1>
    <p className="pdp-price">{formatPrice(product.price)}</p>
    <p className="pdp-desc">{product.description}</p>
  </div>;
}

function SimpleProduct({ product }: { product: Product }) {
  const gallery = [product.image, product.lifestyle].filter(Boolean) as string[];
  const [active, setActive] = useState(0);
  const [added, setAdded] = useState(false);
  const buyRef = useRef<HTMLButtonElement>(null);
  const { addItem } = useCart();
  useEffect(() => { setActive(0); }, [product.id]);
  useEffect(() => { if (!added) return; const t = window.setTimeout(() => setAdded(false), 2400); return () => window.clearTimeout(t); }, [added]);
  const add = () => { addItem(product); setAdded(true); };
  return <div className="config">
    <div className="config-stage">
      <div className="stage-frame">
        <AnimatePresence mode="wait"><motion.img key={gallery[active]} className="stage-photo" src={gallery[active]} alt={product.name} initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }} /></AnimatePresence>
      </div>
      {gallery.length > 1 && <div className="stage-thumbs">{gallery.map((src, i) => <button key={src} className={i === active ? 'is-active' : ''} onClick={() => setActive(i)} aria-label={`Image ${i + 1}`}><img src={src} alt="" /></button>)}</div>}
    </div>
    <div className="config-panel">
      <Heading product={product} />
      <div className="buy-row">
        <button ref={buyRef} className="solid-button buy-button" onClick={add}>
          <AnimatePresence mode="wait" initial={false}><motion.span key={added ? 'a' : 'b'} initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -14, opacity: 0 }} transition={{ duration: 0.25 }}>{added ? 'Added to your bag ✓' : 'Add to bag'}</motion.span></AnimatePresence>
        </button>
        <p className="buy-note">Delivered across Nigeria. Order and pay on WhatsApp.</p>
      </div>
      <Info product={product} />
    </div>
    <StickyBuy target={buyRef} name={product.name} price={product.price} label="Add to bag" onClick={add} />
  </div>;
}

export default function ProductPage() {
  const { slug } = useParams();
  const [params] = useSearchParams();
  const products = useProducts();
  const product = products.find(item => item.slug === slug);
  useTitle(product?.name ?? 'Not found');
  if (!product) return <div className="not-found"><p>This item could not be found.</p><Link to="/collections/all">Shop all</Link></div>;
  const related = products.filter(item => item.id !== product.id && (item.category === product.category || item.featured)).slice(0, 4);
  const photos = [...new Set([product.image, product.lifestyle, ...(product.gallery ?? [])].filter(Boolean) as string[])];

  return <>
    <div className="breadcrumbs pdp-crumbs"><Link to="/">Home</Link><span>/</span><Link to="/collections/all">Shop</Link><span>/</span><span>{product.name}</span></div>
    <section className="pdp section-wrap">
      {product.garment
        ? <Configurator key={product.id} product={product} initialColor={params.get('color') ?? undefined} photos={photos} header={<><Heading product={product} /></>} />
        : <SimpleProduct product={product} />}
      {product.garment && <div className="pdp-info-wide"><Info product={product} /></div>}
    </section>
    <section className="related-block section-wrap">
      <div className="block-head"><div><Eyebrow>Complete the look</Eyebrow><h2>You may also like</h2></div><Link to="/collections/all" className="text-link">Shop all <span>↗</span></Link></div>
      <div className="grid-products">{related.map((item, i) => <ProductTile key={item.id} product={item} index={i} />)}</div>
    </section>
  </>;
}
