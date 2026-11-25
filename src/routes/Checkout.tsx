import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import Eyebrow from '../components/Eyebrow';
import { describeOptions, useCart } from '../context/CartContext';
import ProductMedia from '../components/ProductMedia';
import { formatPrice } from '../lib/format';
import { store, whatsappLink } from '../config';

type PlacedOrder = { number: string; total: number; link: string; message: string };

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const [order, setOrder] = useState<PlacedOrder | null>(null);

  function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const values = new FormData(form);
    const field = (name: string) => String(values.get(name) ?? '').trim();
    const number = `AF-${Date.now().toString(36).slice(-4).toUpperCase()}${Math.random().toString(36).slice(2, 4).toUpperCase()}`;
    const total = subtotal();
    const lines = items.flatMap(({ product, quantity, options }) => { const opts = describeOptions(options); return [`• ${product.name} × ${quantity} — ${formatPrice(product.price * quantity)}`, ...(opts.length ? [`   ${opts.join(" · ")}`] : [])]; });
    const note = field('note');
    const message = [
      `Hello Artios, I'd like to place an order.`,
      '',
      `*Order ${number}*`,
      ...lines,
      `*Total: ${formatPrice(total)}*`,
      '',
      `Name: ${field('name')}`,
      `Phone: ${field('phone')}`,
      field('email') ? `Email: ${field('email')}` : null,
      `Delivery address: ${field('address')}, ${field('city')}, ${field('state')}`,
      note ? `Note: ${note}` : null,
      '',
      `I have paid ${formatPrice(total)} by bank transfer to ${store.bank.bankName} ${store.bank.accountNumber}. I'm sending my receipt in this chat.`,
    ].filter(line => line !== null).join('\n');
    const link = whatsappLink(message);
    // Keep a copy of the order in the admin. Never blocks the WhatsApp step.
    try {
      void fetch('/api/orders', { method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
        number,
        items: items.map(({ product, quantity, options }) => ({ name: product.name, quantity, price: product.price, options: describeOptions(options) })),
        customer: { name: field('name'), phone: field('phone'), email: field('email'), address: field('address'), city: field('city'), state: field('state'), note },
      }) }).catch(() => {});
    } catch { /* ignore */ }
    window.open(link, '_blank', 'noopener');
    setOrder({ number, total, link, message });
    clearCart();
    window.scrollTo(0, 0);
  }

  if (order) return <section className="confirmation section-wrap">
    <Eyebrow>Artios Fashion House</Eyebrow>
    <h1>Almost done.</h1>
    <p className="order-number">Reference {order.number} · {formatPrice(order.total)}</p>
    <p>WhatsApp should have opened with your order details. Send the message and attach a screenshot of your transfer receipt in the same chat.</p>
    <p>We’ll confirm your payment and arrange delivery with you there.</p>
    <a className="outline-button whatsapp-button" href={order.link} target="_blank" rel="noopener noreferrer">WhatsApp didn’t open? Tap here</a>
    <div className="checkout-contact-links">
      <a className="text-link" href={store.phoneHref}>Call {store.phoneDisplay} <span>↗</span></a>
      <a className="text-link" href={`mailto:${store.email}?subject=${encodeURIComponent(`Order ${order.number}`)}&body=${encodeURIComponent(order.message.replace(/\*/g, '').replace("in this chat", "attached to this email"))}`}>Email the order instead <span>↗</span></a>
    </div>
  </section>;

  return <section className="checkout-page section-wrap">
    <div className="page-heading"><Eyebrow>Artios Fashion House</Eyebrow><h1>Checkout</h1></div>
    {items.length ? <form className="checkout-layout" onSubmit={submitOrder}>
      <div className="checkout-fields">
        <section>
          <h2>Contact details</h2>
          <div className="form-grid">
            <label className="span-two">Full name<input name="name" required autoComplete="name" /></label>
            <label>Phone (WhatsApp)<input name="phone" type="tel" required autoComplete="tel" placeholder="0803 000 0000" /></label>
            <label>Email (optional)<input name="email" type="email" autoComplete="email" /></label>
          </div>
        </section>
        <section>
          <h2>Delivery</h2>
          <div className="form-grid">
            <label className="span-two">Street address<input name="address" required autoComplete="street-address" /></label>
            <label>City / town<input name="city" required autoComplete="address-level2" /></label>
            <label>State<input name="state" required autoComplete="address-level1" /></label>
            <label className="span-two">Note for us (optional)<input name="note" placeholder="Landmark, preferred delivery time…" /></label>
          </div>
          <p className="secure-note">Delivery fee depends on your location. We’ll confirm it with you on WhatsApp before dispatch.</p>
        </section>
        <section>
          <h2>Pay by bank transfer</h2>
          <p className="secure-note">Transfer the order total to the account below, then tap the button. WhatsApp opens with your order ready to send. Attach your transfer receipt in the chat.</p>
          <div className="transfer-card">
            <div><span>Account name</span><strong>{store.bank.accountName}</strong></div>
            <div><span>Account number</span><strong>{store.bank.accountNumber}</strong></div>
            <div><span>Bank</span><strong>{store.bank.bankName}</strong></div>
            <div className="transfer-total"><span>Amount to transfer</span><strong>{formatPrice(subtotal())}</strong></div>
          </div>
          <p className="receipt-contact">Need help? <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">Chat on WhatsApp</a> · <a href={store.phoneHref}>{store.phoneDisplay}</a></p>
        </section>
        <button type="submit" className="solid-button place-order">Send order on WhatsApp</button>
      </div>
      <aside className="order-summary">
        <h2>Your items</h2>
        {items.map(({ key, product, quantity, options }) => <div key={key} className="order-line"><ProductMedia product={product} options={options} className="line-media" /><div><span>{product.name}</span><small>{[...describeOptions(options), `Qty ${quantity}`].join(" · ")}</small></div><span>{formatPrice(product.price * quantity)}</span></div>)}
        <div className="subtotal"><span>Total</span><strong>{formatPrice(subtotal())}</strong></div>
        <p className="summary-note">Plus delivery, confirmed on WhatsApp.</p>
      </aside>
    </form> : <div className="empty-bag page-empty"><p>Your bag is empty.</p><Link to="/collections/all" className="text-link">Shop all <span>↗</span></Link></div>}
  </section>;
}
