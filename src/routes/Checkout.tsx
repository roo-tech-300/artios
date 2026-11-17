import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import Eyebrow from '../components/Eyebrow';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../lib/format';

const storeEmail = 'matkaltungo@gmail.com';

export default function Checkout() {
  const { items, subtotal } = useCart();
  const [order, setOrder] = useState('');
  const [receiptName, setReceiptName] = useState('');

  function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const orderNumber = `AF-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const values = new FormData(form);
    const orderLines = items.map(({ product, quantity }) => `${product.name} × ${quantity} — ${formatPrice(product.price * quantity)}`).join('\n');
    const subject = encodeURIComponent(`Payment receipt for order ${orderNumber}`);
    const body = encodeURIComponent([
      `Order: ${orderNumber}`,
      `Name: ${values.get('name')}`,
      `Email: ${values.get('email')}`,
      `Phone: ${values.get('phone')}`,
      '',
      'Items:',
      orderLines,
      `Total transferred: ${formatPrice(subtotal())}`,
      `Receipt to attach: ${receiptName}`,
      '',
      'I have made the bank transfer. My receipt is attached for verification.',
    ].join('\n'));
    window.location.href = `mailto:${storeEmail}?subject=${subject}&body=${body}`;
    setOrder(orderNumber);
  }

  if (order) return <section className="confirmation section-wrap"><Eyebrow>Artios Fashion House</Eyebrow><h1>Order received.</h1><p className="order-number">Reference {order}</p><p>Your email draft is ready. Attach your transfer receipt and send it to complete your order.</p><p>We’ll confirm your payment after reviewing it.</p><div className="checkout-contact-links"><a className="text-link" href={`mailto:${storeEmail}`}>Email the store <span>↗</span></a><a className="text-link" href="tel:+2348030406062">Call +234 803 040 6062 <span>↗</span></a></div></section>;

  return <section className="checkout-page section-wrap"><div className="page-heading"><Eyebrow>Artios Fashion House</Eyebrow><h1>Checkout</h1></div>{items.length ? <form className="checkout-layout" onSubmit={submitOrder}><div className="checkout-fields"><section><h2>Contact details</h2><div className="form-grid"><label className="span-two">Full name<input name="name" required autoComplete="name" /></label><label className="span-two">Email address<input name="email" type="email" required autoComplete="email" /></label><label className="span-two">Phone number<input name="phone" type="tel" required autoComplete="tel" /></label></div></section><section><h2>Pay by bank transfer</h2><p className="secure-note">Transfer the order total, then add your transfer receipt below. We’ll review the payment manually before confirming your order.</p><div className="transfer-card"><div><span>Account name</span><strong>Artios Fashion House</strong></div><div><span>Account number</span><strong>6578266670</strong></div><div><span>Bank</span><strong>Moniepoint MFB</strong></div><div className="transfer-total"><span>Amount to transfer</span><strong>{formatPrice(subtotal())}</strong></div></div></section><section><h2>Payment receipt</h2><p className="receipt-note">Choose an image or PDF of your transfer receipt. Your email app will open with the order details; attach the receipt there and send it to complete your order.</p><label className="receipt-file">Upload receipt<input type="file" name="receipt" required accept="image/*,.pdf,application/pdf" onChange={event => setReceiptName(event.currentTarget.files?.[0]?.name ?? '')} /></label>{receiptName && <p className="receipt-selected">Selected: {receiptName}</p>}<p className="receipt-contact">Need help? <a href={`mailto:${storeEmail}`}>{storeEmail}</a> · <a href="tel:+2348030406062">+234 803 040 6062</a></p></section><button type="submit" className="outline-button place-order">Continue to email</button></div><aside className="order-summary"><h2>Your items</h2>{items.map(({ product, quantity }) => <div key={product.id} className="order-line"><img src={product.images[0]} alt="" /><div><span>{product.name}</span><small>Quantity {quantity}</small></div><span>{formatPrice(product.price * quantity)}</span></div>)}<div className="subtotal"><span>Total</span><strong>{formatPrice(subtotal())}</strong></div></aside></form> : <div className="empty-bag page-empty"><p>Your bag is empty.</p><Link to="/collections/all" className="text-link">Shop all <span>↗</span></Link></div>}</section>;
}
