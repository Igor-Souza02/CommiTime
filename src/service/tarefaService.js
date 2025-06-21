const TarefaRepository = require('../repository/tarefaRepository');

class TarefaService {
  static async getTarefasByUsuario(usuarioId) {
    if (!usuarioId) {
      throw new Error('ID do usuário é obrigatório.');
    }
    try {
      const tarefas = await TarefaRepository.findByUsuarioId(usuarioId);
      return { data: tarefas };
    } catch (error) {
      throw new Error(`Erro no serviço ao buscar tarefas: ${error.message}`);
    }
  }

  static async createTarefa(tarefaData) {
    const { titulo, data_entrega, materia_id, usuario_id } = tarefaData;
    if (!titulo || !data_entrega || !materia_id || !usuario_id) {
      throw new Error('Todos os campos são obrigatórios.');
    }
    // Adicionar mais validações aqui se necessário (formato da data, etc.)
    try {
      const novaTarefa = await TarefaRepository.create(tarefaData);
      return { data: novaTarefa };
    } catch (error) {
      throw new Error(`Erro no serviço ao criar tarefa: ${error.message}`);
    }
  }

  static async updateTarefaStatus(tarefaId, status) {
    if (!tarefaId || !status) {
      throw new Error('ID da tarefa e novo status são obrigatórios.');
    }
    if (!['pendente', 'concluida'].includes(status)) {
        throw new Error('Status inválido. Use "pendente" ou "concluida".');
    }
    try {
      const tarefaAtualizada = await TarefaRepository.updateStatus(tarefaId, status);
      return { data: tarefaAtualizada, message: 'Status da tarefa atualizado com sucesso.' };
    } catch (error) {
      throw new Error(`Erro no serviço ao atualizar status: ${error.message}`);
    }
  }
}

module.exports = TarefaService; 