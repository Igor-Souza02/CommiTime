// app/_layout.tsx
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { useEffect, useState } from 'react';
import { useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

// Simulação simples de storage para desenvolvimento
const SimpleStorage = {
  async getItem(key: string): Promise<string | null> {
    return (globalThis as any)[`storage_${key}`] || null;
  },
  async setItem(key: string, value: string): Promise<void> {
    (globalThis as any)[`storage_${key}`] = value;
  },
  async clear(): Promise<void> {
    const keys = Object.keys(globalThis as any).filter(key => key.startsWith('storage_'));
    keys.forEach(key => delete (globalThis as any)[key]);
  }
};

// Previne a splash screen de se esconder automaticamente
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    // Adicione suas fontes customizadas aqui se necessário
  });
  
  const [initialRoute, setInitialRoute] = useState<string | null>(null);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
      checkInitialRoute();
    }
  }, [loaded]);

  const checkInitialRoute = async () => {
    try {
      const userToken = await SimpleStorage.getItem('userToken');
      
      if (userToken) {
        // Usuário já está logado, redireciona para perfil
        setInitialRoute('/(tabs)/perfil');
        if (!segments.length || segments[0] === 'login') {
          router.replace('/(tabs)/perfil');
        }
      } else {
        // Usuário não está logado, vai para login
        setInitialRoute('/login');
        if (!segments.length || segments[0] === '(tabs)') {
          router.replace('/login');
        }
      }
    } catch (error) {
      console.error('Erro ao verificar rota inicial:', error);
      setInitialRoute('/login');
      router.replace('/login');
    }
  };

  // Proteção de rotas
  useEffect(() => {
    if (!loaded || !initialRoute) return;

    const checkAuth = async () => {
      const userToken = await SimpleStorage.getItem('userToken');
      const inAuthGroup = segments[0] === '(tabs)';
      
      if (!userToken && inAuthGroup) {
        // Usuário não logado tentando acessar área protegida
        router.replace('/login');
      }
    };

    checkAuth();
  }, [segments, loaded, initialRoute]);

  if (!loaded) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}