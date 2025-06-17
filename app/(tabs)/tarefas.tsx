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

interface Tarefa {
  id: number;
  titulo: string;
  disciplina: string;
  aluno: string;
  prazo: string;
  status: 'pendente' | 'concluida' | 'vence_hoje' | 'atrasada';
  diasRestantes?: number;
}

export default function TarefasScreen() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([
    {
      id: 1,
      titulo: 'Matemática - Exercícios Cap. 5',
      disciplina: 'Matemática',
      aluno: 'Ana',
      prazo: '23/05/2025',
      status: 'vence_hoje',
    },
    {
      id: 2,
      titulo: 'História - Pesquisa sobre Brasil Colonial',
      disciplina: 'História',
      aluno: 'João',
      prazo: '25/05/2025',
      status: 'concluida',
      diasRestantes: 3,
    },
  ]);

  const [filtroAtivo, setFiltroAtivo] = useState<'todas' | 'pendentes' | 'concluidas'>('todas');

  const handleAdicionarTarefa = () => {
    Alert.alert('Adicionar Tarefa', 'Funcionalidade de adicionar tarefa será implementada');
  };

  const handleMarcarConcluida = (tarefaId: number) => {
    setTarefas(prev => prev.map(tarefa => 
      tarefa.id === tarefaId 
        ? { ...tarefa, status: 'concluida' as const }
        : tarefa
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluida': return '#2ECC71';
      case 'vence_hoje': return '#F39C12';
      case 'atrasada': return '#E74C3C';
      default: return '#4A90E2';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'concluida': return 'Concluída';
      case 'vence_hoje': return 'Vence amanhã';
      case 'atrasada': return 'Atrasada';
      default: return 'Pendente';
    }
  };

  const tarefasFiltradas = tarefas.filter(tarefa => {
    if (filtroAtivo === 'pendentes') return tarefa.status !== 'concluida';
    if (filtroAtivo === 'concluidas') return tarefa.status === 'concluida';
    return true;
  });

  const tarefasConcluidas = tarefas.filter(t => t.status === 'concluida').length;
  const tarefasPendentes = tarefas.filter(t => t.status !== 'concluida').length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tarefas Escolares</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAdicionarTarefa}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Filtros */}
        <View style={styles.filtrosContainer}>
          <TouchableOpacity
            style={[styles.filtroButton, filtroAtivo === 'todas' && styles.filtroAtivo]}
            onPress={() => setFiltroAtivo('todas')}
          >
            <Text style={[styles.filtroText, filtroAtivo === 'todas' && styles.filtroTextoAtivo]}>
              Todas
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filtroButton, filtroAtivo === 'pendentes' && styles.filtroAtivo]}
            onPress={() => setFiltroAtivo('pendentes')}
          >
            <Text style={[styles.filtroText, filtroAtivo === 'pendentes' && styles.filtroTextoAtivo]}>
              Pendentes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filtroButton, filtroAtivo === 'concluidas' && styles.filtroAtivo]}
            onPress={() => setFiltroAtivo('concluidas')}
          >
            <Text style={[styles.filtroText, filtroAtivo === 'concluidas' && styles.filtroTextoAtivo]}>
              Concluídas
            </Text>
          </TouchableOpacity>
        </View>

        {/* Lista de Tarefas */}
        <View style={styles.section}>
          {tarefasFiltradas.map((tarefa) => (
            <View key={tarefa.id} style={[
              styles.tarefaCard,
              { borderLeftColor: getStatusColor(tarefa.status) }
            ]}>
              <View style={styles.tarefaHeader}>
                <View style={styles.statusContainer}>
                  {tarefa.status === 'concluida' ? (
                    <Ionicons name="checkmark-circle" size={24} color="#2ECC71" />
                  ) : (
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(tarefa.status) }]} />
                  )}
                </View>
                <View style={styles.tarefaInfo}>
                  <Text style={styles.tarefaTitulo}>{tarefa.titulo}</Text>
                  <Text style={styles.tarefaAluno}>{tarefa.aluno} - {tarefa.disciplina}</Text>
                  <View style={styles.prazoContainer}>
                    <Text style={styles.prazoLabel}>Prazo: {tarefa.prazo}</Text>
                    <Text style={[styles.statusText, { color: getStatusColor(tarefa.status) }]}>
                      {getStatusText(tarefa.status)}
                    </Text>
                  </View>
                </View>
              </View>

              {tarefa.status !== 'concluida' && (
                <View style={styles.tarefaActions}>
                  <TouchableOpacity 
                    style={styles.concluirButton}
                    onPress={() => handleMarcarConcluida(tarefa.id)}
                  >
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    <Text style={styles.concluirButtonText}>Marcar como Concluída</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Estatísticas */}
        <View style={styles.estatisticasContainer}>
          <View style={styles.estatisticaCard}>
            <Text style={styles.estatisticaNumero}>{tarefasConcluidas}</Text>
            <Text style={styles.estatisticaLabel}>Concluídas</Text>
          </View>
          <View style={styles.estatisticaCard}>
            <Text style={[styles.estatisticaNumero, { color: '#E74C3C' }]}>{tarefasPendentes}</Text>
            <Text style={styles.estatisticaLabel}>Pendentes</Text>
          </View>
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
  filtrosContainer: {
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 20,
    gap: 12,
  },
  filtroButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  filtroAtivo: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  filtroText: {
    fontSize: 14,
    color: '#6C757D',
    fontWeight: '500',
  },
  filtroTextoAtivo: {
    color: '#FFFFFF',
  },
  section: {
    marginBottom: 20,
  },
  tarefaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tarefaHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  statusContainer: {
    marginRight: 12,
    paddingTop: 2,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  tarefaInfo: {
    flex: 1,
  },
  tarefaTitulo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  tarefaAluno: {
    fontSize: 14,
    color: '#4A90E2',
    marginBottom: 8,
  },
  prazoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prazoLabel: {
    fontSize: 12,
    color: '#6C757D',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tarefaActions: {
    marginTop: 12,
  },
  concluirButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#2ECC71',
    borderRadius: 8,
    gap: 8,
  },
  concluirButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  estatisticasContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  estatisticaCard: {
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
  estatisticaNumero: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2ECC71',
    marginBottom: 4,
  },
  estatisticaLabel: {
    fontSize: 14,
    color: '#6C757D',
  },
});