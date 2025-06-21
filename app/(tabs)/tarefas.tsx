import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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

// Interfaces
interface Tarefa {
  id: string;
  titulo: string;
  data_entrega: string;
  status: 'pendente' | 'concluida';
  materia: { nome_materia: string };
}
interface Materia { id: string; nome_materia: string; }
interface Membro { id: string; name: string; papel_detalhado: string; }
interface NovaTarefa { titulo: string; data_entrega: string; materia_id: string; }

export default function TarefasScreen() {
  const { userData } = useAuth();
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [dependentes, setDependentes] = useState<Membro[]>([]);
  const [dependenteSelecionado, setDependenteSelecionado] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [novaTarefa, setNovaTarefa] = useState<NovaTarefa>({
    titulo: '', data_entrega: '', materia_id: '',
  });

  const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

  // 1. Busca os dependentes da família ao carregar a tela
  useEffect(() => {
    const buscarDependentes = async () => {
      console.log('[TAREFAS] Iniciando busca de dependentes...');
      if (!userData) {
        console.log('[TAREFAS] userData indisponível, abortando.');
        return;
      }
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem('userToken');
        const response = await fetch(`${API_URL}/api/familias/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok && data.membros) {
          const deps = data.membros.filter((m: Membro) => ['filho', 'filha'].includes(m.papel_detalhado));
          console.log(`[TAREFAS] Dependentes encontrados: ${deps.length}`, deps);
          setDependentes(deps);
          if (deps.length > 0) {
            console.log(`[TAREFAS] Definindo dependente selecionado para: ${deps[0].id}`);
            setDependenteSelecionado(deps[0].id);
          } else {
            console.log('[TAREFAS] Nenhum dependente encontrado.');
            setLoading(false); // Para de carregar se não houver dependentes
          }
        } else {
           console.log('[TAREFAS] Resposta da API de família não foi OK ou não continha membros.');
           setLoading(false);
        }
      } catch (error) {
        console.error('[TAREFAS] Erro ao buscar dependentes:', error);
        Alert.alert('Erro', 'Não foi possível buscar os membros da família.');
        setLoading(false);
      }
    };
    buscarDependentes();
  }, [userData]);

  // 2. Busca matérias e tarefas sempre que o dependente selecionado mudar
  useEffect(() => {
    console.log(`[TAREFAS] useEffect de busca de dados disparado. Dependente selecionado: ${dependenteSelecionado}`);
    if (!dependenteSelecionado) {
      setTarefas([]);
      setMaterias([]);
      setLoading(false);
      return;
    };

    const buscarDadosDoDependente = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem('userToken');
        const tarefasUrl = `${API_URL}/api/tarefas?usuario_id=${dependenteSelecionado}`;
        const materiasUrl = `${API_URL}/api/materias/usuario/${dependenteSelecionado}`;
        
        console.log(`[TAREFAS] Buscando dados...`);
        console.log(`[TAREFAS] URL Tarefas: ${tarefasUrl}`);
        console.log(`[TAREFAS] URL Matérias: ${materiasUrl}`);

        const [tarefasRes, materiasRes] = await Promise.all([
          fetch(tarefasUrl, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(materiasUrl, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        console.log(`[TAREFAS] Resposta Tarefas Status: ${tarefasRes.status}`);
        console.log(`[TAREFAS] Resposta Matérias Status: ${materiasRes.status}`);

        const tarefasData = await tarefasRes.json();
        console.log('[TAREFAS] Dados de tarefas recebidos:', JSON.stringify(tarefasData, null, 2));
        setTarefas(tarefasData.data || []);

        const materiasData = await materiasRes.json();
        console.log('[TAREFAS] Dados de matérias recebidos:', JSON.stringify(materiasData, null, 2));
        setMaterias(materiasData.data || []);

      } catch (error) {
        console.error('[TAREFAS] Erro ao buscar dados do dependente:', error);
        Alert.alert('Erro', 'Não foi possível buscar os dados do dependente.');
        setTarefas([]);
        setMaterias([]);
      } finally {
        setLoading(false);
      }
    };

    buscarDadosDoDependente();
  }, [dependenteSelecionado]);
  
  // Funções Utilitárias e Handlers
  const formatarData = (texto: string) => {
    const numeros = texto.replace(/\D/g, '');
    let dataFormatada = numeros;
    if (numeros.length > 4) {
      dataFormatada = `${numeros.slice(0, 2)}/${numeros.slice(2, 4)}/${numeros.slice(4, 8)}`;
    } else if (numeros.length > 2) {
      dataFormatada = `${numeros.slice(0, 2)}/${numeros.slice(2)}`;
    }
    return dataFormatada;
  };

  const limparFormulario = () => setNovaTarefa({ titulo: '', data_entrega: '', materia_id: '' });

  const handleAbrirModal = () => {
    limparFormulario();
    setModalVisivel(true);
  };

  const handleSalvarTarefa = async () => {
    if (!novaTarefa.titulo.trim() || !novaTarefa.data_entrega.trim() || !novaTarefa.materia_id) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }
    const dataRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dataRegex.test(novaTarefa.data_entrega)) {
      Alert.alert('Erro', 'Use o formato DD/MM/AAAA para a data');
      return;
    }
    const [dia, mes, ano] = novaTarefa.data_entrega.split('/').map(Number);
    const dataFormatadaISO = `${ano}-${mes.toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`;
    
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/api/tarefas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          titulo: novaTarefa.titulo,
          data_entrega: dataFormatadaISO,
          materia_id: novaTarefa.materia_id,
          usuario_id: dependenteSelecionado,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setModalVisivel(false);
        limparFormulario();
        // Re-busca as tarefas para atualizar a lista
        const tarefasRes = await fetch(`${API_URL}/api/tarefas?usuario_id=${dependenteSelecionado}`, { headers: { Authorization: `Bearer ${token}` } });
        const tarefasData = await tarefasRes.json();
        setTarefas(tarefasData.data || []);
      } else {
        const errorMessage = data.details ? data.details[0].msg : (data.error || 'Erro ao salvar tarefa.');
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      Alert.alert('Erro ao Salvar', error.message);
    }
  };

  const handleMarcarConcluida = async (tarefaId: string) => {
    try {
        const token = await AsyncStorage.getItem('userToken');
        await fetch(`${API_URL}/api/tarefas/${tarefaId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ status: 'concluida' }),
        });
        // Re-busca as tarefas para atualizar a lista
        const tarefasRes = await fetch(`${API_URL}/api/tarefas?usuario_id=${dependenteSelecionado}`, { headers: { Authorization: `Bearer ${token}` } });
        const tarefasData = await tarefasRes.json();
        setTarefas(tarefasData.data || []);
    } catch (error: any) {
        Alert.alert('Erro', error.message || 'Não foi possível atualizar a tarefa.');
    }
  };
  
  const tarefasPendentes = tarefas.filter(t => t.status === 'pendente');
  const tarefasConcluidas = tarefas.filter(t => t.status === 'concluida');

  // Renderização
  if (loading) {
    return <ActivityIndicator size="large" color="#007BFF" style={styles.loadingContainer} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tarefas</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAbrirModal}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={dependenteSelecionado}
          onValueChange={(itemValue) => setDependenteSelecionado(itemValue)}
          enabled={dependentes.length > 0}
        >
          {dependentes.map(dep => (
            <Picker.Item key={dep.id} label={dep.name} value={dep.id} />
          ))}
        </Picker>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Pendentes ({tarefasPendentes.length})</Text>
        {tarefasPendentes.length > 0 ? (
          tarefasPendentes.map(tarefa => (
            <View key={tarefa.id} style={styles.tarefaCard}>
              <TouchableOpacity onPress={() => handleMarcarConcluida(tarefa.id)}>
                <Ionicons name="square-outline" size={24} color="#4A90E2" />
              </TouchableOpacity>
              <View style={styles.tarefaInfo}>
                <Text style={styles.tarefaTitulo}>{tarefa.titulo}</Text>
                <Text style={styles.tarefaDetalhe}>{tarefa.materia.nome_materia} - {new Date(tarefa.data_entrega).toLocaleDateString('pt-BR')}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Nenhuma tarefa pendente.</Text>
        )}

        <Text style={styles.sectionTitle}>Concluídas ({tarefasConcluidas.length})</Text>
        {tarefasConcluidas.length > 0 ? (
          tarefasConcluidas.map(tarefa => (
            <View key={tarefa.id} style={[styles.tarefaCard, styles.tarefaConcluida]}>
              <Ionicons name="checkbox" size={24} color="#2ECC71" />
              <View style={styles.tarefaInfo}>
                <Text style={[styles.tarefaTitulo, styles.tarefaTituloConcluido]}>{tarefa.titulo}</Text>
                <Text style={styles.tarefaDetalhe}>{tarefa.materia.nome_materia}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Nenhuma tarefa concluída.</Text>
        )}
      </ScrollView>

      <Modal
        visible={modalVisivel}
        animationType="slide"
        transparent={true}
        onRequestClose={limparFormulario}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nova Tarefa</Text>
            <TextInput
              style={styles.input}
              placeholder="Título da tarefa"
              value={novaTarefa.titulo}
              onChangeText={text => setNovaTarefa(prev => ({ ...prev, titulo: text }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Data de Entrega (DD/MM/AAAA)"
              value={novaTarefa.data_entrega}
              keyboardType="numeric"
              maxLength={10}
              onChangeText={text => setNovaTarefa(prev => ({ ...prev, data_entrega: formatarData(text) }))}
            />
            <View style={styles.pickerContainerModal}>
              <Picker
                selectedValue={novaTarefa.materia_id}
                onValueChange={itemValue => setNovaTarefa(prev => ({ ...prev, materia_id: itemValue as string }))}
                enabled={materias.length > 0}
              >
                <Picker.Item label="Selecione a matéria" value="" />
                {materias.map(m => <Picker.Item key={m.id} label={m.nome_materia} value={m.id} />)}
              </Picker>
            </View>
            <TouchableOpacity style={styles.saveButton} onPress={handleSalvarTarefa}>
              <Text style={styles.saveButtonText}>Salvar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisivel(false)}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E9ECEF' },
    headerTitle: { fontSize: 24, fontWeight: 'bold' },
    addButton: { backgroundColor: '#007BFF', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    pickerContainer: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, marginHorizontal: 20, marginTop: 10, backgroundColor: '#fff' },
    pickerContainerModal: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, marginBottom: 20 },
    content: { paddingHorizontal: 20, paddingTop: 10 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
    tarefaCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#E9ECEF' },
    tarefaConcluida: { backgroundColor: '#E9F7EF', borderColor: '#D1FAE5' },
    tarefaInfo: { marginLeft: 15, flex: 1 },
    tarefaTitulo: { fontSize: 16, fontWeight: '500' },
    tarefaTituloConcluido: { textDecorationLine: 'line-through', color: '#A0AEC0' },
    tarefaDetalhe: { color: '#718096', fontSize: 14, paddingTop: 2 },
    emptyText: { textAlign: 'center', color: '#A0AEC0', marginVertical: 20, fontSize: 16 },
    modalOverlay: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 20 },
    modalContent: { backgroundColor: '#fff', borderRadius: 10, padding: 20 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5, marginBottom: 15 },
    saveButton: { backgroundColor: '#007BFF', padding: 15, borderRadius: 5, alignItems: 'center', marginBottom: 10 },
    saveButtonText: { color: '#fff', fontWeight: 'bold' },
    cancelButton: { backgroundColor: '#6c757d', padding: 15, borderRadius: 5, alignItems: 'center' },
    cancelButtonText: { color: '#fff', fontWeight: 'bold' },
});