import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import products from '../data/products';
import type { Product } from '../data/products';

export type LineOptions = { size?: string; color?: string; side?: 'left' | 'right'; phrase?: string; placement?: 'front' | 'back'; note?: string };
export type CartLine = { key: string; product: Product; quantity: number; options: LineOptions };
type StoredLine = { id: string; quantity: number; options?: LineOptions; size?: string };
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

const STORAGE_KEY = 'artios-cart-v3';
const CartContext = createContext<CartValue | null>(null);

const clean = (o: LineOptions): LineOptions => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== '')) as LineOptions;
const lineKey = (id: string, options: LineOptions) => `${id}|${JSON.stringify(Object.entries(clean(options)).sort())}`;

// Human-readable summary of a line's choices, used in the bag, checkout and the WhatsApp order.
export function describeOptions(o: LineOptions) {
  const parts: string[] = [];
  if (o.color) parts.push(o.color);
  if (o.size) parts.push(`Size ${o.size}`);
  if (o.side) parts.push(`Logo top ${o.side}`);
  if (o.phrase) parts.push(`“${o.phrase}”${o.placement === 'back' ? ' on back' : ' on front'}`);
  else if (o.side) parts.push('No phrase');
  if (o.note) parts.push(`Note: ${o.note}`);
  return parts;
}

// Only ids and choices are saved, so prices always come from the current catalogue.
function loadCart(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem('artios-cart-v2') ?? '[]';
    const stored = JSON.parse(raw) as StoredLine[];
    return stored.flatMap(line => {
      const product = products.find(p => p.id === line.id);
      if (!product || !(line.quantity > 0)) return [];
      const options = clean(line.options ?? (line.size ? { size: line.size } : {}));
      return [{ key: lineKey(product.id, options), product, quantity: line.quantity, options }];
    });
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartLine[]>(loadCart);
  const [lastAdded, setLastAdded] = useState(0);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items.map(({ product, quantity, options }) => ({ id: product.id, quantity, options })))); } catch { /* Cart stays in memory when storage is unavailable. */ }
  }, [items]);

  const value = useMemo<CartValue>(() => ({
    items,
    count: items.reduce((n, line) => n + line.quantity, 0),
    lastAdded,
    addItem: (product, options = {}) => {
      const opts = clean(options);
      const key = lineKey(product.id, opts);
      setItems(current => current.some(line => line.key === key)
        ? current.map(line => line.key === key ? { ...line, quantity: line.quantity + 1 } : line)
        : [...current, { key, product, quantity: 1, options: opts }]);
      setLastAdded(Date.now());
    },
    removeItem: key => setItems(current => current.filter(line => line.key !== key)),
    updateQty: (key, qty) => setItems(current => qty < 1 ? current.filter(line => line.key !== key) : current.map(line => line.key === key ? { ...line, quantity: qty } : line)),
    clearCart: () => setItems([]),
    subtotal: () => items.reduce((sum, line) => sum + line.product.price * line.quantity, 0),
  }), [items, lastAdded]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside CartProvider');
  return context;
}
