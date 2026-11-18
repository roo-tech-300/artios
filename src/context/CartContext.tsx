import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Product } from '../data/products';
import { useProducts } from './ProductsContext';

export type LineOptions = { size?: string; color?: string; side?: 'left' | 'centre' | 'right'; phrase?: string; placement?: 'front' | 'back'; note?: string };
export type CartLine = { key: string; product: Product; quantity: number; options: LineOptions };
type StoredLine = { key: string; id: string; quantity: number; options: LineOptions };
type CartValue = {
  items: CartLine[];
  count: number;
  lastAdded: number;
  addItem: (product: Product, options?: LineOptions) => void;
  removeItem: (key: string) => void;
  updateQty: (key: string, qty: number) => void;
  clearCart: () => void;
  subtotal: () => number;
};

const STORAGE_KEY = 'artios-cart-v4';
const CartContext = createContext<CartValue | null>(null);

const clean = (o: LineOptions): LineOptions => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== '')) as LineOptions;
const lineKey = (id: string, options: LineOptions) => `${id}|${JSON.stringify(Object.entries(clean(options)).sort())}`;

// Human-readable summary of a line's choices, used in the bag, checkout and the WhatsApp order.
export function describeOptions(o: LineOptions) {
  const parts: string[] = [];
  if (o.color) parts.push(o.color);
  if (o.size) parts.push(`Size ${o.size}`);
  if (o.side) parts.push(o.side === 'centre' ? 'Logo centre' : `Logo top ${o.side}`);
  if (o.phrase) parts.push(`“${o.phrase}”${o.placement === 'back' ? ' on back' : ' on front'}`);
  else if (o.side) parts.push('No phrase');
  if (o.note) parts.push(`Note: ${o.note}`);
  return parts;
}

function loadLines(): StoredLine[] {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem('artios-cart-v3') ?? '[]') as Partial<StoredLine>[];
    return stored.flatMap(l => (l.id && (l.quantity ?? 0) > 0) ? [{ id: l.id, quantity: l.quantity!, options: clean(l.options ?? {}), key: lineKey(l.id, l.options ?? {}) }] : []);
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const catalog = useProducts();
  const [lines, setLines] = useState<StoredLine[]>(loadLines);
  const [lastAdded, setLastAdded] = useState(0);
  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(lines)); } catch { /* cart stays in memory */ } }, [lines]);

  // Prices, names and photos always come from the live catalogue.
  const items = useMemo(() => lines.flatMap(l => {
    const product = catalog.find(p => p.id === l.id);
    return product ? [{ key: l.key, product, quantity: l.quantity, options: l.options }] : [];
  }), [lines, catalog]);

  const value = useMemo<CartValue>(() => ({
    items,
    count: items.reduce((n, line) => n + line.quantity, 0),
    lastAdded,
    addItem: (product, options = {}) => {
      const opts = clean(options);
      const key = lineKey(product.id, opts);
      setLines(current => current.some(l => l.key === key)
        ? current.map(l => l.key === key ? { ...l, quantity: l.quantity + 1 } : l)
        : [...current, { key, id: product.id, quantity: 1, options: opts }]);
      setLastAdded(Date.now());
    },
    removeItem: key => setLines(current => current.filter(l => l.key !== key)),
    updateQty: (key, qty) => setLines(current => qty < 1 ? current.filter(l => l.key !== key) : current.map(l => l.key === key ? { ...l, quantity: qty } : l)),
    clearCart: () => setLines([]),
    subtotal: () => items.reduce((sum, line) => sum + line.product.price * line.quantity, 0),
  }), [items, lastAdded]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside CartProvider');
  return context;
}
