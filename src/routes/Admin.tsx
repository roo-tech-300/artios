import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { createClient } from '@supabase/supabase-js';
import type { Session, SupabaseClient } from '@supabase/supabase-js';
import { ImagePlus, LogOut, Plus, X, Eye, EyeOff, Trash2 } from 'lucide-react';
import base, { categories } from '../data/products';
import { adminConfigured, SUPABASE_KEY, SUPABASE_URL } from '../lib/catalog';
import type { RemoteRow } from '../lib/catalog';
import { useCatalog } from '../context/ProductsContext';
import { formatPrice } from '../lib/format';

const supabase: SupabaseClient | null = adminConfigured ? createClient(SUPABASE_URL!, SUPABASE_KEY!) : null;
const BUCKET = 'product-images';

type Draft = {
  rowId?: string; ref?: string; name: string; price: string; category: string; description: string;
  material: string; dimensions: string; care: string; sizes: string; badge: string; featured: boolean; visible: boolean;
  image: string; gallery: string[];
};
const emptyDraft: Draft = { name: '', price: '', category: 'apparel', description: '', material: '', dimensions: '', care: '', sizes: '', badge: '', featured: false, visible: true, image: '', gallery: [] };

// Shrinks a phone photo before upload so the site stays fast.
async function shrink(file: File, max = 1600): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bmp.width * scale); canvas.height = Math.round(bmp.height * scale);
  canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) => canvas.toBlob(b => (b ? resolve(b) : reject(new Error('Could not read this image'))), 'image/webp', 0.86));
}

async function upload(file: File) {
  const blob = await shrink(file);
  const path = `products/${crypto.randomUUID()}.webp`;
  const { error } = await supabase!.storage.from(BUCKET).upload(path, blob, { contentType: 'image/webp', upsert: false });
  if (error) throw error;
  return supabase!.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

function Setup() {
  return <section className="admin section-wrap"><div className="admin-card">
    <h1>Admin is not connected yet</h1>
    <p>The admin area needs its free Supabase database. Follow <strong>ADMIN-SETUP.md</strong> in the project: create the project, run <code>supabase/setup.sql</code>, then add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to the hosting settings and redeploy.</p>
  </div></section>;
}

function SignIn() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [msg, setMsg] = useState('');
  async function send(e: FormEvent) {
    e.preventDefault(); setState('sending');
    const { error } = await supabase!.auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: `${window.location.origin}/admin`, shouldCreateUser: true } });
    if (error) { setState('error'); setMsg(error.message); } else setState('sent');
  }
  return <section className="admin section-wrap"><form className="admin-card admin-signin" onSubmit={send}>
    <p className="eyebrow">Artios Fashion House</p>
    <h1>Staff sign in</h1>
    {state === 'sent'
      ? <p>Check <strong>{email}</strong>. We sent you a sign-in link. Open it on this device to continue.</p>
      : <>
        <p>Enter your staff email and we’ll send you a secure sign-in link. No password needed.</p>
        <label>Email<input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" /></label>
        <button className="solid-button" disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Send sign-in link'}</button>
        {state === 'error' && <p className="admin-error">{msg}</p>}
      </>}
  </form></section>;
}

