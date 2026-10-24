import 'dotenv/config';
import express from 'express';

import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import cors from 'cors';

const app = express();
app.use(
  cors({
    origin: 'http://localhost:5173',
  })
);

const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

app.use('/api/auth', authRoutes);

async function startServer(): Promise<void> {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}

startServer();
