import { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import AuthTabs from "@/components/authTabs";
import AuthForm from "../../components/authForm";
import { Lobster_400Regular } from "@expo-google-fonts/lobster";
import { useFonts } from "expo-font";

export default function Login() {
  const [activeTab, setActiveTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();

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

  const handlepasswordchange = (text: string) => {
    setPassword(text);
  };

  const handleLogin = async () => {
    try {
      if (!email || !password) {
        console.log("email", email, "password", password);
        alert("Preencha todos os campos");
        return;
      }

      const userData = {
        email: email,
        password: password,
      };

      const requestOpstions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      };

      const response = await fetch(
        "http://localhost:3000/api/auth/login",
        requestOpstions
      );
      const data = await response.json();

      if (response.ok) {
        router.push("/calendario");
      } else {
        alert("Erro ao realizar login");
      }
      console.log("Login response:", data);
    } catch (error) {
      console.error("Error during login:", error);
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
        buttonText="Continue"
        placeholderPassword="Enter your Password"
        onEmailChange={handleEmailChange}
        onPasswordChange={handlepasswordchange}
        onSubmit={handleLogin}
        gap={16}
        tabType="login"
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
    fontSize: 72, // text-7xl
    fontFamily: 'Lobster_400Regular',
    marginBottom: 144, // mb-36 (9rem = 144px)
    color: '#000000',
  },
  titleAccent: {
    color: '#0EA5E9', // sky-500
  },
});