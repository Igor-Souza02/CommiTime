const router = express.Router();

// PUT /api/events/:id/status - Atualizar o status de um evento
router.put('/events/:id/status', 
  eventController.updateEventStatus.bind(eventController)
);

// DELETE /api/events/:id - Deletar evento
// ... (resto do arquivo) 