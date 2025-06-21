const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

class MateriaModel {
  // Buscar todas as matérias de um usuário
  static async findByUsuarioId(usuarioId) {
    const query = `
      SELECT id, nome_materia, usuario_id, created_at
      FROM materias 
      WHERE usuario_id = $1 
      ORDER BY nome_materia ASC
    `;
    const result = await pool.query(query, [usuarioId]);
    return result.rows;
  }

  // Criar uma nova matéria
  static async create(nomeMateria, usuarioId) {
    // Verificar se já existe uma matéria com o mesmo nome para este usuário
    const existingQuery = `
      SELECT id FROM materias 
      WHERE nome_materia ILIKE $1 AND usuario_id = $2
    `;
    const existingResult = await pool.query(existingQuery, [nomeMateria, usuarioId]);
    
    if (existingResult.rows.length > 0) {
      throw new Error('Matéria já existe para este usuário');
    }

    const query = `
      INSERT INTO materias (nome_materia, usuario_id) 
      VALUES ($1, $2) 
      RETURNING id, nome_materia, usuario_id, created_at
    `;
    const result = await pool.query(query, [nomeMateria, usuarioId]);
    return result.rows[0];
  }

  // Remover uma matéria
  static async delete(materiaId, usuarioId) {
    const query = `
      DELETE FROM materias 
      WHERE id = $1 AND usuario_id = $2 
      RETURNING id
    `;
    const result = await pool.query(query, [materiaId, usuarioId]);
    return result.rows[0];
  }

  // Verificar se uma matéria existe
  static async findById(materiaId) {
    const query = `
      SELECT id, nome_materia, usuario_id 
      FROM materias 
      WHERE id = $1
    `;
    const result = await pool.query(query, [materiaId]);
    return result.rows[0];
  }
}

module.exports = MateriaModel; 