import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { router } from 'expo-router';
import { AuthContext } from '../../context/AuthContext';
import { AuthContextType } from '../../types';

export default function LoginScreen() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const authContext = useContext(AuthContext) as AuthContextType | undefined;
  const { login, loading, error, isAuthenticated } = authContext || {
    login: async () => false,
    loading: false,
    error: null,
    isAuthenticated: false
  };

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.back();
    }
  }, [isAuthenticated]);

  // Show error if any
  useEffect(() => {
    if (error) {
      Alert.alert('Ошибка', error);
    }
  }, [error]);

  // Validate email
  const validateEmail = (): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email обязателен');
      return false;
    } else if (!emailRegex.test(email)) {
      setEmailError('Введите корректный email');
      return false;
    } else {
      setEmailError('');
      return true;
    }
  };

  // Validate password
  const validatePassword = (): boolean => {
    if (!password) {
      setPasswordError('Пароль обязателен');
      return false;
    } else if (password.length < 6) {
      setPasswordError('Пароль должен содержать минимум 6 символов');
      return false;
    } else {
      setPasswordError('');
      return true;
    }
  };

  // Handle login
  const handleLogin = async (): Promise<void> => {
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();

    if (isEmailValid && isPasswordValid && login) {
      const success = await login(email, password);
      if (success) {
        router.back();
      }
    }
  };

  // Handle register navigation
  const handleRegisterNavigation = (): void => {
    router.push('/auth/register');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Вход в аккаунт</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, emailError ? styles.inputError : null]}
              value={email}
              onChangeText={setEmail}
              placeholder="Введите ваш email"
              keyboardType="email-address"
              autoCapitalize="none"
              onBlur={validateEmail}
            />
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Пароль</Text>
            <TextInput
              style={[styles.input, passwordError ? styles.inputError : null]}
              value={password}
              onChangeText={setPassword}
              placeholder="Введите ваш пароль"
              secureTextEntry
              onBlur={validatePassword}
            />
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
          </View>
          
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.loginButtonText}>Войти</Text>
            )}
          </TouchableOpacity>
          
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Еще нет аккаунта?</Text>
            <TouchableOpacity onPress={handleRegisterNavigation}>
              <Text style={styles.registerLink}>Зарегистрироваться</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    padding: 20,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#f44336',
  },
  errorText: {
    color: '#f44336',
    fontSize: 14,
    marginTop: 4,
  },
  loginButton: {
    backgroundColor: '#e91e63',
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  registerText: {
    fontSize: 14,
    color: '#666',
    marginRight: 4,
  },
  registerLink: {
    fontSize: 14,
    color: '#e91e63',
    fontWeight: '500',
  },
});