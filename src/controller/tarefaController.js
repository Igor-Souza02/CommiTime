const TarefaService = require('../service/tarefaService');

class TarefaController {
  static async getTarefas(req, res) {
    try {
      // O usuario_id virá do query param, como o frontend está enviando
      const { usuario_id } = req.query;
      const result = await TarefaService.getTarefasByUsuario(usuario_id);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async createTarefa(req, res) {
    try {
      const result = await TarefaService.createTarefa(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async updateStatus(req, res) {
    try {
      const { tarefaId } = req.params;
      const { status } = req.body;
      const result = await TarefaService.updateTarefaStatus(tarefaId, status);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = TarefaController; 