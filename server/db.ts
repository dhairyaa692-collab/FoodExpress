import fs from 'fs';
import path from 'path';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  phone: string;
  address: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number; // in Rupees (INR ₹)
  category: 'Pizza' | 'Burger' | 'Indian' | 'Chinese' | 'Snacks' | 'Desserts' | 'Beverages';
  restaurant: string;
  isVeg: boolean;
  imageUrl: string;
  isAvailable: boolean;
  popularity: number;
  rating: number;
  prepTimeMinutes: number;
  createdAt: string;
}

export interface OrderItem {
  foodId: string;
  name: string;
  price: number;
  quantity: number;
  restaurant?: string;
  isVeg: boolean;
  imageUrl: string;
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Preparing' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
export type PaymentStatus = 'Pending - Cash on Delivery' | 'Collected - Cash on Delivery';

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryInstructions?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  paymentMethod: 'Cash on Delivery';
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AdminSession {
  token: string;
  createdAt: string;
  expiresAt: string;
}

interface DatabaseSchema {
  users: User[];
  foodItems: FoodItem[];
  orders: Order[];
  adminSessions: AdminSession[];
}

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'foodexpress_db.json');

// Initial seed food items with Indian Rupees and 4 Featured Restaurants
const INITIAL_FOOD_ITEMS: FoodItem[] = [
  // Restaurant 1: Artisan Sourdough Pizza Co.
  {
    id: 'food-p-1',
    name: 'Truffle & Wild Mushroom Pizza',
    description: 'Hand-stretched sourdough crust topped with roasted portobello, fior di latte mozzarella, and aromatic white truffle oil drizzle.',
    price: 369,
    category: 'Pizza',
    restaurant: 'Artisan Sourdough Pizza Co.',
    isVeg: true,
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    popularity: 96,
    rating: 4.9,
    prepTimeMinutes: 20,
    createdAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'food-p-2',
    name: 'Spicy Pepperoni & Hot Honey',
    description: 'Smoked artisanal pepperoni, San Marzano tomato sauce, fresh mozzarella, finished with chili-infused hot honey.',
    price: 399,
    category: 'Pizza',
    restaurant: 'Artisan Sourdough Pizza Co.',
    isVeg: false,
    imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    popularity: 98,
    rating: 4.8,
    prepTimeMinutes: 22,
    createdAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'food-p-3',
    name: 'Classic Margherita Royale',
    description: 'San Marzano tomatoes, fresh buffalo mozzarella, fragrant sweet basil leaves, and extra virgin cold-pressed olive oil.',
    price: 289,
    category: 'Pizza',
    restaurant: 'Artisan Sourdough Pizza Co.',
    isVeg: true,
    imageUrl: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    popularity: 92,
    rating: 4.7,
    prepTimeMinutes: 18,
    createdAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'food-p-4',
    name: 'Fiery Peri Peri Paneer Pizza',
    description: 'Spicy peri-peri marinated malai paneer cubes, crunchy red onions, crisp capsicum, and golden molten mozzarella.',
    price: 349,
    category: 'Pizza',
    restaurant: 'Artisan Sourdough Pizza Co.',
    isVeg: true,
    imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    popularity: 95,
    rating: 4.9,
    prepTimeMinutes: 20,
    createdAt: '2026-01-10T10:00:00Z',
  },

  // Restaurant 2: The Burger Club & Smokery
  {
    id: 'food-b-1',
    name: 'Smoked Bacon Cheddar Smash Burger',
    description: 'Double Angus beef patties smashed with sweet caramelized onions, double aged cheddar, crispy bacon, and signature relish.',
    price: 299,
    category: 'Burger',
    restaurant: 'The Burger Club & Smokery',
    isVeg: false,
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    popularity: 99,
    rating: 4.9,
    prepTimeMinutes: 15,
    createdAt: '2026-01-11T10:00:00Z',
  },
  {
    id: 'food-b-2',
    name: 'Crispy Korean Fried Chicken Burger',
    description: 'Ultra-crispy buttermilk chicken breast tossed in sweet & spicy gochujang glaze, crunchy kimchi slaw, on toasted brioche.',
    price: 279,
    category: 'Burger',
    restaurant: 'The Burger Club & Smokery',
    isVeg: false,
    imageUrl: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    popularity: 95,
    rating: 4.8,
    prepTimeMinutes: 16,
    createdAt: '2026-01-11T10:00:00Z',
  },
  {
    id: 'food-b-3',
    name: 'Classic Aloo Tikki Supreme Burger',
    description: 'Golden spiced potato and pea patty with fresh mint mayonnaise, crisp tomato slice, onion rings, and tangy tamarind drizzle.',
    price: 159,
    category: 'Burger',
    restaurant: 'The Burger Club & Smokery',
    isVeg: true,
    imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    popularity: 94,
    rating: 4.7,
    prepTimeMinutes: 12,
    createdAt: '2026-01-11T10:00:00Z',
  },
  {
    id: 'food-b-4',
    name: 'Avocado Chipotle Black Bean Burger',
    description: 'House-made quinoa and black bean patty, crushed hass avocado, pepper jack cheese, and chipotle lime crema.',
    price: 249,
    category: 'Burger',
    restaurant: 'The Burger Club & Smokery',
    isVeg: true,
    imageUrl: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    popularity: 88,
    rating: 4.6,
    prepTimeMinutes: 14,
    createdAt: '2026-01-11T10:00:00Z',
  },

  // Restaurant 3: Punjab Grill & Royal Kitchens
  {
    id: 'food-i-1',
    name: 'Old Delhi Butter Chicken & 2 Garlic Naans',
    description: 'Tender tandoori chicken simmered in rich velvety tomato, butter, and cashew gravy. Served with 2 pieces of tandoor garlic butter naan.',
    price: 389,
    category: 'Indian',
    restaurant: 'Punjab Grill & Royal Kitchens',
    isVeg: false,
    imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    popularity: 100,
    rating: 5.0,
    prepTimeMinutes: 25,
    createdAt: '2026-01-12T10:00:00Z',
  },
  {
    id: 'food-i-2',
    name: 'Hyderabadi Dum Paneer Biryani',
    description: 'Fragrant long-grain aged basmati rice layered with spiced paneer tikka, saffron, fried onions, and mint. Served with cucumber raita.',
    price: 329,
    category: 'Indian',
    restaurant: 'Punjab Grill & Royal Kitchens',
    isVeg: true,
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    popularity: 96,
    rating: 4.9,
    prepTimeMinutes: 25,
    createdAt: '2026-01-12T10:00:00Z',
  },
  {
    id: 'food-i-3',
    name: 'Shahi Paneer Butter Masala',
    description: 'Fresh cottage cheese cubes bathed in rich cashew nut gravy infused with cardamom and fenugreek. Served with flaky parathas.',
    price: 299,
    category: 'Indian',
    restaurant: 'Punjab Grill & Royal Kitchens',
    isVeg: true,
    imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    popularity: 94,
    rating: 4.8,
    prepTimeMinutes: 20,
    createdAt: '2026-01-12T10:00:00Z',
  },
  {
    id: 'food-i-4',
    name: 'Overnight Dal Makhani & Jeera Rice',
    description: 'Slow-cooked black lentils simmered for 18 hours with white butter and mild aromatic spices. Paired with cumin-tempered basmati rice.',
    price: 259,
    category: 'Indian',
    restaurant: 'Punjab Grill & Royal Kitchens',
    isVeg: true,
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    popularity: 92,
    rating: 4.7,
    prepTimeMinutes: 20,
    createdAt: '2026-01-12T10:00:00Z',
  },

  // Restaurant 4: Dragon House Asian Wok
  {
    id: 'food-c-1',
    name: 'Szechuan Chilli Garlic Noodles',
    description: 'Wok-tossed hand-pulled noodles with crisp bell peppers, snap peas, roasted garlic, and fiery Szechuan peppercorn sauce.',
    price: 239,
    category: 'Chinese',
    restaurant: 'Dragon House Asian Wok',
    isVeg: true,
    imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    popularity: 93,
    rating: 4.8,
    prepTimeMinutes: 16,
    createdAt: '2026-01-13T10:00:00Z',
  },
  {
    id: 'food-c-2',
    name: 'Steamed Chicken Dim Sums (6 Pcs)',
    description: 'Delicate translucent dumplings filled with ginger-infused minced chicken and scallions. Served with spicy scallion dip.',
    price: 219,
    category: 'Chinese',
    restaurant: 'Dragon House Asian Wok',
    isVeg: false,
    imageUrl: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    popularity: 89,
    rating: 4.7,
    prepTimeMinutes: 15,
    createdAt: '2026-01-13T10:00:00Z',
  },
  {
    id: 'food-c-3',
    name: 'Crispy Honey Chilli Lotus Stem',
    description: 'Crunchy golden lotus stem slices tossed in sweet chili honey glaze, toasted sesame seeds, and fresh scallions.',
    price: 229,
    category: 'Chinese',
    restaurant: 'Dragon House Asian Wok',
    isVeg: true,
    imageUrl: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    popularity: 87,
    rating: 4.6,
    prepTimeMinutes: 14,
    createdAt: '2026-01-13T10:00:00Z',
  },
  {
    id: 'food-c-4',
    name: 'Smoky Schezwan Egg & Chicken Fried Rice',
    description: 'Wok-fried jasmine rice with scrambled eggs, shredded chicken, baby corn, spring onions, and spicy red chili sambal.',
    price: 269,
    category: 'Chinese',
    restaurant: 'Dragon House Asian Wok',
    isVeg: false,
    imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    popularity: 91,
    rating: 4.8,
    prepTimeMinutes: 15,
    createdAt: '2026-01-13T10:00:00Z',
  },

  // Restaurant 5: The Belgian Waffle & Sweet Street
  {
    id: 'food-s-1',
    name: 'Loaded Truffle Parmesan Fries',
    description: 'Hand-cut russet potatoes fried golden, dusted with aged Parmigiano Reggiano, rosemary, and drizzled with truffle garlic aioli.',
    price: 159,
    category: 'Snacks',
    restaurant: 'The Burger Club & Smokery',
    isVeg: true,
    imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    popularity: 97,
    rating: 4.9,
    prepTimeMinutes: 10,
    createdAt: '2026-01-14T10:00:00Z',
  },
  {
    id: 'food-s-2',
    name: 'Spicy Buffalo Wings (8 Pcs)',
    description: 'Crispy jumbo chicken wings glazed in cayenne buffalo butter sauce. Served with cool blue cheese dip.',
    price: 259,
    category: 'Snacks',
    restaurant: 'The Burger Club & Smokery',
    isVeg: false,
    imageUrl: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    popularity: 94,
    rating: 4.8,
    prepTimeMinutes: 15,
    createdAt: '2026-01-14T10:00:00Z',
  },
  {
    id: 'food-d-1',
    name: 'Warm Belgian Molten Lava Cake',
    description: 'Rich dark chocolate cake with a molten center of decadent 70% chocolate ganache, dusted with powdered sugar.',
    price: 169,
    category: 'Desserts',
    restaurant: 'The Belgian Waffle & Sweet Street',
    isVeg: true,
    imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    popularity: 98,
    rating: 4.9,
    prepTimeMinutes: 12,
    createdAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'food-d-2',
    name: 'Nutella Belgian Waffle Platter',
    description: 'Crispy golden malted waffle loaded with warm melted Nutella, banana slices, and roasted hazelnuts.',
    price: 199,
    category: 'Desserts',
    restaurant: 'The Belgian Waffle & Sweet Street',
    isVeg: true,
    imageUrl: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    popularity: 96,
    rating: 4.9,
    prepTimeMinutes: 10,
    createdAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'food-bev-1',
    name: 'Fresh Mint Lime Mojito Cooler',
    description: 'Refreshing crushed spearmint, zesty lime juice, cane sugar, and sparkling soda water over crushed ice.',
    price: 119,
    category: 'Beverages',
    restaurant: 'The Belgian Waffle & Sweet Street',
    isVeg: true,
    imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    popularity: 91,
    rating: 4.7,
    prepTimeMinutes: 5,
    createdAt: '2026-01-16T10:00:00Z',
  },
  {
    id: 'food-bev-2',
    name: 'Iced Vanilla Cold Brew',
    description: 'Slow-steeped 18-hour cold brew coffee infused with Madagascar vanilla and splashed with sweet cream.',
    price: 149,
    category: 'Beverages',
    restaurant: 'The Belgian Waffle & Sweet Street',
    isVeg: true,
    imageUrl: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    popularity: 88,
    rating: 4.6,
    prepTimeMinutes: 5,
    createdAt: '2026-01-16T10:00:00Z',
  },
  {
    id: 'food-bev-3',
    name: 'Alphonso Mango Lassi',
    description: 'Traditional thick and creamy yogurt smoothie blended with ripe sweet Alphonso mango pulp, green cardamom, and pistachios.',
    price: 129,
    category: 'Beverages',
    restaurant: 'Punjab Grill & Royal Kitchens',
    isVeg: true,
    imageUrl: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    popularity: 95,
    rating: 4.9,
    prepTimeMinutes: 5,
    createdAt: '2026-01-16T10:00:00Z',
  },

  // Restaurant 6: Dosa Kingdom & South Express
  {
    id: 'food-dk-1',
    name: 'Ghee Roast Masala Dosa with Sambar',
    description: 'Crisp golden crepe roasted in pure aromatic Desi ghee, filled with spiced potato masala. Accompanied by hot drumstick sambar and coconut chutneys.',
    price: 189,
    category: 'Indian',
    restaurant: 'Dosa Kingdom & South Express',
    isVeg: true,
    imageUrl: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    popularity: 97,
    rating: 4.9,
    prepTimeMinutes: 15,
    createdAt: '2026-01-17T10:00:00Z',
  },
  {
    id: 'food-dk-2',
    name: 'Gunpowder Ghee Podi Mini Idlis (12 Pcs)',
    description: 'Bite-sized soft steamed button idlis liberally tossed in spicy roasted lentil gunpowder and hot clarified butter.',
    price: 159,
    category: 'Snacks',
    restaurant: 'Dosa Kingdom & South Express',
    isVeg: true,
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    popularity: 93,
    rating: 4.8,
    prepTimeMinutes: 10,
    createdAt: '2026-01-17T10:00:00Z',
  },
  {
    id: 'food-dk-3',
    name: 'Mysore Butter Masala Dosa',
    description: 'Authentic Bengaluru-style crispy crepe smeared with fiery red garlic chili relish, potato mash, and fresh white butter.',
    price: 219,
    category: 'Indian',
    restaurant: 'Dosa Kingdom & South Express',
    isVeg: true,
    imageUrl: 'https://images.unsplash.com/photo-1630383249896-424e482df921?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    popularity: 95,
    rating: 4.8,
    prepTimeMinutes: 15,
    createdAt: '2026-01-17T10:00:00Z',
  },
  {
    id: 'food-dk-4',
    name: 'Authentic South Indian Filter Kaapi',
    description: 'Traditional slow-filtered chicory coffee decoction frothed high with creamy steamed milk in a classic brass tumbler.',
    price: 79,
    category: 'Beverages',
    restaurant: 'Dosa Kingdom & South Express',
    isVeg: true,
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    popularity: 96,
    rating: 4.9,
    prepTimeMinutes: 5,
    createdAt: '2026-01-17T10:00:00Z',
  },

  // Restaurant 7: Royal Biryani Darbar
  {
    id: 'food-rb-1',
    name: 'Awadhi Chicken Dum Biryani Handi',
    description: 'Succulent chicken pieces slow-steamed under purdah seal with aged saffron basmati, rose water, kewra, and golden fried onions. Served with burani raita.',
    price: 369,
    category: 'Indian',
    restaurant: 'Royal Biryani Darbar',
    isVeg: false,
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    popularity: 100,
    rating: 5.0,
    prepTimeMinutes: 25,
    createdAt: '2026-01-18T10:00:00Z',
  },
  {
    id: 'food-rb-2',
    name: 'Melt-in-Mouth Mutton Galouti Kebabs (4 Pcs)',
    description: 'Legendary royal minced lamb patties smoked with cloves and 32 heritage spices. Accompanied by soft roomali rotis and mint chutney.',
    price: 429,
    category: 'Snacks',
    restaurant: 'Royal Biryani Darbar',
    isVeg: false,
    imageUrl: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    popularity: 98,
    rating: 4.9,
    prepTimeMinutes: 20,
    createdAt: '2026-01-18T10:00:00Z',
  },
  {
    id: 'food-rb-3',
    name: 'Nizami Paneer Tikka Dum Biryani',
    description: 'Tandoor-charred malai paneer cubes infused in spiced masala rice, saffron milk, and mint in an artisanal earthen handi.',
    price: 319,
    category: 'Indian',
    restaurant: 'Royal Biryani Darbar',
    isVeg: true,
    imageUrl: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    popularity: 94,
    rating: 4.8,
    prepTimeMinutes: 22,
    createdAt: '2026-01-18T10:00:00Z',
  },
  {
    id: 'food-rb-4',
    name: 'Royal Zafrani Kesar Phirni',
    description: 'Slow-simmered rich ground basmati milk pudding steeped with royal saffron strands, green cardamom, and toasted pistachios in a clay matka.',
    price: 139,
    category: 'Desserts',
    restaurant: 'Royal Biryani Darbar',
    isVeg: true,
    imageUrl: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    popularity: 92,
    rating: 4.9,
    prepTimeMinutes: 5,
    createdAt: '2026-01-18T10:00:00Z',
  },

  // Restaurant 8: Tokyo Ramen & Dim Sum Lounge
  {
    id: 'food-tr-1',
    name: 'Spicy Miso Chicken Chashu Ramen',
    description: 'Silky 12-hour chicken broth with aged fermented miso tare, springy artisanal ramen noodles, charred chicken chashu, seasoned soft egg, and nori.',
    price: 349,
    category: 'Chinese',
    restaurant: 'Tokyo Ramen & Dim Sum Lounge',
    isVeg: false,
    imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    popularity: 96,
    rating: 4.9,
    prepTimeMinutes: 18,
    createdAt: '2026-01-19T10:00:00Z',
  },
  {
    id: 'food-tr-2',
    name: 'Crystal Truffle Edamame Dim Sums (6 Pcs)',
    description: 'Translucent steamed parcels stuffed with hand-crushed young edamame, water chestnuts, and fragrant Italian black truffle oil drizzle.',
    price: 279,
    category: 'Chinese',
    restaurant: 'Tokyo Ramen & Dim Sum Lounge',
    isVeg: true,
    imageUrl: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    popularity: 91,
    rating: 4.8,
    prepTimeMinutes: 14,
    createdAt: '2026-01-19T10:00:00Z',
  },
  {
    id: 'food-tr-3',
    name: 'Golden Crispy Tempura Prawns (5 Pcs)',
    description: 'Succulent king prawns wrapped in lacy feather-light Japanese tempura batter, paired with tentsuyu dipping sauce and grated ginger.',
    price: 389,
    category: 'Snacks',
    restaurant: 'Tokyo Ramen & Dim Sum Lounge',
    isVeg: false,
    imageUrl: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    popularity: 95,
    rating: 4.9,
    prepTimeMinutes: 12,
    createdAt: '2026-01-19T10:00:00Z',
  },
  {
    id: 'food-tr-4',
    name: 'Kyoto Matcha Brown Sugar Boba Tea',
    description: 'Ceremonial grade Japanese Uji matcha shaken with chilled farm milk, caramelized dark brown sugar syrup, and warm chewy boba pearls.',
    price: 179,
    category: 'Beverages',
    restaurant: 'Tokyo Ramen & Dim Sum Lounge',
    isVeg: true,
    imageUrl: 'https://images.unsplash.com/photo-1558857563-b37cf0e0d6a9?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    popularity: 89,
    rating: 4.7,
    prepTimeMinutes: 5,
    createdAt: '2026-01-19T10:00:00Z',
  },

  // Restaurant 9: Sweet Indulgence Bakery & Gelato
  {
    id: 'food-si-1',
    name: 'New York Baked Blueberry Cheesecake Slice',
    description: 'Velvety slow-baked Philadelphia cream cheesecake on a toasted Graham cracker crust, smothered in homemade wild Maine blueberry compote.',
    price: 229,
    category: 'Desserts',
    restaurant: 'Sweet Indulgence Bakery & Gelato',
    isVeg: true,
    imageUrl: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    popularity: 98,
    rating: 4.9,
    prepTimeMinutes: 8,
    createdAt: '2026-01-20T10:00:00Z',
  },
  {
    id: 'food-si-2',
    name: 'Lotus Biscoff Tres Leches Dessert Tub',
    description: 'Feather-light sponge cake soaked overnight in three sweet milks, crowned with fresh vanilla chantilly and warm melted Lotus Biscoff speculoos cream.',
    price: 249,
    category: 'Desserts',
    restaurant: 'Sweet Indulgence Bakery & Gelato',
    isVeg: true,
    imageUrl: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    popularity: 99,
    rating: 5.0,
    prepTimeMinutes: 8,
    createdAt: '2026-01-20T10:00:00Z',
  },
  {
    id: 'food-si-3',
    name: 'Pistachio Rasmalai Gelato Sundae',
    description: 'Chilled saffron milk-soaked cottage cheese patties layered between scoops of Sicilian pistachio gelato, slivered almonds, and silver vark.',
    price: 189,
    category: 'Desserts',
    restaurant: 'Sweet Indulgence Bakery & Gelato',
    isVeg: true,
    imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    popularity: 94,
    rating: 4.8,
    prepTimeMinutes: 6,
    createdAt: '2026-01-20T10:00:00Z',
  },
  {
    id: 'food-si-4',
    name: 'Belgian Dark Chocolate Ganache Shake',
    description: 'Sinful 65% Belgian dark chocolate ganache blended with creamy full-fat ice cream, finished with chocolate shavings and fudge ripple.',
    price: 179,
    category: 'Beverages',
    restaurant: 'Sweet Indulgence Bakery & Gelato',
    isVeg: true,
    imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    popularity: 95,
    rating: 4.9,
    prepTimeMinutes: 5,
    createdAt: '2026-01-20T10:00:00Z',
  },
];

