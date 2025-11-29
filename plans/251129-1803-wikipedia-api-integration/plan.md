# Wikipedia API Integration - Implementation Plan

**Created**: 2025-11-29 18:03
**Status**: Ready for Implementation
**Priority**: High (Phase 4 - AI Integration)

---

## Executive Summary

Add Wikipedia article summaries to Vietnamese history timeline by building Express-based CORS proxy backend to interface with Wikipedia Core REST API. Enables users to access rich historical context without direct cross-origin API calls from frontend.

**Goal**: Proxy Wikipedia API requests to avoid CORS restrictions, integrate summaries into timeline events.

**Current State**: Frontend-only React + Vite app (18 events, no backend)

**Target State**: Full-stack app with Express backend proxying Wikipedia API requests

---

## Architecture Overview

```
Frontend (React)          Backend (Express)        External API
   |                            |                        |
   | GET /api/wikipedia/:title  |                        |
   |--------------------------->|                        |
   |                            | GET /page/summary/{title}
   |                            |----------------------->|
   |                            |<-----------------------|
   |<---------------------------|                        |
   |                            |                        |
```

**Tech Stack**:
- **Backend**: Node.js + Express + CORS + node-fetch
- **Frontend**: React 18 + Custom Hooks (useWikipediaData)
- **API**: Wikipedia Core REST API (public, no auth required)

---

## Implementation Phases

### Phase 1: Backend Setup (Express + CORS Proxy)
**File**: `plans/251129-1803-wikipedia-api-integration/phase-1-backend-setup.md`
- Initialize Express server with CORS middleware
- Configure development/production environments
- Setup error handling & logging
- Test server endpoints

### Phase 2: Wikipedia API Integration (Proxy Endpoint)
**File**: `plans/251129-1803-wikipedia-api-integration/phase-2-wikipedia-api-integration.md`
- Create `/api/wikipedia/:title` endpoint
- Implement Wikipedia API client with error handling
- Add response caching (in-memory)
- Handle rate limiting & retries

### Phase 3: Frontend Integration (React Hook + UI)
**File**: `plans/251129-1803-wikipedia-api-integration/phase-3-frontend-integration.md`
- Update `useWikipediaData` hook to use backend proxy
- Integrate Wikipedia summaries into EventDetailModal
- Add loading/error states with Vietnamese messages
- Implement retry mechanism

### Phase 4: Testing & Documentation
**File**: `plans/251129-1803-wikipedia-api-integration/phase-4-testing-documentation.md`
- Manual testing (all 18 events)
- Error scenario testing (404, timeout, rate limit)
- Performance testing (response times, caching)
- Update README & deployment docs

---

## Key Decisions

1. **Why Express?** Minimal, flexible, industry-standard for Node.js backends
2. **Why CORS Proxy?** Wikipedia API doesn't support CORS; direct frontend calls fail
3. **Caching Strategy**: In-memory cache (LRU) for 1-hour TTL to reduce API calls
4. **Error Handling**: Vietnamese user-facing messages, detailed server logs
5. **Deployment**: Separate frontend (static) + backend (Node.js server) deployment

---

## Success Criteria

- ✅ Backend proxy successfully forwards Wikipedia API requests
- ✅ Frontend displays Wikipedia summaries for all 18 events
- ✅ No CORS errors in browser console
- ✅ Error messages in Vietnamese with retry functionality
- ✅ Response times < 1s (cached) / < 3s (uncached)
- ✅ Zero breaking changes to existing timeline functionality

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Wikipedia API rate limits | High | Cache responses, exponential backoff, user-facing retry |
| CORS misconfiguration | High | Test with production URLs, use explicit origin whitelist |
| Server downtime | Medium | Deploy to reliable platform (Render/Railway), health checks |
| Vietnamese title encoding | Low | URL-encode titles, test with diacritics |
| Large bundle size | Low | Backend separate from frontend, no bundle impact |

---

## Next Steps

1. Review Phase 1 plan: `phase-1-backend-setup.md`
2. Execute implementation sequentially (Phase 1 → 2 → 3 → 4)
3. Use `/cook` command for step-by-step implementation
4. Run tests after each phase before proceeding

---

**Dependencies**: Node.js 18+, Express 4.x, CORS, node-fetch
**Timeline**: ~4-6 hours (including testing)
**LOC Estimate**: Backend (~150 lines), Frontend updates (~50 lines)
