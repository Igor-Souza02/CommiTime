// app/_layout.tsx
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

// Previne a splash screen de se esconder automaticamente
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  // O hook de proteção de rota agora está dentro do AuthProvider e funciona corretamente
  const { loading: authLoading } = useAuth();
  
  const [fontsLoaded] = useFonts({
    // Adicione suas fontes customizadas aqui se necessário
  });

  useEffect(() => {
    // Esconde a splash screen apenas quando as fontes E a autenticação terminarem de carregar
    if (fontsLoaded && !authLoading) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, authLoading]);

  // Não renderiza nada até que tudo esteja pronto
  if (!fontsLoaded || authLoading) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="family-gate" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}