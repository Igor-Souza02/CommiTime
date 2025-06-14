import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';
import {
  Alert,
  Dimensions,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface Evento {
  id: number;
  titulo: string;
  data: string;
  hora: string;
  tipo: 'medico' | 'escola' | 'outros';
  pessoa: string;
  descricao?: string;
}

interface NovoEvento {
  titulo: string;
  data: string;
  hora: string;
  tipo: 'medico' | 'escola' | 'outros';
  pessoa: string;
  descricao: string;
}

const { width } = Dimensions.get('window');

export default function CalendarioScreen() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [mesAtual, setMesAtual] = useState(new Date());
  const [novoEvento, setNovoEvento] = useState<NovoEvento>({
    titulo: '',
    data: '',
    hora: '',
    tipo: 'outros',
    pessoa: '',
    descricao: '',
  });

  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const limparFormulario = () => {
    setNovoEvento({
      titulo: '',
      data: '',
      hora: '',
      tipo: 'outros',
      pessoa: '',
      descricao: '',
    });
  };

  const handleAdicionarEvento = () => {
    limparFormulario();
    setModalVisible(true);
  };

  const handleDiaClicado = (data: Date) => {
    // Verificar se a data é no passado
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    if (data < hoje) {
      Alert.alert('Data inválida', 'Não é possível adicionar eventos no passado.');
      return;
    }

    const dataFormatada = `${data.getDate().toString().padStart(2, '0')}/${(data.getMonth() + 1).toString().padStart(2, '0')}/${data.getFullYear()}`;
    limparFormulario();
    setNovoEvento(prev => ({
      ...prev,
      data: dataFormatada
    }));
    setModalVisible(true);
  };

  const formatarData = (texto: string) => {
    // Remove tudo que não for número
    const numeros = texto.replace(/\D/g, '');
    
    // Aplica a máscara DD/MM/AAAA
    if (numeros.length <= 2) {
      return numeros;
    } else if (numeros.length <= 4) {
      return numeros.slice(0, 2) + '/' + numeros.slice(2);
    } else {
      return numeros.slice(0, 2) + '/' + numeros.slice(2, 4) + '/' + numeros.slice(4, 8);
    }
  };

  const formatarHora = (texto: string) => {
    // Remove tudo que não for número
    const numeros = texto.replace(/\D/g, '');

    // Permite apagar tudo
    if (numeros.length === 0) {
      return '';
    }

    // Só horas
    if (numeros.length <= 2) {
      return numeros;
    }

    // Horas e minutos
    let horas = numeros.slice(0, 2);
    let minutos = numeros.slice(2, 4);

    // Limita valores válidos
    if (parseInt(horas) > 23) horas = '23';
    if (minutos && parseInt(minutos) > 59) minutos = '59';

    if (minutos.length > 0) {
      return `${horas}:${minutos}`;
    } else {
      return `${horas}`;
    }
  };

  const validarHorario = (horario: string): boolean => {
    const horaRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
    return horaRegex.test(horario);
  };

  const handleSalvarEvento = async () => {
    if (!novoEvento.titulo || !novoEvento.data || !novoEvento.hora || !novoEvento.pessoa) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios (Título, Data, Hora e Pessoa)');
      return;
    }

    // Validar formato da data
    const dataRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dataRegex.test(novoEvento.data)) {
      Alert.alert('Erro', 'Use o formato DD/MM/AAAA para a data');
      return;
    }

    // Validar formato e valores da hora
    if (!validarHorario(novoEvento.hora)) {
      Alert.alert('Erro', 'Use o formato HH:MM para a hora (00:00 a 23:59)');
      return;
    }

    // Validar se a data não é no passado
    const [dia, mes, ano] = novoEvento.data.split('/').map(Number);
    const dataEvento = new Date(ano, mes - 1, dia);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    if (dataEvento < hoje) {
      Alert.alert('Data inválida', 'Não é possível adicionar eventos no passado.');
      return;
    }

    // Validar se a data é válida (ex: não permitir 31/02/2024)
    const dataValidacao = new Date(ano, mes - 1, dia);
    if (dataValidacao.getDate() !== dia || dataValidacao.getMonth() !== mes - 1 || dataValidacao.getFullYear() !== ano) {
      Alert.alert('Data inválida', 'Por favor, insira uma data válida.');
      return;
    }

    // Converter data para o formato YYYY-MM-DD
    const dataISO = `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;

    // Enviar para o backend
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          ...novoEvento,
          data: dataISO, // <-- aqui está o ajuste!
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Erro', data.error || 'Erro ao salvar evento');
        return;
      }

      setEventos(prev => [...prev, data.event]);
      setModalVisible(false);
      limparFormulario();
      Alert.alert('Sucesso', 'Evento adicionado com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Erro de conexão com o servidor');
    }
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

  const getDiasDoMes = () => {
    const ano = mesAtual.getFullYear();
    const mes = mesAtual.getMonth();
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    const diasNoMes = ultimoDia.getDate();
    const diaSemanaInicio = primeiroDia.getDay();

    const dias = [];
    
    // Dias do mês anterior para preencher o início
    for (let i = diaSemanaInicio - 1; i >= 0; i--) {
      const diaAnterior = new Date(ano, mes, -i);
      dias.push({
        dia: diaAnterior.getDate(),
        isCurrentMonth: false,
        data: diaAnterior,
      });
    }

    // Dias do mês atual
    for (let dia = 1; dia <= diasNoMes; dia++) {
      const data = new Date(ano, mes, dia);
      dias.push({
        dia,
        isCurrentMonth: true,
        data,
      });
    }

    // Dias do próximo mês para completar a grid
    const diasRestantes = 42 - dias.length; // 6 semanas * 7 dias
    for (let dia = 1; dia <= diasRestantes; dia++) {
      const proximoMes = new Date(ano, mes + 1, dia);
      dias.push({
        dia,
        isCurrentMonth: false,
        data: proximoMes,
      });
    }

    return dias;
  };

  const temEventoNoDia = (data: Date) => {
    const dataString = `${data.getDate().toString().padStart(2, '0')}/${(data.getMonth() + 1).toString().padStart(2, '0')}/${data.getFullYear()}`;
    return eventos.some(evento => evento.data === dataString);
  };

  const proximoMes = () => {
    setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 1));
  };

  const mesAnterior = () => {
    setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() - 1, 1));
  };

  const eventosProximos = eventos
    .filter(evento => {
      const [dia, mes, ano] = evento.data.split('/').map(Number);
      const dataEvento = new Date(ano, mes - 1, dia);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      return dataEvento >= hoje;
    })
    .sort((a, b) => {
      const [diaA, mesA, anoA] = a.data.split('/').map(Number);
      const [diaB, mesB, anoB] = b.data.split('/').map(Number);
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
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Seção do Calendário */}
        <View style={styles.calendarSection}>
          {/* Navegação do mês */}
          <View style={styles.monthNavigation}>
            <TouchableOpacity onPress={mesAnterior} style={styles.navButton}>
              <Ionicons name="chevron-back" size={24} color="#4A90E2" />
            </TouchableOpacity>
            <Text style={styles.monthYear}>
              {meses[mesAtual.getMonth()]} {mesAtual.getFullYear()}
            </Text>
            <TouchableOpacity onPress={proximoMes} style={styles.navButton}>
              <Ionicons name="chevron-forward" size={24} color="#4A90E2" />
            </TouchableOpacity>
          </View>

          {/* Dias da semana */}
          <View style={styles.weekDays}>
            {diasSemana.map((dia, index) => (
              <Text key={index} style={styles.weekDay}>{dia}</Text>
            ))}
          </View>

          {/* Grid do calendário */}
          <View style={styles.calendarGrid}>
            {getDiasDoMes().map((item, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.dayContainer}
                onPress={() => item.isCurrentMonth && handleDiaClicado(item.data)}
                disabled={!item.isCurrentMonth}
              >
                <Text style={[
                  styles.dayText,
                  !item.isCurrentMonth && styles.inactiveDayText,
                  item.data.toDateString() === new Date().toDateString() && styles.todayText
                ]}>
                  {item.dia}
                </Text>
                {temEventoNoDia(item.data) && item.isCurrentMonth && (
                  <View style={styles.eventDot} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Seção de Próximos Eventos */}
        <View style={styles.eventsSection}>
          <View style={styles.eventsSectionHeader}>
            <Text style={styles.sectionTitle}>Todos os Próximos Eventos</Text>
            <TouchableOpacity 
              style={styles.addEventButton}
              onPress={handleAdicionarEvento}
            >
              <Ionicons name="add" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {eventosProximos.length === 0 ? (
            <View style={styles.emptyEventsContainer}>
              <Ionicons name="calendar-outline" size={48} color="#BDC3C7" />
              <Text style={styles.emptyEventsText}>Nenhum evento próximo</Text>
              <Text style={styles.emptyEventsSubtext}>Toque no + para adicionar um evento</Text>
            </View>
          ) : (
            eventosProximos.map(evento => (
              <TouchableOpacity key={evento.id} style={styles.eventCard}>
                <View style={[styles.eventColorBar, { backgroundColor: getTipoColor(evento.tipo) }]} />
                <View style={styles.eventContent}>
                  <Text style={styles.eventTitle}>{evento.titulo}</Text>
                  <Text style={styles.eventDateTime}>{evento.data} às {evento.hora}</Text>
                  <Text style={styles.eventPerson}>{evento.pessoa}</Text>
                  {evento.descricao && (
                    <Text style={styles.eventDescription}>{evento.descricao}</Text>
                  )}
                </View>
                <TouchableOpacity 
                  style={styles.deleteEventButton}
                  onPress={() => handleRemoverEvento(evento.id)}
                >
                  <Ionicons name="trash-outline" size={18} color="#E74C3C" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* Modal Adicionar Evento */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          limparFormulario();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Novo Evento</Text>
              <TouchableOpacity 
                onPress={() => {
                  setModalVisible(false);
                  limparFormulario();
                }}
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
                <Text style={styles.inputLabel}>Pessoa *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ex: João, Ana, Maria..."
                  value={novoEvento.pessoa}
                  onChangeText={(text) => setNovoEvento({...novoEvento, pessoa: text})}
                />
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputContainer, styles.inputHalf]}>
                  <Text style={styles.inputLabel}>Data *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Ex: 25/12/2024"
                    value={novoEvento.data}
                    onChangeText={(text) => setNovoEvento({...novoEvento, data: formatarData(text)})}
                    keyboardType="numeric"
                    maxLength={10}
                  />
                </View>

                <View style={[styles.inputContainer, styles.inputHalf]}>
                  <Text style={styles.inputLabel}>Hora *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Ex: 14:30"
                    value={novoEvento.hora}
                    onChangeText={(text) => setNovoEvento({...novoEvento, hora: formatarHora(text)})}
                    keyboardType="numeric"
                    maxLength={5}
                  />
                </View>
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

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Descrição</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Detalhes adicionais sobre o evento..."
                  value={novoEvento.descricao}
                  onChangeText={(text) => setNovoEvento({...novoEvento, descricao: text})}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setModalVisible(false);
                  limparFormulario();
                }}
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
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  content: {
    flex: 1,
  },
  calendarSection: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  navButton: {
    padding: 8,
  },
  monthYear: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  weekDay: {
    width: width / 7 - 20,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    color: '#6C757D',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayContainer: {
    width: (width - 72) / 7,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  dayText: {
    fontSize: 16,
    color: '#2C3E50',
  },
  inactiveDayText: {
    color: '#BDC3C7',
  },
  todayText: {
    color: '#4A90E2',
    fontWeight: 'bold',
  },
  eventDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4A90E2',
    position: 'absolute',
    bottom: 4,
  },
  eventsSection: {
    margin: 16,
    marginTop: 0,
  },
  eventsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addEventButton: {
    backgroundColor: '#4A90E2',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyEventsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  emptyEventsText: {
    fontSize: 18,
    color: '#6C757D',
    marginTop: 12,
    fontWeight: '500',
  },
  emptyEventsSubtext: {
    fontSize: 14,
    color: '#BDC3C7',
    marginTop: 4,
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  eventColorBar: {
    width: 4,
  },
  eventContent: {
    flex: 1,
    padding: 16,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  eventDateTime: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 4,
  },
  eventPerson: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '500',
  },
  eventDescription: {
    fontSize: 12,
    color: '#6C757D',
    marginTop: 8,
    fontStyle: 'italic',
  },
  deleteEventButton: {
    padding: 16,
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
    maxHeight: '85%',
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
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputHalf: {
    flex: 1,
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
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