import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT ?? 4000;

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.get('/', (_req, res) => res.json({ status: 'ok', message: 'Middleware running' }));
app.use('/api/auth', authRouter);

app.use(errorHandler);

app.listen(PORT, () => console.log(`Middleware running on http://localhost:${PORT}`));
