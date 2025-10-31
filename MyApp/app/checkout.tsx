import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { router } from 'expo-router';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { checkout } from '../api/api';
import { 
  CartContextType, 
  AuthContextType,
  User
} from '../types';

export default function CheckoutScreen() {
  const cartContext = useContext(CartContext) as CartContextType | undefined;
  const { cart, loading: cartLoading, clearCart } = cartContext || {
    cart: null,
    loading: false,
    clearCart: async () => {}
  };
  
  const authContext = useContext(AuthContext) as AuthContextType | undefined;
  const user = authContext?.user as User | null;
  
  const [shippingAddress, setShippingAddress] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill user data if available
  useEffect(() => {
    if (user && user.phone_number) {
      setPhoneNumber(user.phone_number);
    }
  }, [user]);

  // Show error if any
  useEffect(() => {
    if (error) {
      Alert.alert('Ошибка', error);
    }
  }, [error]);

  // Handle checkout
  const handleCheckout = async (): Promise<void> => {
    // Validate inputs
    if (!shippingAddress.trim()) {
      setError('Пожалуйста, укажите адрес доставки');
      return;
    }

    if (!phoneNumber.trim()) {
      setError('Пожалуйста, укажите номер телефона');
      return;
    }

    // Validate phone number format (simple validation)
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    if (!phoneRegex.test(phoneNumber.replace(/\s/g, ''))) {
      setError('Пожалуйста, укажите корректный номер телефона');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (!cart || !cart.id || !clearCart) {
        throw new Error('Cart is not available');
      }
      
      const response = await checkout(cart.id, shippingAddress, phoneNumber);
      
      // Clear cart and navigate to success screen
      await clearCart();
      router.push({
        pathname: '/order-success',
        params: { orderId: response.data.order_id }
      });
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.response?.data?.error || 'Произошла ошибка при оформлении заказа. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  if (cartLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#e91e63" />
      </View>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>Ваша корзина пуста</Text>
        <TouchableOpacity
          style={styles.shopButton}
          onPress={() => router.push('/(tabs)/')}
        >
          <Text style={styles.shopButtonText}>Перейти к покупкам</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView style={styles.container}>
        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ваш заказ</Text>
          
          {cart.items.map(item => (
            <View key={item.id} style={styles.orderItem}>
              <View style={styles.orderItemDetails}>
                <Text style={styles.orderItemName}>{item.product.name}</Text>
                <Text style={styles.orderItemQuantity}>{item.quantity} шт.</Text>
              </View>
              <Text style={styles.orderItemPrice}>{item.total_price} ₽</Text>
            </View>
          ))}
          
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Итого:</Text>
            <Text style={styles.totalPrice}>{cart.total_price} ₽</Text>
          </View>
        </View>
        
        {/* Shipping Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Информация о доставке</Text>
          
          <Text style={styles.inputLabel}>Адрес доставки</Text>
          <TextInput
            style={styles.input}
            value={shippingAddress}
            onChangeText={setShippingAddress}
            placeholder="Введите адрес доставки"
            multiline
          />
          
          <Text style={styles.inputLabel}>Номер телефона</Text>
          <TextInput
            style={styles.input}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="Введите номер телефона"
            keyboardType="phone-pad"
          />
        </View>
        
        {/* Checkout Button */}
        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={handleCheckout}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.checkoutButtonText}>Оформить заказ</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  section: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 15,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  orderItemDetails: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 16,
    fontWeight: '500',
  },
  orderItemQuantity: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  orderItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e91e63',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e91e63',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
  },
  checkoutButton: {
    backgroundColor: '#e91e63',
    margin: 10,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 30,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  shopButton: {
    backgroundColor: '#e91e63',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 4,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});