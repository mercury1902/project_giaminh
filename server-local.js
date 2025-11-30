import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { readFileSync } from 'fs';

// Load environment variables from .env
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Import API handlers
import chatHandler from './api/gemini/chat.js';
import searchHandler from './api/history/search.js';

// Mount handlers
app.post('/api/gemini/chat', async (req, res) => {
  await chatHandler(req, res);
});

app.get('/api/history/search', async (req, res) => {
  await searchHandler(req, res);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✓ API Server running at http://localhost:${PORT}`);
});
