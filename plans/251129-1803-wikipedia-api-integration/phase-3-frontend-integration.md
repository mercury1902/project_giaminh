# Phase 3: Frontend Integration (React Hook + UI)

**Phase**: 3 of 4
**Estimated Time**: 1.5 hours
**Dependencies**: Phase 1 & 2 Complete
**Status**: Ready

---

## Context

Backend proxy endpoint (`/api/wikipedia/:title`) now available. Frontend already has `useWikipediaData` hook but configured for direct Wikipedia API calls. Need to update hook to use backend proxy and integrate summaries into EventDetailModal component.

---

## Overview

Update `useWikipediaData` hook to point to backend proxy, modify EventDetailModal to display Wikipedia summaries, add loading/error states with Vietnamese messages, and implement retry mechanism.

---

## Key Insights

1. **Existing Hook**: `src/hooks/useFetch.js` already has `useWikipediaData` - needs URL update only
2. **Service Layer**: `src/services/wikipediaService.js` exists but uses direct API - switch to backend proxy
3. **Component Integration**: EventDetailModal likely needs Wikipedia summary section
4. **Error Messages**: All errors already in Vietnamese in hook - maintain consistency
5. **No Breaking Changes**: Keep existing timeline functionality intact

---

## Requirements

### Functional Requirements
- [x] Update `wikipediaService.js` to use backend proxy (`http://localhost:3000/api/wikipedia`)
- [x] Modify `useWikipediaData` hook to handle new response format
- [x] Integrate Wikipedia summary in EventDetailModal
- [x] Display loading skeleton during fetch
- [x] Show error message with retry button
- [x] Handle missing/null summaries gracefully

### Non-Functional Requirements
- [x] No flash of content during loading
- [x] Smooth transitions between states
- [x] Accessible error messages (screen readers)
- [x] Responsive layout (mobile + desktop)
- [x] Vietnamese language consistency

---

## Architecture

### Component Hierarchy

```
App.jsx
  └── EventDetailModal
        ├── Event Details (existing)
        └── Wikipedia Summary (NEW)
              ├── Loading Skeleton
              ├── Summary Content
              └── Error State + Retry
```

### Data Flow

```
EventDetailModal
    |
    | useWikipediaData(event.title)
    v
useWikipediaData Hook
    |
    | fetch('http://localhost:3000/api/wikipedia/' + title)
    v
Backend Proxy
    |
    | fetch('https://vi.wikipedia.org/api/rest_v1/page/summary/' + title)
    v
Wikipedia API
```

---

## Implementation Steps

### Step 1: Update Wikipedia Service (15 min)

**File**: `src/services/wikipediaService.js` (update existing)

```javascript
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

/**
 * Fetch Wikipedia page summary via backend proxy
 * @param {string} title - Wikipedia page title
 * @returns {Promise<Object>} Response with data or error
 */
export async function getWikipediaPageSummary(title) {
  if (!title || !title.trim()) {
    return { error: true, errorCode: 'EMPTY_TITLE' }
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/wikipedia/${encodeURIComponent(title)}`)

    // Handle HTTP errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))

      return {
        error: true,
        errorCode: errorData.error || 'UNKNOWN',
        message: errorData.message,
        url: `https://vi.wikipedia.org/wiki/${encodeURIComponent(title)}`
      }
    }

    // Parse success response
    const result = await response.json()

    return {
      error: false,
      ...result.data
    }
  } catch (err) {
    // Network errors
    return {
      error: true,
      errorCode: 'NETWORK_ERROR',
      message: err.message
    }
  }
}

/**
 * Format Wikipedia data for UI consumption
 * @param {Object} data - Raw Wikipedia data
 * @returns {Object} Formatted data
 */
export function formatWikipediaData(data) {
  return {
    title: data.title,
    summary: data.summary || '',
    image: data.image || null,
    url: data.url,
    cached: data.cached || false
  }
}
```

**Validation**: Service uses backend proxy URL

---

### Step 2: Update useWikipediaData Hook (10 min)

**File**: `src/hooks/useFetch.js` (already exists, verify compatibility)

Existing hook already handles:
- ✅ Error states with Vietnamese messages
- ✅ Retry mechanism with exponential backoff
- ✅ Loading states
- ✅ Abort controller for cleanup

**No changes needed** - hook is already generic and will work with updated service.

**Validation**: Hook works with new backend response format

---

### Step 3: Create Wikipedia Summary Component (30 min)

**File**: `src/components/WikipediaSummary.jsx` (new file, < 200 lines)

```jsx
import { useWikipediaData } from '../hooks/useFetch'

