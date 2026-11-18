import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import base from '../data/products';
import type { Product } from '../data/products';
import { fetchRows, mergeCatalog } from '../lib/catalog';
import type { RemoteRow } from '../lib/catalog';

type Value = { products: Product[]; rows: RemoteRow[]; refresh: () => Promise<void> };
const Ctx = createContext<Value>({ products: base, rows: [], refresh: async () => {} });
const CACHE = 'artios-catalog-v1';

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [rows, setRows] = useState<RemoteRow[]>(() => {
    try { return JSON.parse(localStorage.getItem(CACHE) || '[]') as RemoteRow[]; } catch { return []; }
  });
  const refresh = useCallback(async () => {
    try {
      const next = await fetchRows();
      setRows(next);
      try { localStorage.setItem(CACHE, JSON.stringify(next)); } catch { /* ignore */ }
    } catch { /* keep the built-in catalogue if the admin database is unreachable */ }
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);
  const products = useMemo(() => (rows.length ? mergeCatalog(rows) : base), [rows]);
  return <Ctx.Provider value={{ products, rows, refresh }}>{children}</Ctx.Provider>;
}

export const useProducts = () => useContext(Ctx).products;
export const useCatalog = () => useContext(Ctx);
