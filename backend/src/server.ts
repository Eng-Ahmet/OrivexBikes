import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { checkDatabaseConnection } from './config/database.js';
import { initializeSchema } from './db/initSchema.js';
import { requestLogger, errorHandler } from './middleware/logger.js';
import apiRouter from './routes/index.js';

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-dev-user-id', 'x-dev-username', 'x-dev-role', 'x-dev-store-id']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger
app.use(requestLogger);

// API Routes
app.use('/api', apiRouter);

// Frontend Proxy & Static Serving
const frontendPath = path.resolve(process.cwd(), 'frontend');
app.use(express.static(frontendPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(frontendPath, 'public/index.html'));
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
