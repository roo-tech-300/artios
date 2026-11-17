export type Product = {
  id: string;
  slug: string;
  name: string;
  category: 'rings' | 'necklaces' | 'bracelets' | 'watches' | 'accessories';
  price: number;
  currency: 'NGN';
  description: string;
  details: { material: string; dimensions: string; origin: string; stones?: string };
  images: string[];
  featured: boolean;
};

const products: Product[] = [
  { id: 'a1', slug: 'artios-hoodie', name: 'Artios Hoodie', category: 'accessories', price: 11000, currency: 'NGN', description: 'A relaxed everyday layer, thoughtfully made for comfort and easy movement.', details: { material: 'Soft cotton blend', dimensions: 'Available in multiple sizes', origin: 'Artios Fashion House' }, images: ['/assets/hoodie1.png'], featured: true },
  { id: 'a2', slug: 'artios-totebag', name: 'Totebag', category: 'accessories', price: 7000, currency: 'NGN', description: 'A versatile carryall with room for the things that go wherever you do.', details: { material: 'Durable woven fabric', dimensions: 'Everyday carry size', origin: 'Artios Fashion House' }, images: ['/assets/Totebag.png'], featured: true },
  { id: 'a3', slug: 'artios-notepad', name: 'Notepad', category: 'accessories', price: 6500, currency: 'NGN', description: 'A considered place for new ideas, plans, and passing thoughts.', details: { material: 'Paper', dimensions: 'Journal size', origin: 'Artios Fashion House' }, images: ['/assets/journal.png'], featured: true },
  { id: 'a4', slug: 'stanley-cup', name: 'Stanley Cup', category: 'accessories', price: 20000, currency: 'NGN', description: 'A sturdy reusable cup for keeping your favourite drink close throughout the day.', details: { material: 'Reusable drinkware', dimensions: 'Everyday size', origin: 'Artios Fashion House' }, images: ['/assets/StanleyCup.png'], featured: true },
];

export default products;

