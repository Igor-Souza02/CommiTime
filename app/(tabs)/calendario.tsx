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
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Evento {
  id: number;
  titulo: string;
  data: string;
  hora: string;
  tipo: 'medico' | 'escola' | 'outros';
  pessoa: string;
}

interface NovoEvento {
  titulo: string;
  data: string;
  hora: string;
  tipo: 'medico' | 'escola' | 'outros';
  pessoa: string;
}

export default function CalendarioScreen() {
  const [eventos, setEventos] = useState<Evento[]>([
    {
      id: 1,
      titulo: 'Consulta Pediatra - João',
      data: '24/05/2025',
      hora: '14:00',
      tipo: 'medico',
      pessoa: 'João',
    },
    {
      id: 2,
      titulo: 'Prova de Matemática - Ana',
      data: '26/05/2025',
      hora: '08:00',
      tipo: 'escola',
      pessoa: 'Ana',
    },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [novoEvento, setNovoEvento] = useState<NovoEvento>({
    titulo: '',
    data: '',
    hora: '',
    tipo: 'outros',
    pessoa: '',
  });

  const handleAdicionarEvento = () => {
    setModalVisible(true);
  };

  const handleSalvarEvento = () => {
    if (!novoEvento.titulo || !novoEvento.data || !novoEvento.hora) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    const evento: Evento = {
      id: Date.now(),
      titulo: novoEvento.titulo,
      data: novoEvento.data,
      hora: novoEvento.hora,
      tipo: novoEvento.tipo,
      pessoa: novoEvento.pessoa,
    };

    setEventos(prev => [...prev, evento]);
    setModalVisible(false);
    setNovoEvento({
      titulo: '',
      data: '',
      hora: '',
      tipo: 'outros',
      pessoa: '',
    });
    Alert.alert('Sucesso', 'Evento adicionado com sucesso!');
  };

  const handleRemoverEvento = (eventoId: number) => {
    Alert.alert(
      'Remover Evento',
      'Tem certeza que deseja remover este evento?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => {
            setEventos(prev => prev.filter(evento => evento.id !== eventoId));
          },
        },
      ]
    );
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'medico': return 'medical-outline';
      case 'escola': return 'school-outline';
      default: return 'calendar-outline';
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'medico': return '#E74C3C';
      case 'escola': return '#2ECC71';
      default: return '#4A90E2';
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'medico': return 'Médico';
      case 'escola': return 'Escola';
      default: return 'Outros';
    }
  };

  const eventosPorData = eventos.reduce((acc, evento) => {
    if (!acc[evento.data]) {
      acc[evento.data] = [];
    }
    acc[evento.data].push(evento);
    return acc;
  }, {} as Record<string, Evento[]>);

  const datasOrdenadas = Object.keys(eventosPorData).sort((a, b) => {
    const [diaA, mesA, anoA] = a.split('/').map(Number);
    const [diaB, mesB, anoB] = b.split('/').map(Number);
    const dataA = new Date(anoA, mesA - 1, diaA);
    const dataB = new Date(anoB, mesB - 1, diaB);
    return dataA.getTime() - dataB.getTime();
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Calendário</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAdicionarEvento}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Lista de Eventos */}
        {datasOrdenadas.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color="#BDC3C7" />
            <Text style={styles.emptyText}>Nenhum evento agendado</Text>
          </View>
        ) : (
          datasOrdenadas.map(data => (
            <View key={data} style={styles.dataSection}>
              <Text style={styles.dataHeader}>{data}</Text>
              {eventosPorData[data].map(evento => (
                <View key={evento.id} style={styles.eventoCard}>
                  <View style={styles.eventoContent}>
                    <View style={[styles.tipoIndicator, { backgroundColor: getTipoColor(evento.tipo) }]}>
                      <Ionicons name={getTipoIcon(evento.tipo)} size={20} color="#FFFFFF" />
                    </View>
                    <View style={styles.eventoInfo}>
                      <Text style={styles.eventoTitulo}>{evento.titulo}</Text>
                      <Text style={styles.eventoHora}>às {evento.hora}</Text>
                      <View style={styles.eventoMeta}>
                        <View style={[styles.tipoLabel, { backgroundColor: getTipoColor(evento.tipo) + '20' }]}>
                          <Text style={[styles.tipoText, { color: getTipoColor(evento.tipo) }]}>
                            {getTipoLabel(evento.tipo)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => handleRemoverEvento(evento.id)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#E74C3C" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>

      {/* Modal Adicionar Evento */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Novo Evento</Text>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#6C757D" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Título *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ex: Consulta médica, Prova de matemática..."
                  value={novoEvento.titulo}
                  onChangeText={(text) => setNovoEvento({...novoEvento, titulo: text})}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Data *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="DD/MM/AAAA"
                  value={novoEvento.data}
                  onChangeText={(text) => setNovoEvento({...novoEvento, data: text})}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Hora *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="HH:MM"
                  value={novoEvento.hora}
                  onChangeText={(text) => setNovoEvento({...novoEvento, hora: text})}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Pessoa</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ex: João, Ana, Maria..."
                  value={novoEvento.pessoa}
                  onChangeText={(text) => setNovoEvento({...novoEvento, pessoa: text})}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Tipo do Evento</Text>
                <View style={styles.tipoSelector}>
                  {(['medico', 'escola', 'outros'] as const).map(tipo => (
                    <TouchableOpacity
                      key={tipo}
                      style={[
                        styles.tipoOption,
                        novoEvento.tipo === tipo && styles.tipoOptionSelected,
                        { borderColor: getTipoColor(tipo) }
                      ]}
                      onPress={() => setNovoEvento({...novoEvento, tipo})}
                    >
                      <Ionicons name={getTipoIcon(tipo)} size={20} color={getTipoColor(tipo)} />
                      <Text style={[styles.tipoOptionText, { color: getTipoColor(tipo) }]}>
                        {getTipoLabel(tipo)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleSalvarEvento}
              >
                <Text style={styles.saveButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#6C757D',
    marginTop: 16,
  },
  dataSection: {
    marginTop: 20,
  },
  dataHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  eventoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
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
  eventoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tipoIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  eventoInfo: {
    flex: 1,
  },
  eventoTitulo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  eventoHora: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 8,
  },
  eventoMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipoLabel: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tipoText: {
    fontSize: 12,
    fontWeight: '500',
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalForm: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  tipoSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  tipoOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderRadius: 8,
    gap: 6,
  },
  tipoOptionSelected: {
    backgroundColor: '#F8F9FA',
  },
  tipoOptionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6C757D',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});