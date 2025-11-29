# Phase 4: Testing & Validation

**Parent Plan**: [plan.md](./plan.md)
**Phase Status**: Pending Implementation
**Priority**: Critical (Ensures quality)
**Implementation Status**: Not Started
**Review Status**: Ready for Review
**Depends On**: Phases 1, 2, 3 completion

---

## Context & Dependencies

**Related Files**:
- `backend/tests/` - Existing test infrastructure
- `backend/services/rag-service.js` - RAG logic
- `backend/routes/gemini-routes.js` - Chat endpoint
- `src/components/gemini-chat-panel.jsx` - Frontend UI

**Dependencies**:
- All previous phases must be implemented
- Test framework (existing)
- Node.js test environment

**Prerequisites**:
- Understanding of test scenarios
- Knowledge of mocking APIs
- Familiarity with test assertions

---

## Overview

**Objective**: Comprehensively test all implemented changes across multiple dimensions: unit tests for RAG logic, integration tests for API flow, end-to-end tests for user scenarios, and performance validation.

**Test Coverage**:
1. **RAG Service Tests**: Multi-tier fallback strategies
2. **API Integration Tests**: Metadata handling, error responses
3. **Frontend Tests**: Metadata parsing, UI states, retry logic
4. **End-to-End Tests**: Full chat flow with various scenarios
5. **Performance Tests**: Response time under load

---

## Key Insights

### Testing Strategy
- **Unit Tests**: RAG fallback strategies in isolation
- **Integration Tests**: RAG + Gemini API interaction
- **UI Tests**: Component behavior and state management
- **Scenario Tests**: Real user workflows
- **Load Tests**: Performance under concurrent requests

### Critical Test Scenarios
1. **Success Path**: Wikipedia found → RAG included → strategy 1
2. **Fallback Path**: Primary fails → Fallback succeeds → strategy 2-3
3. **All Fail Path**: All strategies fail → Static context only
4. **Error Path**: Gemini API error → Metadata error sent
5. **Stream Error Path**: Error during streaming → Partial response + error
6. **Retry Path**: User retries failed request → Works on retry

---

## Requirements

### Functional Test Requirements

**R1**: RAG Service Tests
- Test all 3 search strategies execute in order
- Test fallback triggers on previous failure
- Test result validation (empty/invalid results)
- Test caching of results
- Test Vietnamese text normalization
- Test keyword extraction edge cases
- Test timeout handling

**R2**: API Integration Tests
- Test metadata header in response
- Test successful RAG inclusion in system prompt
- Test RAG failure graceful handling
- Test error response format
- Test request ID generation
- Test logging of all events
- Test streaming response format

**R3**: Frontend UI Tests
- Test metadata parsing from response
- Test source indicator display
- Test loading state transitions
- Test error message display
- Test retry button functionality
- Test cancel button functionality
- Test message history updates

**R4**: End-to-End Tests
- Full chat flow: user input → Wikipedia search → Gemini response → UI update
- Various query types: event names, person names, dates, descriptions
- Failure recovery: RAG fails → fallback succeeds → response sent
- Multiple turns: user asks follow-up questions
- Concurrent requests: multiple users chatting simultaneously

### Non-Functional Test Requirements

**NF1**: Performance
- Single request < 5s (with all phases)
- Fallback search < 2s per strategy
- Metadata parsing < 50ms
- UI update smooth (60fps)

**NF2**: Reliability
- 100% success rate for successful scenarios
- Graceful failure for error scenarios
- No unhandled exceptions
- Clean error messages

**NF3**: Accessibility
- Source indicator readable by screen readers
- Error messages announced properly
- Loading states perceivable

---

## Test Scenarios

### Unit Tests: RAG Service

```javascript
// backend/tests/rag-service.test.js

describe('RAG Service', () => {

  describe('searchWikipediaMultiTier', () => {
    it('should use strategy 1 when primary search succeeds', async () => {
      // Mock successful primary search
      // Assert: strategy === 1, results.length > 0
    })

    it('should fallback to strategy 2 when strategy 1 fails', async () => {
      // Mock strategy 1 failure, strategy 2 success
      // Assert: strategy === 2, results found
    })

    it('should fallback to strategy 3 when strategies 1-2 fail', async () => {
      // Mock strategies 1-2 fail, strategy 3 success
      // Assert: strategy === 3, results found
    })

    it('should return null when all strategies fail', async () => {
      // Mock all strategies fail
      // Assert: strategy === 0, results === null
    })

    it('should skip empty results', async () => {
      // Mock strategy 1 returns empty, strategy 2 returns results
      // Assert: strategy === 2
    })
  })

  describe('extractKeywords', () => {
    it('should extract meaningful keywords', () => {
      const keywords = extractKeywords('Trần Hưng Đạo lên đầu')
      // Assert: contains 'Trần', 'Hùng', 'Đạo'
      // Assert: excludes 'lên', 'đầu' (stop words)
    })

    it('should filter short words', () => {
      const keywords = extractKeywords('Lý Thái Tổ là ai')
      // Assert: excludes single-char words
    })

    it('should normalize Vietnamese text', () => {
      const keywords = extractKeywords('LỊch sử Việt Nam')
      // Assert: all lowercase
    })
  })

  describe('getRAGContext', () => {
    it('should return context with metadata', async () => {
      const context = await getRAGContext('Trần Hưng Đạo')
      // Assert: context.content exists
      // Assert: context.meta.success === true
      // Assert: context.meta.strategy > 0
    })

    it('should cache results', async () => {
      const context1 = await getRAGContext('Test')
      const context2 = await getRAGContext('Test')
      // Assert: second call returns immediately (cached)
    })

    it('should handle Wikipedia timeout', async () => {
      // Mock Wikipedia timeout
      const context = await getRAGContext('Some query')
      // Assert: context.content includes static events
      // Assert: context.meta.success === false
    })
  })
})
```

