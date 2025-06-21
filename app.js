import cors from 'cors';
import express from 'express';
import authRoutes from './routes/authRoutes.js';
import eventRoutes from './routes/evenRoutes.js';
import familiaRoutes from './routes/familiaRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', eventRoutes);
app.use('/api', familiaRoutes);

// Rota de teste
app.get('/', (req, res) => {
  res.send('API CommiTime está no ar!');
});

// Tratamento de erro global (exemplo simples)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Algo deu errado!');
});

export default app; 