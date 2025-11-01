/**
 * Express app entry point
 */

import express, { Express } from 'express';
import cors from 'cors';
import { config } from './config';
import coursesRouter from './api/routes/courses';
import schedulesRouter from './api/routes/schedules';
import { errorHandler, notFoundHandler } from './api/middleware/errorHandler';

const app: Express = express();

// Middleware
app.use(cors({
  origin: config.corsOrigin,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Baniere API Server',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      courses: '/api/courses',
      search: '/api/courses/search?q=ADMI',
      sections: '/api/courses/:code',
      subjects: '/api/courses/subjects/list',
      generate: 'POST /api/schedules/generate'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv
  });
});

// API routes
app.use('/api/courses', coursesRouter);
app.use('/api/schedules', schedulesRouter);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const server = app.listen(config.port, () => {
  console.log('');
  console.log('='.repeat(50));
  console.log(`🚀 Baniere Backend Server`);
  console.log('='.repeat(50));
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`Port: ${config.port}`);
  console.log(`CORS Origin: ${config.corsOrigin}`);
  console.log(`Courses JSON: ${config.coursesJsonPath}`);
  console.log('='.repeat(50));
  console.log('');
  console.log('Available endpoints:');
  console.log('  GET  /health');
  console.log('  GET  /api/courses');
  console.log('  GET  /api/courses/search?q=ADMI');
  console.log('  GET  /api/courses/:code');
  console.log('  GET  /api/courses/subjects/list');
  console.log('  POST /api/schedules/generate');
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

export default app;
