import base from '../data/products';
import type { Product } from '../data/products';

// Products managed in the admin (Supabase). Rows with `ref` edit a built-in product; others are new.
export type RemoteRow = {
  id: string; ref: string | null; name: string | null; price: number | null; category: string | null;
  description: string | null; image_url: string | null; gallery: string[] | null; sizes: string[] | null;
  material: string | null; dimensions: string | null; care: string | null; badge: string | null;
  featured: boolean | null; visible: boolean | null; sort: number | null; created_at: string;
};

export const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/$/, '');
export const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
export const adminConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);

export async function fetchRows(): Promise<RemoteRow[]> {
  if (!adminConfigured) return [];
  const res = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*&order=sort.asc,created_at.asc`, { headers: { apikey: SUPABASE_KEY!, Authorization: `Bearer ${SUPABASE_KEY}` } });
  if (!res.ok) throw new Error(`Catalogue request failed (${res.status})`);
  return res.json();
}

export const slugify = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'item';
const pick = <T,>(v: T | null | undefined, fallback: T) => (v === null || v === undefined || v === '' ? fallback : v);

export function mergeCatalog(rows: RemoteRow[]): Product[] {
  const byRef = new Map(rows.filter(r => r.ref).map(r => [r.ref!, r]));
  const out: Product[] = [];
  for (const p of base) {
    const r = byRef.get(p.id);
    if (!r) { out.push(p); continue; }
    if (r.visible === false) continue;
    out.push({
      ...p,
      name: pick(r.name, p.name), price: pick(r.price, p.price), description: pick(r.description, p.description),
      image: pick(r.image_url, p.image ?? '') || p.image, badge: pick(r.badge, p.badge ?? '') || undefined,
      featured: r.featured ?? p.featured, gallery: r.gallery?.length ? r.gallery : p.gallery,
      details: { ...p.details, ...(r.material ? { material: r.material } : {}), ...(r.dimensions ? { dimensions: r.dimensions } : {}), ...(r.care ? { care: r.care } : {}) },
    });
  }
  for (const r of rows) {
    if (r.ref || r.visible === false || !r.name || r.price === null || !r.image_url) continue;
    out.push({
      id: `db-${r.id}`, slug: `${slugify(r.name)}-${r.id.slice(0, 4)}`, name: r.name, category: r.category || 'accessories',
      price: r.price, currency: 'NGN', description: r.description ?? '',
      details: { material: r.material ?? '', dimensions: r.dimensions ?? undefined, care: r.care ?? undefined },
      sizes: r.sizes?.length ? r.sizes : undefined, image: r.image_url, lifestyle: r.gallery?.[0], gallery: r.gallery ?? undefined,
      badge: r.badge ?? undefined, featured: Boolean(r.featured),
    });
  }
  return out;
}
