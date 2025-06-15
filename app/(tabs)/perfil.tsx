import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';


interface User {
  id: number;
  name: string;
  email: string;
  createdAt?: string;
  role?: string;
}

interface CurrentUser {
  id: number;
  name: string;
  email: string;
}

export default function PerfilScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      const userData = await AsyncStorage.getItem('userData');
      
      if (!userToken) {
        console.log("loadUsers: Token não encontrado, saindo.");
        setIsLoading(false); // Pare o carregamento
        return;
      }

      if (userData) {
        setCurrentUser(JSON.parse(userData));
      }

      await loadUsers();
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      router.replace('/login');
    }
  };

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
      const userToken = await AsyncStorage.getItem('userToken');

      const response = await fetch(`${API_URL}/api/users`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else if (response.status === 401) {
        // Se o token for inválido, apenas limpe e o layout cuidará do resto
        await AsyncStorage.clear();
      } else {
        console.error('Erro ao carregar usuários:', response.status);
      }
    } catch (error) {
      console.error('Erro ao conectar com o servidor:', error);
      Alert.alert(
        'Erro de Conexão',
        'Não foi possível carregar os usuários. Verifique sua conexão.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Tem certeza que deseja sair?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              router.replace('/login');
            } catch (error) {
              console.error('Erro ao fazer logout:', error);
            }
          },
        },
      ]
    );
  };

  const handleDeleteUser = async (userId: number) => {
    Alert.alert(
      'Remover Usuário',
      'Tem certeza que deseja remover este usuário?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
                      const userToken = await AsyncStorage.getItem('userToken');


              const response = await fetch(`${API_URL}/api/users`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${userToken}`,
                  'Content-Type': 'application/json',
                },
              });

              if (response.ok) {
                Alert.alert('Sucesso', 'Usuário removido com sucesso');
                await loadUsers(); // Recarrega a lista
              } else {
                Alert.alert('Erro', 'Não foi possível remover o usuário');
              }
            } catch (error) {
              console.error('Erro ao remover usuário:', error);
              Alert.alert('Erro', 'Erro de conexão ao remover usuário');
            }
          },
        },
      ]
    );
  };

  const getRandomEmoji = () => {
    const emojis = ['👤', '👨', '👩', '🧑', '👱', '👴', '👵', '🧓'];
    return emojis[Math.floor(Math.random() * emojis.length)];
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Data não disponível';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return 'Data inválida';
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Carregando usuários...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>CommiTime</Text>
          {currentUser && (
            <Text style={styles.welcomeText}>Olá, {currentUser.name}!</Text>
          )}
        </View>
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color="#E74C3C" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Usuários Cadastrados */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            👥 Usuários Cadastrados ({users.length})
          </Text>
          
          {users.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Nenhum usuário encontrado</Text>
              <TouchableOpacity 
                style={styles.refreshButton}
                onPress={() => loadUsers()}
              >
                <Text style={styles.refreshButtonText}>Atualizar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            users.map((user) => (
              <View key={user.id} style={styles.userCard}>
                <View style={styles.userInfo}>
                  <View style={styles.emojiContainer}>
                    <Text style={styles.emoji}>{getRandomEmoji()}</Text>
                  </View>
                  <View style={styles.userDetails}>
                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.userEmail}>{user.email}</Text>
                    {user.createdAt && (
                      <Text style={styles.userDate}>
                        Cadastrado em: {formatDate(user.createdAt)}
                      </Text>
                    )}
                  </View>
                </View>
                
                <View style={styles.userActions}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => Alert.alert('Info', `Usuário: ${user.name}\nEmail: ${user.email}`)}
                  >
                    <Ionicons name="information-circle-outline" size={20} color="#4A90E2" />
                  </TouchableOpacity>
                  {currentUser && currentUser.id !== user.id && (
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => handleDeleteUser(user.id)}
                    >
                      <Ionicons name="trash-outline" size={20} color="#E74C3C" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          )}
        </View>

        {/* Estatísticas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Estatísticas</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{users.length}</Text>
              <Text style={styles.statLabel}>Total de Usuários</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {users.filter(u => u.createdAt && 
                  new Date(u.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                ).length}
              </Text>
              <Text style={styles.statLabel}>Novos (7 dias)</Text>
            </View>
          </View>
        </View>

        {/* Configurações */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ Configurações</Text>
          
          <TouchableOpacity 
            style={styles.configItem}
            onPress={() => Alert.alert('Em breve', 'Funcionalidade em desenvolvimento')}
          >
            <View style={styles.configContent}>
              <View style={styles.configIcon}>
                <Ionicons name="notifications-outline" size={24} color="#4A90E2" />
              </View>
              <View style={styles.configText}>
                <Text style={styles.configTitle}>Notificações</Text>
                <Text style={styles.configSubtitle}>Gerenciar lembretes e alertas</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.configItem}
            onPress={() => Alert.alert('Em breve', 'Funcionalidade em desenvolvimento')}
          >
            <View style={styles.configContent}>
              <View style={styles.configIcon}>
                <Ionicons name="cloud-upload-outline" size={24} color="#2ECC71" />
              </View>
              <View style={styles.configText}>
                <Text style={styles.configTitle}>Backup de Dados</Text>
                <Text style={styles.configSubtitle}>Sincronizar e fazer backup</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6C757D',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  welcomeText: {
    fontSize: 14,
    color: '#6C757D',
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: '#FFF5F5',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  emptyText: {
    fontSize: 16,
    color: '#6C757D',
    marginBottom: 16,
  },
  refreshButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emojiContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  emoji: {
    fontSize: 24,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#4A90E2',
    marginBottom: 2,
  },
  userDate: {
    fontSize: 12,
    color: '#6C757D',
  },
  userActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    flex: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6C757D',
    textAlign: 'center',
  },
  configItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2.22,
    elevation: 3,
  },
  configContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  configIcon: {
    marginRight: 16,
  },
  configText: {
    flex: 1,
  },
  configTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  configSubtitle: {
    fontSize: 14,
    color: '#6C757D',
  },
});