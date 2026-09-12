import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes, { usersRouter } from './routes/authRoutes.js';
import issueRoutes from './routes/issueRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import geoRoutes from './routes/geoRoutes.js';
import demoRoutes from './routes/demoRoutes.js';
import { departmentRouter, categoryRouter } from './routes/metaRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads serving
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
const healthHandler = (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'Smart Bhavnagar Municipal Platform API',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
};
app.get('/health', healthHandler);
app.get('/api/health', healthHandler);
app.get('/api/v1/health', healthHandler);

// Mount both standard /api/* and legacy /api/v1/* prefixes for maximum compatibility
const mountEndpoints = (prefix) => {
  app.use(`${prefix}/auth`, authRoutes);
  app.use(`${prefix}/users`, usersRouter);
  app.use(`${prefix}/issues`, issueRoutes);
  app.use(`${prefix}/departments`, departmentRouter);
  app.use(`${prefix}/categories`, categoryRouter);
  app.use(`${prefix}/ai`, aiRoutes);
  app.use(`${prefix}/admin`, adminRoutes);
  app.use(`${prefix}/geo`, geoRoutes);
  app.use(`${prefix}/demo`, demoRoutes);
};

mountEndpoints('/api');
mountEndpoints('/api/v1');

// Centralized Error Handling
app.use(errorHandler);

export default app;
