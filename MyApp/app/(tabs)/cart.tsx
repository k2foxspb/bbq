import React, { useContext, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ListRenderItem
} from 'react-native';
import { router } from 'expo-router';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import { baseUrl } from '../../config';
import { 
  CartContextType, 
  AuthContextType,
  CartItem
} from '../../types';

export default function CartScreen() {
  const cartContext = useContext(CartContext) as CartContextType | undefined;
  const { 
    cart, 
    loading, 
    error, 
    loadCart, 
    removeItem, 
    updateItem 
  } = cartContext || {
    cart: null,
    loading: false,
    error: null,
    loadCart: async () => {},
    removeItem: async () => {},
    updateItem: async () => {}
  };
  
  const authContext = useContext(AuthContext) as AuthContextType | undefined;
  const isAuthenticated = authContext?.isAuthenticated || false;

  // Load cart on component mount
  useEffect(() => {
    if (loadCart) {
      loadCart();
    }
  }, [loadCart]);

  // Show error if any
  useEffect(() => {
    if (error) {
      Alert.alert('Ошибка', error);
    }
  }, [error]);

  // Handle quantity change
  const handleQuantityChange = async (itemId: number, quantity: number, currentQuantity: number): Promise<void> => {
    if (quantity === 0) {
      // Confirm removal
      Alert.alert(
        'Удаление товара',
        'Вы уверены, что хотите удалить этот товар из корзины?',
        [
          { text: 'Отмена', style: 'cancel' },
          { text: 'Удалить', onPress: () => removeItem && removeItem(itemId) }
        ]
      );
    } else if (quantity !== currentQuantity && updateItem) {
      await updateItem(itemId, quantity);
    }
  };

  // Handle checkout
  const handleCheckout = (): void => {
    if (!cart || !cart.items || cart.items.length === 0) {
      Alert.alert('Корзина пуста', 'Добавьте товары в корзину, чтобы оформить заказ.');
      return;
    }

    if (!isAuthenticated) {
      Alert.alert(
        'Требуется авторизация',
        'Для оформления заказа необходимо войти в аккаунт.',
        [
          { text: 'Отмена', style: 'cancel' },
          { text: 'Войти', onPress: () => router.push('/auth/login') }
        ]
      );
      return;
    }

    router.push('/checkout');
  };

  // Render cart item
  const renderCartItem: ListRenderItem<CartItem> = ({ item }) => (
    <View style={styles.cartItem}>
      <Image 
        source={
          item.product.image 
            ? { uri: `${baseUrl}${item.product.image}` } 
            : require('../../assets/images/icon.png')
        }
        style={styles.itemImage}
        resizeMode="cover"
      />
      
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.product.name}</Text>
        <Text style={styles.itemPrice}>{item.product.price} ₽</Text>
        
        <View style={styles.quantityContainer}>
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={() => handleQuantityChange(item.id, item.quantity - 1, item.quantity)}
          >
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          
          <Text style={styles.quantityText}>{item.quantity}</Text>
          
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={() => handleQuantityChange(item.id, item.quantity + 1, item.quantity)}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.itemTotal}>
        <Text style={styles.itemTotalText}>{item.total_price} ₽</Text>
        <TouchableOpacity 
          style={styles.removeButton}
          onPress={() => handleQuantityChange(item.id, 0, item.quantity)}
        >
          <Text style={styles.removeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render empty cart
  const renderEmptyCart = (): JSX.Element => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>Ваша корзина пуста</Text>
      <TouchableOpacity
        style={styles.shopButton}
        onPress={() => router.push('/(tabs)/')}
      >
        <Text style={styles.shopButtonText}>Перейти к покупкам</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && (!cart || !cart.items)) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#e91e63" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={cart?.items || []}
        renderItem={renderCartItem}
        keyExtractor={item => item.id.toString()}
        ListEmptyComponent={renderEmptyCart}
        contentContainerStyle={cart?.items?.length === 0 ? { flex: 1 } : null}
      />
      
      {cart && cart.items && cart.items.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Итого:</Text>
            <Text style={styles.totalPrice}>{cart.total_price} ₽</Text>
          </View>
          
          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={handleCheckout}
          >
            <Text style={styles.checkoutButtonText}>Оформить заказ</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
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
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    marginVertical: 4,
    marginHorizontal: 8,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 4,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
  },
  itemPrice: {
    fontSize: 14,
    color: '#666',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  quantityText: {
    marginHorizontal: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  itemTotal: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingLeft: 8,
  },
  itemTotalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e91e63',
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
  },
  footer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
  checkoutButton: {
    backgroundColor: '#e91e63',
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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