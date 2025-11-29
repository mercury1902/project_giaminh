# Phase 2: Wikipedia API Integration (Proxy Endpoint)

**Phase**: 2 of 4
**Estimated Time**: 2 hours
**Dependencies**: Phase 1 Complete
**Status**: Ready

---

## Context

Wikipedia Core REST API provides article summaries at `https://vi.wikipedia.org/api/rest_v1/page/summary/{title}`. Direct frontend access blocked by CORS. Backend proxy required to fetch data and forward to frontend.

---

## Overview

Build `/api/wikipedia/:title` endpoint that proxies requests to Wikipedia API, handles errors, implements caching, and formats responses for frontend consumption.

---

## Key Insights

1. **API Endpoint**: Use Vietnamese Wikipedia (`vi.wikipedia.org`) for local language support
2. **Caching Strategy**: In-memory LRU cache (1-hour TTL) reduces API load by ~80%
3. **Error Taxonomy**: Distinguish NOT_FOUND (404), TIMEOUT, RATE_LIMIT, NETWORK_ERROR for user messaging
4. **URL Encoding**: Vietnamese diacritics (ở, ủ, ế) require proper URL encoding
5. **Rate Limiting**: Wikipedia allows ~200 req/s; our app unlikely to hit limits with caching

---

## Requirements

### Functional Requirements
- [x] `GET /api/wikipedia/:title` endpoint
- [x] Fetch summary from Wikipedia API
- [x] Return structured JSON response
- [x] Cache successful responses (1-hour TTL)
- [x] Handle 404 errors (article not found)
- [x] Handle network errors with retries
- [x] URL-encode Vietnamese characters

### Non-Functional Requirements
- [x] Response time < 1s (cached) / < 3s (uncached)
- [x] Cache hit rate > 70% after 10 requests
- [x] Max memory usage < 50MB
- [x] Retry failed requests (max 3 attempts)
- [x] Detailed error logging

---

## Architecture

### API Flow

```
Frontend                Backend Proxy              Wikipedia API
   |                          |                           |
   | GET /api/wikipedia/     |                           |
   |    Đinh_Bộ_Lĩnh          |                           |
   |------------------------>|                           |
   |                         | Check cache               |
   |                         |----.                      |
   |                         |    | HIT: return cached  |
   |                         |<---'                      |
   |                         |                           |
   |                         | MISS: fetch               |
   |                         | GET /page/summary/        |
   |                         |    Đinh_Bộ_Lĩnh           |
   |                         |-------------------------->|
   |                         |<--------------------------|
   |                         | Cache response            |
   |                         |----.                      |
   |                         |<---'                      |
   |<------------------------|                           |
```

### Data Structure

**Wikipedia API Response**:
```json
{
  "title": "Đinh Bộ Lĩnh",
  "extract": "Đinh Tiên Hoàng (924–979)...",
  "thumbnail": {
    "source": "https://...",
    "width": 200,
    "height": 300
  },
  "content_urls": {
    "desktop": {
      "page": "https://vi.wikipedia.org/wiki/Đinh_Bộ_Lĩnh"
    }
  }
}
```

**Backend Response Format**:
```json
{
  "title": "Đinh Bộ Lĩnh",
  "summary": "Đinh Tiên Hoàng (924–979)...",
  "image": "https://...",
  "url": "https://vi.wikipedia.org/wiki/Đinh_Bộ_Lĩnh",
  "cached": true,
  "timestamp": "2025-11-29T18:03:00Z"
}
```

---

## Implementation Steps

### Step 1: Create Wikipedia Service Module (30 min)

**File**: `backend/src/services/wikipedia-service.js`

