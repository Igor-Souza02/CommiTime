const express = require('express');
const TarefaController = require('../controller/tarefaController');
const router = express.Router();

// GET /api/tarefas?usuario_id=...
router.get('/', TarefaController.getTarefas);

// POST /api/tarefas
router.post('/', TarefaController.createTarefa);

// PUT /api/tarefas/:tarefaId/status
router.put('/:tarefaId/status', TarefaController.updateStatus);

module.exports = router; 