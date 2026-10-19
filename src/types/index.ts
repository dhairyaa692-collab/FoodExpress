export type FoodCategory =
  | 'Pizza'
  | 'Burger'
  | 'Indian'
  | 'Chinese'
  | 'Snacks'
  | 'Desserts'
  | 'Beverages';

export interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: FoodCategory;
  restaurant: string;
  isVeg: boolean;
  imageUrl: string;
  isAvailable: boolean;
  popularity: number;
  rating: number;
  prepTimeMinutes: number;
  createdAt: string;
}

export interface CartItem {
  foodItem: FoodItem;
  quantity: number;
}

export interface OrderItem {
  foodId: string;
  name: string;
  price: number;
  quantity: number;
  isVeg: boolean;
  imageUrl: string;
}

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Preparing'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export type PaymentStatus =
  | 'Pending - Cash on Delivery'
  | 'Collected - Cash on Delivery';

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

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface CravingRecommendation {
  foodItem: FoodItem;
  reason: string;
  confidenceScore: number;
  cravingTag: string;
}

export interface CravingResponse {
  isPersonalized: boolean;
  userPromptOrPreference?: string;
  recommendations: CravingRecommendation[];
  summaryMessage: string;
  patternsIdentified?: string[];
}

export interface AdminStats {
  totalOrders: number;
  ordersToday: number;
  ordersThisMonth: number;
  pendingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalMonthRevenue: number;
  pendingCodAmount: number;
}

export interface DailyChartItem {
  day: number;
  date: string;
  orders: number;
  revenue: number;
  codCollected: number;
}

export interface MonthlyComparisonItem {
  month: string;
  monthNumber: number;
  orders: number;
  revenue: number;
}

export interface AdminAnalytics {
  year: number;
  month: number;
  summary: {
    totalOrders: number;
    revenue: number;
    delivered: number;
    codPending: number;
  };
  dailyChart: DailyChartItem[];
  monthlyComparison: MonthlyComparisonItem[];
}
