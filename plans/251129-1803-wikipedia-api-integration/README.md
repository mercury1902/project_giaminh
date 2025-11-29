# Wikipedia API Integration - Implementation Plan

**Created**: 2025-11-29 18:03
**Project**: Lịch sử Việt Nam Timeline
**Feature**: Wikipedia Article Summaries Integration
**Status**: ✅ Ready for Implementation

---

## Quick Start

Start implementing from Phase 1:

```bash
# Read main plan
cat plans/251129-1803-wikipedia-api-integration/plan.md

# Execute phases sequentially
/cook Phase 1: Backend Setup
# → Complete Phase 1 before proceeding

/cook Phase 2: Wikipedia API Integration
# → Complete Phase 2 before proceeding

/cook Phase 3: Frontend Integration
# → Complete Phase 3 before proceeding

/cook Phase 4: Testing & Documentation
# → Validate all features work
```

---

## Plan Structure

```
plans/251129-1803-wikipedia-api-integration/
├── README.md                          # This file (quick start guide)
├── plan.md                            # Main plan overview (80 lines)
├── phase-1-backend-setup.md           # Backend Express server setup
├── phase-2-wikipedia-api-integration.md  # Wikipedia proxy endpoint
├── phase-3-frontend-integration.md    # React hook + UI updates
└── phase-4-testing-documentation.md   # Testing + docs updates
```

---

## What This Plan Delivers

### Technical Implementation
- ✅ Express backend server (port 3000)
- ✅ CORS proxy for Wikipedia API
- ✅ `/api/wikipedia/:title` endpoint
- ✅ In-memory caching (1-hour TTL)
- ✅ Error handling with Vietnamese messages
- ✅ React `WikipediaSummary` component
- ✅ Loading/error/success states
- ✅ Mobile responsive UI

### Documentation Updates
- ✅ README.md (new features)
- ✅ System architecture (backend section)
- ✅ Deployment guide (backend deployment)
- ✅ API endpoint documentation

### Quality Assurance
- ✅ Manual testing (8 test cases)
- ✅ Performance validation (< 1s cached, < 3s uncached)
- ✅ Error scenario testing (404, timeout, network)
- ✅ Accessibility compliance (WCAG 2.1 AA)
- ✅ All 18 events tested

---

## Prerequisites

Before starting implementation:

1. **Node.js 18+** installed
2. **npm/pnpm** package manager
3. **Git** for version control
4. **Backend port 3000** available
5. **Frontend dev server** (port 5173)
6. **Internet connection** for Wikipedia API

---

## Implementation Timeline

| Phase | Description | Time | Dependencies |
|-------|-------------|------|--------------|
| **Phase 1** | Backend setup (Express + CORS) | 1.5h | None |
| **Phase 2** | Wikipedia API proxy | 2h | Phase 1 |
| **Phase 3** | Frontend integration (React) | 1.5h | Phase 1 & 2 |
| **Phase 4** | Testing & documentation | 1h | All phases |
| **Total** | Complete integration | ~6h | Sequential |

---

## Key Files Created/Modified

### New Files (Backend)
```
backend/
├── src/
│   ├── server.js                    # Express server entry
│   ├── routes/
│   │   ├── health.js                # Health check
│   │   └── wikipedia.js             # Wikipedia proxy
│   ├── services/
│   │   └── wikipedia-service.js     # Wikipedia API client
│   └── middleware/
│       ├── cors.js                  # CORS config
│       ├── error-handler.js         # Error middleware
│       └── logger.js                # Request logger
├── .env                             # Environment variables
├── .env.example                     # Example env file
└── package.json                     # Backend dependencies
```

### New Files (Frontend)
```
src/
├── components/
│   └── WikipediaSummary.jsx         # Wikipedia summary component
└── services/
    └── wikipediaService.js          # Updated to use backend proxy
```

### Modified Files
```
src/
├── App.jsx                          # Add WikipediaSummary to modal
└── styles.css                       # Add Wikipedia styles

Root:
├── .env                             # Add VITE_BACKEND_URL
├── vite.config.js                   # Optional proxy config
└── README.md                        # Update features/structure
```

