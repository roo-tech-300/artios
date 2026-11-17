import Eyebrow from '../components/Eyebrow';
import ProductTile from '../components/ProductTile';
import products from '../data/products';
export default function Collection() { const list = products; return <><section className="collection-hero shop-hero"><div><Eyebrow>Artios Fashion House</Eyebrow><h1>Shop all</h1></div></section><section className="collection-products section-wrap"><div className="collection-intro"><p>Explore everything available from Artios.</p><span>{String(list.length).padStart(2, '0')} pieces</span></div><div className="product-grid collection-grid">{list.map(product => <ProductTile key={product.id} product={product} />)}</div></section></>; }
