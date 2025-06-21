const MateriaService = require('../service/materiaService');

class MateriaController {
  // Buscar matérias de um usuário
  static async getMateriasByUsuario(req, res) {
    try {
      const { usuarioId } = req.params;
      
      if (!usuarioId) {
        return res.status(400).json({ error: 'ID do usuário é obrigatório' });
      }

      const result = await MateriaService.getMateriasByUsuario(usuarioId);
      res.json(result);
    } catch (error) {
      console.error('Erro ao buscar matérias:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Criar uma nova matéria
  static async createMateria(req, res) {
    try {
      const { nome_materia, usuario_id } = req.body;
      
      if (!nome_materia || !usuario_id) {
        return res.status(400).json({ 
          error: 'Nome da matéria e ID do usuário são obrigatórios' 
        });
      }

      const result = await MateriaService.createMateria(nome_materia, usuario_id);
      res.status(201).json(result);
    } catch (error) {
      console.error('Erro ao criar matéria:', error);
      
      // Se for erro de matéria já existente, retorna 409 (Conflict)
      if (error.message.includes('já existe')) {
        return res.status(409).json({ error: error.message });
      }
      
      res.status(500).json({ error: error.message });
    }
  }

  // Remover uma matéria
  static async deleteMateria(req, res) {
    try {
      const { materiaId } = req.params;
      const { usuario_id } = req.body; // O usuário que está fazendo a requisição
      
      if (!materiaId || !usuario_id) {
        return res.status(400).json({ 
          error: 'ID da matéria e ID do usuário são obrigatórios' 
        });
      }

      const result = await MateriaService.deleteMateria(materiaId, usuario_id);
      res.json(result);
    } catch (error) {
      console.error('Erro ao remover matéria:', error);
      
      // Se for erro de permissão ou não encontrado, retorna 403 ou 404
      if (error.message.includes('não tem permissão') || error.message.includes('não encontrada')) {
        return res.status(403).json({ error: error.message });
      }
      
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = MateriaController; 