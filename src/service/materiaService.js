const MateriaRepository = require('../repository/materiaRepository');

class MateriaService {
  static async getMateriasByUsuario(usuarioId) {
    try {
      const materias = await MateriaRepository.findByUsuarioId(usuarioId);
      return { materias };
    } catch (error) {
      throw new Error(`Erro no serviço ao buscar matérias: ${error.message}`);
    }
  }

  static async createMateria(nomeMateria, usuarioId) {
    try {
      // Validações
      if (!nomeMateria || !nomeMateria.trim()) {
        throw new Error('Nome da matéria é obrigatório');
      }

      if (!usuarioId) {
        throw new Error('ID do usuário é obrigatório');
      }

      const nomeMateriaLimpo = nomeMateria.trim();
      if (nomeMateriaLimpo.length < 2) {
        throw new Error('Nome da matéria deve ter pelo menos 2 caracteres');
      }

      if (nomeMateriaLimpo.length > 50) {
        throw new Error('Nome da matéria deve ter no máximo 50 caracteres');
      }

      const materia = await MateriaRepository.create(nomeMateriaLimpo, usuarioId);
      return { materia };
    } catch (error) {
      throw new Error(`Erro no serviço ao criar matéria: ${error.message}`);
    }
  }

  static async deleteMateria(materiaId, usuarioId) {
    try {
      if (!materiaId) {
        throw new Error('ID da matéria é obrigatório');
      }

      if (!usuarioId) {
        throw new Error('ID do usuário é obrigatório');
      }

      // Verificar se a matéria existe e pertence ao usuário
      const materia = await MateriaRepository.findById(materiaId);
      if (!materia) {
        throw new Error('Matéria não encontrada');
      }

      if (materia.usuario_id !== usuarioId) {
        throw new Error('Você não tem permissão para remover esta matéria');
      }

      await MateriaRepository.delete(materiaId, usuarioId);
      return { message: 'Matéria removida com sucesso' };
    } catch (error) {
      throw new Error(`Erro no serviço ao remover matéria: ${error.message}`);
    }
  }
}

module.exports = MateriaService; 