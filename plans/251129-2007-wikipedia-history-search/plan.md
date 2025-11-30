# Wikipedia History Search Implementation Plan
Date: 2025-11-29

## Overview
Extend existing Wikipedia proxy/service for /api/history/search?q={keyword} returning pages[]. Update AiHistory.jsx with search UI (input default 'lịch sử'), fetch backend, render 5 cards (title, desc, url). Loading/error states. YAGNI/KISS/DRY: Reuse wikipedia-service search(). Modular <200lines, kebab-case. Follow code-standards.md, design-guidelines.md.

## Key Decisions
- Backend: New /api/history routes/history-search.js proxying wikipedia-service.search() (vi lang, limit=5).
- Frontend: AiHistory.jsx: SearchForm + ResultsCards. Cards: title (H4 Be Vietnam Pro), desc (Lora body), url link. Loading spinner, error msg.
- Tests: Real integration (no mocks): backend supertest, frontend RTL+VRT.
- Colors: Neutral cards, accent links (--accent-primary).
- Responsive: Mobile-first cards grid.

## Phases
1. Backend: Add routes/history-search.js, mount in server.js.
2. Frontend: Update AiHistory.jsx (<200lines).
3. Tests: backend/history-search.test.js, frontend/AiHistory.test.jsx.
4. Docs: Update README, code-standards if needed.
5. Verify: Run tests, manual QA.

## Risks/Deps
- Wikipedia 429: Existing backoff handles.
- CORS: Existing proxy.
- No new deps.

## Success Criteria
- /api/history/search?q=lịch sử → 5 pages JSON.
- AiHistory search → cards render, clickable urls.
- Tests pass 100%.
- <200lines/file.

Unresolved: None.