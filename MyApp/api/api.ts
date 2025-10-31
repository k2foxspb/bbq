import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiUrl, apiTimeout, logDebug } from '../config';

// API URL is configured in config.tsx based on the environment (development/production)
logDebug('Using API URL:', apiUrl);

// Create axios instance
const api = axios.create({
  baseURL: apiUrl,
  timeout: apiTimeout,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Categories
export const getCategories = () => {
  return api.get('/categories/');
};

// Products
export const getProducts = () => {
  return api.get('/products/');
};

export const getProductsByCategory = (categoryId: number) => {
  return api.get(`/products/by_category/?category_id=${categoryId}`);
};

export const getProductDetail = (productId: number) => {
  return api.get(`/products/${productId}/`);
};

// Cart
export const getCart = () => {
  return api.get('/carts/');
};

export const addToCart = (cartId: number, productId: number, quantity = 1) => {
  return api.post(`/carts/${cartId}/add_item/`, {
    product_id: productId,
    quantity: quantity,
  });
};

export const removeFromCart = (cartId: number, itemId: number) => {
  return api.post(`/carts/${cartId}/remove_item/`, {
    item_id: itemId,
  });
};

export const updateCartItem = (cartId: number, itemId: number, quantity: number) => {
  return api.post(`/carts/${cartId}/update_item/`, {
    item_id: itemId,
    quantity: quantity,
  });
};

// Orders
export const checkout = (cartId: number, shippingAddress: string, phoneNumber: string) => {
  return api.post(`/carts/${cartId}/checkout/`, {
    shipping_address: shippingAddress,
    phone_number: phoneNumber,
  });
};

export const getOrders = () => {
  return api.get('/orders/');
};

// Auth
export const login = (email: string, password: string) => {
  return api.post('/auth/login/', {
    email: email,
    password: password,
  });
};

export const register = (username: string, email: string, password: string) => {
  return api.post('/auth/register/', {
    username: username,
    email: email,
    password: password,
  });
};

export const getUserProfile = () => {
  return api.get('/users/me/');
};

export default api;