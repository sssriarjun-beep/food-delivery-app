export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  preferences?: string[];
  loyaltyPoints?: number;
  membershipLevel?: 'None' | 'Bronze' | 'Silver' | 'Gold' | 'Plus';
}

export interface Address {
  id: string;
  tag: 'Home' | 'Work' | 'Other';
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  instructions?: string;
  isDefault?: boolean;
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string[];
  rating: number;
  deliveryTimeMinutes: number;
  priceRange: '$' | '$$' | '$$$' | '$$$$';
  imageUrl: string;
  address: string;
  description: string;
  hasOffers: boolean;
  isVegOnly: boolean;
}

export interface VariantOption {
  name: string;
  price: number;
}

export interface VariantCategory {
  name: string;
  options: VariantOption[];
}

export interface AddOn {
  id: string;
  name: string;
  price: number;
}

export interface Dish {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isVeg: boolean;
  inStock: boolean;
  variants?: VariantCategory[];
  addOns?: AddOn[];
  rating?: number;
}

export interface CartItem {
  id: string;
  dish: Dish;
  quantity: number;
  variants?: Record<string, string>; // e.g., { "Size": "Large", "Spicy Level": "Medium" }
  addOns?: string[]; // Array of add-on names
}

export enum PaymentType {
  UPI = 'UPI',
  CREDIT_DEBIT_CARD = 'Credit/Debit Card',
  WALLET = 'Wallet',
  NET_BANKING = 'Net Banking',
  CASH_ON_DELIVERY = 'Cash on Delivery',
}

export interface PaymentMethod {
  id: string;
  type: PaymentType;
  details: string; // e.g., "Visa **** 1234" or "Paytm Wallet"
  isDefault?: boolean;
}

export enum OrderStatus {
  PENDING = 'Pending',
  CONFIRMED = 'Confirmed',
  PREPARING = 'Preparing',
  OUT_FOR_DELIVERY = 'Out for Delivery',
  DELIVERED = 'Delivered',
  CANCELLED = 'Cancelled',
}

export interface Order {
  id: string;
  userId: string;
  restaurantId: string;
  items: CartItem[];
  totalAmount: number;
  deliveryAddress: Address;
  deliveryInstructions?: string;
  paymentMethod: PaymentType;
  orderTime: string; // ISO string
  deliveryTime?: string; // ISO string
  status: OrderStatus;
  promoCodeApplied?: string;
  discountAmount?: number;
  trackingUpdates?: OrderTrackingUpdate[];
}

export interface OrderTrackingUpdate {
  timestamp: string; // ISO string
  status: OrderStatus;
  message: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  restaurantId?: string; // For restaurant review
  dishId?: string; // For dish review
  rating: number; // 1-5 stars
  comment: string;
  imageUrl?: string;
  reviewTime: string; // ISO string
}

export interface Notification {
  id: string;
  type: 'order' | 'promo' | 'recommendation' | 'alert';
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
}
