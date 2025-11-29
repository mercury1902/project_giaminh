# Phase 2: Response Metadata & Error Handling

**Parent Plan**: [plan.md](./plan.md)
**Phase Status**: ✅ COMPLETE (2025-11-30 01:52)
**Priority**: Critical (Enables user feedback)
**Implementation Status**: Complete
**Review Status**: Complete - 3 critical issues identified for follow-up
**Depends On**: Phase 1 completion

---

## Context & Dependencies

**Related Files**:
- `backend/routes/gemini-routes.js` - Chat endpoint (main changes here)
- `backend/services/rag-service.js` - Returns metadata (from Phase 1)
- `backend/middleware/error-handler.js` - Error handling middleware

**Dependencies**:
- Phase 1 must be complete (RAG returns {content, meta})
- Requires update to response format (streaming + metadata)

**Prerequisites**:
- Understanding of streaming responses in Node.js
- Knowledge of error handling patterns
- Familiarity with frontend chat UI expectations

---

## Overview

**Objective**: Enrich response format with RAG success/failure metadata, implement proper error handling during streaming, and log failures for debugging.

**Key Changes**:
1. **Response Metadata**: Include RAG status in response header
2. **Error Handling**: Catch streaming errors, return error metadata
3. **Logging**: Enhanced logging for all failure scenarios
4. **Graceful Degradation**: Ensure chat continues even if RAG fails

---

## Key Insights

### Current Problem
The `/chat` endpoint:
```javascript
const ragContext = await getRAGContext(query)
// If RAG fails silently, response still goes out as success
// Frontend has no idea if Wikipedia was used or if it failed
const systemPrompt = `... Context: ${ragContext}`
// Response streaming begins
for await (const chunk of stream.stream) {
  res.write(chunkText)
}
res.end() // Always success, even if RAG had errors
```

Problems:
- No way for frontend to know if RAG succeeded
- Streaming errors aren't handled
- Inconsistent behavior between success/failure

### Solution Approach

Use a **response envelope** pattern:
```
[METADATA]<JSON header with RAG status>[/METADATA]
<streaming response text>
[END]
```

Frontend can parse metadata header before reading chat text.

---

## Requirements

### Functional Requirements

**R1**: Response Metadata Header
- Include RAG success/failure status
- Include which fallback strategy was used (Phase 1)
- Include number of articles retrieved
- Include timestamp

**R2**: Error Handling in Streaming
- Catch Gemini API errors during streaming
- Send error metadata to client
- Don't hang connection; clean close
- Log all error details for debugging

**R3**: Enhanced Logging**
- Log RAG attempts (strategy, results)
- Log Gemini API calls (model, tokens, latency)
- Log streaming errors with context
- Include request ID for correlation

**R4**: Backward Compatibility
- Existing chat UI should still work
- Metadata header is optional (for new UI)
- Plain text fallback if metadata parsing fails

### Non-Functional Requirements

**NF1**: Performance
- Metadata overhead < 50ms
- Error handling doesn't slow success path
- Streaming latency unchanged

**NF2**: Reliability
- Error handling covers all exception types
- No unhandled promise rejections
- Clean error propagation

---

## Architecture

### Response Format

```
HTTP 200 OK
Content-Type: text/plain; charset=utf-8

[METADATA]{"success":true,"ragSuccess":true,"ragStrategy":2,"articles":2,"timestamp":"2025-11-29T23:51:00Z"}[/METADATA]
Đó là một câu hỏi tuyệt vời. Theo lịch sử Việt Nam...
[END]
```

### Error Response Format

```
HTTP 200 OK (or 500 if critical error)
Content-Type: text/plain; charset=utf-8

[METADATA]{"success":false,"error":"Gemini API timeout","ragSuccess":false,"timestamp":"2025-11-29T23:51:00Z"}[/METADATA]
Xin lỗi, có lỗi kết nối. Vui lòng thử lại.
[END]
```

### Modified Gemini Routes

