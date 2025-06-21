import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Keyboard,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';

interface Membro {
  id: string;
  name: string;
  papel_detalhado: string;
}

interface Materia {
  id: string;
  nome_materia: string;
}

export default function GerenciarMateriasScreen() {
  const { userData } = useAuth();
  const [dependentes, setDependentes] = useState<Membro[]>([]);
  const [dependenteSelecionado, setDependenteSelecionado] = useState<string | null>(null);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [novaMateria, setNovaMateria] = useState('');
  const [loading, setLoading] = useState(true);

  // 1. Buscar dependentes da família
  useEffect(() => {
    const buscarDependentes = async () => {
      try {
        setLoading(true);
        const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
        const token = await AsyncStorage.getItem('userToken');
        const response = await fetch(`${API_URL}/api/familias/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok) {
          const deps = data.membros.filter((m: Membro) => m.papel_detalhado === 'filho' || m.papel_detalhado === 'filha');
          setDependentes(deps);
          if (deps.length > 0) {
            setDependenteSelecionado(deps[0].id);
          }
        }
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível buscar os membros da família.');
      } finally {
        setLoading(false);
      }
    };
    buscarDependentes();
  }, [userData]);

  // 2. Buscar matérias quando um dependente é selecionado
  useEffect(() => {
    if (!dependenteSelecionado) return;
    const buscarMaterias = async () => {
      try {
        setLoading(true);
        const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
        const token = await AsyncStorage.getItem('userToken');
        const response = await fetch(`${API_URL}/api/materias/usuario/${dependenteSelecionado}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok) {
          setMaterias(data.data || []);
        } else {
          setMaterias([]);
        }
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível buscar as matérias deste usuário.');
      } finally {
        setLoading(false);
      }
    };
    buscarMaterias();
  }, [dependenteSelecionado]);

  // 3. Função para adicionar uma nova matéria
  const handleAdicionarMateria = async () => {
    if (!novaMateria.trim() || !dependenteSelecionado) return;
    Keyboard.dismiss();
    try {
      const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/api/materias`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          nome_materia: novaMateria,
          usuario_id: dependenteSelecionado,
        }),
      });
      const data = await response.json();
      
      if (response.ok) {
        // Verificar se a resposta tem a estrutura esperada
        if (data.data && data.data.id) {
          setMaterias(prev => [...prev, data.data]);
          setNovaMateria('');
        } else {
          throw new Error('Resposta do servidor não contém dados válidos da matéria');
        }
      } else {
        // Se for erro 409 (Conflict), significa que a matéria já existe
        if (response.status === 409) {
          Alert.alert('Matéria já existe', 'Esta matéria já foi cadastrada para este dependente.');
        } else {
          throw new Error(data.error || 'Erro ao adicionar matéria');
        }
      }
    } catch (error: any) {
      console.error('Erro ao adicionar matéria:', error);
      Alert.alert('Erro', error.message || 'Erro desconhecido ao adicionar matéria');
    }
  };

  // 4. Função para remover uma matéria
  const handleRemoverMateria = async (materiaId: string) => {
    try {
      const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/api/materias/${materiaId}`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          usuario_id: dependenteSelecionado
        }),
      });
      const data = await response.json();
      
      if (response.ok) {
        setMaterias(prev => prev.filter(m => m.id !== materiaId));
      } else {
        // Se for erro 403, significa que não tem permissão
        if (response.status === 403) {
          Alert.alert('Sem permissão', 'Você não tem permissão para remover esta matéria.');
        } else {
          throw new Error(data.error || 'Erro ao remover matéria');
        }
      }
    } catch (error: any) {
      console.error('Erro ao remover matéria:', error);
      Alert.alert('Erro', error.message || 'Erro desconhecido ao remover matéria');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Gerenciar Matérias</Text>
      <Text style={styles.label}>Selecione o Dependente</Text>
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

      <Text style={styles.label}>Adicionar Nova Matéria</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ex: Matemática, Português..."
          value={novaMateria}
          onChangeText={setNovaMateria}
          returnKeyType="done"
          onSubmitEditing={handleAdicionarMateria}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAdicionarMateria}>
          <Ionicons name="add-circle" size={32} color="#007BFF" />
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Matérias Cadastradas</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" />
      ) : (
        <FlatList
          data={materias}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.materiaItem}>
              <Text style={styles.materiaNome}>{item.nome_materia}</Text>
              <TouchableOpacity onPress={() => handleRemoverMateria(item.id)}>
                <Ionicons name="trash-bin-outline" size={22} color="#E74C3C" />
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhuma matéria encontrada.</Text>
              <Text style={styles.emptySubtext}>Adicione matérias para este dependente.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F8F9FA' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 8 },
  pickerContainer: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, marginBottom: 16 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  input: { flex: 1, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 12, marginRight: 10 },
  addButton: { padding: 4 },
  materiaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  materiaNome: { fontSize: 16 },
  emptyContainer: { alignItems: 'center', marginTop: 40 },
  emptyText: { fontSize: 16, color: '#6C757D' },
  emptySubtext: { fontSize: 14, color: '#ADB5BD' },
}); 