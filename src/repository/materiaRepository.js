const MateriaModel = require('../models/materiaModel');

class MateriaRepository {
  static async findByUsuarioId(usuarioId) {
    try {
      return await MateriaModel.findByUsuarioId(usuarioId);
    } catch (error) {
      throw new Error(`Erro ao buscar matérias: ${error.message}`);
    }
  }

  static async create(nomeMateria, usuarioId) {
    try {
      return await MateriaModel.create(nomeMateria, usuarioId);
    } catch (error) {
      throw new Error(`Erro ao criar matéria: ${error.message}`);
    }
  }

  static async delete(materiaId, usuarioId) {
    try {
      const materia = await MateriaModel.delete(materiaId, usuarioId);
      if (!materia) {
        throw new Error('Matéria não encontrada ou você não tem permissão para removê-la');
      }
      return materia;
    } catch (error) {
      throw new Error(`Erro ao remover matéria: ${error.message}`);
    }
  }

  static async findById(materiaId) {
    try {
      return await MateriaModel.findById(materiaId);
    } catch (error) {
      throw new Error(`Erro ao buscar matéria: ${error.message}`);
    }
  }
}

module.exports = MateriaRepository; 