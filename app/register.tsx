import { Lobster_400Regular, useFonts } from '@expo-google-fonts/lobster';
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import AuthForm from "../components/authForm";
import AuthTabs from "../components/authTabs";

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
      const userData = {
        email: email.trim().toLowerCase(),
        name: username.trim(),
        password: password,
      };

      const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          "Sucesso!",
          "Sua conta foi criada. Por favor, faça o login para continuar.",
          [
            {
              text: "Ir para Login",
              onPress: () => router.push("/login"),
            },
          ]
        );
      } else {
        throw new Error(data.error || data.message || "Não foi possível criar a conta.");
      }
    } catch (error: any) {
      console.error("Erro no registro:", error);
      Alert.alert("Erro de Registro", error.message);
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
    marginBottom: 120,
    color: '#000000',
  },
  titleAccent: {
    color: '#0EA5E9',
  },
});