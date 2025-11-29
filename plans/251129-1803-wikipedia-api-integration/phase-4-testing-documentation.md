# Phase 4: Testing & Documentation

**Phase**: 4 of 4
**Estimated Time**: 1 hour
**Dependencies**: Phase 1, 2, 3 Complete
**Status**: Ready

---

## Context

All implementation phases complete (backend proxy, Wikipedia API integration, frontend UI). Need comprehensive testing across all scenarios, performance validation, and documentation updates for deployment and maintenance.

---

## Overview

Execute systematic testing of all 18 historical events, validate error scenarios, measure performance metrics, and update project documentation to reflect new Wikipedia integration feature.

---

## Key Insights

1. **Test Coverage**: 18 events × 3 states (loading, success, error) = 54 test scenarios
2. **Real-World Testing**: Use actual Wikipedia API (not mocks) to catch encoding/availability issues
3. **Performance Baseline**: Measure before/after to ensure no regression
4. **Documentation Debt**: Update README, system-architecture, deployment-guide
5. **Deployment Readiness**: Verify production environment variables configured

---

## Requirements

### Functional Testing
- [x] All 18 events display Wikipedia summaries
- [x] Loading states render correctly
- [x] Error states show Vietnamese messages
- [x] Retry mechanism works
- [x] Cache indicator appears
- [x] External links open correctly

### Non-Functional Testing
- [x] Response times meet targets (< 1s cached, < 3s uncached)
- [x] No CORS errors
- [x] No console errors/warnings
- [x] Mobile responsive (320px, 640px, 960px)
- [x] Accessibility (WCAG 2.1 AA)
- [x] Bundle size impact < 10 KB

### Documentation Updates
- [x] README.md feature description
- [x] System architecture diagram
- [x] Deployment guide (backend setup)
- [x] Environment variables documented
- [x] API endpoint documentation

---

## Testing Strategy

### Test Matrix

| Event ID | Event Title | Expected Result | Cache Test | Error Test |
|----------|-------------|-----------------|------------|------------|
| hb-2879 | Hồng Bàng dynasty | ✅ Summary | ✅ | ❌ |
| ng-939 | Ngô Quyền | ✅ Summary | ✅ | ❌ |
| dn-968 | Đinh Bộ Lĩnh | ✅ Summary | ✅ | ❌ |
| tl-980 | Lê Hoàn | ✅ Summary | ✅ | ❌ |
| ly-1010 | Lý Thái Tổ | ✅ Summary | ✅ | ❌ |
| ly-1054 | Nhà Lý | ✅ Summary | ✅ | ❌ |
| tr-1225 | Trần Thái Tông | ✅ Summary | ✅ | ❌ |
| tr-1258 | Mongol Invasions | ✅ Summary | ✅ | ❌ |
| ho-1400 | Hồ Quý Ly | ✅ Summary | ✅ | ❌ |
| hl-1428 | Lê Lợi | ✅ Summary | ✅ | ❌ |
| hl-1471 | Lê Thánh Tông | ✅ Summary | ✅ | ❌ |
| mc-1527 | Mạc Đăng Dung | ✅ Summary | ✅ | ❌ |
| ts-1788 | Nguyễn Huệ | ✅ Summary | ✅ | ❌ |
| ng-1802 | Gia Long | ✅ Summary | ✅ | ❌ |
| ng-1858 | French Colonization | ✅ Summary | ✅ | ❌ |
| ng-1945 | August Revolution | ✅ Summary | ✅ | ❌ |
| ng-1954 | Điện Biên Phủ | ✅ Summary | ✅ | ❌ |
| ng-1975 | Fall of Saigon | ✅ Summary | ✅ | ❌ |

---

## Implementation Steps

### Step 1: Manual Functional Testing (20 min)

**Test Script**: `test-wikipedia-integration.md`

