import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { ImagePlus, LogOut, Plus, X, Eye, EyeOff, Trash2, MessageCircle, RefreshCw } from 'lucide-react';
import base, { categories } from '../data/products';
import type { RemoteRow } from '../lib/catalog';
import { useCatalog } from '../context/ProductsContext';
import { formatPrice } from '../lib/format';

type Me = { email: string; is_owner: boolean };
type Order = { id: string; number: string; status: string; total: number; created_at: string; customer: Record<string, string | null>; items: { name: string; quantity: number; price: number; options: string[] }[] };
type Staff = { email: string; is_owner: boolean; created_at: string };

async function api<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api${path}`, { credentials: 'same-origin', ...init, headers: { ...(init.body && typeof init.body === 'string' ? { 'Content-Type': 'application/json' } : {}), ...init.headers } });
  const isJson = (res.headers.get('content-type') || '').includes('application/json');
  const data = isJson ? await res.json() : null;
  if (!res.ok) throw Object.assign(new Error(data?.error || (res.status === 404 ? 'The admin server is not running on this address.' : `Request failed (${res.status})`)), { status: res.status });
  return data as T;
}
const post = <T,>(path: string, body: unknown, method = 'POST') => api<T>(path, { method, body: JSON.stringify(body) });

// Shrinks a phone photo before upload so the site stays fast.
async function shrink(file: File, max = 1600): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bmp.width * scale); canvas.height = Math.round(bmp.height * scale);
  canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) => canvas.toBlob(b => (b ? resolve(b) : reject(new Error('Could not read this image.'))), 'image/webp', 0.86));
}
async function upload(file: File) {
  const blob = await shrink(file);
  const { url } = await api<{ url: string }>('/images', { method: 'POST', body: blob, headers: { 'Content-Type': blob.type || 'image/webp' } });
  return url;
}

type Draft = {
  rowId?: string; ref?: string; name: string; price: string; category: string; description: string;
  material: string; dimensions: string; care: string; sizes: string; badge: string; featured: boolean; visible: boolean;
  image: string; gallery: string[];
};
const emptyDraft: Draft = { name: '', price: '', category: 'apparel', description: '', material: '', dimensions: '', care: '', sizes: '', badge: '', featured: false, visible: true, image: '', gallery: [] };

function toDraft(r?: RemoteRow, ref?: string, fb?: Partial<Draft>): Draft {
  return {
    rowId: r?.id, ref: ref ?? r?.ref ?? undefined,
    name: r?.name ?? fb?.name ?? '', price: String(r?.price ?? fb?.price ?? ''), category: r?.category ?? fb?.category ?? 'apparel',
    description: r?.description ?? fb?.description ?? '', material: r?.material ?? fb?.material ?? '', dimensions: r?.dimensions ?? fb?.dimensions ?? '', care: r?.care ?? fb?.care ?? '',
    sizes: (r?.sizes ?? []).join(', '), badge: r?.badge ?? fb?.badge ?? '', featured: r?.featured ?? fb?.featured ?? false, visible: r?.visible ?? true,
    image: r?.image_url ?? fb?.image ?? '', gallery: r?.gallery?.length ? r.gallery : fb?.gallery ?? [],
  };
}

function SignIn({ onDone, offline }: { onDone: () => void; offline: string }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(offline);
  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setErr('');
    try { await post('/login', { email, password }); onDone(); } catch (x) { setErr((x as Error).message); } finally { setBusy(false); }
  }
  return <section className="admin section-wrap"><form className="admin-card admin-signin" onSubmit={submit}>
    <p className="eyebrow">Artios Fashion House</p>
    <h1>Staff sign in</h1>
    <p>Sign in to add products, change photos and prices, and see orders.</p>
    <label>Email<input type="email" required value={email} onChange={e => setEmail(e.target.value)} autoComplete="username" /></label>
    <label>Password<input type="password" required value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" /></label>
    <button className="solid-button" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
    {err && <p className="admin-error">{err}</p>}
  </form></section>;
}

function Editor({ draft, onClose, onSaved }: { draft: Draft; onClose: () => void; onSaved: () => Promise<void> }) {
  const [d, setD] = useState<Draft>(draft);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const builtIn = Boolean(d.ref);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD(prev => ({ ...prev, [k]: v }));
  const run = async (fn: () => Promise<void>) => { setBusy(true); setErr(''); try { await fn(); } catch (e) { setErr((e as Error).message); } finally { setBusy(false); } };

  const pickMain = (files: FileList | null) => files?.[0] && run(async () => set('image', await upload(files[0])));
  const pickExtra = (files: FileList | null) => files?.length && run(async () => { const urls = await Promise.all([...files].slice(0, 6).map(upload)); setD(p => ({ ...p, gallery: [...p.gallery, ...urls] })); });

  function save(e: FormEvent) {
    e.preventDefault();
    const price = Number(String(d.price).replace(/[^0-9]/g, ''));
    if (!d.name.trim() || !price) { setErr('Please add a name and a price.'); return; }
    if (!builtIn && !d.image) { setErr('Please upload a main photo.'); return; }
    const body = { ref: d.ref, name: d.name, price, category: d.category, description: d.description, material: d.material, dimensions: d.dimensions, care: d.care, sizes: d.sizes.split(',').map(s => s.trim()).filter(Boolean), badge: d.badge, featured: d.featured, visible: d.visible, image_url: d.image, gallery: d.gallery };
    void run(async () => {
      if (d.rowId && !builtIn) await post(`/products/${d.rowId}`, body, 'PUT'); else await post('/products', body);
      await onSaved(); onClose();
    });
  }
  function remove() {
    if (!d.rowId || !window.confirm(builtIn ? 'Restore this product to its original details?' : 'Delete this product from the website?')) return;
    void run(async () => { await api(`/products/${d.rowId}`, { method: 'DELETE' }); await onSaved(); onClose(); });
  }

  return <div className="modal-scrim" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
    <form className="modal-panel admin-editor" onSubmit={save}>
      <div className="modal-head"><h2>{d.rowId || builtIn ? 'Edit product' : 'New product'}</h2><button type="button" className="icon-button" onClick={onClose} aria-label="Close"><X size={20} /></button></div>
      <div className="admin-photos">
        <label className="admin-drop">{d.image ? <img src={d.image} alt="" /> : <span><ImagePlus size={26} strokeWidth={1.2} />{builtIn ? 'Live preview' : 'Main photo'}</span>}<input type="file" accept="image/*" onChange={e => pickMain(e.target.files)} /></label>
        <div className="admin-gallery">
          {d.gallery.map(src => <div key={src}><img src={src} alt="" /><button type="button" onClick={() => set('gallery', d.gallery.filter(g => g !== src))} aria-label="Remove photo"><X size={14} /></button></div>)}
          <label className="admin-add"><Plus size={18} />More photos<input type="file" accept="image/*" multiple onChange={e => pickExtra(e.target.files)} /></label>
        </div>
      </div>
      <p className="admin-tip">Tap a box to upload. Photos on a plain light background look best next to the other products.</p>
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

function Products() {
  const { rows, refresh } = useCatalog();
  const [draft, setDraft] = useState<Draft | null>(null);
  const list = useMemo(() => {
    const builtIns = base.map(p => {
      const r = rows.find(x => x.ref === p.id);
      return { key: p.id, ref: p.id, row: r, name: r?.name || p.name, price: r?.price ?? p.price, image: r?.image_url || p.image || '', visible: r?.visible !== false, builtIn: true,
        draft: toDraft(r, p.id, { name: p.name, price: String(p.price), category: p.category, description: p.description, material: p.details.material, dimensions: p.details.dimensions ?? '', care: p.details.care ?? '', image: p.image ?? '', badge: p.badge ?? '', featured: p.featured, gallery: p.gallery ?? [] }) };
    });
    const added = rows.filter(r => !r.ref).map(r => ({ key: r.id, ref: undefined, row: r, name: r.name ?? 'Untitled', price: r.price ?? 0, image: r.image_url ?? '', visible: r.visible !== false, builtIn: false, draft: toDraft(r) }));
    return [...added.reverse(), ...builtIns];
  }, [rows]);

  async function toggle(item: (typeof list)[number]) {
    try {
      if (item.row && !item.builtIn) await post(`/products/${item.row.id}/visible`, { visible: !item.visible }, 'PATCH');
      else await post(`/products/ref/${item.ref}/visible`, { visible: !item.visible });
      await refresh();
    } catch (e) { window.alert((e as Error).message); }
  }

  return <>
    <div className="admin-subhead"><p>{list.length} products. Changes show on the website straight away.</p><button className="solid-button" onClick={() => setDraft({ ...emptyDraft })}><Plus size={16} /> Add product</button></div>
    <div className="admin-list">
      {list.map(item => <article key={item.key} className={`admin-row ${item.visible ? '' : 'is-hidden'}`}>
        {item.image ? <img src={item.image} alt="" /> : <div className="admin-noimg">Live preview</div>}
        <div><strong>{item.name}</strong><span>{formatPrice(item.price)} · {item.builtIn ? 'Original' : 'Added'}{item.visible ? '' : ' · Hidden'}</span></div>
        <button className="ghost-dark" onClick={() => toggle(item)}>{item.visible ? <EyeOff size={15} /> : <Eye size={15} />}{item.visible ? 'Hide' : 'Show'}</button>
        <button className="solid-button small" onClick={() => setDraft(item.draft)}>Edit</button>
      </article>)}
    </div>
    {draft && <Editor draft={draft} onClose={() => setDraft(null)} onSaved={refresh} />}
  </>;
}

const STATUSES = [['new', 'New'], ['paid', 'Paid'], ['making', 'Making'], ['delivered', 'Delivered'], ['cancelled', 'Cancelled']] as const;
function Orders() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [filter, setFilter] = useState('open');
  const [err, setErr] = useState('');
  const load = useCallback(async () => { try { setOrders(await api<Order[]>('/orders')); setErr(''); } catch (e) { setErr((e as Error).message); } }, []);
  useEffect(() => { void load(); }, [load]);
  async function setStatus(o: Order, status: string) {
    setOrders(list => list?.map(x => (x.id === o.id ? { ...x, status } : x)) ?? null);
    try { await post(`/orders/${o.id}`, { status }, 'PATCH'); } catch (e) { setErr((e as Error).message); void load(); }
  }
  const shown = (orders ?? []).filter(o => filter === 'all' || (filter === 'open' ? !['delivered', 'cancelled'].includes(o.status) : o.status === filter));
  const wa = (phone?: string | null) => `https://wa.me/${String(phone || '').replace(/[^0-9]/g, '').replace(/^0/, '234')}`;
  return <>
    <div className="admin-subhead">
      <div className="chips">{[['open', 'Open'], ['all', 'All'], ...STATUSES].map(([id, label]) => <button key={id} className={filter === id ? 'is-active admin-chip' : 'admin-chip'} onClick={() => setFilter(id)}>{label}</button>)}</div>
      <button className="ghost-dark" onClick={load}><RefreshCw size={14} /> Refresh</button>
    </div>
    {err && <p className="admin-error">{err}</p>}
    {orders === null ? <p>Loading orders…</p> : !shown.length ? <p className="admin-empty">No orders here yet. Every order sent from checkout appears in this list.</p> :
      <div className="admin-orders">{shown.map(o => <article key={o.id} className={`admin-order status-${o.status}`}>
        <header><strong>{o.number}</strong><span>{new Date(o.created_at).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })}</span><b>{formatPrice(o.total)}</b></header>
        <ul>{o.items.map((i, n) => <li key={n}><span>{i.name} × {i.quantity}</span>{i.options?.length ? <small>{i.options.join(' · ')}</small> : null}</li>)}</ul>
        <p className="admin-cust"><strong>{o.customer.name}</strong> · {o.customer.phone}{o.customer.email ? ` · ${o.customer.email}` : ''}<br />{[o.customer.address, o.customer.city, o.customer.state].filter(Boolean).join(', ')}{o.customer.note ? <><br /><em>Note: {o.customer.note}</em></> : null}</p>
        <footer>
          <select value={o.status} onChange={e => setStatus(o, e.target.value)} aria-label="Order status">{STATUSES.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select>
          <a className="ghost-dark" href={wa(o.customer.phone)} target="_blank" rel="noopener noreferrer"><MessageCircle size={14} /> WhatsApp customer</a>
        </footer>
      </article>)}</div>}
  </>;
}

