const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

class TarefaModel {
  static async findByUsuarioId(usuarioId) {
    console.log(`[TAREFA MODEL] Buscando tarefas para o usuario_id: ${usuarioId}`);
    const query = `
      SELECT 
        t.id, 
        t.titulo, 
        t.data_entrega, 
        t.status, 
        json_build_object('nome_materia', COALESCE(m.nome_materia, 'Matéria Removida')) as materia
      FROM tarefas t
      LEFT JOIN materias m ON t.materia_id = m.id
      WHERE t.usuario_id = $1
      ORDER BY t.data_entrega ASC;
    `;
    try {
      console.log('[TAREFA MODEL] Executando a query...');
      const { rows } = await pool.query(query, [usuarioId]);
      console.log(`[TAREFA MODEL] A query retornou ${rows.length} linhas.`);
      console.log('[TAREFA MODEL] Dados retornados pela query:', JSON.stringify(rows, null, 2));
      return rows;
    } catch (error) {
      console.error('[TAREFA MODEL] Erro ao executar a query de tarefas:', error);
      throw error;
    }
  }

  static async create({ titulo, data_entrega, materia_id, usuario_id }) {
    const query = `
      INSERT INTO tarefas (titulo, data_entrega, materia_id, usuario_id, status)
      VALUES ($1, $2, $3, $4, 'pendente')
      RETURNING *;
    `;
    try {
      const { rows } = await pool.query(query, [titulo, data_entrega, materia_id, usuario_id]);
      return rows[0];
    } catch (error) {
      console.error('Erro ao criar tarefa no modelo:', error);
      throw error;
    }
  }

  static async updateStatus(tarefaId, status) {
    const query = `
      UPDATE tarefas
      SET status = $1, data_conclusao = CASE WHEN $1 = 'concluida' THEN NOW() ELSE NULL END
      WHERE id = $2
      RETURNING *;
    `;
    try {
      const { rows } = await pool.query(query, [status, tarefaId]);
      return rows[0];
    } catch (error) {
      console.error('Erro ao atualizar status da tarefa no modelo:', error);
      throw error;
    }
  }
}

module.exports = TarefaModel; 