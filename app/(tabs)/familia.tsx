import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

interface Membro {
  id: string;
  name: string;
  papel: 'responsavel' | 'dependente';
  papel_detalhado?: string; // Ex: 'dono', 'pai', 'filho'
}

export default function FamiliaScreen() {
  const { userData } = useAuth();
  const router = useRouter();
  const [codigoFamilia, setCodigoFamilia] = useState('');
  const [membros, setMembros] = useState<Membro[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [membroSelecionado, setMembroSelecionado] = useState<Membro | null>(null);

  const PAPEIS_DISPONIVEIS = ['pai', 'mae', 'filho', 'filha'];

  useEffect(() => {
    buscarFamilia();
  }, [userData]);

  const buscarFamilia = async () => {
    try {
      setLoading(true);
      const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;
      const response = await fetch(`${API_URL}/api/familias/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro ao buscar família');
      setCodigoFamilia(data.codigoConvite || '');
      setMembros(data.membros || []);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os dados da família.');
    } finally {
      setLoading(false);
    }
  };

  const copiarCodigo = () => {
    if (codigoFamilia) {
      // @ts-ignore
      if (navigator && navigator.clipboard) {
        navigator.clipboard.writeText(codigoFamilia);
        Alert.alert('Copiado!', 'Código copiado para a área de transferência.');
      } else {
        Alert.alert('Código', codigoFamilia);
      }
    }
  };

  const abrirModalDePapel = (membro: Membro) => {
    setMembroSelecionado(membro);
    setModalVisivel(true);
  };

  const salvarNovoPapel = async (novoPapel: string) => {
    if (!membroSelecionado) return;

    try {
      const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;
      
      const response = await fetch(`${API_URL}/api/familias/membros/${membroSelecionado.id}/papel`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ papel_detalhado: novoPapel })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `Erro do servidor: ${response.status}`);
      
      buscarFamilia();
      setModalVisivel(false);
      setMembroSelecionado(null);

    } catch (error: any) {
      Alert.alert('Erro ao Alterar Papel', error.message || 'Não foi possível conectar ao servidor.');
    }
  };

  const removerMembro = async (membro: Membro) => {
    if (membro.id === userData?.id) return;
    Alert.alert(
      'Remover membro',
      `Tem certeza que deseja remover ${membro.name} da família?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover', style: 'destructive', onPress: async () => {
            try {
              const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
              const token = await AsyncStorage.getItem('userToken');
              if (!token) return;
              const response = await fetch(`${API_URL}/api/familias/membros/${membro.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
              });
              const data = await response.json();
              if (!response.ok) throw new Error(data.error || 'Erro ao remover membro');
              buscarFamilia();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível remover o membro.');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gerenciar Família</Text>
      <View style={styles.codigoContainer}>
        <Text style={styles.codigoLabel}>Código da Família:</Text>
        <View style={styles.codigoBox}>
          <Text selectable style={styles.codigoTexto}>{codigoFamilia || '---'}</Text>
          <TouchableOpacity onPress={copiarCodigo} style={styles.copiarBtn}>
            <Ionicons name="copy-outline" size={20} color="#007BFF" />
          </TouchableOpacity>
        </View>
      </View>

      {(userData?.papel === 'responsavel' || userData?.papel_detalhado === 'dono') && (
        <TouchableOpacity 
          style={styles.manageButton}
          onPress={() => router.push('/gerenciar-materias')}
        >
          <Ionicons name="book-outline" size={20} color="#fff" />
          <Text style={styles.manageButtonText}>Gerenciar Matérias dos Dependentes</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.membrosLabel}>Membros:</Text>
      <FlatList
        data={membros}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.membroItem}>
            <Ionicons name={item.papel === 'responsavel' ? 'person-circle-outline' : 'person-outline'} size={28} color={item.papel_detalhado === 'dono' ? '#FFD700' : (item.papel === 'responsavel' ? '#007BFF' : '#888')} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.membroNome}>{item.name}</Text>
              <Text style={styles.membroPapel}>{item.papel_detalhado ? item.papel_detalhado.charAt(0).toUpperCase() + item.papel_detalhado.slice(1) : (item.papel === 'responsavel' ? 'Responsável' : 'Dependente')}</Text>
            </View>
            {userData?.papel_detalhado === 'dono' && item.id !== userData.id && (
              <>
                <TouchableOpacity onPress={() => abrirModalDePapel(item)} style={styles.acaoBtn}>
                  <Ionicons name="pencil-outline" size={22} color="#FFA500" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => removerMembro(item)} style={styles.acaoBtn}>
                  <Ionicons name="trash-outline" size={22} color="#E74C3C" />
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
        ListEmptyComponent={<Text style={{ color: '#888', textAlign: 'center', marginTop: 20 }}>Nenhum membro encontrado.</Text>}
        style={{ flex: 1 }}
      />
      
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisivel}
        onRequestClose={() => setModalVisivel(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Alterar Papel de {membroSelecionado?.name}</Text>
            {PAPEIS_DISPONIVEIS.map(papel => (
              <TouchableOpacity
                key={papel}
                style={styles.papelOption}
                onPress={() => salvarNovoPapel(papel)}
              >
                <Text style={styles.papelOptionText}>{papel.charAt(0).toUpperCase() + papel.slice(1)}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.papelOption, { backgroundColor: '#E74C3C', marginTop: 10 }]}
              onPress={() => setModalVisivel(false)}
            >
              <Text style={[styles.papelOptionText, { color: '#fff' }]}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#2C3E50', alignSelf: 'center' },
  codigoContainer: { marginBottom: 24 },
  codigoLabel: { fontSize: 16, color: '#374151', marginBottom: 6 },
  codigoBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#D1D5DB' },
  codigoTexto: { fontSize: 18, fontWeight: 'bold', color: '#007BFF', letterSpacing: 2 },
  copiarBtn: { marginLeft: 10 },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  manageButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  membrosLabel: { fontSize: 18, fontWeight: '600', color: '#2C3E50', marginBottom: 10 },
  membroItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#E9ECEF' },
  membroNome: { fontSize: 16, fontWeight: '500', color: '#2C3E50' },
  membroPapel: { fontSize: 13, color: '#888', textTransform: 'capitalize' },
  acaoBtn: { marginLeft: 10, padding: 5 },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  papelOption: {
    width: '100%',
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#007BFF',
    marginBottom: 10,
    alignItems: 'center',
  },
  papelOptionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 