### Integration Tests: API

```javascript
// backend/tests/gemini-routes.test.js

describe('Gemini Chat API', () => {

  describe('POST /api/gemini/chat', () => {
    it('should return 200 with metadata header', async () => {
      const res = await request(app)
        .post('/api/gemini/chat')
        .send({ messages: [{ role: 'user', content: 'Trần Hưng Đạo?' }] })

      // Assert: res.status === 200
      // Assert: res.text includes '[METADATA]'
      // Assert: res.text includes '[/METADATA]'
    })

    it('should include RAG metadata when Wikipedia found', async () => {
      // Mock successful Wikipedia search
      const res = await request(app).post('/api/gemini/chat').send(...)

      const metadata = extractMetadata(res.text)
      // Assert: metadata.ragSuccess === true
      // Assert: metadata.articles > 0
      // Assert: metadata.strategy > 0
    })

    it('should include RAG failure metadata when Wikipedia fails', async () => {
      // Mock Wikipedia failure
      const res = await request(app).post('/api/gemini/chat').send(...)

      const metadata = extractMetadata(res.text)
      // Assert: metadata.ragSuccess === false
      // Assert: metadata.error exists (optional)
    })

    it('should include static events in context on RAG failure', async () => {
      // Mock Wikipedia failure
      const res = await request(app).post('/api/gemini/chat').send(...)

      // Assert: response includes static event information
      // Assert: response generated despite RAG failure
    })

    it('should return error metadata on Gemini API failure', async () => {
      // Mock Gemini API timeout
      const res = await request(app).post('/api/gemini/chat').send(...)

      const metadata = extractMetadata(res.text)
      // Assert: metadata.success === false
      // Assert: metadata.error exists
    })

    it('should handle streaming errors gracefully', async () => {
      // Mock streaming error mid-response
      const res = await request(app).post('/api/gemini/chat').send(...)

      // Assert: partial response received
      // Assert: [END] marker included (if implemented)
      // Assert: error logged
    })

    it('should generate unique request IDs', async () => {
      const res1 = await request(app).post('/api/gemini/chat').send(...)
      const res2 = await request(app).post('/api/gemini/chat').send(...)

      const id1 = res1.get('X-Request-ID')
      const id2 = res2.get('X-Request-ID')
      // Assert: id1 !== id2
    })

    it('should reject invalid messages', async () => {
      const res = await request(app)
        .post('/api/gemini/chat')
        .send({ messages: [] })

      // Assert: res.status === 400
    })

    it('should reject missing API key', async () => {
      // Remove GEMINI_API_KEY
      const res = await request(app)
        .post('/api/gemini/chat')
        .send({ messages: [...] })

      // Assert: res.status === 500
      // Assert: error message returned
    })
  })
})
```

### Frontend Tests: Component

```javascript
// src/components/__tests__/gemini-chat-panel.test.jsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import GeminiChatPanel from '../gemini-chat-panel'

describe('GeminiChatPanel', () => {

  it('should parse metadata from response', async () => {
    // Mock fetch with metadata-containing response
    const response = `[METADATA]{"success":true,"ragSuccess":true,"ragStrategy":2,"articles":2}[/METADATA]
Response text here
[END]`

    render(<GeminiChatPanel isOpen={true} onClose={() => {}} />)

    // User sends message
    const input = screen.getByPlaceholderText(/Hỏi về/i)
    fireEvent.change(input, { target: { value: 'Test' } })
    fireEvent.submit(input.form)

    // Wait for response
    await waitFor(() => {
      // Assert: metadata extracted correctly
      // Assert: display text excludes metadata markers
    })
  })

  it('should show source indicator when RAG successful', async () => {
    // Mock successful RAG response
    render(<GeminiChatPanel isOpen={true} onClose={() => {}} />)

    // Send message, wait for response
    fireEvent.submit(screen.getByPlaceholderText(/Hỏi về/i).form)

    await waitFor(() => {
      // Assert: source indicator visible
      // Assert: shows "Từ Wikipedia"
      // Assert: shows article count
    })
  })

  it('should NOT show source indicator when RAG failed', async () => {
    // Mock failed RAG response
    const response = `[METADATA]{"success":true,"ragSuccess":false}[/METADATA]
