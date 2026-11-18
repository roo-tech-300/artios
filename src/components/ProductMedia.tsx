import type { Product } from '../data/products';
import { findColor } from '../data/products';
import type { LineOptions } from '../context/CartContext';
import GarmentPreview from './GarmentPreview';

// Shows the real studio photo when it matches the chosen colour, otherwise a live garment preview.
export default function ProductMedia({ product, options = {}, className = '', loading = 'lazy' }: { product: Product; options?: LineOptions; className?: string; loading?: 'lazy' | 'eager' }) {
  const color = findColor(product, options.color);
  const usePhoto = product.image && (!product.garment || !options.color || options.color === product.photoColor) && !options.phrase;
  if (usePhoto || !product.garment || !color) return <img className={className} src={product.image} alt={product.name} loading={loading} />;
  return <GarmentPreview className={className} garment={product.garment} color={color} side={options.side} phrase={options.phrase} placement={options.placement} title={`${product.name} in ${color.name}`} />;
}