function Team({ me }: { me: Me }) {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [pw, setPw] = useState({ current: '', next: '' });
  const load = useCallback(async () => { if (me.is_owner) setStaff(await api<Staff[]>('/staff')); }, [me.is_owner]);
  useEffect(() => { void load(); }, [load]);
  const act = async (fn: () => Promise<unknown>, ok: string) => { try { await fn(); setMsg(ok); await load(); } catch (e) { setMsg((e as Error).message); } };
  return <div className="admin-team">
    {me.is_owner && <section className="admin-card">
      <h2>Staff who can sign in</h2>
      <ul className="admin-staff">{staff.map(s => <li key={s.email}><span>{s.email}{s.is_owner ? ' (owner)' : ''}</span>{!s.is_owner && <button className="admin-danger" onClick={() => window.confirm(`Remove ${s.email}?`) && act(() => api(`/staff/${encodeURIComponent(s.email)}`, { method: 'DELETE' }), 'Removed.')}>Remove</button>}</li>)}</ul>
      <form className="admin-signin" onSubmit={e => { e.preventDefault(); void act(() => post('/staff', { email, password }), `${email} can now sign in. Send them the password privately.`).then(() => { setEmail(''); setPassword(''); }); }}>
        <label>New staff email<input type="email" required value={email} onChange={e => setEmail(e.target.value)} /></label>
        <label>Their password (8+ characters)<input type="text" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} /></label>
        <button className="solid-button">Add staff</button>
      </form>
    </section>}
    <section className="admin-card">
      <h2>Change your password</h2>
      <form className="admin-signin" onSubmit={e => { e.preventDefault(); void act(() => post('/password', pw), 'Password changed.').then(() => setPw({ current: '', next: '' })); }}>
        <label>Current password<input type="password" required value={pw.current} onChange={e => setPw({ ...pw, current: e.target.value })} autoComplete="current-password" /></label>
        <label>New password<input type="password" required minLength={8} value={pw.next} onChange={e => setPw({ ...pw, next: e.target.value })} autoComplete="new-password" /></label>
        <button className="solid-button">Change password</button>
      </form>
    </section>
    {msg && <p className="admin-msg">{msg}</p>}
  </div>;
}