Response without Wikipedia data
[END]`

    render(<GeminiChatPanel isOpen={true} onClose={() => {}} />)

    fireEvent.submit(screen.getByPlaceholderText(/Hỏi về/i).form)

    await waitFor(() => {
      // Assert: source indicator NOT visible
      // Assert: response still displayed
    })
  })

  it('should show loading states', async () => {
    render(<GeminiChatPanel isOpen={true} onClose={() => {}} />)

    fireEvent.submit(screen.getByPlaceholderText(/Hỏi về/i).form)

    // Assert: "Đang tìm kiếm Wikipedia..." visible
    // Assert: "Đang suy nghĩ..." shown after
  })

  it('should show error message on failure', async () => {
    // Mock fetch error
    render(<GeminiChatPanel isOpen={true} onClose={() => {}} />)

    fireEvent.submit(screen.getByPlaceholderText(/Hỏi về/i).form)

    await waitFor(() => {
      // Assert: error message displayed
      // Assert: retry button visible
    })
  })

  it('should retry on button click', async () => {
    // Mock initial failure, then success
    render(<GeminiChatPanel isOpen={true} onClose={() => {}} />)

    fireEvent.submit(screen.getByPlaceholderText(/Hỏi về/i).form)

    await waitFor(() => {
      const retryBtn = screen.getByText(/Thử lại/i)
      // Assert: retry button visible

      fireEvent.click(retryBtn)
      // Assert: message sent again
      // Assert: success on second attempt
    })
  })

  it('should cancel request on cancel button', async () => {
    // Mock slow response
    render(<GeminiChatPanel isOpen={true} onClose={() => {}} />)

    fireEvent.submit(screen.getByPlaceholderText(/Hỏi về/i).form)

    const cancelBtn = screen.getByText(/Hủy/i)
    fireEvent.click(cancelBtn)

    // Assert: fetch aborted
    // Assert: loading stopped
    // Assert: message removed
  })

  it('should handle accessibility', () => {
    render(<GeminiChatPanel isOpen={true} onClose={() => {}} />)

    // Assert: dialog role correct
    // Assert: close button labeled
    // Assert: input labeled
  })
})
```

### End-to-End Tests

```javascript
// backend/tests/e2e-chat.test.js

describe('Full Chat Flow', () => {

  const testQueries = [
    'Trần Hưng Đạo',
    'Chiến thắng Bạch Đằng',
    'Giải phóng miền Nam',
    '1453 Việt Nam',
    'Lý Thái Tổ lên ngôi'
  ]

  testQueries.forEach(query => {
    it(`should handle query: "${query}"`, async () => {
      // 1. Send chat message
      const res = await request(app)
        .post('/api/gemini/chat')
        .send({ messages: [{ role: 'user', content: query }] })

      // 2. Assert successful response
      // - Status 200
      // - Metadata header present
      // - Streaming complete (body length > 100)
      // - All expected fields in metadata

      // 3. Assert content quality
      // - Response in Vietnamese
      // - Response mentions relevant events
      // - Response doesn't contain metadata markers

      // 4. Assert RAG status
      // - If Wikipedia found: source indicator present
      // - If Wikipedia failed: graceful response still sent
    })
  })

  it('should handle follow-up questions', async () => {
    // First message
    const msg1 = { role: 'user', content: 'Trần Hưng Đạo là ai?' }
    const res1 = await request(app)
      .post('/api/gemini/chat')
      .send({ messages: [msg1] })

    // Follow-up message (in real app, would reference conversation context)
    const msg2 = { role: 'user', content: 'Chi tiết hơn?' }
    const res2 = await request(app)
      .post('/api/gemini/chat')
      .send({ messages: [msg1, msg2] })

    // Assert: both responses successful
    // Assert: second response references first (if implemented)
  })

  it('should handle rapid successive requests', async () => {
    // Send 5 requests rapidly
    const promises = [1, 2, 3, 4, 5].map(i =>
      request(app)
        .post('/api/gemini/chat')
        .send({ messages: [{ role: 'user', content: `Query ${i}` }] })
    )

    const results = await Promise.all(promises)

    // Assert: all successful (200)
    // Assert: all have unique request IDs
    // Assert: no request blocked by rate limiting
  })
})
```

### Performance Tests

