import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { getProductDetail } from '../../api/api';
import { CartContext } from '../../context/CartContext';
import { baseUrl } from '../../config';
import { Product, CartContextType, ProductDetailParams } from '../../types';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<ProductDetailParams>();
  const productId = parseInt(id);
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [quantity, setQuantity] = useState<number>(1);
  const cartContext = useContext(CartContext) as CartContextType | undefined;
  const { addItem, loading: cartLoading, error: cartError } = cartContext || { 
    addItem: async () => {}, 
    loading: false, 
    error: null 
  };

  // Load product details on component mount
  useEffect(() => {
    loadProductDetails();
  }, [productId]);

  // Show cart error if any
  useEffect(() => {
    if (cartError) {
      Alert.alert('Ошибка', cartError);
    }
  }, [cartError]);

  // Load product details
  const loadProductDetails = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await getProductDetail(productId);
      setProduct(response.data);
    } catch (error) {
      console.error('Error loading product details:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить информацию о товаре. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  // Increase quantity
  const increaseQuantity = (): void => {
    setQuantity(prevQuantity => prevQuantity + 1);
  };

  // Decrease quantity
  const decreaseQuantity = (): void => {
    setQuantity(prevQuantity => prevQuantity > 1 ? prevQuantity - 1 : 1);
  };

  // Add to cart
  const handleAddToCart = async (): Promise<void> => {
    if (product && addItem) {
      await addItem(productId, quantity);
      Alert.alert(
        'Товар добавлен',
        `${product.name} (${quantity} шт.) добавлен в корзину`,
        [
          { text: 'Продолжить покупки', style: 'cancel' },
          { 
            text: 'Перейти в корзину', 
            onPress: () => router.push('/(tabs)/cart')
          }
        ]
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#e91e63" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.centered}>
        <Text>Товар не найден</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Product Image */}
      <Image
        source={product.image_url ? { uri: product.image_url } : require('../../assets/images/icon.png')}
        style={styles.image}
        resizeMode="contain"
      />

      {/* Product Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{product.name}</Text>
        
        <View style={styles.priceRow}>
          <Text style={styles.price}>{product.price} ₽</Text>
          {product.gram && (
            <Text style={styles.weight}>{product.gram} г</Text>
          )}
        </View>

        {/* Quantity Selector */}
        <View style={styles.quantityContainer}>
          <Text style={styles.quantityLabel}>Количество:</Text>
          <View style={styles.quantitySelector}>
            <TouchableOpacity 
              style={styles.quantityButton} 
              onPress={decreaseQuantity}
            >
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
            
            <Text style={styles.quantityValue}>{quantity}</Text>
            
            <TouchableOpacity 
              style={styles.quantityButton} 
              onPress={increaseQuantity}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Total Price */}
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Итого:</Text>
          <Text style={styles.totalPrice}>{(product.price * quantity).toFixed(2)} ₽</Text>
        </View>

        {/* Add to Cart Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddToCart}
          disabled={cartLoading}
        >
          <Text style={styles.addButtonText}>
            {cartLoading ? 'Добавление...' : 'Добавить в корзину'}
          </Text>
        </TouchableOpacity>

        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionTitle}>Описание</Text>
          <Text style={styles.description}>{product.description}</Text>
        </View>

        {/* Category */}
        {product.category && (
          <View style={styles.categoryContainer}>
            <Text style={styles.categoryLabel}>Категория:</Text>
            <Text style={styles.categoryValue}>{product.category.name}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 300,
  },
  infoContainer: {
    padding: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  price: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#e91e63',
    marginRight: 8,
  },
  weight: {
    fontSize: 16,
    color: '#666',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  quantityLabel: {
    fontSize: 16,
    marginRight: 8,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
  },
  quantityButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantityValue: {
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e91e63',
  },
  addButton: {
    backgroundColor: '#e91e63',
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 24,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  descriptionContainer: {
    marginBottom: 16,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  categoryContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  categoryValue: {
    fontSize: 16,
    color: '#666',
  },
});