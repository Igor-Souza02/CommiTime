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
    try {
      const success = await login(email, password);
      if (!success) {
        Alert.alert("Erro", "Email ou senha incorretos");
      }
    } catch (error) {
      Alert.alert("Erro", "Ocorreu um erro durante o login");
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
        email={email}
        password={password}
        onEmailChange={handleEmailChange}
        onPasswordChange={handlePasswordChange}
        onSubmit={handleLogin}
        isLoading={isLoading}
        type="login"
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