```javascript
// backend/tests/performance.test.js

describe('Performance', () => {

  it('should respond in < 5s', async () => {
    const start = Date.now()
    const res = await request(app)
      .post('/api/gemini/chat')
      .send({ messages: [...] })
    const duration = Date.now() - start

    // Assert: duration < 5000
    console.log(`Response time: ${duration}ms`)
  })

  it('should handle 10 concurrent requests', async () => {
    const start = Date.now()
    const promises = Array(10).fill(null).map(() =>
      request(app)
        .post('/api/gemini/chat')
        .send({ messages: [...] })
    )

    const results = await Promise.all(promises)
    const duration = Date.now() - start

    // Assert: all successful
    // Assert: total time < 30s (avg 3s each)
    // Assert: no memory issues
    console.log(`10 concurrent requests: ${duration}ms`)
  })

  it('should have < 50ms metadata parsing overhead', async () => {
    // Measure metadata parsing time
    const metadata = '[METADATA]{"success":true,"ragSuccess":true}[/METADATA]'

    const start = performance.now()
    for (let i = 0; i < 1000; i++) {
      extractMetadata(metadata)
    }
    const duration = performance.now() - start

    // Assert: avg < 50ms
    console.log(`Avg parsing time: ${duration / 1000}ms`)
  })
})
```

---

## Test Coverage Goals

| Component | Target | Current |
|-----------|--------|---------|
| RAG Service | 90% | TBD |
| Gemini Routes | 85% | TBD |
| Frontend Component | 80% | TBD |
| Utility Functions | 95% | TBD |
| **Overall** | **85%** | **TBD** |

---

## Test Execution Checklist

### Unit Test Phase
- [ ] RAG Service: All search strategies
- [ ] RAG Service: Caching
- [ ] RAG Service: Vietnamese normalization
- [ ] RAG Service: Error handling
- [ ] Utility functions: Keyword extraction
- [ ] Utility functions: Diacritic removal

### Integration Test Phase
- [ ] API response format
- [ ] Metadata header presence
- [ ] RAG success metadata
- [ ] RAG failure metadata
- [ ] Gemini API error handling
- [ ] Stream error handling
- [ ] Request ID generation
- [ ] Input validation

### Frontend Test Phase
- [ ] Metadata parsing
- [ ] Source indicator display
- [ ] Loading state transitions
- [ ] Error message display
- [ ] Retry functionality
- [ ] Cancel functionality
- [ ] Message history

### End-to-End Test Phase
- [ ] Real user queries
- [ ] Follow-up questions
- [ ] Concurrent requests
- [ ] Rapid sequential requests
- [ ] Error recovery
- [ ] Edge cases

### Performance Test Phase
- [ ] Response time < 5s
- [ ] Concurrent request handling
- [ ] Metadata parsing overhead
- [ ] Memory usage
- [ ] CPU usage

---

## Success Criteria

1. ✓ Unit test coverage ≥ 85%
2. ✓ All happy path scenarios pass
3. ✓ All error scenarios handled gracefully
4. ✓ Performance meets targets (< 5s/request)
5. ✓ No unhandled exceptions
6. ✓ All test categories complete
7. ✓ Accessibility validated

---

## Test Results Template

```
Test Execution Report: [Date]

UNIT TESTS
============
RAG Service:    ✓ 12/12 passed
Utilities:      ✓ 8/8 passed
Subtotal:       ✓ 20/20 passed

INTEGRATION TESTS
=================
API Endpoint:   ✓ 15/15 passed
Error Handling: ✓ 8/8 passed
Subtotal:       ✓ 23/23 passed

FRONTEND TESTS
==============
Component:      ✓ 12/12 passed
Accessibility:  ✓ 4/4 passed
Subtotal:       ✓ 16/16 passed

E2E TESTS
=========
Real Queries:   ✓ 5/5 passed
Edge Cases:     ✓ 8/8 passed
Concurrency:    ✓ 3/3 passed
Subtotal:       ✓ 16/16 passed

PERFORMANCE TESTS
=================
Response Time:  ✓ avg 2.8s (< 5s)
Concurrent:     ✓ 10 simultaneous
Memory:         ✓ stable
Subtotal:       ✓ 3/3 passed

TOTAL RESULTS
=============
All Tests:      ✓ 78/78 passed (100%)
Coverage:       ✓ 87% (target: ≥85%)
Performance:    ✓ All targets met
Status:         ✓ READY FOR PRODUCTION
```

---

## Defect Resolution Process

If tests fail:
1. Document failure with test name, condition, expected vs actual
2. Analyze root cause
3. Fix in appropriate phase (1-3)
4. Re-run affected tests
5. Re-run full test suite to ensure no regressions

---

## Next Steps

1. Execute all tests from this phase
2. Document any test failures with root cause
3. Fix issues in appropriate phase
4. Re-run all tests
5. Obtain stakeholder approval
6. Mark implementation as production-ready