// Helper to seed initial sample users and NO previous orders (fresh clean start)
function getInitialSeedData(): DatabaseSchema {
  const defaultUser: User = {
    id: 'user-demo-1',
    name: 'Alex Johnson',
    email: 'alex@example.com',
    passwordHash: 'ea30e3ffaa9192462dfd63460e59fd1b7fbd4dee7d3c322d67d718bee1445770142168be54ab1d2f24a755183017f2f092dbdafca8c61c364014bdc9affe9475',
    salt: 'fe_salt_demo_2026',
    phone: '+91 98765 43210',
    address: 'Flat 402, Royal Palms Residency, MG Road, Bangalore',
    createdAt: '2026-01-15T08:00:00Z',
  };

  const secondUser: User = {
    id: 'user-demo-2',
    name: 'Sophia Chen',
    email: 'sophia@example.com',
    passwordHash: 'ea30e3ffaa9192462dfd63460e59fd1b7fbd4dee7d3c322d67d718bee1445770142168be54ab1d2f24a755183017f2f092dbdafca8c61c364014bdc9affe9475',
    salt: 'fe_salt_demo_2026',
    phone: '+91 98111 22334',
    address: 'B-12, Sector 14, Ring Road, New Delhi',
    createdAt: '2026-02-01T12:00:00Z',
  };

  // Clean start: All previous orders and history removed as requested
  return {
    users: [defaultUser, secondUser],
    foodItems: INITIAL_FOOD_ITEMS,
    orders: [],
    adminSessions: [],
  };
}

