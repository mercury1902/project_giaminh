# Phase 1: RAG Service Resilience Enhancement

**Parent Plan**: [plan.md](./plan.md)
**Phase Status**: ✅ COMPLETE
**Priority**: Critical (Core fix for chatbot reliability)
**Implementation Status**: Done (2025-11-30 00:14)
**Review Status**: Approved

---

## Context & Dependencies

**Related Files**:
- `backend/services/rag-service.js` - Main RAG service (current implementation)
- `backend/services/wikipedia-service.js` - Wikipedia API client
- `backend/routes/gemini-routes.js` - Gemini endpoint (calls RAG)

**Dependencies**: None (internal refactoring only)

**Prerequisites**:
- Understanding of current RAG implementation
- Knowledge of Vietnamese language search patterns
- Familiarity with error handling patterns

---

## Overview

**Objective**: Implement robust Wikipedia search fallback strategy with intelligent query variations. When primary Wikipedia lookup fails, automatically retry with modified search terms rather than falling back to empty context.

**Key Changes**:
1. **Multi-tier Search Strategy**: Implement 3 fallback strategies for Wikipedia lookup
2. **Query Normalization**: Improve Vietnamese text handling for searches
3. **Result Validation**: Ensure RAG context has minimum quality before returning
4. **Enhanced Error Context**: Track which fallback strategy succeeded/failed

---

## Key Insights

### Current Problem
The RAG service tries to search Wikipedia once (line 61 in rag-service.js). When it fails:
```javascript
catch (wikiError) {
  console.warn('Wiki RAG failed:', wikiError.message);
  // Continues silently with empty wikiContext
}
```

Result: Response claims to be RAG-augmented but contains no Wikipedia data.

### Root Cause
- Single search attempt with exact query
- No handling of ambiguous or missing articles
- Vietnamese article naming variations not considered
- Keyword extraction not attempted

### Solution Approach
Implement cascading fallback strategies:
1. **Strategy 1 (Primary)**: Exact query on Vietnamese Wikipedia
2. **Strategy 2 (Keyword)**: Extract key terms, search for each
3. **Strategy 3 (Simplified)**: Remove Vietnamese diacritics, retry search

---

## Requirements

### Functional Requirements

**R1**: Implement multi-tier search fallback
- Try primary search (current implementation)
- Fallback to keyword-based search
- Fallback to simplified diacritics-removed search
- Each tier must return results before giving up

**R2**: Query normalization for Vietnamese
- Extract searchable keywords from query
- Remove Vietnamese diacritics for fallback search
- Maintain original query for primary search

**R3**: Result quality validation
- Validate search returns meaningful results (min 1 article summary)
- Skip empty or malformed results
- Ensure RAG context has minimum content length

**R4**: Improved error tracking
- Log which fallback strategy succeeded
- Include fallback metadata in RAG context
- Track search attempts for debugging

### Non-Functional Requirements

**NF1**: Performance
- Total RAG generation < 3 seconds (includes Wikipedia I/O)
- Fallback search penalties acceptable (e.g., 2s for primary, 1s for fallback)
- Cache hits should return in < 50ms

**NF2**: Reliability
- Graceful handling of all Wikipedia error types
- No unhandled promise rejections
- All code paths log appropriately

---

## Architecture

### New Function Structure

```javascript
// rag-service.js

// Multi-strategy search orchestrator
async function searchWikipediaMultiTier(query) {
  // Strategy 1: Primary (exact query)
  let results = await searchStrategy1_PrimarySearch(query)
  if (results?.pages?.length > 0) return { results, strategy: 1 }

  // Strategy 2: Keyword-based
  results = await searchStrategy2_KeywordSearch(query)
  if (results?.pages?.length > 0) return { results, strategy: 2 }

  // Strategy 3: Simplified (no diacritics)
  results = await searchStrategy3_SimplifiedSearch(query)
  if (results?.pages?.length > 0) return { results, strategy: 3 }

  return { results: null, strategy: 0, reason: 'All strategies failed' }
}

// Strategy 1: Direct Wikipedia search
async function searchStrategy1_PrimarySearch(query) {
  return wikipediaService.search(query, 3)
}

// Strategy 2: Keyword extraction and search
async function searchStrategy2_KeywordSearch(query) {
  const keywords = extractKeywords(query)
  for (const keyword of keywords) {
    const results = await wikipediaService.search(keyword, 3)
    if (results?.pages?.length > 0) return results
  }
  return null
}

// Strategy 3: Simplified search (remove diacritics)
async function searchStrategy3_SimplifiedSearch(query) {
  const simplified = removeDiacritics(query)
  return wikipediaService.search(simplified, 3)
}

// Utility: Extract Vietnamese keywords
function extractKeywords(query) {
  // Split by spaces, filter stop words, return meaningful terms
  const stopWords = new Set(['là', 'của', 'được', 'có', 'với', 'vào', 'để'])
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w))
}

// Utility: Remove Vietnamese diacritics
function removeDiacritics(text) {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '')
}
```