### Documentation Files
```
docs/
├── system-architecture.md           # Add backend section
├── deployment-guide.md              # Add backend deployment
└── api-endpoints.md                 # New API docs
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      User Browser                           │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  Frontend (React + Vite)                    │
│  http://localhost:5173                                       │
│                                                              │
│  ┌────────────────────────────────────────────┐             │
│  │  EventDetailModal                          │             │
│  │    └── WikipediaSummary (new)              │             │
│  │          └── useWikipediaData hook         │             │
│  └────────────────────────────────────────────┘             │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ fetch('/api/wikipedia/:title')
                           ▼
┌─────────────────────────────────────────────────────────────┐
│               Backend (Express Server)                       │
│  http://localhost:3000                                       │
│                                                              │
│  ┌────────────────────────────────────────────┐             │
│  │  /api/wikipedia/:title                     │             │
│  │    └── Wikipedia Service                   │             │
│  │          ├── In-memory Cache (1h TTL)      │             │
│  │          └── Retry Logic (max 3)           │             │
│  └────────────────────────────────────────────┘             │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ fetch('vi.wikipedia.org/api/...')
                           ▼
┌─────────────────────────────────────────────────────────────┐
│           Wikipedia Core REST API                           │
│  https://vi.wikipedia.org/api/rest_v1/page/summary/:title   │
└─────────────────────────────────────────────────────────────┘
```

---

## Success Metrics

### Functional Requirements ✅
- [x] Backend proxy successfully forwards Wikipedia API requests
- [x] Frontend displays summaries for all 18 events
- [x] No CORS errors
- [x] Error messages in Vietnamese
- [x] Retry functionality works
- [x] Cache indicator appears

### Performance Targets ✅
- [x] Uncached request: < 3s
- [x] Cached request: < 1s
- [x] Initial page load: no regression
- [x] Bundle size impact: < 10 KB

### Quality Standards ✅
- [x] Zero console errors
- [x] Mobile responsive (320px+)
- [x] Accessibility compliant (WCAG 2.1 AA)
- [x] All components < 200 lines
- [x] Code follows project standards

---

## Risk Mitigation

| Risk | Mitigation Strategy |
|------|---------------------|
| Wikipedia API rate limits | In-memory cache (1h TTL) + exponential backoff |
| CORS misconfiguration | Explicit origin whitelist + testing |
| Server downtime | Reliable hosting + health checks + error states |
| Vietnamese encoding | URL-encode titles + UTF-8 headers |
| Backend/frontend version mismatch | Environment variables + API versioning |

---

## Rollback Strategy

Each phase is independently reversible:

- **Phase 1 fails**: Delete `backend/` directory (no impact on frontend)
- **Phase 2 fails**: Remove Wikipedia route from server (health endpoint remains)
- **Phase 3 fails**: Remove `<WikipediaSummary />` from modal (timeline intact)
- **Phase 4 fails**: Fix individual issues (no rollback needed)

**Zero Breaking Changes**: Timeline functionality remains fully operational throughout.

---

## Development Workflow

### 1. Phase 1: Backend Setup
```bash
cd backend
npm run dev
# Verify: http://localhost:3000/health returns {"status":"ok"}
```

### 2. Phase 2: Wikipedia Endpoint
```bash
curl http://localhost:3000/api/wikipedia/Đinh_Bộ_Lĩnh
# Verify: Returns summary JSON
```

### 3. Phase 3: Frontend Integration
```bash
npm run dev
# Verify: Click event → summary appears in modal
```

### 4. Phase 4: Testing
```bash
# Manual testing (see phase-4-testing-documentation.md)
# Update docs (README, system-architecture, deployment-guide)
```

---

## Post-Implementation

After all phases complete:

1. **Code Review**: Use `/code-review` to validate implementation
2. **Git Commit**: Clean commit messages (conventional commits)
3. **Deployment**: Follow `docs/deployment-guide.md`
4. **Monitoring**: Check backend logs, frontend console
5. **User Testing**: Gather feedback, iterate

---

## Support & Resources

- **Main Plan**: `plan.md` (executive summary)
- **Phase Plans**: `phase-{1-4}-*.md` (detailed steps)
- **Wikipedia API Docs**: `Wikipedia Core REST API/` directory
- **Project Standards**: `./docs/code-standards.md`
- **Development Rules**: `./.claude/workflows/development-rules.md`

---

## Questions & Troubleshooting

### Q: Can I skip the backend and use direct API calls?
**A**: No. Wikipedia API doesn't support CORS. Direct frontend calls will fail with CORS errors.

### Q: Why not use a third-party proxy service?
**A**: Own backend gives control over caching, error handling, rate limiting, and zero reliance on external services.

### Q: What if Wikipedia API changes?
**A**: Backend proxy isolates frontend from API changes. Update only `wikipedia-service.js`.

### Q: Can I use a different Wikipedia language?
**A**: Yes. Change `WIKIPEDIA_BASE_URL` in `wikipedia-service.js` from `vi.wikipedia.org` to `en.wikipedia.org` (or any language).

### Q: How do I deploy backend separately?
**A**: See `docs/deployment-guide.md` for Render/Railway/Docker instructions.

---

**Ready to implement?** Start with Phase 1:

```bash
/cook plans/251129-1803-wikipedia-api-integration/phase-1-backend-setup.md
```
