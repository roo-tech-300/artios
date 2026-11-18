export type Swatch = { name: string; hex: string; dark: boolean };
export type Category = 'apparel' | 'bags' | 'stationery' | 'drinkware';
export type Garment = 'tee' | 'hoodie';

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: Category;
  price: number;
  currency: 'NGN';
  description: string;
  details: { material: string; fit?: string; dimensions?: string; care?: string };
  sizes?: string[];
  colors?: Swatch[];
  garment?: Garment;          // apparel that can be customised and previewed live
  photoColor?: string;        // colour shown in the real photo, if any
  image?: string;             // studio shot (uniform backdrop)
  lifestyle?: string;         // styled shot, shown on hover and in the gallery
  badge?: string;
  featured: boolean;
};

export const apparelColors: Swatch[] = [
  { name: 'Noir', hex: '#151313', dark: true },
  { name: 'Ivory', hex: '#F3EEE4', dark: false },
  { name: 'Burgundy', hex: '#4A1218', dark: true },
  { name: 'Sand', hex: '#D9C8AA', dark: false },
  { name: 'Midnight', hex: '#1B2333', dark: true },
];

export const apparelSizes = ['S', 'M', 'L', 'XL', 'XXL'];

export const categories: { id: Category | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'apparel', label: 'Apparel' },
  { id: 'drinkware', label: 'Drinkware' },
  { id: 'bags', label: 'Bags' },
  { id: 'stationery', label: 'Stationery' },
];

const products: Product[] = [
  { id: 'a7', slug: 'alatupa-tee', name: 'Alátùpà T-Shirt', category: 'apparel', price: 8000, currency: 'NGN', description: 'Our signature tee. The Artios mark and the Alátùpà lantern sit at the chest, with the catch phrase of your choice. Made to order in your colour.', details: { material: 'Soft combed cotton', fit: 'Regular, true to size', care: 'Wash inside out, cool. Do not iron the print.' }, sizes: apparelSizes, colors: apparelColors, garment: 'tee', badge: 'Make it yours', featured: true },
  { id: 'a1', slug: 'artios-hoodie', name: 'Artios Hoodie', category: 'apparel', price: 11000, currency: 'NGN', description: 'A relaxed everyday layer in a soft brushed fleece, finished with the Artios mark. Choose your colour, phrase and placement.', details: { material: 'Soft cotton-blend fleece', fit: 'Relaxed, size down for a closer fit', care: 'Wash inside out, cool. Do not iron the print.' }, sizes: apparelSizes, colors: apparelColors, garment: 'hoodie', photoColor: 'Noir', image: '/assets/studio/artios-hoodie.webp', lifestyle: '/assets/lifestyle/artios-hoodie.webp', badge: 'Bestseller', featured: true },
  { id: 'a4', slug: 'thermo-flask', name: 'Thermo Flask', category: 'drinkware', price: 20000, currency: 'NGN', description: 'An insulated tumbler with handle and straw that keeps your drink hot or cold all day.', details: { material: 'Stainless steel, double-wall insulated', dimensions: 'Large, with handle and straw', care: 'Hand wash' }, image: '/assets/studio/thermo-flask.webp', lifestyle: '/assets/lifestyle/thermo-flask.webp', featured: true },
  { id: 'a2', slug: 'artios-totebag', name: 'Tote Bag', category: 'bags', price: 7000, currency: 'NGN', description: 'A roomy everyday carryall with the Alátùpà lantern, for the things that go wherever you do.', details: { material: 'Durable woven canvas', dimensions: 'Everyday carry size', care: 'Spot clean' }, image: '/assets/studio/artios-totebag.webp', lifestyle: '/assets/lifestyle/artios-totebag.webp', featured: true },
  { id: 'a5', slug: 'matte-flask', name: 'Matte Flask', category: 'drinkware', price: 11000, currency: 'NGN', description: 'A slim screw-top bottle that slips into any bag and keeps your drink just right.', details: { material: 'Stainless steel, insulated', dimensions: 'Slim bottle', care: 'Hand wash' }, image: '/assets/studio/matte-flask.webp', lifestyle: '/assets/lifestyle/matte-flask.webp', featured: false },
  { id: 'a3', slug: 'artios-notepad', name: 'Notepad', category: 'stationery', price: 6500, currency: 'NGN', description: 'A hardcover notepad with elastic closure and ribbon marker. A considered place for ideas, plans and prayers.', details: { material: 'Hardcover, lined pages', dimensions: 'Journal size', care: 'Keep dry' }, image: '/assets/studio/artios-notepad.webp', lifestyle: '/assets/lifestyle/artios-notepad.webp', featured: false },
  { id: 'a6', slug: 'artios-mug', name: 'Mug', category: 'drinkware', price: 5000, currency: 'NGN', description: 'A classic ceramic mug for slow mornings, desk coffee and evening tea.', details: { material: 'Glazed ceramic', dimensions: 'Standard mug', care: 'Dishwasher safe' }, image: '/assets/studio/artios-mug.webp', lifestyle: '/assets/lifestyle/artios-mug.webp', featured: false },
];

export const findColor = (product: Product, name?: string) => product.colors?.find(c => c.name === name) ?? product.colors?.[0];
export default products;
