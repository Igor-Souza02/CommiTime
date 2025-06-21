import { pool } from '../database/database.js';
import User from '../models/user.js';

class UserRepository {
  /**
   * Busca um usuário pelo ID.
   * @param {string} id - O ID do usuário a ser buscado.
   * @returns {Promise<User | null>}
   */
  async findById(id) {
    const query = `
      SELECT id, name, email, created_at, updated_at, familia_id, papel
      FROM usuarios
      WHERE id = $1;
    `;
    const result = await pool.query(query, [id]);
    if (result.rows.length > 0) {
      const row = result.rows[0];
      return new User(row.id, row.name, row.email, null, row.created_at, row.updated_at, row.familia_id, row.papel);
    }
    return null;
  }

  /**
   * Atualiza a família e o papel de um usuário.
   * @param {string} usuarioId - O ID do usuário a ser atualizado.
   * @param {string} familiaId - O ID da família para vincular.
   * @param {string} papel - O novo papel do usuário.
   * @returns {Promise<void>}
   */
  async updateFamilia(usuarioId, familiaId, papel) {
    const query = `
      UPDATE usuarios
      SET familia_id = $1, papel = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3;
    `;
    await pool.query(query, [familiaId, papel, usuarioId]);
  }

  async findByEmail(email) {
    const query = `
      SELECT id, name, email, password, created_at, updated_at, familia_id, papel
      FROM usuarios 
      WHERE email = $1;
    `;
    const result = await pool.query(query, [email]);

    if (result.rows.length > 0) {
      const row = result.rows[0];
      // Passa todos os novos campos para o construtor
      return new User(row.id, row.name, row.email, row.password, row.created_at, row.updated_at, row.familia_id, row.papel);
    }

    return null;
  }
}

export default UserRepository; 