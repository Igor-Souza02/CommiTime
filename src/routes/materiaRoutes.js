const express = require('express');
const MateriaController = require('../controller/materiaController');
const router = express.Router();

// Middleware de autenticação (assumindo que você tem um middleware de auth)
// const authMiddleware = require('../middleware/auth');

// Buscar matérias de um usuário
router.get('/usuario/:usuarioId', MateriaController.getMateriasByUsuario);

// Criar uma nova matéria
router.post('/', MateriaController.createMateria);

// Remover uma matéria
router.delete('/:materiaId', MateriaController.deleteMateria);

module.exports = router; 