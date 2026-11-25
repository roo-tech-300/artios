import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LayoutGroup, motion } from 'framer-motion';
import Eyebrow from '../components/Eyebrow';
import ProductTile from '../components/ProductTile';
import { categories } from '../data/products';
import { useProducts } from '../context/ProductsContext';
import { collectionName } from '../brand';
import useTitle from '../hooks/useTitle';

type Sort = 'featured' | 'low' | 'high';

export default function Collection() {
  const [params, setParams] = useSearchParams();
  const products = useProducts();
  const chips = [...categories, ...[...new Set(products.map(p => p.category))].filter(c => !categories.some(k => k.id === c)).map(c => ({ id: c, label: c.charAt(0).toUpperCase() + c.slice(1) }))];
  const cat = params.get('category') ?? 'all';
  useTitle(cat === 'all' ? 'Shop all' : `Shop ${cat}`);
  const sort = (params.get('sort') as Sort) ?? 'featured';
  const list = useMemo(() => {
    const filtered = products.filter(p => cat === 'all' || p.category === cat);
    if (sort === 'low') return [...filtered].sort((a, b) => a.price - b.price);
    if (sort === 'high') return [...filtered].sort((a, b) => b.price - a.price);
    return filtered;
  }, [cat, sort, products]);
  const set = (key: string, value: string) => { const next = new URLSearchParams(params); if (value === 'all' || value === 'featured') next.delete(key); else next.set(key, value); setParams(next, { replace: true }); };

  return <>
    <section className="shop-head">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
        <Eyebrow>{collectionName}</Eyebrow>
        <h1>Shop all</h1>
        <p>Everyday pieces carrying the light. Apparel made to order in your colour.</p>
      </motion.div>
    </section>
    <section className="section-wrap shop-body">
      <div className="shop-bar">
        <LayoutGroup>
          <div className="chips" role="tablist" aria-label="Filter by category">
            {chips.map(c => <button key={c.id} role="tab" aria-selected={cat === c.id} className={cat === c.id ? 'is-active' : ''} onClick={() => set('category', c.id)}>
              {cat === c.id && <motion.span layoutId="chip" className="chip-bg" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
              <span className="chip-label">{c.label}</span>
            </button>)}
          </div>
        </LayoutGroup>
        <label className="sort">Sort <select value={sort} onChange={e => set('sort', e.target.value)}><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></label>
      </div>
      <p className="shop-count">{String(list.length).padStart(2, '0')} pieces</p>
      <motion.div layout className="grid-products">
        {list.map((p, i) => <ProductTile key={p.id} product={p} index={i} />)}
      </motion.div>
    </section>
  </>;
}
