class User {
  constructor(id, name, email, password, created_at, updated_at, familia_id = null, papel = null) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password; // A senha pode ser nula ao ser retornada para o frontend
    this.created_at = created_at;
    this.updated_at = updated_at;
    this.familia_id = familia_id;
    this.papel = papel;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      created_at: this.created_at,
      updated_at: this.updated_at,
      familia_id: this.familia_id,
      papel: this.papel,
    };
  }
}

export default User; 