import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { checkDatabaseConnection } from './config/database.js';
import { initializeSchema } from './db/initSchema.js';
import { requestLogger, errorHandler } from './middleware/logger.js';
import apiRouter from './routes/index.js';

import { requestTracingMiddleware } from './middleware/requestTracing.js';
import { idempotencyMiddleware } from './middleware/idempotency.js';

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'x-request-id', 'Idempotency-Key', 'idempotency-key', 'x-dev-user-id', 'x-dev-username', 'x-dev-role', 'x-dev-store-id']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Tracing & Idempotency Middlewares
app.use(requestTracingMiddleware);
app.use(idempotencyMiddleware);

// Request Logger
app.use(requestLogger);

// API Routes (/api/v1 and /api)
app.use('/api/v1', apiRouter);
app.use('/api', apiRouter);

// Frontend Static Serving & PWA Support
const frontendPath = path.resolve(process.cwd(), 'frontend');
const publicPath = path.join(frontendPath, 'public');

// Serve public static assets (manifest.json, sw.js, assets, assetlinks.json) at root
app.use(express.static(publicPath, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.json') || filePath.endsWith('.js') || filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, must-revalidate');
    }
  }
}));

// Serve source files (/src/styles, /src/js)
app.use('/src', express.static(path.join(frontendPath, 'src'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js') || filePath.endsWith('.css')) {
      res.setHeader('Cache-Control', 'no-cache, must-revalidate');
    }
  }
}));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Global Error Handler
app.use(errorHandler);

const startServer = async () => {
  console.log(`🚀 Starting QQBikes Management Backend on PORT ${PORT}...`);
  await checkDatabaseConnection();
  await initializeSchema();

  app.listen(PORT, () => {
    console.log(`\n==================================================`);
    console.log(`🚲 QQBikes Rental & Store Management System Active`);
    console.log(`🌐 Server running at: http://localhost:${PORT}`);
    console.log(`==================================================\n`);
  });
};

startServer();
