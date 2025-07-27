import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { AuthContext } from '../../context/AuthContext';
import { getOrders } from '../../api/api';
import { AuthContextType } from '../../types';

export default function ProfileScreen() {
  const { initialTab } = useLocalSearchParams<{ initialTab?: string }>();
  const authContext = useContext(AuthContext) as AuthContextType;
  const { user, isAuthenticated, logout } = authContext || { 
    user: null, 
    isAuthenticated: false, 
    logout: async () => {} 
  };
  
  const [activeTab, setActiveTab] = useState('profile');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Set initial tab from URL params if provided
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Load orders when tab is 'orders' and user is authenticated
  useEffect(() => {
    if (activeTab === 'orders' && isAuthenticated) {
      loadOrders();
    }
  }, [activeTab, isAuthenticated]);

  // Load orders from API
  const loadOrders = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const response = await getOrders();
      setOrders(response.data);
    } catch (error) {
      console.error('Error loading orders:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить заказы. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  // Handle logout
  const handleLogout = () => {
    Alert.alert(
      'Выход из аккаунта',
      'Вы уверены, что хотите выйти?',
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Выйти', onPress: logout }
      ]
    );
  };

  // Handle login
  const handleLogin = () => {
    router.push('/auth/login');
  };

  // Handle register
  const handleRegister = () => {
    router.push('/auth/register');
  };

  // Render profile tab
  const renderProfileTab = () => {
    if (!isAuthenticated) {
      return (
        <View style={styles.authContainer}>
          <Text style={styles.authTitle}>Войдите в аккаунт</Text>
          <Text style={styles.authDescription}>
            Войдите в аккаунт, чтобы видеть историю заказов и управлять своим профилем
          </Text>
          
          <TouchableOpacity
            style={styles.authButton}
            onPress={handleLogin}
          >
            <Text style={styles.authButtonText}>Войти</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.authButton, styles.registerButton]}
            onPress={handleRegister}
          >
            <Text style={styles.registerButtonText}>Зарегистрироваться</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.profileContainer}>
        <View style={styles.userInfoSection}>
          <Text style={styles.userName}>{user?.first_name} {user?.last_name}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          {user?.phone_number && (
            <Text style={styles.userPhone}>{user.phone_number}</Text>
          )}
        </View>
        
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Выйти из аккаунта</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Render orders tab
  const renderOrdersTab = () => {
    if (!isAuthenticated) {
      return (
        <View style={styles.authContainer}>
          <Text style={styles.authTitle}>Войдите в аккаунт</Text>
          <Text style={styles.authDescription}>
            Войдите в аккаунт, чтобы видеть историю заказов
          </Text>
          
          <TouchableOpacity
            style={styles.authButton}
            onPress={handleLogin}
          >
            <Text style={styles.authButtonText}>Войти</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (loading && !refreshing) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#e91e63" />
        </View>
      );
    }

    if (orders.length === 0) {
      return (
        <ScrollView
          contentContainerStyle={styles.emptyOrdersContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#e91e63']}
            />
          }
        >
          <Text style={styles.emptyOrdersText}>У вас пока нет заказов</Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => router.push('/(tabs)/')}
          >
            <Text style={styles.shopButtonText}>Перейти к покупкам</Text>
          </TouchableOpacity>
        </ScrollView>
      );
    }

    return (
      <ScrollView
        style={styles.ordersContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#e91e63']}
          />
        }
      >
        {orders.map(order => (
          <View key={order.id} style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <Text style={styles.orderNumber}>Заказ #{order.id}</Text>
              <Text style={styles.orderDate}>
                {new Date(order.order_date).toLocaleDateString()}
              </Text>
            </View>
            
            <View style={styles.orderStatus}>
              <Text style={styles.orderStatusLabel}>Статус:</Text>
              <Text style={[
                styles.orderStatusValue,
                order.status === 'delivered' && styles.statusDelivered,
                order.status === 'cancelled' && styles.statusCancelled
              ]}>
                {order.status === 'pending' && 'Ожидается'}
                {order.status === 'processing' && 'В обработке'}
                {order.status === 'shipped' && 'Отправлен'}
                {order.status === 'delivered' && 'Доставлен'}
                {order.status === 'cancelled' && 'Отменен'}
              </Text>
            </View>
            
            <Text style={styles.orderProducts}>{order.products}</Text>
            
            <View style={styles.orderFooter}>
              <Text style={styles.orderAddress}>{order.shipping_address}</Text>
              <Text style={styles.orderTotal}>{order.total_price} ₽</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'profile' && styles.activeTab]}
          onPress={() => setActiveTab('profile')}
        >
          <Text style={[styles.tabText, activeTab === 'profile' && styles.activeTabText]}>
            Профиль
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'orders' && styles.activeTab]}
          onPress={() => setActiveTab('orders')}
        >
          <Text style={[styles.tabText, activeTab === 'orders' && styles.activeTabText]}>
            Заказы
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Tab Content */}
      <View style={styles.tabContent}>
        {activeTab === 'profile' ? renderProfileTab() : renderOrdersTab()}
      </View>
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
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#e91e63',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#e91e63',
    fontWeight: 'bold',
  },
  tabContent: {
    flex: 1,
  },
  // Profile Tab Styles
  profileContainer: {
    padding: 20,
  },
  userInfoSection: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 16,
    color: '#666',
  },
  logoutButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#e91e63',
    fontSize: 16,
    fontWeight: '500',
  },
  // Orders Tab Styles
  ordersContainer: {
    padding: 10,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
  },
  orderStatus: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  orderStatusLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  orderStatusValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ff9800',
  },
  statusDelivered: {
    color: '#4caf50',
  },
  statusCancelled: {
    color: '#f44336',
  },
  orderProducts: {
    fontSize: 14,
    color: '#444',
    marginBottom: 12,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  orderAddress: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    marginRight: 8,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e91e63',
  },
  emptyOrdersContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyOrdersText: {
    fontSize: 16,
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
  // Auth Container Styles
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  authTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  authDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  authButton: {
    backgroundColor: '#e91e63',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 4,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  authButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e91e63',
  },
  registerButtonText: {
    color: '#e91e63',
    fontSize: 16,
    fontWeight: 'bold',
  },
});