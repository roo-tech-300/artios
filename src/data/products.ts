export type Product = {
  id: string;
  slug: string;
  name: string;
  category: 'apparel' | 'bags' | 'stationery' | 'drinkware';
  price: number;
  currency: 'NGN';
  description: string;
  details: { material: string; dimensions: string; origin: string };
  sizes?: string[];
  images: string[];
  featured: boolean;
};

const products: Product[] = [
  { id: 'a1', slug: 'artios-hoodie', name: 'Artios Hoodie', category: 'apparel', price: 11000, currency: 'NGN', description: 'A relaxed everyday layer, thoughtfully made for comfort and easy movement.', details: { material: 'Soft cotton blend', dimensions: 'Sizes S – XXL', origin: 'Artios Fashion House' }, sizes: ['S', 'M', 'L', 'XL', 'XXL'], images: ['/assets/hoodie1.webp'], featured: true },
  { id: 'a2', slug: 'artios-totebag', name: 'Totebag', category: 'bags', price: 7000, currency: 'NGN', description: 'A versatile carryall with room for the things that go wherever you do.', details: { material: 'Durable woven fabric', dimensions: 'Everyday carry size', origin: 'Artios Fashion House' }, images: ['/assets/Totebag.webp'], featured: true },
  { id: 'a3', slug: 'artios-notepad', name: 'Notepad', category: 'stationery', price: 6500, currency: 'NGN', description: 'A considered place for new ideas, plans, and passing thoughts.', details: { material: 'Paper', dimensions: 'Journal size', origin: 'Artios Fashion House' }, images: ['/assets/journal.webp'], featured: true },
  { id: 'a4', slug: 'thermo-flask', name: 'Thermo Flask', category: 'drinkware', price: 20000, currency: 'NGN', description: 'An insulated tumbler with handle and straw that keeps your drink hot or cold throughout the day.', details: { material: 'Stainless steel, insulated', dimensions: 'Large, with handle and straw', origin: 'Artios Fashion House' }, images: ['/assets/thermo-flask.webp'], featured: true },
  { id: 'a5', slug: 'matte-flask', name: 'Matte Flask', category: 'drinkware', price: 11000, currency: 'NGN', description: 'A slim, screw-top bottle that slips into any bag and keeps your drink just right.', details: { material: 'Stainless steel, insulated', dimensions: 'Slim bottle', origin: 'Artios Fashion House' }, images: ['/assets/matte-flask.webp'], featured: false },
  { id: 'a6', slug: 'artios-mug', name: 'Mug', category: 'drinkware', price: 5000, currency: 'NGN', description: 'A classic ceramic mug for slow mornings, desk coffee and evening tea.', details: { material: 'Ceramic', dimensions: 'Standard mug', origin: 'Artios Fashion House' }, images: ['/assets/mug.webp'], featured: false },
];

export default products;