class Database {
  private data: DatabaseSchema;
  private isSaving = false;
  private queuedSave = false;

  constructor() {
    this.data = this.loadDatabase();
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.foodItems && parsed.users) {
          // Ensure all initial restaurants & dishes are present
          const existingIds = new Set(parsed.foodItems.map((f: FoodItem) => f.id));
          for (const item of INITIAL_FOOD_ITEMS) {
            if (!existingIds.has(item.id)) {
              parsed.foodItems.push(item);
            }
          }
          // Ensure zero previous orders as explicitly requested
          parsed.orders = [];
          this.persist(parsed);
          return parsed;
        }
      }
    } catch (err) {
      console.error('Error loading database file, initializing seed:', err);
    }

    const initial = getInitialSeedData();
    this.persist(initial);
    return initial;
  }

  private persist(data: DatabaseSchema): void {
    if (this.isSaving) {
      this.queuedSave = true;
      return;
    }

    this.isSaving = true;
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      const tmpPath = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tmpPath, DB_FILE);
    } catch (err) {
      console.error('Failed to write database file:', err);
    } finally {
      this.isSaving = false;
      if (this.queuedSave) {
        this.queuedSave = false;
        this.persist(this.data);
      }
    }
  }

  private save(): void {
    this.persist(this.data);
  }

  // --- Users ---
  getUsers(): User[] {
    return [...this.data.users];
  }

  findUserByEmail(email: string): User | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  createUser(user: User): User {
    this.data.users.push(user);
    this.save();
    return user;
  }

  updateUser(id: string, updates: Partial<User>): User | null {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    this.data.users[idx] = { ...this.data.users[idx], ...updates };
    this.save();
    return this.data.users[idx];
  }

  // --- Food Items ---
  getFoodItems(): FoodItem[] {
    return [...this.data.foodItems];
  }

  getFoodItemById(id: string): FoodItem | undefined {
    return this.data.foodItems.find((f) => f.id === id);
  }

  createFoodItem(item: FoodItem): FoodItem {
    this.data.foodItems.push(item);
    this.save();
    return item;
  }

  updateFoodItem(id: string, updates: Partial<FoodItem>): FoodItem | null {
    const idx = this.data.foodItems.findIndex((f) => f.id === id);
    if (idx === -1) return null;
    this.data.foodItems[idx] = { ...this.data.foodItems[idx], ...updates };
    this.save();
    return this.data.foodItems[idx];
  }

  deleteFoodItem(id: string): boolean {
    const initialLen = this.data.foodItems.length;
    this.data.foodItems = this.data.foodItems.filter((f) => f.id !== id);
    if (this.data.foodItems.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // --- Orders ---
  getOrders(): Order[] {
    return [...this.data.orders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  getOrderById(id: string): Order | undefined {
    return this.data.orders.find((o) => o.id === id);
  }

  getUserOrders(userId: string): Order[] {
    return this.data.orders
      .filter((o) => o.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  createOrder(order: Order): Order {
    this.data.orders.push(order);
    this.save();
    return order;
  }

  updateOrderStatus(orderId: string, status: OrderStatus): Order | null {
    const idx = this.data.orders.findIndex((o) => o.id === orderId);
    if (idx === -1) return null;
    this.data.orders[idx].orderStatus = status;
    this.data.orders[idx].updatedAt = new Date().toISOString();
    this.save();
    return this.data.orders[idx];
  }

  updateOrderPaymentStatus(orderId: string, paymentStatus: PaymentStatus): Order | null {
    const idx = this.data.orders.findIndex((o) => o.id === orderId);
    if (idx === -1) return null;
    this.data.orders[idx].paymentStatus = paymentStatus;
    this.data.orders[idx].updatedAt = new Date().toISOString();
    this.save();
    return this.data.orders[idx];
  }

  // --- Admin Sessions ---
  createAdminSession(token: string, expiresAt: string): void {
    const now = new Date().toISOString();
    this.data.adminSessions = this.data.adminSessions.filter((s) => s.expiresAt > now);
    this.data.adminSessions.push({
      token,
      createdAt: now,
      expiresAt,
    });
    this.save();
  }

  validateAdminSession(token: string): boolean {
    if (!token) return false;
    const now = new Date().toISOString();
    const session = this.data.adminSessions.find((s) => s.token === token && s.expiresAt > now);
    return !!session;
  }

  removeAdminSession(token: string): void {
    this.data.adminSessions = this.data.adminSessions.filter((s) => s.token !== token);
    this.save();
  }

  // Reset/reseed
  resetToSeeds(): void {
    this.data = getInitialSeedData();
    this.save();
  }
}

export const db = new Database();
