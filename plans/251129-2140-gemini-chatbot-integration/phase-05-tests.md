# Phase 05: Tests
**Date**: 251129 **Priority**: Med **Status**: ✅ Complete

## Context
[plan.md](../plan.md)

## Overview
Unit/int tests: backend proxy, rag, frontend hook/UI.

## Key Insights
- Vitest (add?).
- Mock Gemini/wikijs.

## Requirements
- Backend: proxy stream, rag context.
- Frontend: render ChatPanel, hook send/stream.

## Arch
```
vitest.config.js; tests/gemini.test.js; tests/ChatPanel.test.jsx
```

## Files
Create: vitest.config.js, tests/
tests/backend/gemini.test.js, tests/ChatPanel.test.jsx

## Steps
1. npm i -D vitest jsdom @testing-library/react
2. Backend: supertest mock genai.
3. Frontend: rtl render hook.

## Todos
- pending: Setup vitest.

## Success Criteria
- 80% coverage chat flow.

## Risks
- Mock streaming hard.

## Security
N/A

## Next
Phase 06 docs.
