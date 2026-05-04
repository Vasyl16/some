import cors from 'cors';
import express from 'express';
import type { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { ZodError } from 'zod';
import applicationRouter from './routes/applicationRoutes';
import analyticsRouter from './routes/analyticsRoutes';
import authRouter from './routes/authRoutes';
import jobRouter from './routes/jobRoutes';
import profileRouter from './routes/profileRoutes';
import ratingRouter from './routes/ratingRoutes';
import topsisRouter from './routes/topsisRoutes';
import uploadRouter from './routes/uploadRoutes';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get('/api/health', (_req, res) => {
  res.status(200).json({ message: 'Backend is running' });
});

app.use('/api/auth', authRouter);
app.use('/api/profile', profileRouter);
app.use('/api/jobs', jobRouter);
app.use('/api/applications', applicationRouter);
app.use('/api/ratings', ratingRouter);
app.use('/api/topsis', topsisRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/uploads', uploadRouter);

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof SyntaxError && 'body' in error) {
    res.status(400).json({ message: 'Invalid JSON body' });
    return;
  }

  if (error instanceof ZodError) {
    res.status(400).json({
      message: 'Validation failed',
      errors: error.issues.map((issue) => ({
        field: issue.path.join('.') || 'body',
        message: issue.message,
      })),
    });
    return;
  }

  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ message: 'File is too large. Max size is 5MB' });
      return;
    }
    res.status(400).json({ message: error.message });
    return;
  }

  if (error instanceof Error) {
    res.status(400).json({ message: error.message });
    return;
  }

  res.status(500).json({ message: 'Internal server error' });
});

export default app;
