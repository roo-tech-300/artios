import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Eyebrow from '../components/Eyebrow';
import Configurator from '../components/Configurator';
import { useProducts } from '../context/ProductsContext';
import { formatPrice } from '../lib/format';

const ease = [0.16, 1, 0.3, 1] as const;

export default function Studio() {
  const [params, setParams] = useSearchParams();
  const products = useProducts();
  const apparel = products.filter(p => p.garment);
  const item = apparel.find(p => p.garment === params.get('item')) ?? apparel[0];

  return <>
    <section className="studio-hero">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease }}>
        <Eyebrow>Artios design studio</Eyebrow>
        <h1>Make it <em>yours.</em></h1>
        <p>Pick your piece, your colour and the words you carry. Place your mark top left or top right, and tell us anything else you want. We make it to order.</p>
      </motion.div>
      <ol className="studio-steps">{['Choose your piece', 'Pick a colour', 'Choose your phrase', 'Place your mark'].map((s, i) => <motion.li key={s} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.25 + i * 0.08, ease }}><span>0{i + 1}</span>{s}</motion.li>)}</ol>
    </section>
    <section className="studio section-wrap">
      <Configurator key={item.id} product={item} showNote initialColor={params.get('color') ?? undefined} header={<div className="pdp-head">
        <Eyebrow>Step 01 · Your piece</Eyebrow>
        <div className="segmented garment-switch">{apparel.map(p => <button key={p.id} type="button" className={p.id === item.id ? 'is-active' : ''} aria-pressed={p.id === item.id} onClick={() => setParams({ item: p.garment! }, { replace: true })}>{p.garment === 'tee' ? 'T-shirt' : 'Hoodie'} <small>{formatPrice(p.price)}</small></button>)}</div>
      </div>} />
    </section>
  </>;
}
