import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Product } from '../data/products';
import { findColor } from '../data/products';
import { phrases } from '../brand';
import { formatPrice } from '../lib/format';
import GarmentPreview from './GarmentPreview';

const ease = [0.16, 1, 0.3, 1] as const;

export default function ProductTile({ product, index = 0 }: { product: Product; index?: number }) {
  const [hoverColor, setHoverColor] = useState<string>();
  const color = findColor(product, hoverColor);
  const showPreview = product.garment && color && (!product.image || (hoverColor && hoverColor !== product.photoColor));
  const href = `/products/${product.slug}`;

  return <motion.article className="tile" initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.9, delay: (index % 4) * 0.08, ease }}>
    <Link className="tile-link" to={href}>
      <div className="tile-media">
        {product.badge && <span className="tile-badge">{product.badge}</span>}
        {showPreview
          ? <GarmentPreview className="tile-img" garment={product.garment!} color={color!} />
          : <img className="tile-img" src={product.image} alt={product.name} loading="lazy" />}
        {product.lifestyle
          ? <img className="tile-img tile-alt" src={product.lifestyle} alt="" loading="lazy" aria-hidden="true" />
          : product.garment && color && <GarmentPreview className="tile-img tile-alt" garment={product.garment} color={color} view="back" phrase={phrases[4]} placement="back" />}
        <span className="tile-cta">{product.garment ? 'Customise' : 'View'}</span>
      </div>
      <div className="tile-info"><h3>{product.name}</h3><span>{formatPrice(product.price)}</span></div>
    </Link>
    {product.colors && <div className="tile-swatches" onMouseLeave={() => setHoverColor(undefined)}>
      {product.colors.map(c => <Link key={c.name} to={`${href}?color=${c.name}`} className="swatch-dot" style={{ background: c.hex }} aria-label={`${product.name} in ${c.name}`} onMouseEnter={() => setHoverColor(c.name)} onFocus={() => setHoverColor(c.name)} />)}
      <span>{product.colors.length} colours</span>
    </div>}
  </motion.article>;
}