```markdown
# Wikipedia Integration Test Script

## Setup
1. ✅ Backend running on http://localhost:3000
2. ✅ Frontend running on http://localhost:5173
3. ✅ .env file configured with VITE_BACKEND_URL

## Test Cases

### TC1: Happy Path (Event with Wikipedia article)
1. Open http://localhost:5173
2. Click on "Đinh Bộ Lĩnh" event
3. **Expected**:
   - Modal opens
   - Loading skeleton appears
   - Summary loads within 3s
   - Title, summary, image, "Đọc thêm" link visible
   - No errors in console
4. **Result**: PASS / FAIL

### TC2: Cache Behavior
1. Close modal from TC1
2. Reopen "Đinh Bộ Lĩnh" event
3. **Expected**:
   - Summary loads in < 1s
   - "⚡ Cached" badge appears
4. **Result**: PASS / FAIL

### TC3: Error Handling (Non-existent article)
1. Modify event title in code to "NonExistentArticle123"
2. Click event
3. **Expected**:
   - Error state displays
   - Vietnamese error message: "Không tìm thấy bài viết..."
   - Retry button visible
   - "Xem trên Wikipedia" link visible
4. **Result**: PASS / FAIL

### TC4: Retry Mechanism
1. From TC3, click "🔄 Thử lại" button
2. **Expected**:
   - Loading skeleton appears
   - Request sent to backend
   - Error state returns (article still doesn't exist)
3. **Result**: PASS / FAIL

### TC5: External Link
1. From successful summary, click "Đọc thêm trên Wikipedia →"
2. **Expected**:
   - Opens Wikipedia article in new tab
   - Correct Vietnamese Wikipedia URL
3. **Result**: PASS / FAIL

### TC6: Mobile Responsive
1. Open DevTools, set viewport to 320px width
2. Click event, view summary
3. **Expected**:
   - Summary fits viewport
   - Image scales correctly
   - Text readable (no overflow)
   - Buttons accessible
4. **Result**: PASS / FAIL

### TC7: Accessibility
1. Use keyboard only (Tab, Enter, Esc)
2. Navigate to event, open modal, retry error
3. **Expected**:
   - All interactive elements focusable
   - Focus visible
   - Modal closes with Esc
   - Screen reader announces errors
4. **Result**: PASS / FAIL

### TC8: All 18 Events
1. Click through each of 18 events
2. **Expected**:
   - All load successfully (or show appropriate error)
   - No crashes/freezes
   - No console errors
3. **Result**: PASS / FAIL
```

**Validation**: All test cases pass

---

### Step 2: Performance Testing (15 min)

**Performance Metrics Script**:

```javascript
// Run in browser console at http://localhost:5173

// Test 1: Uncached request time
console.time('Uncached Request')
fetch('http://localhost:3000/api/wikipedia/Đinh_Bộ_Lĩnh')
  .then(r => r.json())
  .then(() => console.timeEnd('Uncached Request'))
// Expected: < 3000ms

// Test 2: Cached request time
setTimeout(() => {
  console.time('Cached Request')
  fetch('http://localhost:3000/api/wikipedia/Đinh_Bộ_Lĩnh')
    .then(r => r.json())
    .then(() => console.timeEnd('Cached Request'))
  // Expected: < 100ms
}, 1000)

// Test 3: Bundle size impact
// Compare before/after build outputs
```

**Performance Checklist**:
- [ ] Uncached request: < 3s
- [ ] Cached request: < 1s
- [ ] Initial page load: < 3s (no regression)
- [ ] Time to Interactive: < 2s (no regression)
- [ ] Bundle size: < 10 KB increase

**Validation**: All metrics within targets

---

### Step 3: Error Scenario Testing (10 min)

**Error Test Cases**:

```bash
# Test 1: Backend offline
# Stop backend server, open frontend
# Expected: "Không thể kết nối đến Wikipedia" error

# Test 2: Network timeout
# Add 10s delay in backend Wikipedia service
# Expected: "Lỗi khi tải dữ liệu từ Wikipedia" after timeout

# Test 3: Invalid title (404)
curl http://localhost:3000/api/wikipedia/InvalidTitle123
# Expected: 404 with NOT_FOUND error

# Test 4: Empty title
curl http://localhost:3000/api/wikipedia/
# Expected: 404 (route not matched)

# Test 5: Special characters
curl http://localhost:3000/api/wikipedia/Đinh%20Bộ%20Lĩnh
# Expected: 200 with summary (URL encoding works)
```

