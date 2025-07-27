import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login, register, getUserProfile } from '../api/api';
import { User, AuthContextType } from '../types';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is logged in on app start
  useEffect(() => {
    const loadToken = async (): Promise<void> => {
      try {
        const storedToken = await AsyncStorage.getItem('authToken');
        if (storedToken) {
          setToken(storedToken);
          await loadUserProfile();
        }
      } catch (err) {
        console.error('Error loading auth token:', err);
      } finally {
        setLoading(false);
      }
    };

    loadToken();
  }, []);

  // Load user profile
  const loadUserProfile = async (): Promise<void> => {
    try {
      const response = await getUserProfile();
      setUser(response.data);
    } catch (err) {
      console.error('Error loading user profile:', err);
      // If we can't load the profile, the token might be invalid
      await logout();
    }
  };

  // Login user
  const loginUser = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await login(email, password);
      const { token } = response.data;
      
      // Save token to storage
      await AsyncStorage.setItem('authToken', token);
      setToken(token);
      
      // Load user profile
      await loadUserProfile();
      
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
      console.error('Login error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Register user
  const registerUser = async (username: string, email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await register(username, email, password);
      const { token } = response.data;
      
      // Save token to storage
      await AsyncStorage.setItem('authToken', token);
      setToken(token);
      
      // Load user profile
      await loadUserProfile();
      
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      console.error('Registration error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem('authToken');
      setToken(null);
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        isAuthenticated: !!token,
        login: loginUser,
        register: registerUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};