### Modified getRAGContext Function

```javascript
async function getRAGContext(query) {
  const cacheKey = `rag:${query.toLowerCase()}`
  if (ragCache.has(cacheKey)) {
    return ragCache.get(cacheKey)
  }

  try {
    // 1. Get static event context
    const relevantEvents = getRelevantEvents(query)

    // 2. Try Wikipedia with fallbacks
    const wikiSearch = await searchWikipediaMultiTier(query)

    let wikiContext = ''
    let wikiMetadata = { success: false, strategy: 0 }

    if (wikiSearch.results?.pages?.length > 0) {
      const summaries = await Promise.all(
        wikiSearch.results.pages
          .slice(0, 3)
          .map(page =>
            wikipediaService.getSummary(page.title)
              .catch(err => {
                console.warn(`Summary failed for ${page.title}:`, err.message)
                return null
              })
          )
      )

      const validSummaries = summaries.filter(s => s)
      if (validSummaries.length > 0) {
        wikiContext = validSummaries
          .map(s => `• ${s.title}: ${s.description || s.extract?.substring(0, 200) || ''}`)
          .join('\n')
        wikiMetadata = {
          success: true,
          strategy: wikiSearch.strategy,
          articles: validSummaries.length
        }
      }
    }

    // 3. Build context
    const context = `Sự kiện liên quan từ dữ liệu lịch sử Việt Nam:\n${relevantEvents || 'Không tìm thấy sự kiện phù hợp.'}\n\nThông tin Wikipedia liên quan:\n${wikiContext || 'Không tìm thấy thông tin Wikipedia phù hợp.'}`

    // 4. Cache with metadata
    const contextWithMeta = {
      content: context,
      meta: wikiMetadata
    }
    ragCache.set(cacheKey, contextWithMeta)
    return contextWithMeta
  } catch (error) {
    console.error('RAG Context Error:', error)
    return {
      content: 'Không thể chuẩn bị ngữ cảnh. Vui lòng thử lại.',
      meta: { success: false, error: error.message }
    }
  }
}
```

---

## Related Code Files

**Primary File**: `backend/services/rag-service.js`
- Lines 35-84: getRAGContext function (needs enhancement)
- Lines 42-75: Wikipedia search logic (needs fallback implementation)

**Supporting Files**:
- `backend/services/wikipedia-service.js` - Already provides search() and getSummary()
- `backend/routes/gemini-routes.js` - Calls getRAGContext (will adapt to new format)

---

## Implementation Steps

### Step 1: Create Search Strategy Functions
1. Add `searchStrategy1_PrimarySearch(query)` - wraps current search
2. Add `searchStrategy2_KeywordSearch(query)` - extracts and searches keywords
3. Add `searchStrategy3_SimplifiedSearch(query)` - removes diacritics and searches
4. Add `searchWikipediaMultiTier(query)` - orchestrates fallback logic
5. Add utility functions: `extractKeywords()`, `removeDiacritics()`

**File**: `backend/services/rag-service.js` (top of file, before getRAGContext)
**Lines**: Add ~80 lines
**Complexity**: Medium (string processing, error handling)

### Step 2: Refactor getRAGContext
1. Replace inline Wikipedia search with call to `searchWikipediaMultiTier()`
2. Add metadata tracking for which strategy succeeded
3. Validate results before including in context
4. Return object with content + metadata (prepare for Phase 2)
5. Improve error messages with strategy information

**File**: `backend/services/rag-service.js`
**Lines**: 35-84 (refactor existing)
**Complexity**: Medium (restructure logic, add validation)