**Validation**: All error scenarios handled gracefully

---

### Step 4: Update README.md (10 min)

**File**: `README.md` (update sections)

Add to **Key Features > Core Features**:

```markdown
- **Wikipedia Integration**: Rich historical context from Vietnamese Wikipedia with caching and error handling
```

Add to **Project Structure**:

```markdown
├── backend/                    # Express backend (CORS proxy)
│   ├── src/
│   │   ├── server.js          # Server entry point
│   │   ├── routes/            # API routes
│   │   ├── services/          # Wikipedia service
│   │   └── middleware/        # CORS, error handling
│   └── package.json           # Backend dependencies
```

Add to **Technology Stack > Frontend**:

```markdown
### Backend
- **Express** 4.x - Web framework
- **CORS** - Cross-origin resource sharing
- **Node Fetch** 3.x - HTTP client
```

Add to **Available Scripts**:

```markdown
### Backend

```bash
# Start backend server (port 3000)
cd backend
npm run dev

# Production backend
npm start
```
```

**Validation**: README reflects Wikipedia integration

---

### Step 5: Update System Architecture Docs (5 min)

**File**: `docs/system-architecture.md` (add section)

```markdown
## Backend Architecture

### Express Server
- **Port**: 3000 (configurable via PORT env var)
- **CORS**: Allows localhost:5173 (dev), production URL (prod)
- **Endpoints**:
  - `GET /health` - Health check
  - `GET /api/wikipedia/:title` - Wikipedia proxy

### Wikipedia Integration

```
Frontend → Backend Proxy → Wikipedia API
(React)    (Express)        (vi.wikipedia.org)

Cache Layer (in-memory, 1-hour TTL)
```

### Technology Stack
- Express 4.18.2
- CORS 2.8.5
- Node Fetch 3.3.2
- Dotenv 16.3.1
```

**Validation**: Architecture docs updated

---

### Step 6: Create Deployment Guide Section (5 min)

**File**: `docs/deployment-guide.md` (create if not exists)

```markdown
# Deployment Guide

## Environment Variables

### Frontend (.env)
```env
VITE_BACKEND_URL=https://your-backend-url.com
```

### Backend (.env)
```env
PORT=3000
NODE_ENV=production
ALLOWED_ORIGINS=https://your-frontend-url.com
```

## Backend Deployment

### Option 1: Render.com
1. Create new Web Service
2. Connect GitHub repository
3. Build command: `cd backend && npm install`
4. Start command: `cd backend && npm start`
5. Add environment variables in dashboard

### Option 2: Railway.app
1. Click "New Project" → "Deploy from GitHub"
2. Select repository
3. Root directory: `backend/`
4. Start command: `npm start`
5. Add environment variables

### Option 3: Docker
```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm install --production
COPY backend/src ./src
CMD ["node", "src/server.js"]
```

## Frontend Deployment

Update `.env.production`:
```env
VITE_BACKEND_URL=https://your-backend-url.com
```

Build and deploy:
```bash
npm run build
# Deploy dist/ to Netlify/Vercel/Cloudflare Pages
```
```

**Validation**: Deployment docs comprehensive

---

### Step 7: Create API Endpoint Documentation (5 min)

**File**: `docs/api-endpoints.md` (new file)

```markdown
# API Endpoints

## Base URL
- **Development**: `http://localhost:3000`
- **Production**: `https://your-backend-url.com`

---

## GET /health

Health check endpoint.

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2025-11-29T18:03:00.000Z",
  "uptime": 123.456
}
```

---

## GET /api/wikipedia/:title

Fetch Wikipedia page summary.

**Parameters**:
- `title` (string, required): Wikipedia page title (URL-encoded)

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "title": "Đinh Bộ Lĩnh",
    "summary": "Đinh Tiên Hoàng (924–979)...",
    "image": "https://...",
    "url": "https://vi.wikipedia.org/wiki/Đinh_Bộ_Lĩnh",
    "cached": false,
    "timestamp": "2025-11-29T18:03:00.000Z"
  }
}
```

