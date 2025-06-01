import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface AuthTabsProps {
  onTabChange: (tab: string) => void;
  activeTab: string;
}

export default function AuthTabs({ onTabChange, activeTab }: AuthTabsProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => onTabChange("login")} style={styles.tabButton}>
        <Text style={[
          styles.tabText, 
          activeTab === "login" ? styles.activeText : styles.inactiveText
        ]}>
          Login
        </Text>
        {activeTab === "login" && <View style={styles.underline} />}
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => onTabChange("register")} style={styles.tabButton}>
        <Text style={[
          styles.tabText, 
          activeTab === "register" ? styles.activeText : styles.inactiveText
        ]}>
          Sign-in
        </Text>
        {activeTab === "register" && <View style={styles.underline} />}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    marginTop: 12,
    flexDirection: 'row',
    gap: 36,
  },
  tabButton: {
    paddingBottom: 4,
  },
  tabText: {
    fontSize: 18,
    fontFamily: 'Inter_400Regular',
  },
  activeText: {
    color: '#3B82F6', // blue-500
  },
  inactiveText: {
    color: '#6B7280', // gray-500
  },
  underline: {
    height: 2,
    backgroundColor: '#3B82F6', // blue-500
    marginTop: 4,
  },
});