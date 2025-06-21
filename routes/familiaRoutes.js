import express from 'express';
import FamiliaController from '../controller/familiaController.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();
const familiaController = new FamiliaController();

// Todas as rotas de família requerem autenticação
router.use(authenticateToken);

// POST /api/familias - Criar uma nova família
router.post(
  '/familias', 
  familiaController.criarFamilia.bind(familiaController)
);

// POST /api/familias/join - Entrar em uma família com um código
router.post(
  '/familias/join', 
  familiaController.entrarEmFamilia.bind(familiaController)
);

// GET /api/familias/me - Obter detalhes da família do usuário logado
router.get(
  '/familias/me', 
  familiaController.getMinhaFamilia.bind(familiaController)
);

export default router; 