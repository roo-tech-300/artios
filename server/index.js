// Artios web server: serves the built site and a small API for the admin (products, photos, orders, staff).
// Data lives in the Railway Postgres database (DATABASE_URL). Without a database the site still runs;
// only the admin features are unavailable.
import express from 'express';
import pg from 'pg';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, '..', 'dist');
const PORT = Number(process.env.PORT) || 3000;
const SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
const SESSION_DAYS = 14;

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', true);

// ---------- database ----------
const pool = process.env.DATABASE_URL
  ? new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: /railway\.internal|localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL) ? false : { rejectUnauthorized: false }, max: 5 })
  : null;
let dbReady = false;

async function migrate() {
  if (!pool) { console.log('No DATABASE_URL: admin features disabled, site still served.'); return; }
  await pool.query(`
    create table if not exists admins (
      email text primary key, password_hash text not null, is_owner boolean default false, created_at timestamptz default now());
    create table if not exists products (
      id uuid primary key, ref text unique, name text, price integer, category text, description text,
      image_url text, gallery text[], sizes text[], material text, dimensions text, care text, badge text,
      featured boolean default false, visible boolean default true, sort integer default 100, created_at timestamptz default now());
    create table if not exists images (
      id uuid primary key, content_type text not null, data bytea not null, created_at timestamptz default now());
    create table if not exists orders (
      id uuid primary key, number text not null, customer jsonb not null, items jsonb not null, total integer not null,
      status text not null default 'new', created_at timestamptz default now());
  `);
  const owner = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const pass = process.env.ADMIN_PASSWORD || '';
  if (owner && pass) {
    const { rowCount } = await pool.query('select 1 from admins where email = $1', [owner]);
    if (!rowCount) await pool.query('insert into admins (email, password_hash, is_owner) values ($1, $2, true)', [owner, hashPassword(pass)]);
  }
  dbReady = true;
  console.log('Database ready.');
}

// ---------- auth helpers ----------
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}
function checkPassword(password, stored) {
  const [salt, hash] = String(stored).split(':');
  if (!salt || !hash) return false;
  const test = crypto.scryptSync(password, salt, 64);
  const real = Buffer.from(hash, 'hex');
  return real.length === test.length && crypto.timingSafeEqual(real, test);
}
const sign = data => crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
function makeToken(email) {
  const payload = Buffer.from(JSON.stringify({ email, exp: Date.now() + SESSION_DAYS * 864e5 })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}
function readToken(token) {
  const [payload, mac] = String(token || '').split('.');
  if (!payload || !mac) return null;
  const expected = sign(payload);
  if (expected.length !== mac.length || !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(mac))) return null;
  try { const data = JSON.parse(Buffer.from(payload, 'base64url').toString()); return data.exp > Date.now() ? data : null; } catch { return null; }
}
function cookie(req, name) {
  const found = (req.headers.cookie || '').split(';').map(s => s.trim()).find(s => s.startsWith(name + '='));
  return found ? decodeURIComponent(found.slice(name.length + 1)) : null;
}
function setSession(res, value, maxAge) {
  res.setHeader('Set-Cookie', `artios_admin=${value}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=${maxAge}`);
}

// Simple in-memory rate limiter (per IP and key).
const hits = new Map();
function limited(key, max, windowMs, record = true) {
  const now = Date.now();
  const list = (hits.get(key) || []).filter(t => now - t < windowMs);
  if (record) list.push(now);
  hits.set(key, list);
  if (hits.size > 5000) hits.clear();
  return list.length > max;
}
const noteFailure = key => limited(key, Infinity, 15 * 60e3);

const needDb = (req, res, next) => (dbReady ? next() : res.status(503).json({ error: 'The admin database is not connected yet.' }));
async function needAdmin(req, res, next) {
  const session = readToken(cookie(req, 'artios_admin'));
  if (!session) return res.status(401).json({ error: 'Please sign in.' });
  const { rows } = await pool.query('select email, is_owner from admins where email = $1', [session.email]);
  if (!rows.length) return res.status(401).json({ error: 'This account no longer has access.' });
  req.admin = rows[0];
  next();
}
const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const str = (v, max = 2000) => (typeof v === 'string' ? v.trim().slice(0, max) : null) || null;
const strList = (v, max = 30) => (Array.isArray(v) ? v.filter(x => typeof x === 'string' && x.trim()).slice(0, max).map(x => x.trim().slice(0, 500)) : []);

// ---------- API ----------
const api = express.Router();
api.use(express.json({ limit: '200kb' }));

api.get('/health', (_req, res) => res.json({ ok: true, db: dbReady }));

api.get('/products', wrap(async (_req, res) => {
  if (!dbReady) return res.json([]);
  const { rows } = await pool.query('select * from products order by sort asc, created_at asc');
  res.set('Cache-Control', 'public, max-age=30').json(rows);
}));

