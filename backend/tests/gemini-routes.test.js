import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import app from '../server.js';
import * as genaiModule from '@google/generative-ai';
import * as ragService from '../services/rag-service.js';

vi.mock('@google/generative-ai');
vi.mock('../services/rag-service.js');

async function* mockStream() {
  yield { text: () => 'Mock Gemini response' };
}

const mockModel = {
  generateContentStream: vi.fn(async () => ({
    stream: mockStream()
  }))
};

const mockGoogleGenerativeAI = vi.fn(function() {
  this.getGenerativeModel = vi.fn(() => mockModel);
});

beforeEach(() => {
  vi.clearAllMocks();
  process.env.GEMINI_API_KEY = 'test-key';
  vi.mocked(genaiModule).GoogleGenerativeAI = mockGoogleGenerativeAI;

  // Reset mockModel.generateContentStream to default behavior
  mockModel.generateContentStream.mockResolvedValue({
    stream: mockStream()
  });

  // Default mock: new format {content, meta}
  vi.mocked(ragService).getRAGContext.mockResolvedValue({
    content: 'Test RAG context content',
    meta: { success: true, strategy: 1, articles: 2 }
  });
});

afterEach(() => {
  delete process.env.GEMINI_API_KEY;
  vi.restoreAllMocks();
});

describe('Gemini Routes /api/gemini/chat', () => {
  it('returns 200 and streams response for valid messages', async () => {
    const res = await request(app)
      .post('/api/gemini/chat')
      .set('Content-Type', 'application/json')
      .send({ messages: [{ role: 'user', content: 'Test query' }] })
      .expect(200);

    expect(res.text).toContain('[METADATA]');
    expect(res.text).toContain('"success":true');
    expect(res.text).toContain('"ragSuccess":true');
    expect(res.text).toContain('[/METADATA]');
    expect(res.text).toContain('Mock Gemini response');
    expect(res.text).toContain('[END]');
    expect(res.headers['content-type']).toContain('text/plain');
    expect(res.headers['x-request-id']).toBeTruthy();
    expect(mockGoogleGenerativeAI).toHaveBeenCalled();
    expect(mockModel.generateContentStream).toHaveBeenCalled();
  });

  it('returns 200 with error metadata for invalid/empty messages', async () => {
    const res = await request(app)
      .post('/api/gemini/chat')
      .send({})
      .expect(200);

    expect(res.text).toContain('[METADATA]');
    expect(res.text).toContain('"success":false');
    expect(res.text).toContain('Invalid messages array');
  });

  it('returns 200 with error metadata for non-array messages', async () => {
    const res = await request(app)
      .post('/api/gemini/chat')
      .send({ messages: 'invalid' })
      .expect(200);

    expect(res.text).toContain('[METADATA]');
    expect(res.text).toContain('"success":false');
  });

  it('returns 200 with error metadata if GEMINI_API_KEY missing', async () => {
    delete process.env.GEMINI_API_KEY;

    const res = await request(app)
      .post('/api/gemini/chat')
      .send({ messages: [{ role: 'user', content: 'test' }] })
      .expect(200);

    expect(res.text).toContain('[METADATA]');
    expect(res.text).toContain('"success":false');
    expect(res.text).toContain('GEMINI_API_KEY not configured');
  });

  it('returns 200 with error metadata for stream errors', async () => {
    mockModel.generateContentStream.mockRejectedValue(new Error('Stream error'));

    const res = await request(app)
      .post('/api/gemini/chat')
      .send({ messages: [{ role: 'user', content: 'test' }] })
      .expect(200);

    expect(res.text).toContain('[METADATA]');
    expect(res.text).toContain('"success":false');
    expect(res.text).toContain('Stream error');
  });

  describe('Backward Compatibility', () => {
    it('handles new {content, meta} format from getRAGContext', async () => {
      vi.mocked(ragService).getRAGContext.mockResolvedValueOnce({
        content: 'New format RAG content',
        meta: { success: true, strategy: 2, articles: 3 }
      });

      const res = await request(app)
        .post('/api/gemini/chat')
        .send({ messages: [{ role: 'user', content: 'test' }] })
        .expect(200);

      // Verify RAG context is used in system prompt
      expect(mockModel.generateContentStream).toHaveBeenCalled();
      const callArgs = mockModel.generateContentStream.mock.calls[0][0];
      expect(callArgs.systemInstruction).toContain('New format RAG content');
    });

    it('handles legacy string format from getRAGContext (backward compatibility)', async () => {
      vi.mocked(ragService).getRAGContext.mockResolvedValueOnce('Legacy string RAG content');

      const res = await request(app)
        .post('/api/gemini/chat')
        .send({ messages: [{ role: 'user', content: 'test' }] })
        .expect(200);

      // Verify string RAG context is used in system prompt
      const callArgs = mockModel.generateContentStream.mock.calls[0][0];
      expect(callArgs.systemInstruction).toContain('Legacy string RAG content');
    });

    it('handles null/undefined from getRAGContext gracefully', async () => {
      vi.mocked(ragService).getRAGContext.mockResolvedValueOnce(null);

      const res = await request(app)
        .post('/api/gemini/chat')
        .send({ messages: [{ role: 'user', content: 'test' }] })
        .expect(200);

      // Should not crash, system prompt should exist
      const callArgs = mockModel.generateContentStream.mock.calls[0][0];
      expect(callArgs.systemInstruction).toBeTruthy();
    });

    it('handles object without content property gracefully', async () => {
      vi.mocked(ragService).getRAGContext.mockResolvedValueOnce({
        meta: { success: false }
      });

      const res = await request(app)
        .post('/api/gemini/chat')
        .send({ messages: [{ role: 'user', content: 'test' }] })
        .expect(200);

      // Should use the object itself as fallback
      const callArgs = mockModel.generateContentStream.mock.calls[0][0];
      expect(callArgs.systemInstruction).toBeTruthy();
    });
  });

  describe('RAG Context Integration', () => {
    it('calls getRAGContext with user query', async () => {
      const userMessage = 'Tell me about Ngô Quyền';

      await request(app)
        .post('/api/gemini/chat')
        .send({ messages: [{ role: 'user', content: userMessage }] })
        .expect(200);

      expect(ragService.getRAGContext).toHaveBeenCalledWith(userMessage);
    });

    it('extracts query from messages with parts array', async () => {
      const userMessage = 'Test query with parts';

      await request(app)
        .post('/api/gemini/chat')
        .send({
          messages: [{
            role: 'user',
            parts: [{ text: userMessage }]
          }]
        })
        .expect(200);

      expect(ragService.getRAGContext).toHaveBeenCalledWith(userMessage);
    });

    it('includes RAG context in system prompt', async () => {
      const ragContent = 'Historical event: Battle of Bach Dang';
      vi.mocked(ragService).getRAGContext.mockResolvedValueOnce({
        content: ragContent,
        meta: { success: true, strategy: 1 }
      });

      await request(app)
        .post('/api/gemini/chat')
        .send({ messages: [{ role: 'user', content: 'test' }] })
        .expect(200);

      const callArgs = mockModel.generateContentStream.mock.calls[0][0];
      expect(callArgs.systemInstruction).toContain(ragContent);
      expect(callArgs.systemInstruction).toContain('trợ lý lịch sử hữu ích');
    });
  });
});
