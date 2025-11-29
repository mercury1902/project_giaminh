import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { wikipediaService } from './services/wikipedia-service.js';
import { errorHandler } from './middleware/error-handler.js';
import { requestLogger } from './middleware/request-logger.js';
import { apiLimiter, wikipediaLimiter } from './middleware/rate-limiter.js';
import wikipediaRoutes from './routes/wikipedia-routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(requestLogger);
app.use(apiLimiter); // General rate limiting
app.use(cors({
  origin: process.env.CORS_ORIGIN || ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Wikipedia API Routes (with stricter rate limiting)
app.use('/api/wikipedia', wikipediaLimiter, wikipediaRoutes);

// Cache stats
app.get('/api/cache/stats', (req, res) => {
  const stats = wikipediaService.getCacheStats();
  res.json(stats);
});

// Clear cache
app.post('/api/cache/clear', (req, res) => {
  wikipediaService.clearCache();
  res.json({ message: 'Cache đã được xóa' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'NOT_FOUND',
    message: 'Endpoint không tìm thấy'
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running at http://localhost:${PORT}`);
  console.log(`CORS origin: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
});

export default app;
