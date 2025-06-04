// contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, name: string, password: string) => Promise<boolean>;
  logout: () => void;
  user: User | null;
}

interface User {
  id: string;
  email: string;
  name: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Simulador de API para desenvolvimento
const mockApiCall = async (endpoint: string, data: any) => {
  // Simula delay de rede
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  if (endpoint === 'login') {
    // Simula credenciais válidas
    if (data.email === 'test@test.com' && data.password === '123456') {
      return {
        ok: true,
        json: async () => ({
          token: 'mock-jwt-token',
          user: {
            id: '1',
            email: data.email,
            name: 'Usuário Teste'
          }
        })
      };
    } else {
      return {
        ok: false,
        json: async () => ({ message: 'Credenciais inválidas' })
      };
    }
  }
  
  if (endpoint === 'register') {
    // Simula registro bem-sucedido
    return {
      ok: true,
      json: async () => ({
        message: 'Usuário criado com sucesso',
        user: {
          id: '2',
          email: data.email,
          name: data.name
        }
      })
    };
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const userData = await AsyncStorage.getItem('userData');
      
      if (token && userData) {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
        router.replace('/(tabs)');
      } else {
        router.replace('/login');
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      router.replace('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const userData = {
        email: email,
        password: password,
      };

      // Primeiro tenta a API real
      let response;
      try {
        response = await fetch("http://localhost:3000/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        });
      } catch (networkError) {
        console.log('API não disponível, usando mock');
        // Se falhar, usa o mock
        response = await mockApiCall('login', userData);
      }

      if (!response) {
        Alert.alert('Erro', 'Falha na conexão. Tente novamente.');
        return false;
      }

      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.setItem('authToken', data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(data.user));
        
        setUser(data.user);
        setIsAuthenticated(true);
        
        router.replace('/(tabs)');
        return true;
      } else {
        Alert.alert('Erro', data.message || 'Credenciais inválidas');
        return false;
      }
    } catch (error) {
      console.error('Error during login:', error);
      Alert.alert('Erro', 'Falha na conexão. Tente novamente.');
      return false;
    }
  };

  const register = async (email: string, name: string, password: string): Promise<boolean> => {
    try {
      const userData = {
        email: email,
        name: name,
        password: password,
      };

      // Primeiro tenta a API real
      let response;
      try {
        response = await fetch("http://localhost:3000/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        });
      } catch (networkError) {
        console.log('API não disponível, usando mock');
        // Se falhar, usa o mock
        response = await mockApiCall('register', userData);
      }

      if (!response) {
        Alert.alert('Erro', 'Falha na conexão. Tente novamente.');
        return false;
      }

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Sucesso', 'Conta criada com sucesso!', [
          {
            text: 'OK',
            onPress: () => router.push('/login')
          }
        ]);
        return true;
      } else {
        Alert.alert('Erro', data.message || 'Erro ao criar conta');
        return false;
      }
    } catch (error) {
      console.error('Error during registration:', error);
      Alert.alert('Erro', 'Falha na conexão. Tente novamente.');
      return false;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
      setUser(null);
      setIsAuthenticated(false);
      router.replace('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      isLoading,
      login,
      register,
      logout,
      user
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}