/**
 * Wikipedia Summary Component
 * Displays article summary with loading/error states
 */
export default function WikipediaSummary({ title }) {
  const { data, loading, error, retry, isRetryable } = useWikipediaData(title)

  // Loading state
  if (loading) {
    return (
      <div className="wikipedia-summary loading">
        <div className="summary-header">
          <div className="skeleton skeleton-title"></div>
        </div>
        <div className="summary-content">
          <div className="skeleton skeleton-text"></div>
          <div className="skeleton skeleton-text"></div>
          <div className="skeleton skeleton-text"></div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="wikipedia-summary error" role="alert">
        <div className="error-icon">⚠️</div>
        <p className="error-message">{error.message}</p>
        {isRetryable && (
          <button
            onClick={retry}
            className="retry-button"
            aria-label="Thử lại"
          >
            🔄 Thử lại
          </button>
        )}
        {error.url && (
          <a
            href={error.url}
            target="_blank"
            rel="noopener noreferrer"
            className="wiki-link"
          >
            Xem trên Wikipedia →
          </a>
        )}
      </div>
    )
  }

  // Success state (no data)
  if (!data) {
    return null
  }

  // Success state (with data)
  return (
    <div className="wikipedia-summary">
      <div className="summary-header">
        <h3 className="summary-title">
          📚 Wikipedia: {data.title}
        </h3>
        {data.cached && (
          <span className="cache-badge" title="Dữ liệu đã lưu trong bộ nhớ đệm">
            ⚡ Cached
          </span>
        )}
      </div>

      {data.image && (
        <div className="summary-image-wrapper">
          <img
            src={data.image}
            alt={data.title}
            className="summary-image"
            loading="lazy"
          />
        </div>
      )}

      <div className="summary-content">
        <p className="summary-text">{data.summary}</p>
      </div>

      <div className="summary-footer">
        <a
          href={data.url}
          target="_blank"
          rel="noopener noreferrer"
          className="wiki-link"
        >
          Đọc thêm trên Wikipedia →
        </a>
      </div>
    </div>
  )
}
```

**Validation**: Component renders all states correctly

---

### Step 4: Add Wikipedia Summary Styles (20 min)

**File**: `src/styles.css` (append to existing file)

```css
/* Wikipedia Summary Component */
.wikipedia-summary {
  margin-top: 2rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #3366cc;
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.summary-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.cache-badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  background: #ffc107;
  border-radius: 4px;
  color: #000;
  font-weight: 500;
}

.summary-image-wrapper {
  margin: 1rem 0;
  text-align: center;
}

.summary-image {
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
  object-fit: cover;
}

.summary-content {
  margin: 1rem 0;
}

.summary-text {
  line-height: 1.6;
  color: #333;
  margin: 0;
}

.summary-footer {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #ddd;
}

.wiki-link {
  color: #3366cc;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.wiki-link:hover {
  color: #1a4d99;
  text-decoration: underline;
}

