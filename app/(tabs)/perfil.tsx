import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FamilyMember {
  id: number;
  name: string;
  role: string;
  age?: number;
  emoji: string;
}

export default function PerfilScreen() {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([
    {
      id: 1,
      name: 'Carlos Silva',
      role: 'Pai',
      emoji: '👨',
    },
    {
      id: 2,
      name: 'Maria Silva',
      role: 'Mãe',
      emoji: '👩',
    },
    {
      id: 3,
      name: 'Ana Silva',
      role: 'Filha',
      age: 12,
      emoji: '👧',
    },
    {
      id: 4,
      name: 'João Silva',
      role: 'Filho',
      age: 8,
      emoji: '👦',
    },
  ]);

  const handleEditMember = (memberId: number) => {
    Alert.alert('Editar Membro', 'Funcionalidade de edição será implementada');
  };

  const handleDeleteMember = (memberId: number) => {
    Alert.alert(
      'Remover Membro',
      'Tem certeza que deseja remover este membro da família?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => {
            setFamilyMembers(prev => prev.filter(member => member.id !== memberId));
          },
        },
      ]
    );
  };

  const handleAddMember = () => {
    Alert.alert('Adicionar Membro', 'Funcionalidade de adicionar membro será implementada');
  };

  const handleNotifications = () => {
    Alert.alert('Notificações', 'Configurações de notificações será implementada');
  };

  const handleBackup = () => {
    Alert.alert('Backup de Dados', 'Funcionalidade de backup será implementada');
  };

  const totalMembers = familyMembers.length;
  const totalChildren = familyMembers.filter(member => member.age).length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Perfil da Família</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddMember}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Membros da Família */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Membros da Família</Text>
          
          {familyMembers.map((member) => (
            <View key={member.id} style={styles.memberCard}>
              <View style={styles.memberInfo}>
                <View style={styles.emojiContainer}>
                  <Text style={styles.emoji}>{member.emoji}</Text>
                </View>
                <View style={styles.memberDetails}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <View style={styles.memberRole}>
                    <Text style={styles.roleText}>{member.role}</Text>
                    {member.age && (
                      <Text style={styles.ageText}>{member.age} anos</Text>
                    )}
                  </View>
                </View>
              </View>
              
              <View style={styles.memberActions}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleEditMember(member.id)}
                >
                  <Ionicons name="pencil-outline" size={20} color="#4A90E2" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleDeleteMember(member.id)}
                >
                  <Ionicons name="trash-outline" size={20} color="#E74C3C" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Estatísticas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estatísticas</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{totalMembers}</Text>
              <Text style={styles.statLabel}>Membros</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{totalChildren}</Text>
              <Text style={styles.statLabel}>Crianças</Text>
            </View>
          </View>
        </View>

        {/* Configurações */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ Configurações</Text>
          
          <TouchableOpacity 
            style={styles.configItem}
            onPress={handleNotifications}
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
            onPress={handleBackup}
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
  addButton: {
    backgroundColor: '#4A90E2',
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
  memberCard: {
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
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emojiContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  emoji: {
    fontSize: 24,
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  memberRole: {
    flexDirection: 'column',
  },
  roleText: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '500',
  },
  ageText: {
    fontSize: 12,
    color: '#6C757D',
    marginTop: 2,
  },
  memberActions: {
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