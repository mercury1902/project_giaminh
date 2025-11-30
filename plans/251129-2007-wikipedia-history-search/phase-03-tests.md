# Phase 03: Real Tests (No Mocks)

## Context
Real integration: backend supertest → wikipedia, frontend RTL fetch real backend.

## Requirements
- Backend: 100% pass: 200 ok, 400 invalid q, cache hit, 429 retry.
- Frontend: RTL: render, type input→fetch→cards, error, loading.
- No mocks: nock? No, real calls (env test backend).

## Backend Tests (backend/tests/history-search.test.js)
- supertest(app).get('/api/history/search?q=lịch sử') → 200, pages.length=5.
- ?q= → 400.
- Cache: 2nd call fromCache:true.
- Error: mock fetch fail → 5xx.

## Frontend Tests (src/__tests__/AiHistory.test.jsx)
- render → input default 'lịch sử'.
- submit → loading→cards (waitFor).
- Invalid → error.
- RTL: userEvent.type(input,'test')→fetch.

## Steps
1. npm i -D supertest jest (if missing).
2. backend/tests/history-search.test.js: describe, beforeAll supertest.
3. src/__tests__/AiHistory.test.jsx: render(<AiHistory/>), msWait.
4. Run npm t → 100% pass.

## Rules
- Real: server.listen(0), no mocks.
- Cover: happy/sad paths.
- Modular: separate files.