```javascript
import fetch from 'node-fetch'

const WIKIPEDIA_BASE_URL = 'https://vi.wikipedia.org/api/rest_v1/page/summary'
const REQUEST_TIMEOUT = 5000 // 5 seconds
const MAX_RETRIES = 3

export class WikipediaService {
  constructor() {
    this.cache = new Map()
    this.CACHE_TTL = 60 * 60 * 1000 // 1 hour
  }

  /**
   * Fetch Wikipedia page summary
   * @param {string} title - Wikipedia page title
   * @returns {Promise<Object>} Formatted response
   */
  async getPageSummary(title) {
    // Check cache first
    const cached = this.getFromCache(title)
    if (cached) {
      return { ...cached, cached: true }
    }

    // Fetch from API with retry logic
    const data = await this.fetchWithRetry(title)

    // Format response
    const formatted = this.formatResponse(data)

    // Cache successful response
    this.setCache(title, formatted)

    return { ...formatted, cached: false }
  }

  /**
   * Fetch with retry and timeout
   */
  async fetchWithRetry(title, attempt = 1) {
    const url = `${WIKIPEDIA_BASE_URL}/${encodeURIComponent(title)}`

    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'LichSuVietNam/1.0 (Educational Project)',
          'Accept': 'application/json'
        }
      })

      clearTimeout(timeout)

      if (!response.ok) {
        if (response.status === 404) {
          throw { code: 'NOT_FOUND', message: 'Article not found' }
        }
        if (response.status === 429) {
          throw { code: 'RATE_LIMIT', message: 'Rate limit exceeded' }
        }
        throw { code: 'API_ERROR', message: `HTTP ${response.status}` }
      }

      return await response.json()
    } catch (error) {
      // Handle abort (timeout)
      if (error.name === 'AbortError') {
        if (attempt < MAX_RETRIES) {
          await this.sleep(1000 * attempt) // Exponential backoff
          return this.fetchWithRetry(title, attempt + 1)
        }
        throw { code: 'TIMEOUT', message: 'Request timeout' }
      }

      // Handle network errors
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        throw { code: 'NETWORK_ERROR', message: 'Network error' }
      }

      // Re-throw known errors
      if (error.code) throw error

      // Unknown errors
      throw { code: 'UNKNOWN_ERROR', message: error.message }
    }
  }

  /**
   * Format Wikipedia API response
   */
  formatResponse(data) {
    return {
      title: data.title,
      summary: data.extract || '',
      image: data.thumbnail?.source || null,
      url: data.content_urls?.desktop?.page || '',
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Cache management
   */
  getFromCache(title) {
    const entry = this.cache.get(title)
    if (!entry) return null

    // Check if expired
    if (Date.now() - entry.timestamp > this.CACHE_TTL) {
      this.cache.delete(title)
      return null
    }

    return entry.data
  }

  setCache(title, data) {
    this.cache.set(title, {
      data,
      timestamp: Date.now()
    })

    // Cleanup old entries (simple LRU)
    if (this.cache.size > 100) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export default new WikipediaService()
```

**Validation**: Module exports singleton instance

---

### Step 2: Create Wikipedia API Route (20 min)

**File**: `backend/src/routes/wikipedia.js`

```javascript
import express from 'express'
import wikipediaService from '../services/wikipedia-service.js'

const router = express.Router()

/**
 * GET /api/wikipedia/:title
 * Fetch Wikipedia page summary
 */
router.get('/:title', async (req, res, next) => {
  try {
    const { title } = req.params

    // Validate title
    if (!title || !title.trim()) {
      return res.status(400).json({
        error: 'INVALID_TITLE',
        message: 'Title parameter is required'
      })
    }

    // Fetch summary
    const data = await wikipediaService.getPageSummary(title)

    // Return success response
    res.json({
      success: true,
      data
    })
  } catch (error) {
    // Handle known errors
    if (error.code === 'NOT_FOUND') {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Wikipedia article not found',
        title: req.params.title
      })
    }

    if (error.code === 'RATE_LIMIT') {
      return res.status(429).json({
        error: 'RATE_LIMIT',
        message: 'Too many requests, please try again later'
      })
    }

    if (error.code === 'TIMEOUT') {
      return res.status(504).json({
        error: 'TIMEOUT',
        message: 'Request timeout, please try again'
      })
    }

    if (error.code === 'NETWORK_ERROR') {
      return res.status(503).json({
        error: 'NETWORK_ERROR',
        message: 'Unable to connect to Wikipedia'
      })
    }

    // Unknown errors
    next(error)
  }
})

export default router
```

**Validation**: Route handles all error scenarios

---

### Step 3: Register Wikipedia Route in Server (10 min)

**File**: `backend/src/server.js` (update)

