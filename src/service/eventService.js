import EventRepository from '../repository/eventRepository.js';
import UserRepository from '../repository/userRepository.js';

class EventService {
  constructor() {
    this.eventRepository = new EventRepository();
    this.userRepository = new UserRepository(); // Usado para validar o destinatário
  }

  /**
   * Cria um evento, aplicando regras de permissão.
   * @param {object} eventData - Dados do evento, pode incluir `destinatario_id`.
   * @param {object} criador - O objeto do usuário que está criando o evento.
   */
  async createEvent(eventData, criador) {
    const { destinatario_id, ...dadosPurosDoEvento } = eventData;
    let targetUserId = criador.id;

    // Se um destinatário foi especificado, valida as permissões
    if (destinatario_id && destinatario_id !== criador.id) {
      if (criador.papel !== 'responsavel') {
        throw new Error('Apenas responsáveis podem criar eventos para outros membros.');
      }

      const destinatario = await this.userRepository.findById(destinatario_id);
      if (!destinatario || destinatario.familia_id !== criador.familia_id) {
        throw new Error('Destinatário inválido ou não pertence à mesma família.');
      }
      targetUserId = destinatario.id;
    }

    return this.eventRepository.create(dadosPurosDoEvento, targetUserId);
  }

  /**
   * Atualiza o status de um evento com base nas permissões.
   * @param {string} eventId - O ID do evento.
   * @param {string} newStatus - O novo status desejado.
   * @param {object} user - O usuário que está realizando a ação.
   */
  async updateEventStatus(eventId, newStatus, user) {
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new Error('Evento não encontrado.');
    }

    const validTransitions = {
      pendente: ['concluido'],
      concluido: ['verificado', 'pendente'],
      verificado: ['pendente']
    };

    if (!validTransitions[event.status]?.includes(newStatus)) {
      throw new Error(`Não é possível mudar o status de '${event.status}' para '${newStatus}'.`);
    }

    // Lógica de permissão
    if (newStatus === 'concluido' && event.usuario_id !== user.id) {
      throw new Error('Apenas o usuário responsável pelo evento pode marcá-lo como concluído.');
    }

    if (newStatus === 'verificado' && user.papel !== 'responsavel') {
      throw new Error('Apenas um responsável pode verificar um evento.');
    }
    
    // Um responsável pode reabrir (mudar para 'pendente') qualquer evento da família
    if (newStatus === 'pendente' && user.papel !== 'responsavel') {
        // Se o evento não estiver 'concluido', o próprio usuário pode "desmarcar"
        if(event.status !== 'concluido' || event.usuario_id !== user.id) {
            throw new Error('Apenas um responsável pode reabrir um evento.');
        }
    }

    const destinatario = await this.userRepository.findById(event.usuario_id);
    if(destinatario.familia_id !== user.familia_id) {
        throw new Error('Este evento não pertence à sua família.');
    }
    
    return this.eventRepository.updateStatus(eventId, newStatus);
  }

  async getEventsForUser(user) {
    if (user.papel === 'responsavel') {
      return this.eventRepository.findAllByFamilyId(user.familia_id);
    } else {
      return this.eventRepository.findAllByUserId(user.id);
    }
  }

  // ... (outros métodos)
}

export default EventService; 