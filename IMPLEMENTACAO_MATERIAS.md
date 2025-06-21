# Implementação da Funcionalidade de Matérias

## Resumo do Problema
O erro `TypeError: Cannot read property 'id' of undefined` estava ocorrendo porque o frontend tentava acessar endpoints de matérias que não existiam no backend.

## Solução Implementada

### 1. Backend (Node.js/Express)

#### Arquivos Criados:
- `src/models/materiaModel.js` - Modelo para interação com o banco de dados
- `src/repository/materiaRepository.js` - Camada de repositório
- `src/service/materiaService.js` - Lógica de negócio
- `src/controller/materiaController.js` - Controlador HTTP
- `src/routes/materiaRoutes.js` - Rotas da API

#### Endpoints Criados:
- `GET /api/materias/usuario/:usuarioId` - Buscar matérias de um usuário
- `POST /api/materias` - Criar nova matéria
- `DELETE /api/materias/:materiaId` - Remover matéria

#### Arquivo Modificado:
- `src/app.js` - Adicionadas as rotas de matérias

### 2. Frontend (React Native/Expo)

#### Arquivo Modificado:
- `app/gerenciar-materias.tsx` - Melhorado tratamento de erros

### 3. Banco de Dados

#### Script SQL:
- `create_materias_table.sql` - Comando para criar a tabela

## Como Implementar

### 1. Execute o Script SQL
```sql
-- Execute o conteúdo do arquivo create_materias_table.sql no seu banco PostgreSQL
```

### 2. Reinicie o Backend
```bash
# No diretório do backend
npm start
# ou
node src/app.js
```

### 3. Teste a Funcionalidade
1. Acesse a tela "Gerenciar Matérias" no app
2. Selecione um dependente
3. Tente adicionar uma matéria (ex: "Português")
4. Verifique se não há mais erros

## Funcionalidades Implementadas

### ✅ Validações
- Nome da matéria obrigatório (2-50 caracteres)
- Verificação de duplicatas (case insensitive)
- Permissões de usuário

### ✅ Tratamento de Erros
- Erro 409 para matérias duplicadas
- Erro 403 para falta de permissão
- Mensagens de erro amigáveis no frontend

### ✅ Segurança
- Verificação de propriedade da matéria
- Validação de dados de entrada
- Sanitização de strings

## Estrutura da Tabela

```sql
materias (
    id SERIAL PRIMARY KEY,
    nome_materia VARCHAR(50) NOT NULL,
    usuario_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

## Próximos Passos

1. **Teste completo**: Verifique se todas as operações CRUD funcionam
2. **Integração com tarefas**: Conecte as matérias com a funcionalidade de tarefas
3. **Validações adicionais**: Adicione mais validações se necessário
4. **Logs**: Implemente logs para debugging

## Troubleshooting

### Erro "Cannot read property 'id' of undefined"
- **Causa**: Backend não implementado ou tabela não criada
- **Solução**: Execute o script SQL e reinicie o backend

### Erro "Matéria já existe"
- **Causa**: Tentativa de criar matéria duplicada
- **Solução**: Use um nome diferente ou remova a matéria existente

### Erro de conexão
- **Causa**: Backend não está rodando
- **Solução**: Verifique se o servidor está ativo e acessível 