```javascript
// Add import at top
import wikipediaRouter from './routes/wikipedia.js'

// Add route after health check
app.use('/api/wikipedia', wikipediaRouter)
```

**Validation**: `GET /api/wikipedia/:title` endpoint accessible

---

### Step 4: Add Request Logging (15 min)

**File**: `backend/src/middleware/logger.js`

```javascript
export default function requestLogger(req, res, next) {
  const start = Date.now()

  // Log on response finish
  res.on('finish', () => {
    const duration = Date.now() - start
    const log = {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    }

    console.log(JSON.stringify(log))
  })

  next()
}
```

Update `server.js`:
```javascript
import requestLogger from './middleware/logger.js'

// Add after CORS middleware
if (process.env.NODE_ENV === 'development') {
  app.use(requestLogger)
}
```

**Validation**: Logs appear in console for each request

---

## Todo List

- [ ] Create wikipedia-service.js with cache logic
- [ ] Implement getPageSummary method
- [ ] Implement fetchWithRetry with exponential backoff
- [ ] Implement formatResponse helper
- [ ] Implement cache get/set methods
- [ ] Create wikipedia.js route handler
- [ ] Add input validation for title parameter
- [ ] Add error handling for all error codes
- [ ] Register route in server.js
- [ ] Create request logger middleware
- [ ] Test endpoint with valid title
- [ ] Test endpoint with invalid title (404)
- [ ] Test caching (same request twice)
- [ ] Test Vietnamese diacritics encoding
- [ ] Test timeout scenario
- [ ] Verify cache expiration (1 hour)

---

## Success Criteria

- ✅ `GET /api/wikipedia/Đinh_Bộ_Lĩnh` returns summary
- ✅ Response includes title, summary, image, url
- ✅ Vietnamese characters properly encoded/decoded
- ✅ Cache hit on second identical request
- ✅ 404 error for non-existent articles
- ✅ Timeout after 5 seconds with retry
- ✅ Rate limit error returns 429 status
- ✅ Response time < 1s (cached) / < 3s (uncached)
- ✅ Memory usage < 50MB with 100 cached entries

---

## Testing Checklist

```bash
# 1. Test valid Wikipedia article
curl http://localhost:3000/api/wikipedia/Đinh_Bộ_Lĩnh
# Expected: 200 with summary data

# 2. Test same request (cache hit)
curl http://localhost:3000/api/wikipedia/Đinh_Bộ_Lĩnh
# Expected: 200 with "cached": true

# 3. Test non-existent article
curl http://localhost:3000/api/wikipedia/NonExistentArticle123
# Expected: 404 with NOT_FOUND error

# 4. Test invalid title (empty)
curl http://localhost:3000/api/wikipedia/
# Expected: 404 (route not matched)

# 5. Test Vietnamese diacritics
curl http://localhost:3000/api/wikipedia/Lý_Thái_Tổ
# Expected: 200 with summary data

# 6. Test from frontend (CORS check)
# In browser console at http://localhost:5173:
fetch('http://localhost:3000/api/wikipedia/Đinh_Bộ_Lĩnh')
  .then(r => r.json())
  .then(console.log)
# Expected: No CORS errors, data logged
```

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Wikipedia API down | High | Implement retry logic, graceful error messages |
| Rate limiting | Medium | Cache responses, limit frontend requests |
| Memory leak from cache | Medium | LRU eviction, 100-entry cap, TTL expiration |
| Vietnamese encoding issues | Low | Test all 18 event titles, URL-encode properly |
| Timeout on slow network | Medium | 5s timeout, 3 retries with backoff |

---

## Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uncached request | < 3s | First request to Wikipedia |
| Cached request | < 100ms | Subsequent identical requests |
| Cache hit rate | > 70% | After 10 requests |
| Memory usage | < 50MB | With 100 cached entries |
| Error rate | < 1% | Excluding 404s |

---

## Rollback Plan

If Phase 2 fails:
1. Remove `/api/wikipedia` route registration from server.js
2. Delete `backend/src/routes/wikipedia.js`
3. Delete `backend/src/services/wikipedia-service.js`
4. Server remains functional with health check endpoint

---

## Next Phase

After Phase 2 completion:
→ **Phase 3**: Frontend Integration (React hook + UI updates)
