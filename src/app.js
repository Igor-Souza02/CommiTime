const express = require('express');
const eventRoutes = require('./routes/evenRoutes');
const familiaRoutes = require('./routes/familiaRoutes');
const materiaRoutes = require('./routes/materiaRoutes');
const tarefaRoutes = require('./routes/tarefaRoutes');

const app = express();

// Middleware para parsing JSON
app.use(express.json());

// Configuração das rotas
app.use('/api/events', eventRoutes);
app.use('/api/familias', familiaRoutes);
app.use('/api/materias', materiaRoutes);
app.use('/api/tarefas', tarefaRoutes);

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'API CommiTime funcionando!' });
});

module.exports = app; 