function Editor({ draft, onClose, onSaved }: { draft: Draft; onClose: () => void; onSaved: () => Promise<void> }) {
  const [d, setD] = useState<Draft>(draft);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const builtIn = Boolean(d.ref);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD(prev => ({ ...prev, [k]: v }));

  async function pickMain(files: FileList | null) {
    if (!files?.[0]) return;
    setBusy(true); setErr('');
    try { set('image', await upload(files[0])); } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  }
  async function pickExtra(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true); setErr('');
    try { const urls = await Promise.all([...files].slice(0, 6).map(upload)); setD(prev => ({ ...prev, gallery: [...prev.gallery, ...urls] })); } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  }
  async function save(e: FormEvent) {
    e.preventDefault(); setErr('');
    const price = Number(String(d.price).replace(/[^0-9]/g, ''));
    if (!d.name.trim() || !price) { setErr('Please add a name and a price.'); return; }
    if (!builtIn && !d.image) { setErr('Please upload a main photo.'); return; }
    setBusy(true);
    const row = {
      ref: d.ref ?? null, name: d.name.trim(), price, category: d.category.trim().toLowerCase() || 'accessories', description: d.description.trim() || null,
      material: d.material.trim() || null, dimensions: d.dimensions.trim() || null, care: d.care.trim() || null,
      sizes: d.sizes.split(',').map(s => s.trim()).filter(Boolean), badge: d.badge.trim() || null, featured: d.featured, visible: d.visible,
      image_url: d.image || null, gallery: d.gallery,
    };
    const q = d.rowId ? supabase!.from('products').update(row).eq('id', d.rowId) : builtIn ? supabase!.from('products').upsert(row, { onConflict: 'ref' }) : supabase!.from('products').insert(row);
    const { error } = await q;
    setBusy(false);
    if (error) { setErr(error.message); return; }
    await onSaved(); onClose();
  }
  async function remove() {
    if (!d.rowId || !window.confirm(builtIn ? 'Restore this product to its original details?' : 'Delete this product from the website?')) return;
    setBusy(true);
    const { error } = await supabase!.from('products').delete().eq('id', d.rowId);
    setBusy(false);
    if (error) { setErr(error.message); return; }
    await onSaved(); onClose();
  }

  return <div className="modal-scrim" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
    <form className="modal-panel admin-editor" onSubmit={save}>
      <div className="modal-head"><h2>{d.rowId || builtIn ? 'Edit product' : 'New product'}</h2><button type="button" className="icon-button" onClick={onClose} aria-label="Close"><X size={20} /></button></div>
      <div className="admin-photos">
        <label className="admin-drop">{d.image ? <img src={d.image} alt="" /> : <span><ImagePlus size={26} strokeWidth={1.2} />Main photo</span>}<input type="file" accept="image/*" onChange={e => pickMain(e.target.files)} /></label>
        <div className="admin-gallery">
          {d.gallery.map(src => <div key={src}><img src={src} alt="" /><button type="button" onClick={() => set('gallery', d.gallery.filter(g => g !== src))} aria-label="Remove photo"><X size={14} /></button></div>)}
          <label className="admin-add"><Plus size={18} />More photos<input type="file" accept="image/*" multiple onChange={e => pickExtra(e.target.files)} /></label>
        </div>
      </div>
      <p className="admin-tip">Tip: photos on a plain light background look best next to the other products.</p>
      <div className="admin-grid">
        <label className="span2">Name<input value={d.name} onChange={e => set('name', e.target.value)} required /></label>
        <label>Price (₦)<input inputMode="numeric" value={d.price} onChange={e => set('price', e.target.value)} required placeholder="8000" /></label>
        <label>Category<input list="cats" value={d.category} onChange={e => set('category', e.target.value)} disabled={builtIn} /><datalist id="cats">{categories.filter(c => c.id !== 'all').map(c => <option key={c.id} value={c.id} />)}</datalist></label>
        <label className="span2">Description<textarea rows={3} value={d.description} onChange={e => set('description', e.target.value)} /></label>
        <label>Material<input value={d.material} onChange={e => set('material', e.target.value)} /></label>
        <label>Size / dimensions<input value={d.dimensions} onChange={e => set('dimensions', e.target.value)} /></label>
        <label>Care<input value={d.care} onChange={e => set('care', e.target.value)} /></label>
        <label>Badge<input value={d.badge} onChange={e => set('badge', e.target.value)} placeholder="New, Bestseller…" /></label>
        {!builtIn && <label className="span2">Sizes customers can pick<input value={d.sizes} onChange={e => set('sizes', e.target.value)} placeholder="S, M, L, XL (leave empty if none)" /></label>}
        <label className="check"><input type="checkbox" checked={d.featured} onChange={e => set('featured', e.target.checked)} /> Show on the homepage</label>
        <label className="check"><input type="checkbox" checked={d.visible} onChange={e => set('visible', e.target.checked)} /> Visible on the website</label>
      </div>
      {err && <p className="admin-error">{err}</p>}
      <div className="admin-actions">
        {d.rowId && <button type="button" className="admin-danger" onClick={remove} disabled={busy}><Trash2 size={15} /> {builtIn ? 'Restore original' : 'Delete'}</button>}
        <button className="solid-button" disabled={busy}>{busy ? 'Working…' : 'Save'}</button>
      </div>
    </form>
  </div>;
}

