import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import products from '../data/products';
import type { Product } from '../data/products';

export type CartLine = { key: string; product: Product; quantity: number; size?: string };
type StoredLine = { id: string; quantity: number; size?: string };
type CartValue = {
  items: CartLine[];
  addItem: (product: Product, size?: string) => void;
  removeItem: (key: string) => void;
  updateQty: (key: string, qty: number) => void;
  clearCart: () => void;
  subtotal: () => number;
};

const STORAGE_KEY = 'artios-cart-v2';
const CartContext = createContext<CartValue | null>(null);
const lineKey = (id: string, size?: string) => (size ? `${id}:${size}` : id);

// Only ids are saved, so prices and images always come from the current catalogue.
function loadCart(): CartLine[] {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as StoredLine[];
    return stored.flatMap(line => {
      const product = products.find(p => p.id === line.id);
      if (!product || !(line.quantity > 0)) return [];
      return [{ key: lineKey(product.id, line.size), product, quantity: line.quantity, size: line.size }];
    });
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartLine[]>(loadCart);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items.map(({ product, quantity, size }) => ({ id: product.id, quantity, size }))));
    } catch { /* Cart stays in memory when storage is unavailable. */ }
  }, [items]);

  const value = useMemo<CartValue>(() => ({
    items,
    addItem: (product, size) => setItems(current => {
      const key = lineKey(product.id, size);
      return current.some(line => line.key === key)
        ? current.map(line => line.key === key ? { ...line, quantity: line.quantity + 1 } : line)
        : [...current, { key, product, quantity: 1, size }];
    }),
    removeItem: key => setItems(current => current.filter(line => line.key !== key)),
    updateQty: (key, qty) => setItems(current => qty < 1 ? current.filter(line => line.key !== key) : current.map(line => line.key === key ? { ...line, quantity: qty } : line)),
    clearCart: () => setItems([]),
    subtotal: () => items.reduce((sum, line) => sum + line.product.price * line.quantity, 0),
  }), [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside CartProvider');
  return context;
}
