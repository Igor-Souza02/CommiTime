const TarefaModel = require('../models/tarefaModel');

class TarefaRepository {
  static async findByUsuarioId(usuarioId) {
    try {
      return await TarefaModel.findByUsuarioId(usuarioId);
    } catch (error) {
      throw new Error(`Erro no repositório ao buscar tarefas: ${error.message}`);
    }
  }

  static async create(tarefaData) {
    try {
      return await TarefaModel.create(tarefaData);
    } catch (error) {
      throw new Error(`Erro no repositório ao criar tarefa: ${error.message}`);
    }
  }

  static async updateStatus(tarefaId, status) {
    try {
      const tarefa = await TarefaModel.updateStatus(tarefaId, status);
      if (!tarefa) {
        throw new Error('Tarefa não encontrada.');
      }
      return tarefa;
    } catch (error) {
      throw new Error(`Erro no repositório ao atualizar status da tarefa: ${error.message}`);
    }
  }
}

module.exports = TarefaRepository; 