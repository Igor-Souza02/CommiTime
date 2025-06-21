// src/models/familiaModel.js

class Familia {
  constructor(id, nome, codigo_convite, created_at, updated_at) {
    this.id = id;
    this.nome = nome;
    this.codigo_convite = codigo_convite;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }

  toJSON() {
    return {
      id: this.id,
      nome: this.nome,
      codigo_convite: this.codigo_convite,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }
}

export default Familia; 