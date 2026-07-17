export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'coffee' | 'tea' | 'specialty' | 'addons';
  emoji: string;
  tags: string[];
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export const menuItems: MenuItem[] = [
  // Coffee
  {
    id: 'c1',
    name: 'Cappuccino',
    description: 'Rich espresso with steamed milk foam. Classic Italian perfection.',
    price: 180,
    category: 'coffee',
    emoji: '☕',
    tags: ['Bestseller'],
  },
  {
    id: 'c2',
    name: 'Espresso',
    description: 'Pure, intense single-origin shot. Bold and aromatic.',
    price: 120,
    category: 'coffee',
    emoji: '⚡',
    tags: [],
  },
  {
    id: 'c3',
    name: 'Flat White',
    description: 'Velvety micro-foam over a double ristretto. Smooth and creamy.',
    price: 170,
    category: 'coffee',
    emoji: '🤍',
    tags: ['Popular'],
  },
  {
    id: 'c4',
    name: 'Americano',
    description: 'Espresso diluted with hot water. Clean and bold flavor.',
    price: 140,
    category: 'coffee',
    emoji: '🖤',
    tags: [],
  },
  {
    id: 'c5',
    name: 'Cold Brew',
    description: '18-hour slow-steeped. Smooth, low-acid, naturally sweet.',
    price: 190,
    category: 'coffee',
    emoji: '🧊',
    tags: ['New'],
  },
  // Tea
  {
    id: 't1',
    name: 'Masala Chai',
    description: 'Spiced Indian tea with ginger, cardamom, and fresh milk.',
    price: 80,
    category: 'tea',
    emoji: '🍵',
    tags: ['Bestseller'],
  },
  {
    id: 't2',
    name: 'Matcha Latte',
    description: 'Ceremonial-grade Japanese matcha with oat milk.',
    price: 220,
    category: 'tea',
    emoji: '🍃',
    tags: ['New'],
  },
  {
    id: 't3',
    name: 'Green Tea',
    description: 'Light, refreshing loose-leaf sencha. Antioxidant-rich.',
    price: 90,
    category: 'tea',
    emoji: '🌿',
    tags: [],
  },
  // Specialty
  {
    id: 's1',
    name: 'Mocha',
    description: 'Espresso meets Belgian chocolate. Topped with whipped cream.',
    price: 200,
    category: 'specialty',
    emoji: '🍫',
    tags: ['Popular'],
  },
  {
    id: 's2',
    name: 'Caramel Macchiato',
    description: 'Vanilla-infused milk marked with espresso and caramel drizzle.',
    price: 210,
    category: 'specialty',
    emoji: '🍯',
    tags: ['Bestseller'],
  },
  {
    id: 's3',
    name: 'Iced Vanilla Latte',
    description: 'Smooth espresso with Madagascar vanilla over ice.',
    price: 195,
    category: 'specialty',
    emoji: '🧋',
    tags: ['New'],
  },
  // Add-ons
  {
    id: 'a1',
    name: 'Chocolate Muffin',
    description: 'Freshly baked double-chocolate muffin. Warm and gooey.',
    price: 90,
    category: 'addons',
    emoji: '🧁',
    tags: [],
  },
  {
    id: 'a2',
    name: 'Butter Croissant',
    description: 'Flaky, golden French croissant. 48-hour laminated dough.',
    price: 110,
    category: 'addons',
    emoji: '🥐',
    tags: ['Popular'],
  },
  {
    id: 'a3',
    name: 'Cookie',
    description: 'Giant chocolate chip cookie. Crispy edges, chewy center.',
    price: 70,
    category: 'addons',
    emoji: '🍪',
    tags: [],
  },
];

export const categories = [
  { id: 'coffee' as const, label: 'Coffee', emoji: '☕' },
  { id: 'tea' as const, label: 'Tea', emoji: '🍵' },
  { id: 'specialty' as const, label: 'Specialty', emoji: '✨' },
  { id: 'addons' as const, label: 'Add-ons', emoji: '🍪' },
];
