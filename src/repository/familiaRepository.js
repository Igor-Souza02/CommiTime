import pool from '../config/db.js';
import Familia from '../models/familiaModel.js';

class FamiliaRepository {

  /**
   * Cria uma nova família no banco de dados.
   * @param {string} nome - O nome da família.
   * @param {string} codigoConvite - O código de convite gerado.
   * @returns {Promise<Familia>} A instância da família criada.
   */
  async create(nome, codigoConvite) {
    const query = `
      INSERT INTO familias (nome, codigo_convite)
      VALUES ($1, $2)
      RETURNING id, nome, codigo_convite, created_at, updated_at;
    `;
    const values = [nome, codigoConvite];
    const { rows } = await pool.query(query, values);
    const row = rows[0];
    return new Familia(row.id, row.nome, row.codigo_convite, row.created_at, row.updated_at);
  }

  /**
   * Encontra uma família pelo seu código de convite.
   * @param {string} codigoConvite - O código de convite.
   * @returns {Promise<Familia|null>} A instância da família encontrada ou null.
   */
  async findByCodigo(codigoConvite) {
    const query = 'SELECT * FROM familias WHERE codigo_convite = $1;';
    const { rows } = await pool.query(query, [codigoConvite]);

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    return new Familia(row.id, row.nome, row.codigo_convite, row.created_at, row.updated_at);
  }

  /**
   * Encontra uma família pelo seu ID.
   * @param {string} id - O ID da família.
   * @returns {Promise<Familia|null>} A instância da família encontrada ou null.
   */
  async findById(id) {
    const query = 'SELECT * FROM familias WHERE id = $1;';
    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    return new Familia(row.id, row.nome, row.codigo_convite, row.created_at, row.updated_at);
  }

  /**
   * Busca os membros de uma determinada família.
   * @param {string} familiaId - O ID da família.
   * @returns {Promise<Array<Object>>} Uma lista de usuários (sem a senha).
   */
  async findMembrosByFamiliaId(familiaId) {
    const query = `
      SELECT id, name, email, papel
      FROM usuarios
      WHERE familia_id = $1;
    `;
    const { rows } = await pool.query(query, [familiaId]);
    return rows;
  }
}

export default FamiliaRepository; 