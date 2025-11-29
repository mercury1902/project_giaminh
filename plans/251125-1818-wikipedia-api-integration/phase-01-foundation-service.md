# Phase 1: Foundation & Service Layer

**Status**: Pending
**Duration**: 2-3 hours
**Owner**: Development Team

---

## Context & Overview

This phase establishes the core infrastructure for Wikipedia API integration:
1. Create `wikipediaService.js` for API calls
2. Create `useFetch.js` custom hook for data management
3. Implement error handling & caching
4. Add timeout & retry logic

---

## Key Insights

- Wikipedia Core REST API requires no authentication
- Rate limit: 500 req/hour unauthenticated (5 req/sec practical)
- Caching essential to avoid redundant calls
- Vietnamese Wikipedia API supports CORS

---

## Requirements

1. Create reusable Wikipedia service module
2. Implement custom fetch hook with state management
3. Add error handling for network failures
4. Implement localStorage caching
5. Add timeout for slow requests
6. Support retry logic for transient errors

---

## Architecture

### wikipediaService.js
```javascript
// Core service for Wikipedia API calls
- searchWikipedia(query) → Promise<SearchResults>
- getWikipediaPageSummary(title) → Promise<PageSummary>
- getWikipediaPageInfo(title) → Promise<PageInfo>
- formatWikipediaData(rawData) → CleanedData
- isPageNotFound(error) → boolean
```

### useFetch.js (Custom Hook)
```javascript
// State management for async data fetching
- useWikipediaData(eventTitle) → {data, loading, error, retry}
- Manages loading state automatically
- Implements caching with localStorage
- Handles error states
- Provides retry mechanism
```

---

## Implementation Steps

### Step 1: Create Wikipedia Service (`src/services/wikipediaService.js`)
- Implement search function
- Implement page summary fetch
- Add error handling
- Add request timeout
- Format API response

### Step 2: Create Custom Hook (`src/hooks/useFetch.js`)
- Implement data fetching logic
- Add state management (data, loading, error)
- Implement localStorage caching
- Add cache invalidation
- Provide retry mechanism

### Step 3: Add Cache Management
- localStorage-based cache
- 7-day expiration for summaries
- Cache key generation
- Cache invalidation on error

### Step 4: Add Error Handling
- Network error handling
- Rate limit error handling (429)
- Page not found handling (404)
- Timeout handling
- Graceful fallbacks

### Step 5: Testing
- Test API service methods
- Test hook with mock data
- Test error scenarios
- Test caching behavior

---

## Todo List

- [ ] Create src/services/wikipediaService.js
- [ ] Create src/hooks/useFetch.js
- [ ] Add cache utility functions
- [ ] Implement error handling
- [ ] Add timeout handling
- [ ] Write unit tests
- [ ] Verify no breaking changes
- [ ] Code review

---

## Success Criteria

1. ✅ wikipediaService.js exports working functions
2. ✅ useFetch hook manages loading/error states
3. ✅ Caching works (localStorage)
4. ✅ API requests complete within 5 seconds
5. ✅ Network errors handled gracefully
6. ✅ No console errors or warnings
7. ✅ All unit tests pass

---

## Security Considerations

- No API keys stored in code
- No sensitive data in localStorage
- CORS requests to public API only
- User-Agent header for identification

---

## Performance Considerations

- Cache results to minimize API calls
- Implement request debouncing
- Set timeout for slow requests
- Use lazy loading (fetch on demand)

---

## Dependencies

- React 18.3.1 (already installed)
- Fetch API (built-in)
- localStorage API (built-in)

**No additional npm packages required**

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Wikipedia API unavailable | Low | Medium | Graceful fallback, error message |
| Rate limiting | Low | Medium | Implement caching, debounce |
| Network timeout | Medium | Low | Set timeout, add retry |
| CORS errors | Low | High | Use correct API endpoint |

---

## Related Code Files

- `src/App.jsx` (lines 77-177) - EventDetailModal
- `src/App.jsx` (lines 307-347) - Search component
- `src/data/events.js` - Event data structure

---

## Next Phase

After Phase 1 completion, move to [Phase 2: Component Integration](./phase-02-component-integration.md) to integrate the service into UI components.

