import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { getRAGContext } from '../services/rag-service.js';

dotenv.config();

const router = express.Router();

// ============================================================================
// Helper Functions
// ============================================================================

function generateRequestId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function logRequest(requestId, event, data) {
  const timestamp = new Date().toISOString();
  console.log(`[${requestId}] [${timestamp}] ${event}:`, JSON.stringify(data));
}

function setResponseHeaders(res, requestId) {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Request-ID', requestId);
  res.flushHeaders();
}

function buildSystemPrompt(ragContent, ragMeta, query = '') {
  const hasVietnameseHistoryIntent = query.toLowerCase().includes('lịch sử') &&
    (query.toLowerCase().includes('việt nam') || query.toLowerCase().includes('việt'));

  const sourceInfo = ragMeta?.success
    ? `📚 Dựa trên Wikipedia (${ragMeta.articles} bài viết - chiến lược ${ragMeta.strategy})`
    : '🧠 Dựa trên kiến thức lịch sử Việt Nam';

  return `Bạn là chuyên gia lịch sử Việt Nam thân thiện, luôn cố gắng giúp đỡ.

**NGUYÊN TẮC QUAN TRỌNG**:
- KHÔNG BAO GIỜ "Tôi không tìm thấy thông tin" về lịch sử Việt Nam
- Nếu không có Wikipedia, sử dụng kiến thức chung về lịch sử Việt Nam
- Với câu hỏi chung ("cho tôi biết lịch sử Việt Nam"), giới thiệu các thời kỳ chính
- Luôn trả lời bằng tiếng Việt tự nhiên, thân thiện

**Nguồn dữ liệu**: ${sourceInfo}

**Dữ liệu cụ thể**:
${ragContent}

**Hướng dẫn thêm**:
- Nếu người dùng hỏi chung, giới thiệu tổng quan các thời kỳ lịch sử Việt Nam
- Nếu có Wikipedia, ưu tiên thông tin từ nguồn đó
- Nếu không có Wikipedia, sử dụng kiến thức chung nhưng vẫn cung cấp thông tin hữu ích
- Luôn giữ thái độ tích cực và giúp đỡ`;
}

function writeMetadataHeader(res, metadata) {
  res.write('[METADATA]' + JSON.stringify(metadata) + '[/METADATA]\n');
}

function writeEndMarker(res) {
  res.write('\n[END]');
}

function handleChatError(res, error, requestId, startTime) {
  logRequest(requestId, 'chat_error', {
    error: error.message,
    code: error.code || 'UNKNOWN',
    duration: Date.now() - startTime
  });

  const errorMetadata = {
    success: false,
    error: error.message || 'Internal server error',
    errorCode: error.code || 'UNKNOWN',
    timestamp: new Date().toISOString(),
    requestId,
    duration: Date.now() - startTime
  };

  // Only set headers if not already sent (streaming started)
  if (!res.headersSent) {
    setResponseHeaders(res, requestId);
    writeMetadataHeader(res, errorMetadata);
  }

  const errorMsg = process.env.NODE_ENV === 'development'
    ? error.message
    : 'Xin lỗi, có lỗi kết nối. Vui lòng thử lại.';

  res.write(`Lỗi: ${errorMsg}`);
  writeEndMarker(res);
  res.end();
}

// ============================================================================
// Routes
// ============================================================================

router.post('/chat', async (req, res) => {
  const requestId = generateRequestId();
  const startTime = Date.now();

  try {
    // Step 1: Validate input
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const { messages } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new Error('Invalid messages array');
    }

    // Step 2: Extract query and log request
    const query = messages[messages.length - 1]?.parts?.[0]?.text || messages[messages.length - 1]?.content || '';
    logRequest(requestId, 'chat_start', { query, messageCount: messages.length });

    // Step 3: Get RAG context with metadata
    const ragResult = await getRAGContext(query);
    const ragContent = typeof ragResult === 'string' ? ragResult : ragResult?.content || ragResult;
    const ragMeta = typeof ragResult === 'object' ? ragResult?.meta || { success: false, strategy: 0 } : { success: false, strategy: 0 };

    logRequest(requestId, 'rag_complete', ragMeta);

    // Step 4: Initialize Gemini client
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-001' });

    // Step 5: Prepare system prompt and messages
    const systemPrompt = buildSystemPrompt(ragContent, ragMeta, query);
    const contents = messages.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content || (msg.parts && msg.parts[0] ? msg.parts[0].text || msg.parts[0] : '') }]
    })).filter(c => c.parts[0].text.trim());

    // Step 6: Set response headers (don't write metadata yet)
    setResponseHeaders(res, requestId);

    // Step 7: Generate stream (before writing metadata, so we can catch errors)
    let stream;
    try {
      stream = await model.generateContentStream({
        contents,
        systemInstruction: systemPrompt,
        generationConfig: {
          temperature: 0.3,
          topK: 32,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      });
    } catch (streamError) {
      logRequest(requestId, 'stream_creation_error', {
        error: streamError.message
      });
      // Stream creation failed, send error metadata
      const errorMetadata = {
        success: false,
        error: streamError.message,
        timestamp: new Date().toISOString(),
        requestId
      };
      writeMetadataHeader(res, errorMetadata);
      res.write('Lỗi: Không thể tạo luồng phản hồi. Vui lòng thử lại.');
      writeEndMarker(res);
      res.end();
      return;
    }

    // Step 8: Create and write success metadata header (stream creation succeeded)
    const metadata = {
      success: true,
      ragSuccess: ragMeta?.success || false,
      ragStrategy: ragMeta?.strategy || 0,
      articles: ragMeta?.articles || 0,
      timestamp: new Date().toISOString(),
      requestId
    };
    writeMetadataHeader(res, metadata);

    // Step 9: Stream response
    let totalTokens = 0;
    try {
      for await (const chunk of stream.stream) {
        totalTokens += chunk.usageMetadata?.outputTokens || 0;
        const chunkText = chunk.text();
        res.write(chunkText);
      }
    } catch (streamError) {
      logRequest(requestId, 'stream_error', {
        error: streamError.message,
        tokensBeforeError: totalTokens
      });
      throw streamError;
    }

    // Step 10: Log completion and write end marker
    logRequest(requestId, 'chat_complete', {
      duration: Date.now() - startTime,
      tokens: totalTokens,
      ragSuccess: metadata.ragSuccess
    });

    writeEndMarker(res);
    res.end();

  } catch (error) {
    handleChatError(res, error, requestId, startTime);
  }
});

export default router;