function Dashboard({ session }: { session: Session }) {
  const { rows, refresh } = useCatalog();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const email = session.user.email ?? '';

  useEffect(() => {
    supabase!.from('admins').select('email').then(({ data }) => setIsAdmin(Boolean(data?.length)));
  }, [email]);

  const list = useMemo(() => {
    const builtIns = base.map(p => {
      const r = rows.find(x => x.ref === p.id);
      return { key: p.id, row: r, name: r?.name || p.name, price: r?.price ?? p.price, image: r?.image_url || p.image || '', visible: r?.visible !== false, builtIn: true, draft: toDraft(r, p.id, { name: p.name, price: p.price, category: p.category, description: p.description, image: p.image ?? '', badge: p.badge ?? '', featured: p.featured, gallery: p.gallery ?? [] }) };
    });
    const added = rows.filter(r => !r.ref).map(r => ({ key: r.id, row: r, name: r.name ?? 'Untitled', price: r.price ?? 0, image: r.image_url ?? '', visible: r.visible !== false, builtIn: false, draft: toDraft(r) }));
    return [...added.reverse(), ...builtIns];
  }, [rows]);

  async function toggle(item: (typeof list)[number]) {
    const visible = !item.visible;
    const q = item.row ? supabase!.from('products').update({ visible }).eq('id', item.row.id) : supabase!.from('products').upsert({ ref: item.key, visible }, { onConflict: 'ref' });
    const { error } = await q;
    if (error) window.alert(error.message); else await refresh();
  }

  if (isAdmin === null) return <section className="admin section-wrap"><p>Checking access…</p></section>;
  if (!isAdmin) return <section className="admin section-wrap"><div className="admin-card"><h1>No admin access</h1><p><strong>{email}</strong> is not on the staff list. Ask the owner to add it in Supabase (table <code>admins</code>).</p><button className="solid-button" onClick={() => supabase!.auth.signOut()}>Sign out</button></div></section>;

  return <section className="admin section-wrap">
    <div className="admin-head">
      <div><p className="eyebrow">Artios admin · {email}</p><h1>Products</h1></div>
      <div className="admin-head-actions">
        <button className="solid-button" onClick={() => setDraft({ ...emptyDraft })}><Plus size={16} /> Add product</button>
        <button className="ghost-dark" onClick={() => supabase!.auth.signOut()}><LogOut size={15} /> Sign out</button>
      </div>
    </div>
    <div className="admin-list">
      {list.map(item => <article key={item.key} className={`admin-row ${item.visible ? '' : 'is-hidden'}`}>
        {item.image ? <img src={item.image} alt="" /> : <div className="admin-noimg">Live preview</div>}
        <div><strong>{item.name}</strong><span>{formatPrice(item.price)} · {item.builtIn ? 'Built-in' : 'Added'}{item.visible ? '' : ' · Hidden'}</span></div>
        <button className="ghost-dark" onClick={() => toggle(item)} aria-label={item.visible ? 'Hide' : 'Show'}>{item.visible ? <EyeOff size={15} /> : <Eye size={15} />}{item.visible ? 'Hide' : 'Show'}</button>
        <button className="solid-button small" onClick={() => setDraft(item.draft)}>Edit</button>
      </article>)}
    </div>
    {draft && <Editor draft={draft} onClose={() => setDraft(null)} onSaved={refresh} />}
  </section>;
}

function toDraft(r?: RemoteRow, ref?: string, fallback?: { name: string; price: number; category: string; description: string; image: string; badge: string; featured: boolean; gallery: string[] }): Draft {
  return {
    rowId: r?.id, ref: ref ?? r?.ref ?? undefined,
    name: r?.name ?? fallback?.name ?? '', price: String(r?.price ?? fallback?.price ?? ''), category: r?.category ?? fallback?.category ?? 'apparel',
    description: r?.description ?? fallback?.description ?? '', material: r?.material ?? '', dimensions: r?.dimensions ?? '', care: r?.care ?? '',
    sizes: (r?.sizes ?? []).join(', '), badge: r?.badge ?? fallback?.badge ?? '', featured: r?.featured ?? fallback?.featured ?? false, visible: r?.visible ?? true,
    image: r?.image_url ?? fallback?.image ?? '', gallery: r?.gallery ?? fallback?.gallery ?? [],
  };
}

export default function Admin() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);
  useEffect(() => { document.title = 'Admin · Artios Fashion House'; return () => { document.title = 'Artios Fashion House'; }; }, []);
  if (!supabase) return <Setup />;
  if (session === undefined) return <section className="admin section-wrap"><p>Loading…</p></section>;
  return session ? <Dashboard session={session} /> : <SignIn />;
}
