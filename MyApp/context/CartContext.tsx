import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { getCart, addToCart, removeFromCart, updateCartItem } from '../api/api';
import { AuthContext } from './AuthContext';
import { Cart, CartContextType, AuthContextType } from '../types';

export const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const authContext = useContext(AuthContext) as AuthContextType | undefined;
  const isAuthenticated = authContext?.isAuthenticated || false;

  // Load cart from API or create a new one
  const loadCart = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      if (isAuthenticated) {
        // Get cart from API if user is authenticated
        const response = await getCart();
        if (response.data && response.data.length > 0) {
          setCart(response.data[0]);
          await AsyncStorage.setItem('cartId', response.data[0].id.toString());
        } else {
          // Create a new cart by posting to the add_item endpoint
          // This will trigger the backend to create a new cart
          try {
            // We'll create a cart by adding a dummy item and then removing it
            // First, get any product ID to use for cart creation
            const productsResponse = await api.get('/products/');
            if (productsResponse.data && productsResponse.data.length > 0) {
              const dummyProductId = productsResponse.data[0].id;
              
              // Create a cart by adding an item
              const newCartResponse = await api.post('/carts/1/add_item/', {
                product_id: dummyProductId,
                quantity: 1
              });
              
              if (newCartResponse.data) {
                setCart(newCartResponse.data);
                await AsyncStorage.setItem('cartId', newCartResponse.data.id.toString());
              }
            }
          } catch (createErr) {
            console.error('Error creating new cart:', createErr);
          }
        }
      } else {
        // Use local cart ID for guest users
        const cartId = await AsyncStorage.getItem('cartId');
        if (cartId) {
          try {
            const response = await getCart();
            if (response.data && response.data.length > 0) {
              setCart(response.data[0]);
            }
          } catch (err) {
            console.error('Error loading guest cart:', err);
            // Clear invalid cart ID
            await AsyncStorage.removeItem('cartId');
          }
        } else {
          // Create a new cart for guest users
          try {
            // We'll create a cart by adding a dummy item
            // First, get any product ID to use for cart creation
            const productsResponse = await api.get('/products/');
            if (productsResponse.data && productsResponse.data.length > 0) {
              const dummyProductId = productsResponse.data[0].id;
              
              // Create a cart by adding an item
              const newCartResponse = await api.post('/carts/1/add_item/', {
                product_id: dummyProductId,
                quantity: 1
              });
              
              if (newCartResponse.data) {
                setCart(newCartResponse.data);
                await AsyncStorage.setItem('cartId', newCartResponse.data.id.toString());
              }
            }
          } catch (createErr) {
            console.error('Error creating new cart for guest:', createErr);
          }
        }
      }
    } catch (err) {
      setError('Failed to load cart. Please try again.');
      console.error('Error loading cart:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load cart on initial render and when auth state changes
  useEffect(() => {
    loadCart();
  }, [isAuthenticated]);

  // Add item to cart
  const addItem = async (productId: number, quantity: number = 1): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      // If no cart exists, load or create one
      if (!cart) {
        await loadCart();
      }
      
      // Get cart ID from state or AsyncStorage
      let cartId = cart ? cart.id : await AsyncStorage.getItem('cartId');
      
      // If still no cart ID, create a new cart directly with the product
      if (!cartId) {
        try {
          // Create a cart by adding the current product
          const newCartResponse = await api.post('/carts/1/add_item/', {
            product_id: productId,
            quantity: quantity
          });
          
          if (newCartResponse.data) {
            setCart(newCartResponse.data);
            await AsyncStorage.setItem('cartId', newCartResponse.data.id.toString());
            return; // Product already added, so return
          }
        } catch (createErr) {
          console.error('Error creating new cart with product:', createErr);
          throw new Error('Failed to create cart');
        }
      } else {
        // Add item to existing cart
        const response = await addToCart(parseInt(cartId.toString()), productId, quantity);
        setCart(response.data);
      }
    } catch (err: any) {
      setError('Failed to add item to cart. Please try again.');
      console.error('Error adding item to cart:', err);
    } finally {
      setLoading(false);
    }
  };

  // Remove item from cart
  const removeItem = async (itemId: number): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      if (!cart) {
        await loadCart();
      }
      
      const cartId = cart ? cart.id : await AsyncStorage.getItem('cartId');
      
      if (!cartId) {
        throw new Error('No cart available');
      }
      
      const response = await removeFromCart(parseInt(cartId.toString()), itemId);
      setCart(response.data);
    } catch (err: any) {
      setError('Failed to remove item from cart. Please try again.');
      console.error('Error removing item from cart:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update item quantity
  const updateItem = async (itemId: number, quantity: number): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      if (!cart) {
        await loadCart();
      }
      
      const cartId = cart ? cart.id : await AsyncStorage.getItem('cartId');
      
      if (!cartId) {
        throw new Error('No cart available');
      }
      
      const response = await updateCartItem(parseInt(cartId.toString()), itemId, quantity);
      setCart(response.data);
    } catch (err: any) {
      setError('Failed to update cart. Please try again.');
      console.error('Error updating cart:', err);
    } finally {
      setLoading(false);
    }
  };

  // Clear cart (used after checkout)
  const clearCart = async (): Promise<void> => {
    setCart(null);
    await AsyncStorage.removeItem('cartId');
  };

  // Get cart total items count
  const getCartItemsCount = (): number => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        error,
        addItem,
        removeItem,
        updateItem,
        clearCart,
        loadCart,
        getCartItemsCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};