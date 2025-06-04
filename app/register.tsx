// app/login.tsx
import { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import AuthTabs from "../components/authTabs";
import AuthForm from "../components/authForm";
import { Lobster_400Regular } from "@expo-google-fonts/lobster";
import { useFonts } from "expo-font";

export default function Login() {
  const [activeTab, setActiveTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { login } = useAuth();

  const [fontsLoaded] = useFonts({
    Lobster_400Regular,
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    router.push(tab === "login" ? "/login" : "/register");
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erro", "Preencha todos os campos");
      return;
    }

    setIsLoading(true);
    const success = await login(email, password);
    setIsLoading(false);

    // Se chegou até aqui e não teve sucesso, o erro já foi mostrado no AuthContext
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Commi
        <Text style={styles.titleAccent}>Time!</Text>
      </Text>

      <AuthTabs activeTab={activeTab} onTabChange={handleTabChange} />

      <AuthForm
        type="login"
        email={email}
        password={password}
        onEmailChange={handleEmailChange}
        onPasswordChange={handlePasswordChange}
        onSubmit={handleLogin}
        isLoading={isLoading}
      />

      <View style={styles.testCredentials}>
        <Text style={styles.testTitle}>Credenciais de teste:</Text>
        <Text style={styles.testText}>Email: test@test.com</Text>
        <Text style={styles.testText}>Senha: 123456</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 20,
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
  testCredentials: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  testTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 5,
  },
  testText: {
    fontSize: 12,
    color: '#92400E',
  },
});