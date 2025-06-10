import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Alert, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { useFonts, Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter';
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

import AuthTabs from "@/components/authTabs";
import AuthForm from "@/components/authForm";

// Previne o splash screen de se esconder automaticamente
SplashScreen.preventAutoHideAsync();

export default function Login() {
  const [activeTab, setActiveTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  // Carrega as fontes Inter
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // Verifica se já existe um usuário logado
  useEffect(() => {
    checkLoggedInUser();
  }, []);

  const checkLoggedInUser = async () => {
    try {
      const userToken = await SimpleStorage.getItem('userToken');
      if (userToken) {
        console.log("👤 Usuário já logado, redirecionando...");
        router.replace('/(tabs)/perfil');
      }
    } catch (error) {
      console.log('Erro ao verificar usuário logado:', error);
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  const validateInputs = () => {
    if (!email || !password) {
      Alert.alert("Erro de Validação", "Por favor, preencha todos os campos");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Erro de Validação", "Digite um email válido");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateInputs()) {
      return;
    }

    setIsLoading(true);

    try {
      if (activeTab === "login") {
        await handleLogin();
      } else {
        // Redireciona para tela de cadastro
        router.push('/register');
      }
    } catch (error: any) {
      console.error("Erro durante o submit:", error);
      Alert.alert(
        "Erro de Conexão", 
        `Não foi possível conectar ao servidor. Verifique se o backend está rodando. Detalhes: ${error.message}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
    const endpoint = `${API_URL}/api/auth/login`;
    
    const loginData = {
      email: email.trim().toLowerCase(),
      password: password,
    };

    console.log("🔐 Iniciando login...");
    console.log("📡 Endpoint:", endpoint);
    console.log("📦 Dados:", { email: loginData.email, password: "[HIDDEN]" });

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(loginData),
    });

    console.log("📊 Status da resposta:", response.status);

    const contentType = response.headers.get("content-type");
    console.log("📋 Content-Type:", contentType);

    let data;
    try {
      const responseText = await response.text();
      console.log("📄 Resposta bruta:", responseText);
      
      if (contentType && contentType.includes("application/json")) {
        data = responseText ? JSON.parse(responseText) : {};
        console.log("📋 Dados JSON parseados:", data);
      } else {
        throw new Error(`Resposta do servidor não é JSON válido. Content-Type: ${contentType}`);
      }
    } catch (parseError) {
      console.error("❌ Erro ao fazer parse da resposta:", parseError);
      throw new Error("Erro ao processar resposta do servidor");
    }

    if (response.ok && data.success) {
      console.log("✅ Login successful:", data);
      
      // Salva o token e informações do usuário
      await SimpleStorage.setItem('userToken', data.token);
      await SimpleStorage.setItem('userData', JSON.stringify(data.user));
      
      Alert.alert(
        "Sucesso", 
        data.message || "Login realizado com sucesso!", 
        [
          {
            text: "OK",
            onPress: () => {
              // Limpa os campos
              setEmail("");
              setPassword("");
              // Navega para a tela de perfil
              router.replace('/(tabs)/perfil');
            }
          }
        ]
      );
    } else {
      const errorMessage = data?.error || data?.message || "Credenciais inválidas";
      console.error("❌ Login failed:", errorMessage);
      Alert.alert("Erro de Login", errorMessage);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "register") {
      router.push('/register');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>CommiTime</Text>
          <Text style={styles.subtitle}>
            Gerencie seu tempo com eficiência
          </Text>
        </View>

        <View style={styles.authContainer}>
          <AuthTabs 
            activeTab={activeTab} 
            onTabChange={handleTabChange}
          />
          
          <View style={styles.formContainer}>
            <AuthForm
              type="login"
              email={email}
              password={password}
              onEmailChange={(value) => setEmail(value)}
              onPasswordChange={(value) => setPassword(value)}
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    fontFamily: 'Inter_600SemiBold',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
  },
  authContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  formContainer: {
    marginTop: 40,
  },
});