import { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import AuthTabs from "../components/authTabs";
import AuthForm from "../components/authForm";
import { useFonts, Lobster_400Regular } from '@expo-google-fonts/lobster';

export default function Register() {
  const [fontsLoaded] = useFonts({
    Lobster_400Regular,
  });

  const [activeTab, setActiveTab] = useState("register");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  if (!fontsLoaded) {
    return null;
  }

  const handleUsernameChange = (name: string) => {
    setUsername(name);
  };

  const handlePasswordChange = (pw: string) => {
    setPassword(pw);
  };

  const handleEmailChange = (em: string) => {
    setEmail(em);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    router.push(tab === "login" ? "/login" : "/register");
  };

  const validateInputs = () => {
    if (!email || !username || !password) {
      Alert.alert("Erro de Validação", "Preencha todos os campos.");
      return false;
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Erro de Validação", "Digite um email válido.");
      return false;
    }

    // Validação de senha
    if (password.length < 6) {
      Alert.alert("Erro de Validação", "A senha deve ter pelo menos 6 caracteres.");
      return false;
    }

    // Validação de nome
    if (username.trim().length < 2) {
      Alert.alert("Erro de Validação", "O nome deve ter pelo menos 2 caracteres.");
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateInputs()) {
      return;
    }

    setIsLoading(true);

    try {
      console.log("🚀 Iniciando processo de registro...");
      
      const userData = {
        email: email.trim().toLowerCase(),
        name: username.trim(),
        password: password,
      };

      const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
      const endpoint = `${API_URL}/api/auth/register`;
      
      console.log("📡 API URL:", API_URL);
      console.log("🎯 Endpoint:", endpoint);
      console.log("📦 Dados sendo enviados:", {
        email: userData.email,
        name: userData.name,
        password: "[HIDDEN]"
      });

      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(userData),
      };

      console.log("🔄 Fazendo requisição...");
      
      const response = await fetch(endpoint, requestOptions);
      
      console.log("📊 Status da resposta:", response.status);
      console.log("📊 Response OK:", response.ok);
      
      // Verifica o content-type da resposta
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
          console.log("⚠️ Resposta não é JSON válido");
          throw new Error(`Resposta do servidor não é JSON válido. Content-Type: ${contentType}`);
        }
      } catch (parseError) {
        console.error("❌ Erro ao fazer parse da resposta:", parseError);
        throw new Error("Erro ao processar resposta do servidor");
      }

      if (response.ok && data.success) {
        console.log("✅ Registration successful:", data);
        Alert.alert(
          "Sucesso", 
          data.message || "Registro realizado com sucesso! Faça login agora.",
          [
            {
              text: "OK",
              onPress: () => {
                // Limpa os campos
                setEmail("");
                setUsername("");
                setPassword("");
                // Navega para login
                router.push("/login");
              }
            }
          ]
        );
      } else {
        const errorMessage = data?.error || data?.message || `Erro HTTP ${response.status}`;
        console.error("❌ Registration failed:", errorMessage);
        console.error("❌ Full error data:", data);
        
        Alert.alert(
          "Erro de Registro", 
          errorMessage,
          [{ text: "OK" }]
        );
      }

    } catch (error: any) {
      console.error("💥 Erro durante o registro:", error);
      
      let errorMessage = "Erro inesperado durante o registro.";
      
      if (error.message === "Network request failed") {
        errorMessage = `Não foi possível conectar ao servidor.\n\nVerifique se o backend está rodando em:\n${process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000"}`;
      } else if (error.message.includes("JSON")) {
        errorMessage = "Erro na comunicação com o servidor. Resposta inválida.";
      } else {
        errorMessage = error.message || "Erro inesperado.";
      }
      
      Alert.alert("Erro de Conexão", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Commi
        <Text style={styles.titleAccent}>Time</Text>!
      </Text>
      <AuthTabs onTabChange={handleTabChange} activeTab={activeTab} />
      <AuthForm
        type="register"
        email={email}
        password={password}
        username={username}
        onEmailChange={handleEmailChange}
        onUsernameChange={handleUsernameChange}
        onPasswordChange={handlePasswordChange}
        onSubmit={handleRegister}
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