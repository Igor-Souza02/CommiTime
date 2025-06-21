import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Clipboard,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface Familia {
  id: string;
  nome: string;
  codigo_convite: string;
}

interface Membro {
  id: string;
  name: string;
  email: string;
  papel: 'responsavel' | 'dependente';
  papel_detalhado?: string;
}

export default function PerfilScreen() {
  const [familia, setFamilia] = useState<Familia | null>(null);
  const [membros, setMembros] = useState<Membro[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { signOut, userData, authData } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authData?.token) {
      loadFamilia();
    }
  }, [authData]);

  const loadFamilia = async () => {
    if (!authData?.token) return;

    try {
      setIsLoading(true);
      const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
      
      const response = await fetch(`${API_URL}/api/familias/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authData.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFamilia(data.familia);
        setMembros(data.membros || []);
      } else {
        console.error('Erro ao carregar dados da família:', response.status);
      }
    } catch (error) {
      console.error('Erro ao conectar com o servidor:', error);
      Alert.alert('Erro de Conexão', 'Não foi possível carregar os dados da sua família.');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFamilia();
    setRefreshing(false);
  };

  const copyToClipboard = () => {
    if (familia?.codigo_convite) {
      Clipboard.setString(familia.codigo_convite);
      Alert.alert('Copiado!', 'O código de convite foi copiado para a área de transferência.');
    }
  };

  const getRoleStyle = (role?: string) => {
    if (role === 'dono' || role === 'responsavel' || role === 'pai' || role === 'mae') {
        return styles.roleResponsavel;
    }
    return styles.roleDependente;
  };

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: signOut },
      ]
    );
  };

  const handleDeleteUser = async (userId: string) => {
    if (!authData?.token) {
      Alert.alert('Erro', 'Você não está autenticado para realizar esta ação.');
      return;
    }
    
    Alert.alert(
      'Remover Usuário',
      'Tem certeza que deseja remover este usuário?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
              const response = await fetch(`${API_URL}/api/users/${userId}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${authData.token}`,
                  'Content-Type': 'application/json',
                },
              });

              if (response.ok) {
                Alert.alert('Sucesso', 'Usuário removido com sucesso');
                await loadFamilia();
              } else {
                const data = await response.json();
                Alert.alert('Erro', data.error || 'Não foi possível remover o usuário');
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

  const currentUserDisplay = userData ? (
    <View style={styles.userInfo}>
      <Text style={styles.userName}>{userData.name}</Text>
      <Text style={styles.userEmail}>{userData.email}</Text>
      {(userData.papel_detalhado || userData.papel) && 
        <Text style={styles.userRole}>
          {(userData.papel_detalhado || userData.papel)!.charAt(0).toUpperCase() + (userData.papel_detalhado || userData.papel)!.slice(1)}
        </Text>
      }
    </View>
  ) : null;

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
          {currentUserDisplay}
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
        {/* 4. SEÇÃO DA FAMÍLIA */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{familia?.nome || 'Minha Família'}</Text>
          {userData?.papel === 'responsavel' && familia && (
            <View style={styles.inviteContainer}>
              <Text style={styles.inviteLabel}>Código de Convite:</Text>
              <View style={styles.inviteCodeBox}>
                <Text style={styles.inviteCode}>{familia.codigo_convite}</Text>
                <TouchableOpacity onPress={copyToClipboard}>
                  <Ionicons name="copy-outline" size={24} color="#4A90E2" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* 5. SEÇÃO DE MEMBROS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Membros da Família</Text>
          {membros.map(membro => (
            <View key={membro.id} style={styles.userCard}>
              <View>
                <Text style={styles.userName}>{membro.name}</Text>
                <Text style={styles.userEmail}>{membro.email}</Text>
              </View>
              <View style={[styles.roleBadge, getRoleStyle(membro.papel_detalhado || membro.papel)]}>
                <Text style={styles.roleText}>{(membro.papel_detalhado || membro.papel).charAt(0).toUpperCase() + (membro.papel_detalhado || membro.papel).slice(1)}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Estatísticas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Estatísticas</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{membros.length}</Text>
              <Text style={styles.statLabel}>Total de Membros</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {membros.filter(m => m.papel === 'responsavel').length}
              </Text>
              <Text style={styles.statLabel}>Responsáveis</Text>
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
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  inviteContainer: {
    // estilos para a seção de convite
  },
  inviteLabel: {
    fontSize: 14,
    color: '#6C757D',
  },
  inviteCodeBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  inviteCode: {
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 2,
    color: '#4A90E2',
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  roleResponsavel: {
    backgroundColor: '#2ECC71', // Verde para responsável
  },
  roleDependente: {
    backgroundColor: '#F39C12', // Laranja para dependente
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
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
  },
  userEmail: {
    fontSize: 14,
    color: '#6C757D',
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
  userRole: {
    fontSize: 12,
    color: '#4A90E2',
    fontWeight: 'bold',
    backgroundColor: '#E9F5FD',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
    alignSelf: 'flex-start',
    overflow: 'hidden',
  },
});