import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { getRAGContext } from '../services/rag-service.js';

dotenv.config();

const router = express.Router();

router.post('/chat', async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
    }

    const { messages } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Invalid messages array' });
    }
    const query = messages[messages.length - 1]?.parts?.[0]?.text || messages[messages.length - 1]?.content || '';
    const ragResult = await getRAGContext(query);

    // Handle both old (string) and new (object) formats for backward compatibility
    const ragContext = typeof ragResult === 'string' ? ragResult : ragResult?.content || ragResult;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-001' });

    // Convert messages to Gemini format (system prompt + contents)
    const systemPrompt = `You are a helpful history assistant. Use provided context for accurate responses. Prioritize Vietnamese history facts. Cite sources. Respond in Vietnamese unless asked otherwise. Context: ${ragContext}`;

    const contents = messages.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content || (msg.parts && msg.parts[0] ? msg.parts[0].text || msg.parts[0] : '') }]
    })).filter(c => c.parts[0].text.trim());

    const stream = await model.generateContentStream({
      contents,
      systemInstruction: systemPrompt,
      generationConfig: {
        temperature: 0.3,
        topK: 32,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    });

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    for await (const chunk of stream.stream) {
      const chunkText = chunk.text();
      res.write(chunkText);
    }

    res.end();
  } catch (error) {
    console.error('Gemini error:', error);
    res.status(500).json({ error: 'Internal server error', details: process.env.NODE_ENV === 'development' ? error.message : 'Chat service unavailable' });
  }
});

export default router;
