import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Alert, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { useFonts, Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { Lobster_400Regular } from '@expo-google-fonts/lobster';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  // Carrega as fontes Inter e Lobster para consistência
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Lobster_400Regular,
  });

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
      await AsyncStorage.setItem('userToken', data.token);
      await AsyncStorage.setItem('userData', JSON.stringify(data.user));
      
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
    <View style={styles.container}>
      <Text style={styles.title}>
        Commi
        <Text style={styles.titleAccent}>Time</Text>!
      </Text>
      
      <AuthTabs 
        activeTab={activeTab} 
        onTabChange={handleTabChange}
      />
      
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
  },
  title: {
    fontSize: 72,
    fontFamily: 'Lobster_400Regular',
    marginBottom: 144,
    color: '#000000',
  },
  titleAccent: {
    color: '#0EA5E9',
  },
});