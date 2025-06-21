class EventController {
  async createEvent(req, res) {
    try {
      const criador = req.user; // O objeto user completo do token
      const eventData = req.body;
      
      const event = await this.eventService.createEvent(eventData, criador);
      
      return res.status(201).json({
        success: true,
        message: 'Evento criado com sucesso',
        event: event // Assumindo que o repo já retorna um JSON-friendly object
      });
      
    } catch (error) {
      // ... (tratamento de erro)
    }
  }

  async updateEventStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const user = req.user;

      if (!status) {
        return res.status(400).json({ success: false, error: 'O novo status é obrigatório.' });
      }

      const updatedEvent = await this.eventService.updateEventStatus(id, status, user);

      return res.status(200).json({
        success: true,
        message: 'Status do evento atualizado com sucesso.',
        event: updatedEvent,
      });

    } catch (error) {
      console.error('❌ Erro ao atualizar status do evento:', error);
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  async getEvents(req, res) {
    try {
      const user = req.user;
      const events = await this.eventService.getEventsForUser(user);
      return res.status(200).json({
        success: true,
        events,
      });
    } catch (error) {
      console.error('❌ Erro ao buscar eventos:', error);
      return res.status(500).json({ success: false, error: 'Erro interno do servidor.' });
    }
  }
}

export default EventController; 