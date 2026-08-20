import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import apiRouter from './routes/index.js';
import { requestLogger, errorHandler } from './middleware/logger.js';
import { requestTracingMiddleware } from './middleware/requestTracing.js';
import { idempotencyMiddleware } from './middleware/idempotency.js';

export const app = express();

// CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'x-request-id', 'Idempotency-Key', 'idempotency-key', 'X-Store-Context', 'x-store-context', 'x-dev-user-id', 'x-dev-username', 'x-dev-role', 'x-dev-store-id']
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

// Explicit Digital Asset Links handler for Android TWA Verification
app.get('/.well-known/assetlinks.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-cache, must-revalidate');
  res.sendFile(path.join(publicPath, '.well-known/assetlinks.json'), (err) => {
    if (err && !res.headersSent) {
      res.status(200).json([{
        relation: ["delegate_permission/common.handle_all_urls"],
        target: {
          namespace: "android_app",
          package_name: "com.orivexbike.app.twa",
          sha256_cert_fingerprints: ["14:8A:26:7D:96:A7:D5:78:E8:4A:43:9C:A2:0A:79:33:9E:04:84:70:C6:FB:99:9B:F3:D5:29:4A:4C:E3:FA:30"]
        }
      }]);
    }
  });
});

// Serve public static assets (manifest.json, sw.js, assets, assetlinks.json) at root
app.use(express.static(publicPath, {
  setHeaders: (res: express.Response, filePath: string) => {
    if (filePath.endsWith('.json') || filePath.endsWith('.js') || filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, must-revalidate');
    }
  }
}));

// Serve source files (/src/styles, /src/js)
app.use('/src', express.static(path.join(frontendPath, 'src'), {
  setHeaders: (res: express.Response, filePath: string) => {
    if (filePath.endsWith('.js') || filePath.endsWith('.css')) {
      res.setHeader('Cache-Control', 'no-cache, must-revalidate');
    }
  }
}));

app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Global Error Handler
app.use(errorHandler);
