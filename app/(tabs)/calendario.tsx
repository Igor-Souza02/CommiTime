import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
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
import { useAuth } from '../../contexts/AuthContext';

interface Evento {
  id: number;
  titulo: string;
  data: string;
  hora: string;
  tipo: 'medico' | 'escola' | 'outros';
  pessoa: string;
  descricao?: string;
  status: 'pendente' | 'concluido' | 'verificado';
  usuario_id: string;
  pessoa_nome?: string;
}

interface NovoEvento {
  titulo: string;
  data: string;
  hora: string;
  tipo: 'medico' | 'escola' | 'outros';
  pessoa: string;
  descricao: string;
  destinatario_id?: string;
}

interface Familiar {
  id: string;
  name: string;
  papel: 'responsavel' | 'dependente';
}

const { width } = Dimensions.get('window');

export default function CalendarioScreen() {
  const { userData } = useAuth();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [familiares, setFamiliares] = useState<Familiar[]>([]);
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

  const carregarFamiliares = useCallback(async () => {
    if (userData?.papel !== 'responsavel') return;
    try {
      const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      const response = await fetch(`${API_URL}/api/familias/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setFamiliares(data.membros || []);
      } else {
        throw new Error(data.error || 'Erro ao buscar familiares');
      }
    } catch (error) {
      console.error('Erro ao carregar familiares:', error);
    }
  }, [userData]);

  const carregarEventos = useCallback(async () => {
    try {
      const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;
      const response = await fetch(`${API_URL}/api/events`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro ao carregar eventos');
      setEventos(data.events);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
      Alert.alert('Erro', 'Não foi possível carregar seus eventos.');
    }
  }, []);

  useEffect(() => {
    if(userData) {
      carregarEventos();
      carregarFamiliares();
    }
  }, [userData, carregarEventos, carregarFamiliares]);

  const handleStatusUpdate = async (eventoId: number, novoStatus: 'concluido' | 'verificado') => {
    try {
      const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
      const token = await AsyncStorage.getItem('userToken');
      
      const response = await fetch(`${API_URL}/api/events/${eventoId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: novoStatus }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `Erro ao atualizar status`);
      
      Alert.alert('Sucesso!', `Evento marcado como ${novoStatus}.`);
      carregarEventos();
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    }
  };

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
    if (userData?.papel === 'dependente') {
      Alert.alert(
        'Acesso Restrito', 
        'Dependentes não podem criar eventos. Peça a um responsável para criar eventos para você.',
        [{ text: 'OK' }]
      );
      return;
    }
    limparFormulario();
    setModalVisible(true);
  };

  const handleDiaClicado = (data: Date) => {
    if (userData?.papel === 'dependente') {
      Alert.alert(
        'Acesso Restrito', 
        'Dependentes não podem criar eventos. Peça a um responsável para criar eventos para você.',
        [{ text: 'OK' }]
      );
      return;
    }
    
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
    const numeros = texto.replace(/\D/g, '');
    if (numeros.length <= 2) {
      return numeros;
    } else if (numeros.length <= 4) {
      return numeros.slice(0, 2) + '/' + numeros.slice(2);
    } else {
      return numeros.slice(0, 2) + '/' + numeros.slice(2, 4) + '/' + numeros.slice(4, 8);
    }
  };

  const formatarHora = (texto: string) => {
    const numeros = texto.replace(/\D/g, '');
    if (numeros.length === 0) {
      return '';
    }
    if (numeros.length <= 2) {
      return numeros;
    }
    let horas = numeros.slice(0, 2);
    let minutos = numeros.slice(2, 4);
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
    if (userData?.papel === 'dependente') {
      Alert.alert(
        'Acesso Restrito', 
        'Dependentes não podem criar eventos. Peça a um responsável para criar eventos para você.',
        [{ text: 'OK' }]
      );
      setModalVisible(false);
      limparFormulario();
      return;
    }
    
    if (!novoEvento.titulo || !novoEvento.data || !novoEvento.hora || !novoEvento.pessoa) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios (Título, Data, Hora e Pessoa)');
      return;
    }
    const dataRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dataRegex.test(novoEvento.data)) {
      Alert.alert('Erro', 'Use o formato DD/MM/AAAA para a data');
      return;
    }
    if (!validarHorario(novoEvento.hora)) {
      Alert.alert('Erro', 'Use o formato HH:MM para a hora (00:00 a 23:59)');
      return;
    }
    const [dia, mes, ano] = novoEvento.data.split('/').map(Number);
    const dataEvento = new Date(ano, mes - 1, dia);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    if (dataEvento < hoje) {
      Alert.alert('Data inválida', 'Não é possível adicionar eventos no passado.');
      return;
    }
    const dataValidacao = new Date(ano, mes - 1, dia);
    if (dataValidacao.getDate() !== dia || dataValidacao.getMonth() !== mes - 1 || dataValidacao.getFullYear() !== ano) {
      Alert.alert('Data inválida', 'Por favor, insira uma data válida.');
      return;
    }
    try {
      const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
      const endpoint = `${API_URL}/api/events`;
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Erro de Autenticação', 'Sessão expirada. Por favor, faça login novamente.');
        return;
      }
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(novoEvento),
      });
      const data = await response.json();
      if (!response.ok) {
        console.error('Erro do backend:', data);
        Alert.alert('Erro ao Salvar', data.error || data.message || 'Não foi possível salvar o evento.');
        return;
      }
      setEventos(prev => [...prev, data.event]);
      setModalVisible(false);
      limparFormulario();
      Alert.alert('Sucesso', 'Evento adicionado com sucesso!');
    } catch (error) {
      console.error('Falha na conexão:', error);
      Alert.alert('Erro de Conexão', 'Não foi possível conectar ao servidor. Verifique o IP no arquivo .env e se o backend está rodando.');
    }
  };

  const handleRemoverEvento = async (eventoId: number) => {
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
          onPress: async () => {
            try {
              const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
              const token = await AsyncStorage.getItem('userToken');
              if (!token) return;
              const response = await fetch(`${API_URL}/api/events/${eventoId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
              });
              if (!response.ok) {
                const data = await response.json();
                Alert.alert('Erro ao remover', data.error || 'Não foi possível remover o evento.');
                return;
              }
              setEventos(prev => prev.filter(evento => evento.id !== eventoId));
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível remover o evento.');
            }
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
    for (let i = diaSemanaInicio - 1; i >= 0; i--) {
      const diaAnterior = new Date(ano, mes, -i);
      dias.push({
        dia: diaAnterior.getDate(),
        isCurrentMonth: false,
        data: diaAnterior,
      });
    }
    for (let dia = 1; dia <= diasNoMes; dia++) {
      const data = new Date(ano, mes, dia);
      dias.push({
        dia,
        isCurrentMonth: true,
        data,
      });
    }
    const diasRestantes = 42 - dias.length;
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Calendário</Text>
      </View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.calendarSection}>
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
          <View style={styles.weekDays}>
            {diasSemana.map((dia, index) => (
              <Text key={index} style={styles.weekDay}>{dia}</Text>
            ))}
          </View>
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
        <View style={styles.eventsSection}>
          <View style={styles.eventsSectionHeader}>
            <Text style={styles.sectionTitle}>Todos os Próximos Eventos</Text>
            {userData?.papel !== 'dependente' && (
              <TouchableOpacity 
                style={styles.addEventButton}
                onPress={handleAdicionarEvento}
              >
                <Ionicons name="add" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
          {eventosProximos.length === 0 ? (
            <View style={styles.emptyEventsContainer}>
              <Ionicons name="calendar-outline" size={48} color="#BDC3C7" />
              <Text style={styles.emptyEventsText}>Nenhum evento próximo</Text>
              {userData?.papel === 'dependente' ? (
                <Text style={styles.emptyEventsSubtext}>Peça a um responsável para adicionar eventos para você</Text>
              ) : (
                <Text style={styles.emptyEventsSubtext}>Toque no + para adicionar um evento</Text>
              )}
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
                      <Text style={[styles.tipoOptionText, { color: getTipoColor(tipo) }]}> {getTipoLabel(tipo)} </Text>
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
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { padding: 20, alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: 'bold' },
  content: { padding: 20 },
  calendarSection: { marginBottom: 20 },
  monthNavigation: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  navButton: { padding: 10 },
  monthYear: { fontSize: 18, fontWeight: 'bold' },
  weekDays: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 },
  weekDay: { flex: 1, textAlign: 'center', fontWeight: 'bold', color: '#6C757D' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 10 },
  dayContainer: { width: (width-20)/7, alignItems: 'center', justifyContent: 'center', height: 40 },
  dayText: { fontSize: 16 },
  inactiveDayText: { color: '#9CA3AF' },
  todayText: { fontWeight: 'bold', color: '#007BFF' },
  eventDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#007BFF', position: 'absolute', bottom: 4, right: 4 },
  eventsSection: { marginBottom: 20 },
  eventsSectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  addEventButton: { padding: 10 },
  emptyEventsContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyEventsText: { fontSize: 16, color: '#6C757D', marginBottom: 10 },
  emptyEventsSubtext: { fontSize: 14, color: '#9CA3AF' },
  eventCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  eventColorBar: { width: 4, height: '100%', borderTopLeftRadius: 12, borderBottomLeftRadius: 12, position: 'absolute', left: 0 },
  eventContent: { flex: 1, paddingLeft: 12 },
  eventTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 4 },
  eventDateTime: { fontSize: 14, color: '#4B5563' },
  eventPerson: { fontSize: 14, color: '#4B5563', marginBottom: 4 },
  eventDescription: { fontSize: 14, color: '#4B5563' },
  deleteEventButton: { padding: 10 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, height: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 24, fontWeight: 'bold' },
  closeButton: { padding: 10 },
  modalForm: { padding: 20 },
  inputContainer: { marginBottom: 16 },
  inputLabel: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 8, alignSelf: 'flex-start' },
  textInput: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 12, marginBottom: 16, width: '100%' },
  inputRow: { flexDirection: 'row', justifyContent: 'space-between' },
  inputHalf: { width: '48%' },
  tipoSelector: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, marginBottom: 16, backgroundColor: '#F9FAFB' },
  tipoOption: { padding: 12, borderWidth: 2, borderColor: '#D1D5DB', borderRadius: 8 },
  tipoOptionSelected: { borderColor: '#007BFF' },
  tipoOptionText: { fontSize: 16, fontWeight: '600', color: '#374151', marginLeft: 10 },
  textArea: { height: 80 },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  cancelButton: { backgroundColor: '#6B7280', padding: 15, borderRadius: 10, flex: 1, marginRight: 10 },
  cancelButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  saveButton: { backgroundColor: '#2ECC71', padding: 15, borderRadius: 10, flex: 1 },
  saveButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});