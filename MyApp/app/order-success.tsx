import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { OrderSuccessParams } from '../types';

export default function OrderSuccessScreen() {
  const { orderId } = useLocalSearchParams<OrderSuccessParams>();

  // Handle continue shopping
  const handleContinueShopping = (): void => {
    // Reset navigation to home screen
    router.replace('/(tabs)/');
  };

  // Handle view orders
  const handleViewOrders = (): void => {
    // Navigate to profile screen with orders tab
    router.push({
      pathname: '/(tabs)/profile',
      params: { initialTab: 'orders' }
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Image
            source={require('../assets/images/icon.png')}
            style={styles.icon}
            resizeMode="contain"
          />
        </View>
        
        <Text style={styles.title}>Заказ успешно оформлен!</Text>
        
        {orderId && (
          <Text style={styles.orderNumber}>Номер заказа: {orderId}</Text>
        )}
        
        <Text style={styles.message}>
          Спасибо за ваш заказ! Мы уже начали его обрабатывать и скоро свяжемся с вами для подтверждения.
        </Text>
        
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleContinueShopping}
          >
            <Text style={styles.primaryButtonText}>Продолжить покупки</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleViewOrders}
          >
            <Text style={styles.secondaryButtonText}>Мои заказы</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e8f5e9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    width: 50,
    height: 50,
    tintColor: '#4caf50',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  orderNumber: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: '#444',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  buttonsContainer: {
    width: '100%',
  },
  button: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 8,
  },
  primaryButton: {
    backgroundColor: '#e91e63',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  secondaryButtonText: {
    color: '#444',
    fontSize: 16,
    fontWeight: '500',
  },
});