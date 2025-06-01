import { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import AuthTabs from "../../components/authTabs";
import AuthForm from "../../components/authForm";
import { Lobster_400Regular } from "@expo-google-fonts/lobster";
import { useFonts } from "expo-font";

export default function Register() {
  const [fontsLoaded] = useFonts({
    Lobster_400Regular,
  });

  const [activeTab, setActiveTab] = useState("register");
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  if (!fontsLoaded) {
    return null;
  }

  const handleUsernameChange = (username: string) => {
    setUsername(username);
  };

  const handlePasswordChange = (password: string) => {
    setPassword(password);
  };

  const handleEmailChange = (email: string) => {
    setEmail(email);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    router.push(tab === "login" ? "/login" : "/register");
  };

  const handleRegister = async () => {
    try {
      if (!email || !username || !password) {
        alert("Preencha todos os campos");
        return;
      }

      const userData = {
        email: email,
        name: username,
        password: password,
      };

      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      };

      const response = await fetch("http://localhost:3000/api/auth/register", requestOptions);
      const data = await response.json();

      if (response.ok) {
        console.log("Registration successful:", data);
        router.push("/login");
      } else {
        console.error("Registration failed:", data.message);
        alert(data.message);
      }
    } catch (error) {
      console.error("Error during registration:", error);
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
        buttonText="Register"
        placeholderPassword=" Ex: 123456789"
        onEmailChange={handleEmailChange}
        onUsernameChange={handleUsernameChange}
        onPasswordChange={handlePasswordChange}
        gap={12}
        tabType="register"
        onSubmit={handleRegister}
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