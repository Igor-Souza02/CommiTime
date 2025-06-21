-- Script para criar a tabela de matérias
-- Execute este comando no seu banco de dados PostgreSQL

CREATE TABLE IF NOT EXISTS materias (
    id SERIAL PRIMARY KEY,
    nome_materia VARCHAR(50) NOT NULL,
    usuario_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Índice para melhorar performance nas consultas por usuário
    CONSTRAINT fk_materias_usuario FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Constraint para evitar matérias duplicadas para o mesmo usuário (case insensitive)
    CONSTRAINT unique_materia_usuario UNIQUE (LOWER(nome_materia), usuario_id)
);

-- Criar índice para melhorar performance
CREATE INDEX IF NOT EXISTS idx_materias_usuario_id ON materias(usuario_id);
CREATE INDEX IF NOT EXISTS idx_materias_nome ON materias(LOWER(nome_materia));

-- Comentários para documentação
COMMENT ON TABLE materias IS 'Tabela para armazenar as matérias escolares de cada usuário';
COMMENT ON COLUMN materias.id IS 'Identificador único da matéria';
COMMENT ON COLUMN materias.nome_materia IS 'Nome da matéria escolar';
COMMENT ON COLUMN materias.usuario_id IS 'ID do usuário (dependente) que possui esta matéria';
COMMENT ON COLUMN materias.created_at IS 'Data de criação do registro';
COMMENT ON COLUMN materias.updated_at IS 'Data da última atualização do registro'; 