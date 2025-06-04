import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

export default function Perfil() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      "Sair",
      "Tem certeza que deseja sair?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Sair",
          style: "destructive",
          onPress: () => logout()
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Perfil da Família</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Membros da Família</Text>

      {/* Informações do usuário logado */}
      {user && (
        <View style={styles.userInfo}>
          <Text style={styles.userName}>Bem-vindo, {user.name}!</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>
      )}

      {/* Seus componentes existentes aqui */}
      
      {/* Estatísticas */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>4</Text>
          <Text style={styles.statLabel}>Membros</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>2</Text>
          <Text style={styles.statLabel}>Crianças</Text>
        </View>
      </View>

      {/* Configurações */}
      <View style={styles.configSection}>
        <Text style={styles.configTitle}>Configurações</Text>
        
        <TouchableOpacity style={styles.configItem}>
          <Ionicons name="notifications-outline" size={24} color="#666" />
          <Text style={styles.configText}>Notificações</Text>
          <Text style={styles.configSubtext}>Gerenciar lembretes e alertas</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.configItem}>
          <Ionicons name="cloud-upload-outline" size={24} color="#666" />
          <Text style={styles.configText}>Backup de Dados</Text>
          <Text style={styles.configSubtext}>Sincronizar dados na nuvem</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.configItem} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#ff4444" />
          <Text style={[styles.configText, { color: '#ff4444' }]}>Sair</Text>
          <Text style={styles.configSubtext}>Fazer logout da conta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  addButton: {
    backgroundColor: '#4A90E2',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  userInfo: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  configSection: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  configTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
  },
  configItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  configText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginLeft: 15,
    flex: 1,
  },
  configSubtext: {
    fontSize: 12,
    color: '#999',
    marginLeft: 15,
    flex: 2,
  },
});