api.get('/images/:id', wrap(async (req, res) => {
  if (!dbReady || !/^[0-9a-f-]{36}$/.test(req.params.id)) return res.status(404).end();
  const { rows } = await pool.query('select content_type, data from images where id = $1', [req.params.id]);
  if (!rows.length) return res.status(404).end();
  res.set('Content-Type', rows[0].content_type).set('Cache-Control', 'public, max-age=31536000, immutable').send(rows[0].data);
}));

// Orders come from checkout, before WhatsApp opens.
api.post('/orders', needDb, wrap(async (req, res) => {
  if (limited(`order:${req.ip}`, 10, 60 * 60e3)) return res.status(429).json({ error: 'Too many orders, please try again later.' });
  const b = req.body || {};
  const number = str(b.number, 40);
  const items = Array.isArray(b.items) ? b.items.slice(0, 50).map(i => ({ name: str(i?.name, 200), quantity: Math.max(1, Math.min(999, Number(i?.quantity) || 1)), price: Math.max(0, Number(i?.price) || 0), options: strList(i?.options, 12) })) : [];
  const c = b.customer || {};
  const customer = { name: str(c.name, 200), phone: str(c.phone, 60), email: str(c.email, 200), address: str(c.address, 400), city: str(c.city, 120), state: str(c.state, 120), note: str(c.note, 600) };
  if (!number || !items.length || !customer.name || !customer.phone) return res.status(400).json({ error: 'Incomplete order.' });
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  await pool.query('insert into orders (id, number, customer, items, total) values ($1, $2, $3, $4, $5)', [crypto.randomUUID(), number, customer, JSON.stringify(items), total]);
  res.status(201).json({ ok: true });
}));

// Sign in / out
api.post('/login', needDb, wrap(async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  // Only wrong passwords count towards the limit: 10 per 15 minutes per connection.
  if (limited(`login:${req.ip}`, 10, 15 * 60e3, false)) return res.status(429).json({ error: 'Too many wrong attempts. Try again in 15 minutes.' });
  const { rows } = await pool.query('select email, password_hash from admins where email = $1', [email]);
  if (!rows.length || !checkPassword(password, rows[0].password_hash)) { noteFailure(`login:${req.ip}`); return res.status(401).json({ error: 'Wrong email or password.' }); }
  setSession(res, makeToken(email), SESSION_DAYS * 86400);
  res.json({ ok: true });
}));
api.post('/logout', (_req, res) => { setSession(res, '', 0); res.json({ ok: true }); });
api.get('/me', needDb, wrap(needAdmin), (req, res) => res.json(req.admin));

// Products (admin)
const productFields = b => ({
  name: str(b.name, 200), price: Number.isFinite(Number(b.price)) && b.price !== null && b.price !== '' ? Math.round(Number(b.price)) : null,
  category: str(b.category, 60)?.toLowerCase() ?? null, description: str(b.description, 3000), image_url: str(b.image_url, 500),
  gallery: strList(b.gallery, 12), sizes: strList(b.sizes, 20), material: str(b.material, 300), dimensions: str(b.dimensions, 300),
  care: str(b.care, 300), badge: str(b.badge, 40), featured: Boolean(b.featured), visible: b.visible !== false,
});
const cols = ['name', 'price', 'category', 'description', 'image_url', 'gallery', 'sizes', 'material', 'dimensions', 'care', 'badge', 'featured', 'visible'];

api.post('/products', needDb, wrap(needAdmin), wrap(async (req, res) => {
  const f = productFields(req.body || {});
  const ref = str(req.body?.ref, 40);
  if (!ref && (!f.name || !f.price || !f.image_url)) return res.status(400).json({ error: 'Name, price and a photo are required.' });
  const values = cols.map(c => f[c]);
  if (ref) {
    const { rows } = await pool.query(`insert into products (id, ref, ${cols.join(', ')}) values ($1, $2, ${cols.map((_, i) => `$${i + 3}`).join(', ')})
      on conflict (ref) do update set ${cols.map(c => `${c} = excluded.${c}`).join(', ')} returning *`, [crypto.randomUUID(), ref, ...values]);
    return res.json(rows[0]);
  }
  const { rows } = await pool.query(`insert into products (id, ${cols.join(', ')}) values ($1, ${cols.map((_, i) => `$${i + 2}`).join(', ')}) returning *`, [crypto.randomUUID(), ...values]);
  res.status(201).json(rows[0]);
}));
api.put('/products/:id', needDb, wrap(needAdmin), wrap(async (req, res) => {
  const f = productFields(req.body || {});
  const { rows } = await pool.query(`update products set ${cols.map((c, i) => `${c} = $${i + 2}`).join(', ')} where id = $1 returning *`, [req.params.id, ...cols.map(c => f[c])]);
  rows.length ? res.json(rows[0]) : res.status(404).json({ error: 'Not found.' });
}));
api.patch('/products/:id/visible', needDb, wrap(needAdmin), wrap(async (req, res) => {
  await pool.query('update products set visible = $2 where id = $1', [req.params.id, Boolean(req.body?.visible)]);
  res.json({ ok: true });
}));
api.post('/products/ref/:ref/visible', needDb, wrap(needAdmin), wrap(async (req, res) => {
  await pool.query('insert into products (id, ref, visible) values ($1, $2, $3) on conflict (ref) do update set visible = excluded.visible', [crypto.randomUUID(), req.params.ref.slice(0, 40), Boolean(req.body?.visible)]);
  res.json({ ok: true });
}));
api.delete('/products/:id', needDb, wrap(needAdmin), wrap(async (req, res) => {
  await pool.query('delete from products where id = $1', [req.params.id]);
  res.json({ ok: true });
}));

