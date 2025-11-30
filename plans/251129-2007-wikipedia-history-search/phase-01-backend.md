# Phase 01: Backend /api/history/search

## Context
Reuse wikipedia-service.search() (handles cache, retry 429, vi lang). New route group /api/history for modularity.

## Requirements
- GET /api/history/search?q={keyword} → {pages: [{title, description, url}]} limit=5.
- Query params: q (req), lang=vi (opt).
- Reuse existing rate-limit (wikipediaLimiter), errorHandler.
- <100lines routes/history-search.js.

## Architecture
server.js → app.use('/api/history', historyRoutes)
historyRoutes.js → router.get('/search', handler → wikipediaService.search(q,5,lang))
Mount before wikipedia routes? No conflict.

## Steps
1. Create backend/routes/history-search.js: import wikipediaService, GET /search → search(q,5,'vi'), err handle.
2. backend/server.js: import historySearchRoutes, app.use('/api/history', historyLimiter? → historySearchRoutes). Reuse wikipediaLimiter if needed.
3. Test: curl http://localhost:3000/api/history/search?q=lịch sử → pages[].

## Rules
- DRY: wikipediaService.search().
- Modular: Separate file.
- Error: Reuse errorHandler.
- No new deps.