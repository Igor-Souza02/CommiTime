import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function FamilyGateScreen() {
  const [nomeFamilia, setNomeFamilia] = useState('');
  const [codigoConvite, setCodigoConvite] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { updateUserData } = useAuth();

  const handleCreateFamily = async () => {
    if (!nomeFamilia.trim()) {
      Alert.alert('Erro', 'Por favor, insira um nome para a sua família.');
      return;
    }
    
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
      
      const response = await fetch(`${API_URL}/api/familias`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ nome: nomeFamilia }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Sucesso!', 'Sua família foi criada. Bem-vindo(a)!');
        updateUserData({ familia_id: data.familia.id, papel: 'responsavel' });
      } else {
        throw new Error(data.error || 'Não foi possível criar a família.');
      }
    } catch (error: any) {
      console.error('Erro ao criar família:', error);
      Alert.alert('Erro', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinFamily = async () => {
    if (!codigoConvite.trim()) {
      Alert.alert('Erro', 'Por favor, insira um código de convite.');
      return;
    }
    
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
      
      const response = await fetch(`${API_URL}/api/familias/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ codigo_convite: codigoConvite }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Sucesso!', 'Você entrou na família. Bem-vindo(a)!');
        updateUserData({ familia_id: data.familia.id, papel: 'dependente' });
      } else {
        throw new Error(data.error || 'Não foi possível entrar na família.');
      }
    } catch (error: any) {
      console.error('Erro ao entrar em família:', error);
      Alert.alert('Erro', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Ionicons name="people-outline" size={80} color="#4A90E2" style={styles.icon} />
      <Text style={styles.title}>Bem-vindo(a) ao CommiTime!</Text>
      <Text style={styles.subtitle}>Para continuar, crie ou junte-se a uma família.</Text>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Criar uma Nova Família</Text>
        <TextInput
          style={styles.input}
          placeholder="Nome da Família (ex: Família Silva)"
          value={nomeFamilia}
          onChangeText={setNomeFamilia}
        />
        <TouchableOpacity style={styles.button} onPress={handleCreateFamily} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Criar Família</Text>}
        </TouchableOpacity>
      </View>

      <Text style={styles.orText}>ou</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Entrar em uma Família</Text>
        <TextInput
          style={styles.input}
          placeholder="Código de Convite"
          value={codigoConvite}
          onChangeText={setCodigoConvite}
          autoCapitalize="characters"
        />
        <TouchableOpacity style={[styles.button, styles.joinButton]} onPress={handleJoinFamily} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Entrar com Código</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F8F9FA',
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6C757D',
    textAlign: 'center',
    marginBottom: 40,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#4A90E2',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  joinButton: {
    backgroundColor: '#2ECC71',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  orText: {
    fontSize: 16,
    color: '#6C757D',
    fontWeight: 'bold',
    marginVertical: 10,
  },
}); 