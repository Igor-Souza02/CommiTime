import crypto from 'crypto';
import FamiliaRepository from '../repository/familiaRepository.js';
import UserRepository from '../repository/userRepository.js'; // Precisamos interagir com usuários

class FamiliaService {
  constructor() {
    this.familiaRepository = new FamiliaRepository();
    this.userRepository = new UserRepository();
  }

  /**
   * Gera um código de convite aleatório e único.
   * @returns {string} Código de 8 caracteres.
   */
  _gerarCodigoConvite() {
    return crypto.randomBytes(4).toString('hex').toUpperCase();
  }

  /**
   * Cria uma nova família e define o usuário criador como o primeiro responsável.
   * @param {string} nomeFamilia - O nome da nova família.
   * @param {string} usuarioId - O ID do usuário que está criando a família.
   * @returns {Promise<Familia>} A família criada.
   */
  async criarFamilia(nomeFamilia, usuarioId) {
    const usuario = await this.userRepository.findById(usuarioId);
    if (!usuario) {
      throw new Error('Usuário não encontrado.');
    }
    if (usuario.familia_id) {
      throw new Error('Usuário já pertence a uma família.');
    }

    const codigoConvite = this._gerarCodigoConvite();
    
    // Cria a família no banco
    const novaFamilia = await this.familiaRepository.create(nomeFamilia, codigoConvite);

    // Atualiza o usuário para vincular à família e definir o papel
    await this.userRepository.updateFamilia(usuarioId, novaFamilia.id, 'responsavel');

    return novaFamilia;
  }

  /**
   * Adiciona um usuário a uma família existente usando um código de convite.
   * @param {string} codigoConvite - O código para entrar na família.
   * @param {string} usuarioId - O ID do usuário que está entrando.
   * @returns {Promise<Familia>} A família à qual o usuário se juntou.
   */
  async entrarEmFamilia(codigoConvite, usuarioId) {
    const usuario = await this.userRepository.findById(usuarioId);
    if (!usuario) {
      throw new Error('Usuário não encontrado.');
    }
    if (usuario.familia_id) {
      throw new Error('Usuário já pertence a uma família.');
    }

    const familia = await this.familiaRepository.findByCodigo(codigoConvite);
    if (!familia) {
      throw new Error('Código de convite inválido ou família não encontrada.');
    }

    // Atualiza o usuário para vincular à família com o papel de dependente
    await this.userRepository.updateFamilia(usuarioId, familia.id, 'dependente');

    return familia;
  }
  
  /**
   * Busca os detalhes e membros de uma família.
   * @param {string} familiaId - O ID da família do usuário logado.
   * @returns {Promise<Object>} Um objeto com os dados da família e a lista de membros.
   */
  async getDetalhesFamilia(familiaId) {
      if (!familiaId) {
          throw new Error("Usuário não está associado a nenhuma família.");
      }

      // Busca os dados da família e os membros em paralelo
      const [familia, membros] = await Promise.all([
          this.familiaRepository.findById(familiaId),
          this.familiaRepository.findMembrosByFamiliaId(familiaId)
      ]);

      if (!familia) {
        throw new Error("Família não encontrada.");
      }

      return {
          familia: familia.toJSON(),
          membros: membros
      };
  }
}

export default FamiliaService; 