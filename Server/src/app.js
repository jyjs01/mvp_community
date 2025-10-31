import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import authRoutes from './features/auth/auth.route.js';
import postRoutes from './features/posts/posts.route.js';
// import fileRoutes from './features/files/files.route.js';
import { errorHandler } from './middlewares/error.js';

const app = express();

app.use(cors({ origin: env.CORS_ORIGIN?.split(',') || true, credentials: true }));
app.use(express.json());

app.use('/uploads', express.static('uploads'));

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/auth', authRoutes);
app.use('/posts', postRoutes);
// app.use('/files', fileRoutes);

app.use(errorHandler);

export default app;