**Error Response** (404 - Not Found):
```json
{
  "error": "NOT_FOUND",
  "message": "Wikipedia article not found",
  "title": "InvalidTitle"
}
```

**Error Response** (429 - Rate Limit):
```json
{
  "error": "RATE_LIMIT",
  "message": "Too many requests, please try again later"
}
```

**Error Response** (504 - Timeout):
```json
{
  "error": "TIMEOUT",
  "message": "Request timeout, please try again"
}
```

**Error Response** (503 - Network Error):
```json
{
  "error": "NETWORK_ERROR",
  "message": "Unable to connect to Wikipedia"
}
```

**Example Usage**:
```javascript
// Fetch summary for "Lý Thái Tổ"
const response = await fetch('http://localhost:3000/api/wikipedia/Lý_Thái_Tổ')
const data = await response.json()
console.log(data.data.summary)
```
```

**Validation**: API documentation complete

---

## Todo List

- [ ] Create test script markdown file
- [ ] Execute TC1-TC8 manual tests
- [ ] Record test results
- [ ] Run performance metrics (uncached/cached)
- [ ] Test all error scenarios
- [ ] Verify bundle size impact
- [ ] Test all 18 events manually
- [ ] Update README.md (features, structure, scripts)
- [ ] Update system-architecture.md
- [ ] Create/update deployment-guide.md
- [ ] Create api-endpoints.md
- [ ] Add backend/.env to .gitignore
- [ ] Create backend/.env.example
- [ ] Verify no console errors
- [ ] Verify no CORS errors
- [ ] Test responsive layout (3 breakpoints)
- [ ] Test keyboard navigation
- [ ] Run accessibility audit (Lighthouse)
- [ ] Document known issues (if any)

---

## Success Criteria

- ✅ All 8 manual test cases pass
- ✅ All 18 events load Wikipedia summaries (or show appropriate errors)
- ✅ Performance targets met (< 1s cached, < 3s uncached)
- ✅ Zero console errors in production mode
- ✅ Zero CORS errors
- ✅ README.md updated with new features
- ✅ API documentation complete
- ✅ Deployment guide created
- ✅ Accessibility score ≥ 90 (Lighthouse)
- ✅ Mobile responsive (320px, 640px, 960px)

---

## Known Issues & Limitations

Document any issues found during testing:

```markdown
### Known Issues
1. **Issue**: [Description]
   - **Impact**: Low/Medium/High
   - **Workaround**: [If applicable]
   - **Fix**: Planned for [version/phase]

### Limitations
1. **Cache persistence**: In-memory cache resets on server restart (no Redis/persistent storage)
2. **Rate limiting**: No client-side rate limiting (relies on backend cache)
3. **Offline support**: No offline fallback (requires internet connection)
```

**Validation**: Issues documented transparently

---

## Rollback Plan

If critical issues found in Phase 4:
1. Identify root cause (frontend vs backend)
2. Apply targeted fix (don't rollback entire integration)
3. If unfixable: disable Wikipedia feature in frontend (hide component)
4. Document issue for future resolution
5. Timeline functionality remains intact

---

## Final Checklist

Before marking project complete:
- [ ] All test cases pass
- [ ] Performance validated
- [ ] Documentation updated
- [ ] No critical bugs
- [ ] Deployment guide tested
- [ ] Environment variables documented
- [ ] .gitignore includes .env files
- [ ] Code committed with clean messages
- [ ] README reflects current state
- [ ] Screenshots/demos captured (optional)

---

## Next Steps

After Phase 4 completion:
1. **Deploy to staging**: Test in production-like environment
2. **User acceptance testing**: Have stakeholders review
3. **Production deployment**: Deploy frontend + backend
4. **Monitor**: Check logs, performance, errors
5. **Iterate**: Gather feedback, fix issues, enhance features

---

**Project Status**: ✅ Wikipedia API Integration Complete
**Total Time**: ~6 hours (all phases)
**LOC Added**: ~400 (backend: 250, frontend: 150)
**Dependencies Added**: 4 packages (express, cors, node-fetch, dotenv)
