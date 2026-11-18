import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Eyebrow from '../components/Eyebrow';
import ImageReveal from '../components/ImageReveal';
import ProductTile from '../components/ProductTile';
import products from '../data/products';
import { formatPrice } from '../lib/format';
import { useCart } from '../context/CartContext';

export default function ProductPage() {
  const { slug } = useParams();
  const product = products.find(item => item.slug === slug);
  const [image, setImage] = useState(0);
  const [size, setSize] = useState<string>();
  const [sizeError, setSizeError] = useState(false);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  // Reset choices when moving between products via "You may also like".
  useEffect(() => { setImage(0); setSize(undefined); setSizeError(false); setAdded(false); }, [slug]);
  useEffect(() => { if (!added) return; const t = window.setTimeout(() => setAdded(false), 2200); return () => window.clearTimeout(t); }, [added]);

  if (!product) return <div className="not-found"><p>This item could not be found.</p><Link to="/collections/all">Shop all</Link></div>;
  const related = products.filter(item => item.id !== product.id).slice(0, 3);

  function add() {
    if (!product) return;
    if (product.sizes?.length && !size) { setSizeError(true); return; }
    addItem(product, size);
    setAdded(true);
  }

  return <>
    <div className="breadcrumbs"><Link to="/">Home</Link><span>/</span><Link to="/collections/all">Shop all</Link><span>/</span><span>{product.name}</span></div>
    <section className="product-detail section-wrap">
      <div className="product-gallery">
        <ImageReveal className="product-main-image" src={product.images[image] ?? product.images[0]} alt={product.name} />
        {product.images.length > 1 && <div className="thumbnail-row">{product.images.map((src, index) => <button key={`${src}-${index}`} className={image === index ? 'thumb active' : 'thumb'} onClick={() => setImage(index)} aria-label={`View image ${index + 1}`}><img src={src} alt="" /></button>)}</div>}
      </div>
      <div className="product-info">
        <Eyebrow>Artios Fashion House</Eyebrow>
        <h1>{product.name}</h1>
        <p className="product-price">{formatPrice(product.price)}</p>
        <p className="product-description">{product.description}</p>
        {product.sizes?.length ? <fieldset className="size-picker">
          <legend>Size{size ? `: ${size}` : ''}</legend>
          <div>{product.sizes.map(option => <button type="button" key={option} className={size === option ? 'is-active' : ''} aria-pressed={size === option} onClick={() => { setSize(option); setSizeError(false); }}>{option}</button>)}</div>
          {sizeError && <p className="size-error" role="alert">Please choose a size.</p>}
        </fieldset> : null}
        <div className="details-block"><h2>Details</h2><dl>{Object.entries(product.details).map(([key, value]) => value && <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl></div>
        <button className="outline-button add-button" onClick={add}>{added ? 'Added to your bag' : 'Add to Bag'}</button>
        <p className="product-note">Delivery across Nigeria. A personal note comes with every order.</p>
      </div>
    </section>
    <section className="related-section section-wrap">
      <div className="section-heading"><div><Eyebrow>More to explore</Eyebrow><h2>You may also like</h2></div><Link to="/collections/all" className="text-link">Shop all <span>↗</span></Link></div>
      <div className="product-grid">{related.map(item => <ProductTile key={item.id} product={item} />)}</div>
    </section>
  </>;
}