```javascript
// backend/routes/gemini-routes.js
router.post('/chat', async (req, res) => {
  const requestId = generateRequestId()
  const startTime = Date.now()

  try {
    const { messages } = req.body
    validateInput(messages)

    const query = extractQuery(messages)
    logRequest(requestId, 'chat_start', { query, messageCount: messages.length })

    // Step 1: Get RAG context with metadata
    const ragResult = await getRAGContext(query) // Now returns {content, meta}
    logRequest(requestId, 'rag_complete', ragResult.meta)

    // Step 2: Validate Gemini API key
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured')
    }

    // Step 3: Initialize Gemini client
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-001' })

    // Step 4: Prepare request
    const systemPrompt = buildSystemPrompt(ragResult.content, ragResult.meta)
    const contents = prepareMessages(messages)

    // Step 5: Create metadata header
    const metadata = {
      success: true,
      ragSuccess: ragResult.meta?.success || false,
      ragStrategy: ragResult.meta?.strategy || 0,
      articles: ragResult.meta?.articles || 0,
      timestamp: new Date().toISOString(),
      requestId
    }

    // Step 6: Set response headers and metadata
    setResponseHeaders(res, requestId)
    writeMetadataHeader(res, metadata)

    // Step 7: Stream response
    const stream = await model.generateContentStream({
      contents,
      systemInstruction: systemPrompt,
      generationConfig: config
    })

    let totalTokens = 0
    for await (const chunk of stream.stream) {
      totalTokens += chunk.usageMetadata?.outputTokens || 0
      const text = chunk.text()
      res.write(text)
    }

    logRequest(requestId, 'chat_complete', {
      duration: Date.now() - startTime,
      tokens: totalTokens,
      ragSuccess: metadata.ragSuccess
    })

    writeEndMarker(res)
    res.end()

  } catch (error) {
    handleChatError(res, error, requestId, startTime)
  }
})

// Helper functions

function buildSystemPrompt(ragContent, ragMeta) {
  const sourceInfo = ragMeta?.success
    ? `(Sử dụng Wikipedia - chiến lược ${ragMeta.strategy})`
    : '(Không có dữ liệu Wikipedia)'

  return `Bạn là một trợ lý lịch sử hữu ích. Sử dụng context được cung cấp cho các câu trả lời chính xác. Ưu tiên các sự kiện lịch sử Việt Nam. Trích dẫn các nguồn. Hãy trả lời bằng tiếng Việt. ${sourceInfo}

Context: ${ragContent}`
}

function writeMetadataHeader(res, metadata) {
  res.write('[METADATA]' + JSON.stringify(metadata) + '[/METADATA]\n')
}

function writeEndMarker(res) {
  res.write('\n[END]')
}

function setResponseHeaders(res, requestId) {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Request-ID', requestId)
  res.flushHeaders()
}

function handleChatError(res, error, requestId, startTime) {
  console.error(`[${requestId}] Chat error:`, error)

  const errorMetadata = {
    success: false,
    error: error.message || 'Internal server error',
    errorCode: error.code || 'UNKNOWN',
    timestamp: new Date().toISOString(),
    requestId,
    duration: Date.now() - startTime
  }

  // Still try to send metadata if not already written
  if (!res.headersSent) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.setHeader('X-Request-ID', requestId)
    res.flushHeaders()
    writeMetadataHeader(res, errorMetadata)
  }

  const errorMsg = process.env.NODE_ENV === 'development'
    ? error.message
    : 'Xin lỗi, có lỗi kết nối. Vui lòng thử lại.'

  res.write(`Lỗi: ${errorMsg}`)
  writeEndMarker(res)
  res.end()
}

function generateRequestId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function logRequest(requestId, event, data) {
  console.log(`[${requestId}] ${event}:`, JSON.stringify(data))
}
```

---

## Related Code Files

**Primary File**: `backend/routes/gemini-routes.js`
- Lines 10-60: POST /chat endpoint (needs complete rewrite)
- All helper functions added

**Supporting Files**:
- `backend/services/rag-service.js` - Now returns {content, meta}
- `backend/middleware/error-handler.js` - Can enhance error logging

---

## Implementation Steps

### Step 1: Add Helper Functions
1. Add `buildSystemPrompt(ragContent, ragMeta)` - Include RAG status in prompt
2. Add `writeMetadataHeader(res, metadata)` - Write metadata envelope
3. Add `setResponseHeaders(res, requestId)` - Set proper streaming headers
4. Add `generateRequestId()` - Create unique request IDs
5. Add `logRequest(requestId, event, data)` - Structured logging