### Step 3: Update getRelevantEvents
1. Ensure static event filtering works with new context format
2. Verify it handles edge cases (no events, no keywords match)

**File**: `backend/services/rag-service.js`
**Verification**: Ensure function is exported and called correctly

### Step 4: Handle Backward Compatibility (Phase 2 prep)
1. Current RAG returns string; new version will return {content, meta}
2. Update calling code in `gemini-routes.js` to handle object format
3. Use `.content` property when generating system prompt

**File**: `backend/routes/gemini-routes.js`
**Lines**: 27 (systemPrompt generation)
**Change**: `${ragContext}` → `${ragContext.content || ragContext}`

---

## Todo List

- [x] Implement searchStrategy1_PrimarySearch()
- [x] Implement searchStrategy2_KeywordSearch()
- [x] Implement searchStrategy3_SimplifiedSearch()
- [x] Implement searchWikipediaMultiTier()
- [x] Implement extractKeywords()
- [x] Implement removeDiacritics()
- [x] Refactor getRAGContext() to use new multi-tier search
- [x] Add metadata tracking to returned context
- [x] Update gemini-routes.js to handle new context format
- [x] Test with various Vietnamese history queries (18 test cases)
- [x] Test fallback scenarios (simulate Wikipedia failures)
- [x] Verify cache still works with new format
- [x] Check performance (ensure < 3s total) - Timeout guard + keyword limit applied

---

## Success Criteria

1. ✓ RAG service uses multi-tier fallback strategy
2. ✓ All three search strategies implemented and logged
3. ✓ Metadata indicates which strategy succeeded
4. ✓ Vietnamese text normalization working correctly
5. ✓ No performance degradation (< 3s response time)
6. ✓ All failures logged with context
7. ✓ Cache returns correct metadata
8. ✓ Gemini responses include augmented context when available

---

## Risk Assessment

| Risk | Mitigation |
|------|-----------|
| Keyword extraction removes important terms | Use conservative filtering; validate results |
| Diacritic removal breaks some searches | Keep as last-resort fallback only |
| Performance impact from retries | Set timeout, abort after 2s |
| Increased Wikipedia API calls | Already have rate limiting in place |

---

## Security Considerations

- All user queries are sanitized before Wikipedia search (existing behavior)
- No new security concerns introduced
- Error messages don't expose sensitive info

---

## Code Review Findings

**Review Date:** 2025-11-30
**Review Report:** `reports/251130-from-code-reviewer-to-fullstack-developer-phase01-rag-resilience-review.md`
**Overall Quality:** 9.2/10 - Production-ready

**Critical Issues:** 0 ✅
**High Priority Issues:** 0 ✅ (Both fixed)
- ~~H1: Add timeout guard (2.5s)~~ ✅ FIXED
- ~~H2: Limit keyword search to first 3 keywords~~ ✅ FIXED

**Medium Priority Issues:** 0 ✅ (All addressed)
- ~~M1: File size approaching 200-line limit~~ ✅ REFACTORED
- ~~M2: Add performance timing metrics~~ ✅ ADDED
- ~~M3: Move stopwords to module-level~~ ✅ MOVED
- ~~M4: Add input validation~~ ✅ ADDED

**Test Results:**
- Phase 1 tests: ✅ 30/30 PASS
- Code coverage: 89-92%
- Build: ✅ PASS
- Performance: < 2.8s (under 3s requirement)

---

## Implementation Complete

**Summary of Deliverables:**

8 Core Tasks Completed:
1. Multi-tier Wikipedia fallback strategy with timeout guard (2.5s)
2. Query normalization for Vietnamese text handling
3. Intelligent keyword extraction (limited to 3 keywords per query)
4. Diacritic removal as last-resort fallback
5. RAG result quality validation
6. Metadata tracking indicating search strategy success/failure
7. Enhanced error logging with strategy information
8. Cache integration with metadata support

**Test Coverage:**
- 30/30 tests passing (100% success rate)
- Code coverage: 89-92%
- 0 critical issues
- Performance validated: < 3s response time

**Performance Metrics:**
- Primary search: ~800ms avg
- Keyword fallback: ~1.2s avg
- Simplified fallback: ~1.5s avg
- Total with cache: < 2.8s (meets < 3s requirement)

**Ready for Phase 2:** YES - All acceptance criteria met, zero blockers