export default function Admin() {
  const [me, setMe] = useState<Me | null | undefined>(undefined);
  const [offline, setOffline] = useState('');
  const [tab, setTab] = useState<'products' | 'orders' | 'team'>('orders');
  const check = useCallback(async () => {
    try { setMe(await api<Me>('/me')); } catch (e) {
      const status = (e as { status?: number }).status;
      setOffline(status === 401 ? '' : (e as Error).message);
      setMe(null);
    }
  }, []);
  useEffect(() => { void check(); }, [check]);
  useEffect(() => { document.title = 'Admin · Artios Fashion House'; return () => { document.title = 'Artios Fashion House'; }; }, []);

  if (me === undefined) return <section className="admin section-wrap"><p>Loading…</p></section>;
  if (!me) return <SignIn onDone={check} offline={offline} />;
  return <section className="admin section-wrap">
    <div className="admin-head">
      <div><p className="eyebrow">Artios admin · {me.email}</p><h1>{tab === 'orders' ? 'Orders' : tab === 'products' ? 'Products' : 'Account'}</h1></div>
      <button className="ghost-dark" onClick={async () => { await post('/logout', {}); setMe(null); }}><LogOut size={15} /> Sign out</button>
    </div>
    <div className="segmented admin-tabs">{(['orders', 'products', 'team'] as const).map(t => <button key={t} className={tab === t ? 'is-active' : ''} onClick={() => setTab(t)}>{t === 'team' ? (me.is_owner ? 'Staff & account' : 'Account') : t[0].toUpperCase() + t.slice(1)}</button>)}</div>
    {tab === 'orders' ? <Orders /> : tab === 'products' ? <Products /> : <Team me={me} />}
  </section>;
}