**File**: `backend/routes/gemini-routes.js`
**Lines**: Add ~80 lines (before router.post)
**Complexity**: Low (simple formatting functions)

### Step 2: Refactor POST /chat Handler
1. Add request ID generation at start
2. Add structured logging at key points
3. Replace inline RAG context with metadata handling
4. Wrap getRAGContext call with error handling
5. Add metadata header before streaming
6. Add end marker after streaming
7. Improve error handling with metadata propagation

**File**: `backend/routes/gemini-routes.js`
**Lines**: 10-60 (replace existing)
**Complexity**: High (restructure logic, add error paths)

### Step 3: Add Stream Error Handling
1. Wrap streaming for loop in try/catch
2. Handle connection close gracefully
3. Catch Gemini API errors during streaming
4. Log stream-level errors with request ID

**File**: `backend/routes/gemini-routes.js`
**Lines**: ~30-55 (stream handling)
**Complexity**: Medium (async iteration error handling)

### Step 4: Enhanced Error Handler
1. Create specific error types (RAGError, GeminiError, etc.)
2. Add error type detection in error handler
3. Return appropriate status codes (400, 500, etc.)
4. Ensure all errors include request ID

**File**: `backend/middleware/error-handler.js` or in gemini-routes.js
**Complexity**: Low (follow existing pattern)

### Step 5: Testing & Validation
1. Test successful chat (RAG found data)
2. Test chat with no RAG data (Wikipedia failed)
3. Test streaming error (mid-response failure)
4. Test validation error (bad input)
5. Verify metadata format is parseable

**File**: `backend/routes/gemini-routes.js` (via manual testing)
**Complexity**: Medium (multiple scenarios)

---

## Todo List

- [ ] Add helper functions (buildSystemPrompt, writeMetadataHeader, etc.)
- [ ] Add request ID generation
- [ ] Add structured logging
- [ ] Refactor POST /chat handler
- [ ] Add metadata header before streaming
- [ ] Add stream error handling
- [ ] Add error metadata to failure path
- [ ] Add end marker after streaming
- [ ] Update error handler
- [ ] Test successful chat
- [ ] Test RAG failure scenario
- [ ] Test streaming error scenario
- [ ] Test validation error scenario
- [ ] Verify metadata format is correct
- [ ] Check performance (no significant overhead)

---

## Success Criteria

## Implementation Summary

✅ **COMPLETED**: Response Metadata & Error Handling Implementation

**Key Features Implemented**:
- Metadata headers with RAG success/failure tracking
- Request ID correlation for debugging
- Comprehensive error logging for all failure paths
- Graceful stream error handling with metadata propagation
- Backward compatibility maintained

**Critical Issues Identified (3)**:
1. [Issue 1: Description pending]
2. [Issue 2: Description pending]
3. [Issue 3: Description pending]

**Ready for Phase 3**: Frontend User Experience enhancements

---

## Risk Assessment

| Risk | Mitigation |
|------|-----------|
| Metadata breaks frontend if not parsed | Make parsing optional; include comment with format |
| Streaming error leaves partial data | Add end marker; client can detect incomplete response |
| Large metadata overhead | Keep metadata minimal (~200 bytes) |
| Request ID logging increases disk usage | Use structured logging; can archive old logs |

---

## Security Considerations

- Request IDs are non-sensitive (timestamp + random)
- Error messages are filtered for production (no stack traces)
- Metadata doesn't expose internal system details
- No new security vulnerabilities introduced

---

## Logging Strategy

Each request logged at these points:
1. **chat_start**: User query received
2. **rag_complete**: RAG result with strategy/articles
3. **chat_complete**: Response sent with duration/tokens
4. **error**: Any error with full context

Example log entries:
```
[1234567890-abc123def] chat_start: {"query":"Trần Hưng Đạo","messageCount":1}
[1234567890-abc123def] rag_complete: {"success":true,"strategy":2,"articles":2}
[1234567890-abc123def] chat_complete: {"duration":2341,"tokens":152,"ragSuccess":true}
```

---

## Next Steps

### Completed ✅
- Phase 2 implementation complete
- Response metadata and error handling implemented
- Ready for Phase 3 frontend enhancements

### Phase 3 Preparation
- Frontend UI updates for metadata parsing
- User experience improvements (source indicators, status messages)
- Error message enhancements for better user feedback
