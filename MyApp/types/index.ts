// Define the Category interface
export interface Category {
  id: number;
  name: string;
  slug: string;
}

// Define the Product interface
export interface Product {
  id: number;
  name: string;
  description: string;
  gram?: number;
  price: number;
  image?: string;
  image_url?: string;
  category?: Category;
}

// Define the CartItem interface
export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
  total_price: number;
}

// Define the Cart interface
export interface Cart {
  id: number;
  user?: User;
  created_at: string;
  total_price: number;
  items: CartItem[];
}

// Define the Order interface
export interface Order {
  id: number;
  user?: User;
  products: string;
  order_date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_price: number;
  shipping_address: string;
  phone_number: string;
}

// Define the User interface
export interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
}

// Define the AuthContextType interface
export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

// Define the CartContextType interface
export interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  addItem: (productId: number, quantity?: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  updateItem: (itemId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  loadCart: () => Promise<void>;
  getCartItemsCount: () => number;
}

// Expo Router types for navigation
export type ProductDetailParams = {
  id: string;
};

export type OrderSuccessParams = {
  orderId?: string;
};