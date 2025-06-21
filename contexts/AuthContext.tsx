import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useSegments } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';

// 1. DEFINIÇÃO DAS ESTRUTURAS DE DADOS
interface AuthData {
  token: string;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  familia_id?: string;
  papel?: 'responsavel' | 'dependente';
  papel_detalhado?: 'dono' | 'pai' | 'mae' | 'filho' | 'filha';
}

interface AuthContextData {
  authData?: AuthData;
  userData?: UserData;
  loading: boolean;
  signIn(authData: AuthData, userData: UserData): Promise<void>;
  signOut(): void;
  updateUserData(newUserData: Partial<UserData>): void;
}

// 2. CRIAÇÃO DO CONTEXTO
const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// 3. HOOK PÚBLICO PARA ACESSAR O CONTEXTO
export function useAuth() {
  return useContext(AuthContext);
}

// 4. HOOK DE LÓGICA DE REDIRECIONAMENTO
function useProtectedRoute(user: UserData | undefined, loading: boolean) {
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // Se estiver carregando os dados, não faz nada ainda.
    if (loading) return;

    // Pega o nome da rota atual. O expo-router pode ter segmentos vazios no início.
    const currentRoute = segments.length > 0 ? segments[segments.length - 1] : null;

    // Define quais rotas são públicas (não precisam de login)
    const isPublicRoute = currentRoute === 'login' || currentRoute === 'register';
    const isFamilyGate = currentRoute === 'family-gate';
    
    // Se não há usuário e a rota atual NÃO é pública, redireciona para o login.
    if (!user && !isPublicRoute) {
      router.replace('/login');
    } 
    // Se há usuário, mas ele não tem família E não está na tela de família, redireciona para lá.
    else if (user && !user.familia_id && !isFamilyGate) {
      router.replace('/family-gate');
    } 
    // Se há usuário E família, mas ele está em uma rota pública ou na de família, redireciona para dentro do app.
    else if (user && user.familia_id && (isPublicRoute || isFamilyGate)) {
      router.replace('/calendario');
    }
  }, [user, segments, loading, router]);
}

// 5. O PROVEDOR DO CONTEXTO
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authData, setAuthData] = useState<AuthData>();
  const [userData, setUserData] = useState<UserData>();
  const [loading, setLoading] = useState(true);

  // Hook que executa a lógica de redirecionamento
  useProtectedRoute(userData, loading);

  useEffect(() => {
    async function loadStoragedData() {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const userJson = await AsyncStorage.getItem('userData');
        if (token && userJson) {
          setAuthData({ token });
          setUserData(JSON.parse(userJson));
        }
      } catch (error) {
        console.error("Failed to load auth data from storage", error);
      } finally {
        setLoading(false);
      }
    }
    loadStoragedData();
  }, []);

  const signIn = async (newAuthData: AuthData, newUserData: UserData) => {
    try {
      await AsyncStorage.setItem('userToken', newAuthData.token);
      await AsyncStorage.setItem('userData', JSON.stringify(newUserData));
      setAuthData(newAuthData);
      setUserData(newUserData);
      // O hook 'useProtectedRoute' cuidará do redirecionamento
    } catch (error) {
      console.error("Failed to sign in", error);
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.multiRemove(['userToken', 'userData']);
      setAuthData(undefined);
      setUserData(undefined);
      // O hook 'useProtectedRoute' cuidará do redirecionamento
    } catch (error) {
      console.error("Failed to sign out", error);
    }
  };

  const updateUserData = (newUserData: Partial<UserData>) => {
    setUserData(prev => {
      if (!prev) return undefined;
      const updatedUser = { ...prev, ...newUserData };
      AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  return (
    <AuthContext.Provider value={{ authData, userData, loading, signIn, signOut, updateUserData }}>
      {children}
    </AuthContext.Provider>
  );
}