// Photo upload (raw image body, already resized in the browser)
api.post('/images', needDb, wrap(needAdmin), express.raw({ type: ['image/*'], limit: '6mb' }), wrap(async (req, res) => {
  const type = String(req.headers['content-type'] || '').split(';')[0];
  if (!/^image\/(webp|jpeg|png)$/.test(type) || !Buffer.isBuffer(req.body) || !req.body.length) return res.status(400).json({ error: 'Please upload a JPG, PNG or WebP image.' });
  const id = crypto.randomUUID();
  await pool.query('insert into images (id, content_type, data) values ($1, $2, $3)', [id, type, req.body]);
  res.status(201).json({ url: `/api/images/${id}` });
}));

// Orders (admin)
api.get('/orders', needDb, wrap(needAdmin), wrap(async (req, res) => {
  const { rows } = await pool.query('select * from orders order by created_at desc limit 300');
  res.json(rows);
}));
api.patch('/orders/:id', needDb, wrap(needAdmin), wrap(async (req, res) => {
  const status = String(req.body?.status || '');
  if (!['new', 'paid', 'making', 'delivered', 'cancelled'].includes(status)) return res.status(400).json({ error: 'Unknown status.' });
  await pool.query('update orders set status = $2 where id = $1', [req.params.id, status]);
  res.json({ ok: true });
}));

// Staff (owner only)
const ownerOnly = (req, res, next) => (req.admin?.is_owner ? next() : res.status(403).json({ error: 'Only the owner can manage staff.' }));
api.get('/staff', needDb, wrap(needAdmin), ownerOnly, wrap(async (_req, res) => {
  const { rows } = await pool.query('select email, is_owner, created_at from admins order by created_at');
  res.json(rows);
}));
api.post('/staff', needDb, wrap(needAdmin), ownerOnly, wrap(async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || password.length < 8) return res.status(400).json({ error: 'Enter a valid email and a password of at least 8 characters.' });
  await pool.query('insert into admins (email, password_hash) values ($1, $2) on conflict (email) do update set password_hash = excluded.password_hash', [email, hashPassword(password)]);
  res.status(201).json({ ok: true });
}));
api.delete('/staff/:email', needDb, wrap(needAdmin), ownerOnly, wrap(async (req, res) => {
  await pool.query('delete from admins where email = $1 and is_owner = false', [req.params.email.toLowerCase()]);
  res.json({ ok: true });
}));
api.post('/password', needDb, wrap(needAdmin), wrap(async (req, res) => {
  const { current, next: nextPassword } = req.body || {};
  const { rows } = await pool.query('select password_hash from admins where email = $1', [req.admin.email]);
  if (!checkPassword(String(current || ''), rows[0].password_hash)) return res.status(400).json({ error: 'Your current password is wrong.' });
  if (String(nextPassword || '').length < 8) return res.status(400).json({ error: 'Use at least 8 characters.' });
  await pool.query('update admins set password_hash = $2 where email = $1', [req.admin.email, hashPassword(String(nextPassword))]);
  res.json({ ok: true });
}));

api.use((_req, res) => res.status(404).json({ error: 'Not found.' }));
api.use((err, _req, res, _next) => { console.error(err); res.status(500).json({ error: 'Something went wrong. Please try again.' }); });
app.use('/api', api);

// ---------- static site ----------
app.use('/assets', express.static(path.join(DIST, 'assets'), { immutable: true, maxAge: '1y', fallthrough: true }));
app.use(express.static(DIST, { index: false, maxAge: '1h' }));
app.get('*', (_req, res) => res.set('Cache-Control', 'no-cache').sendFile(path.join(DIST, 'index.html')));

migrate().catch(err => console.error('Database setup failed; admin features disabled.', err.message))
  .finally(() => app.listen(PORT, () => console.log(`Artios server on port ${PORT}`)));
