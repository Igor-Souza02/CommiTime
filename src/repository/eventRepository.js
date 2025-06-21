import pool from '../config/db.js'; // Supondo que você tenha essa configuração

class EventRepository {
  /**
   * Cria um novo evento no banco de dados.
   * @param {object} eventData - Dados do evento (titulo, data, etc.).
   * @param {string} destinatarioId - O ID do usuário para quem o evento é destinado.
   * @returns {Promise<Event>}
   */
  async create(eventData, destinatarioId) {
    const { titulo, data, hora, tipo, pessoa, descricao } = eventData;
    const query = `
      INSERT INTO eventos (titulo, data, hora, tipo, pessoa, descricao, usuario_id, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'pendente')
      RETURNING *;
    `;
    const values = [titulo, data, hora, tipo, pessoa, descricao, destinatarioId];
    const { rows } = await pool.query(query, values);
    // Assumindo que você tem um modelo 'Event'
    return rows[0];
  }

  /**
   * Atualiza o status de um evento específico.
   * @param {string} eventId - O ID do evento.
   * @param {string} newStatus - O novo status.
   * @returns {Promise<Event>} O evento atualizado.
   */
  async updateStatus(eventId, newStatus) {
    const query = `
      UPDATE eventos
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [newStatus, eventId]);
    if (rows.length === 0) {
      throw new Error('Evento não encontrado.');
    }
    return rows[0];
  }

  /**
   * Busca um evento pelo seu ID.
   * @param {string} eventId - O ID do evento.
   * @returns {Promise<object|null>}
   */
  async findById(eventId) {
    const query = 'SELECT * FROM eventos WHERE id = $1;';
    const { rows } = await pool.query(query, [eventId]);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Busca todos os eventos de uma família.
   * @param {string} familyId - O ID da família.
   * @returns {Promise<Event[]>}
   */
  async findAllByFamilyId(familyId) {
    const query = `
      SELECT e.* FROM eventos e
      JOIN usuarios u ON e.usuario_id = u.id
      WHERE u.familia_id = $1
      ORDER BY e.data, e.hora;
    `;
    const { rows } = await pool.query(query, [familyId]);
    return rows;
  }

  // ... (outros métodos do repositório de eventos)
}

export default EventRepository; 