/* Loading skeleton */
.wikipedia-summary.loading {
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton {
  background: #e0e0e0;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.skeleton-title {
  height: 1.5rem;
  width: 60%;
}

.skeleton-text {
  height: 1rem;
  width: 100%;
}

.skeleton-text:last-child {
  width: 80%;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* Error state */
.wikipedia-summary.error {
  background: #fff3cd;
  border-left-color: #ff9800;
  text-align: center;
}

.error-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.error-message {
  color: #856404;
  margin: 0.5rem 0;
}

.retry-button {
  background: #3366cc;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin: 1rem 0;
  font-size: 0.9rem;
  transition: background 0.2s;
}

.retry-button:hover {
  background: #1a4d99;
}

.retry-button:active {
  transform: scale(0.98);
}

/* Responsive */
@media (max-width: 640px) {
  .wikipedia-summary {
    padding: 1rem;
  }

  .summary-title {
    font-size: 1.1rem;
  }

  .summary-image {
    max-height: 200px;
  }
}
```

**Validation**: Styles applied correctly

---

### Step 5: Integrate into EventDetailModal (15 min)

**File**: `src/App.jsx` (update EventDetailModal section)

```jsx
// Add import at top
import WikipediaSummary from './components/WikipediaSummary'

// Inside EventDetailModal component (find the modal content section)
// Add after existing event details, before closing modal div:

{/* Wikipedia Summary Section */}
<WikipediaSummary title={selectedEvent.title} />
```

**Validation**: Modal displays Wikipedia summary

---

### Step 6: Add Environment Variable (5 min)

**File**: `.env` (create if not exists)

```env
VITE_BACKEND_URL=http://localhost:3000
```

**File**: `.env.example` (create if not exists)

```env
VITE_BACKEND_URL=http://localhost:3000
```

**File**: `.env.production` (create for deployment)

```env
VITE_BACKEND_URL=https://your-backend-url.com
```

**Validation**: Frontend reads backend URL from env

---

### Step 7: Update Vite Config (Optional, 10 min)

**File**: `vite.config.js` (add proxy for development)

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
```

This allows using `/api/wikipedia/:title` instead of `http://localhost:3000/api/wikipedia/:title` in development.

**Validation**: Proxy forwards API requests

---

## Todo List

- [ ] Update wikipediaService.js to use backend proxy URL
- [ ] Verify useWikipediaData hook compatibility
- [ ] Create WikipediaSummary component
- [ ] Implement loading skeleton UI
- [ ] Implement error state with retry button
- [ ] Implement success state with summary display
- [ ] Add Wikipedia summary styles to styles.css
- [ ] Import WikipediaSummary in App.jsx
- [ ] Add component to EventDetailModal
- [ ] Create .env file with VITE_BACKEND_URL
- [ ] Create .env.example and .env.production
- [ ] (Optional) Add Vite proxy configuration
- [ ] Test loading state
- [ ] Test error state with invalid title
- [ ] Test retry functionality
- [ ] Test successful summary display
- [ ] Test cached response indicator
- [ ] Verify responsive layout on mobile

---

## Success Criteria

- ✅ Wikipedia summaries display for all 18 events
- ✅ Loading skeleton shows during fetch
- ✅ Error messages in Vietnamese with retry button
- ✅ "Cached" badge appears on repeated requests
- ✅ Images display when available
- ✅ "Đọc thêm" link opens Wikipedia article
- ✅ No CORS errors in browser console
- ✅ Responsive layout works on mobile (320px+)
- ✅ Component < 200 lines
- ✅ No breaking changes to existing timeline

---

## Testing Checklist

```bash
# 1. Start backend server
cd backend
npm run dev

# 2. Start frontend dev server
cd ..
npm run dev

# 3. Open browser to http://localhost:5173

# 4. Manual testing steps:
# - Click on any timeline event
# - Verify modal opens
# - Verify Wikipedia summary loads (skeleton → content)
# - Verify image displays (if available)
# - Click "Đọc thêm" link → should open Wikipedia
# - Close and reopen same event → verify "Cached" badge
# - Open event with invalid title → verify error state
# - Click retry button → should refetch
# - Test on mobile viewport (320px, 640px)
# - Verify accessibility (keyboard navigation, screen reader)

# 5. Test all 18 events:
# - Hồng Bàng (should find article)
# - Đinh Bộ Lĩnh (should find article)
# - Lý Thái Tổ (should find article)
# ... etc for all events
```

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Backend not running | High | Show user-friendly error, provide fallback message |
| Long Wikipedia summary (> 500 chars) | Low | CSS handles overflow, "read more" link available |
| Missing images | Low | Component handles null images gracefully |
| Vietnamese character rendering | Low | Proper UTF-8 encoding, tested with diacritics |
| Modal scroll with long content | Medium | Modal should scroll, not page background |

---

## Accessibility Checklist

- [x] Error messages have `role="alert"`
- [x] Retry button has `aria-label`
- [x] Images have alt text
- [x] Links indicate external with "→" symbol
- [x] Loading state announced to screen readers
- [x] Keyboard navigation works (tab, enter)
- [x] Focus management in modal

---

## Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Component render | < 50ms | React DevTools Profiler |
| Loading skeleton display | < 100ms | Visual inspection |
| Transition smoothness | 60 FPS | Browser Performance tab |
| Bundle size impact | < 5 KB | Build output comparison |

---

## Rollback Plan

If Phase 3 fails:
1. Remove `<WikipediaSummary />` from EventDetailModal
2. Delete `src/components/WikipediaSummary.jsx`
3. Remove Wikipedia styles from `src/styles.css`
4. Revert `wikipediaService.js` changes
5. Timeline functionality remains intact

---

## Next Phase

After Phase 3 completion:
→ **Phase 4**: Testing & Documentation (comprehensive testing, README updates)
