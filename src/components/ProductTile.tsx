import { Link } from 'react-router-dom';
import type { Product } from '../data/products';
import { formatPrice } from '../lib/format';
import ImageReveal from './ImageReveal';
export default function ProductTile({ product }: { product: Product }) { return <Link className="product-tile" to={`/products/${product.slug}`}><div className="tile-image"><ImageReveal src={product.images[0]} alt={product.name} loading="lazy" /></div><div className="tile-caption"><span>{product.name}</span><span>{formatPrice(product.price)}</span></div></Link>; }
