import FamiliaService from '../service/familiaService.js';

class FamiliaController {
  constructor() {
    this.familiaService = new FamiliaService();
  }

  /**
   * Rota para criar uma nova família.
   */
  async criarFamilia(req, res) {
    try {
      const { nome } = req.body;
      const usuarioId = req.user.id; // Vem do middleware de autenticação

      if (!nome) {
        return res.status(400).json({ success: false, error: 'O nome da família é obrigatório.' });
      }

      const novaFamilia = await this.familiaService.criarFamilia(nome, usuarioId);
      
      return res.status(201).json({
        success: true,
        message: 'Família criada com sucesso!',
        familia: novaFamilia.toJSON(),
      });
    } catch (error) {
      console.error('❌ Erro ao criar família:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Rota para um usuário entrar em uma família.
   */
  async entrarEmFamilia(req, res) {
    try {
      const { codigo_convite } = req.body;
      const usuarioId = req.user.id;

      if (!codigo_convite) {
        return res.status(400).json({ success: false, error: 'O código de convite é obrigatório.' });
      }

      const familia = await this.familiaService.entrarEmFamilia(codigo_convite, usuarioId);

      return res.status(200).json({
        success: true,
        message: 'Você entrou na família com sucesso!',
        familia: familia.toJSON(),
      });
    } catch (error) {
      console.error('❌ Erro ao entrar em família:', error);
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  /**
   * Rota para buscar os detalhes da família do usuário logado.
   */
  async getMinhaFamilia(req, res) {
    try {
      const familiaId = req.user.familia_id; // Vem do middleware de autenticação

      if (!familiaId) {
        return res.status(404).json({ success: false, error: 'Você ainda não faz parte de uma família.' });
      }
      
      const detalhes = await this.familiaService.getDetalhesFamilia(familiaId);

      return res.status(200).json({
        success: true,
        ...detalhes,
      });

    } catch (error) {
      console.error('❌ Erro ao buscar detalhes da família:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}

export default FamiliaController; 