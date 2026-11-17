import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Product } from '../data/products';

type CartLine = { product: Product; quantity: number };
type CartValue = { items: CartLine[]; addItem: (product: Product) => void; removeItem: (id: string) => void; updateQty: (id: string, qty: number) => void; subtotal: () => number };
const CartContext = createContext<CartValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartLine[]>(() => { try { return JSON.parse(localStorage.getItem('artios-cart') || localStorage.getItem('vionne-cart') || '[]') as CartLine[]; } catch { return []; } });
  useEffect(() => { try { localStorage.setItem('artios-cart', JSON.stringify(items)); } catch { /* Cart remains available in memory when storage is unavailable. */ } }, [items]);
  const value = useMemo<CartValue>(() => ({ items,
    addItem: product => setItems(current => { const existing = current.find(line => line.product.id === product.id); return existing ? current.map(line => line.product.id === product.id ? { ...line, quantity: line.quantity + 1 } : line) : [...current, { product, quantity: 1 }]; }),
    removeItem: id => setItems(current => current.filter(line => line.product.id !== id)),
    updateQty: (id, qty) => setItems(current => qty < 1 ? current.filter(line => line.product.id !== id) : current.map(line => line.product.id === id ? { ...line, quantity: qty } : line)),
    subtotal: () => items.reduce((sum, line) => sum + line.product.price * line.quantity, 0),
  }), [items]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export function useCart() { const context = useContext(CartContext); if (!context) throw new Error('useCart must be used inside CartProvider'); return context; }
