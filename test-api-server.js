import express from 'express';
import cors from 'cors';
import handler from './api/history/search.js';

const app = express();
app.use(cors());
app.use(express.json());

// Mock Vercel request/response
function mockReqRes(query, limit = 5, language = 'vi') {
  return {
    query: { q: query, limit: limit.toString(), language },
    method: 'GET',
    headers: {}
  };
}

app.get('/api/history/search', async (req, res) => {
  try {
    // Convert Express request to Vercel format
    const mockReq = {
      query: req.query,
      method: req.method,
      headers: req.headers
    };

    // Mock response object
    let mockResData = null;
    let mockResStatus = 200;
    let mockResHeaders = {};

    const mockRes = {
      status: (code) => {
        mockResStatus = code;
        return {
          json: (data) => {
            mockResData = data;
            res.status(code).json(data);
          },
          setHeader: (key, value) => {
            mockResHeaders[key] = value;
            res.setHeader(key, value);
            return mockRes;
          },
          end: () => {
            res.status(mockResStatus).end();
          }
        };
      },
      setHeader: (key, value) => {
        mockResHeaders[key] = value;
        res.setHeader(key, value);
        return mockRes;
      },
      json: (data) => {
        mockResData = data;
        res.json(data);
      },
      end: () => {
        res.status(mockResStatus).end();
      }
    };

    await handler(mockReq, mockRes);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'INTERNAL_ERROR', message: error.message });
  }
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Test server running on http://localhost:${PORT}`);
  console.log('Test API: http://localhost:3001/api/history/search?q=kháng%20chiến&limit=5');
});