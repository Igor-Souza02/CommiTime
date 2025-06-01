import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Inter_400Regular } from "@expo-google-fonts/inter";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync();

interface AuthFormProps {
  buttonText: string;
  placeholderPassword: string;
  tabType?: string;
  gap: number;
  onEmailChange?: (email: string) => void;
  onUsernameChange?: (username: string) => void;
  onPasswordChange?: (password: string) => void;
  onSubmit?: () => void;
}

export default function AuthForm({
  buttonText,
  placeholderPassword,
  tabType,
  onEmailChange,
  onUsernameChange,
  onPasswordChange,
  onSubmit,
  gap,
}: AuthFormProps) {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={[styles.container, { gap: gap }]}>
      {tabType === "register" && (
        <View>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your Email"
            placeholderTextColor="#B3B3B3"
            onChangeText={onEmailChange}
          />
        </View>
      )}

      <View>
        <Text style={styles.label}>
          {tabType === "login" ? "Your email" : "Your Username"}
        </Text>
        <TextInput
          style={styles.input}
          placeholder={tabType === "login" ? "Enter Your Email" : "Ex: John12345"}
          placeholderTextColor="#B3B3B3"
          onChangeText={tabType === "login" ? onEmailChange : onUsernameChange}
        />
      </View>

      <View>
        <Text style={styles.label}>Your Password</Text>
        <TextInput
          style={styles.input}
          placeholder={placeholderPassword}
          placeholderTextColor="#B3B3B3"
          secureTextEntry={true}
          onChangeText={onPasswordChange}
        />
      </View>

      <TouchableOpacity
        onPress={onSubmit}
        style={[
          styles.button,
          tabType === "login" && styles.buttonLoginMargin
        ]}
      >
        <Text style={styles.buttonText}>{buttonText}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    width: 384, // w-96 (24rem = 384px)
    height: 240, // h-60 (15rem = 240px)
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 20,
    borderColor: '#9CA3AF', // gray-400
    marginBottom: 40,
  },
  label: {
    fontSize: 12,
    paddingBottom: 4,
    fontFamily: 'Inter_400Regular',
    color: '#000000',
  },
  input: {
    borderWidth: 1,
    borderRadius: 5,
    height: 28,
    paddingHorizontal: 8,
    borderColor: '#D1D5DB', // gray-300
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 32,
    backgroundColor: '#648DDB',
    borderRadius: 4,
  },
  buttonLoginMargin: {
    marginTop: 32,
  },
  buttonText: {
    color: '#FFFFFF',
    fontFamily: 'Inter_400Regular',
  },
});