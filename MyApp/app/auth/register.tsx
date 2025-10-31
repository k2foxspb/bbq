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

export default function RegisterScreen() {
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [usernameError, setUsernameError] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [confirmPasswordError, setConfirmPasswordError] = useState<string>('');
  
  const authContext = useContext(AuthContext) as AuthContextType | undefined;
  const { register, loading, error, isAuthenticated } = authContext || {
    register: async () => false,
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

  // Validate username
  const validateUsername = (): boolean => {
    if (!username) {
      setUsernameError('Имя пользователя обязательно');
      return false;
    } else if (username.length < 3) {
      setUsernameError('Имя пользователя должно содержать минимум 3 символа');
      return false;
    } else {
      setUsernameError('');
      return true;
    }
  };

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

  // Validate confirm password
  const validateConfirmPassword = (): boolean => {
    if (!confirmPassword) {
      setConfirmPasswordError('Подтверждение пароля обязательно');
      return false;
    } else if (confirmPassword !== password) {
      setConfirmPasswordError('Пароли не совпадают');
      return false;
    } else {
      setConfirmPasswordError('');
      return true;
    }
  };

  // Handle register
  const handleRegister = async (): Promise<void> => {
    const isUsernameValid = validateUsername();
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    const isConfirmPasswordValid = validateConfirmPassword();

    if (isUsernameValid && isEmailValid && isPasswordValid && isConfirmPasswordValid && register) {
      const success = await register(username, email, password);
      if (success) {
        Alert.alert(
          'Регистрация успешна',
          'Вы успешно зарегистрировались!',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      }
    }
  };

  // Handle login navigation
  const handleLoginNavigation = (): void => {
    router.push('/auth/login');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Регистрация</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Имя пользователя</Text>
            <TextInput
              style={[styles.input, usernameError ? styles.inputError : null]}
              value={username}
              onChangeText={setUsername}
              placeholder="Введите имя пользователя"
              autoCapitalize="none"
              onBlur={validateUsername}
            />
            {usernameError ? <Text style={styles.errorText}>{usernameError}</Text> : null}
          </View>
          
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
              placeholder="Введите пароль"
              secureTextEntry
              onBlur={validatePassword}
            />
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Подтверждение пароля</Text>
            <TextInput
              style={[styles.input, confirmPasswordError ? styles.inputError : null]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Подтвердите пароль"
              secureTextEntry
              onBlur={validateConfirmPassword}
            />
            {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}
          </View>
          
          <TouchableOpacity
            style={styles.registerButton}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.registerButtonText}>Зарегистрироваться</Text>
            )}
          </TouchableOpacity>
          
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Уже есть аккаунт?</Text>
            <TouchableOpacity onPress={handleLoginNavigation}>
              <Text style={styles.loginLink}>Войти</Text>
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
  registerButton: {
    backgroundColor: '#e91e63',
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 8,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    fontSize: 14,
    color: '#666',
    marginRight: 4,
  },
  loginLink: {
    fontSize: 14,
    color: '#e91e63',
    fontWeight: '500',
  },
});