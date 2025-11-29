# Phase 2: Component Integration

**Status**: Pending
**Duration**: 2-3 hours
**Owner**: Development Team

---

## Context & Overview

This phase integrates the Wikipedia service and custom hook into React components:
1. Update EventDetailModal to fetch Wikipedia data
2. Add Wikipedia section to event details
3. Integrate Wikipedia links in Search results
4. Add loading indicators

---

## Key Insights

- EventDetailModal is primary integration point (high value)
- Search results are secondary (medium value)
- Progressive loading (on-demand) is better than batch
- User expects Wikipedia data to load within 2-3 seconds

---

## Requirements

1. EventDetailModal fetches Wikipedia data when opened
2. Display Wikipedia summary in modal
3. Add "Read on Wikipedia" link
4. Show loading spinner while fetching
5. Handle errors gracefully
6. Add Wikipedia link to search results
7. Maintain existing functionality

---

## Architecture

### EventDetailModal Changes
```javascript
// Add useState for Wikipedia data
const [wikiData, setWikiData] = useState(null)
const [wikiLoading, setWikiLoading] = useState(false)

// Add useEffect to fetch data when modal opens
useEffect(() => {
  if (isOpen && event?.title) {
    fetchWikipediaData(event.title)
  }
}, [isOpen, event?.title])

// Add Wikipedia section to JSX
<div className="event-modal-section wiki-section">
  {wikiLoading && <LoadingSpinner />}
  {wikiData && <WikipediaContent data={wikiData} />}
  {wikiError && <ErrorMessage error={wikiError} />}
</div>
```

### Search Results Changes
```javascript
// Add Wikipedia link to each result card
<a href={`https://vi.wikipedia.org/wiki/${event.title}`}>
  Wikipedia
</a>
```

---

## Implementation Steps

### Step 1: Update EventDetailModal
- Import useFetch hook
- Add state for Wikipedia data
- Add useEffect to trigger fetch
- Add Wikipedia section to JSX
- Style the new section

### Step 2: Add Loading Spinner Component
- Create simple loading indicator
- Add CSS animations
- Position in modal

### Step 3: Add Error Handling
- Display error message if fetch fails
- Provide "Retry" button
- Log errors to console

### Step 4: Update Search Component
- Add Wikipedia link to result cards
- Style the link
- Open in new tab

### Step 5: Update Styles
- Add CSS for wiki-section
- Add loading spinner animation
- Add link styling
- Ensure responsive design

### Step 6: Testing
- Test modal opening/closing
- Test Wikipedia data display
- Test error scenarios
- Test search results display

---

## Code Changes Summary

### src/App.jsx - EventDetailModal (lines 77-177)

**Add at top of function:**
```javascript
const [wikiData, setWikiData] = useState(null)
const [wikiLoading, setWikiLoading] = useState(false)
const [wikiError, setWikiError] = useState(null)
```

**Add after escape key effect:**
```javascript
useEffect(() => {
  if (isOpen && event?.title) {
    setWikiLoading(true)
    setWikiError(null)
    useWikipediaData(event.title)
      .then(data => setWikiData(data))
      .catch(err => setWikiError(err.message))
      .finally(() => setWikiLoading(false))
  }
}, [isOpen, event?.title])
```

**Add before modal close button:**
```javascript
{wikiData && (
  <div className="event-modal-section wiki-section">
    <h3 className="section-title">Wikipedia</h3>
    {wikiLoading && <div className="loading-spinner">Đang tải...</div>}
    {wikiData.extract && !wikiLoading && (
      <>
        <p className="section-content">{wikiData.extract}</p>
        <a
          href={wikiData.url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-wiki"
        >
          Đọc trên Wikipedia →
        </a>
      </>
    )}
    {wikiError && <p className="error-message">Không thể tải dữ liệu từ Wikipedia</p>}
  </div>
)}
```

### src/App.jsx - Search (lines 307-347)

**Update result card:**
```javascript
<article key={e.id} className="result-card">
  <h3 className="result-title">{e.title}</h3>
  <div className="result-meta">{e.year} • {e.dynasty || '—'} • {e.period}</div>
  <p>{e.description}</p>
  <div className="result-links">
    <a className="back-to-top" href="#timeline">Xem trên timeline →</a>
    <a
      href={`https://vi.wikipedia.org/wiki/${e.title}`}
      target="_blank"
      rel="noopener noreferrer"
      className="wiki-link"
    >
      Wikipedia
    </a>
  </div>
</article>
```

### src/styles.css - Add new styles

```css
/* Loading spinner */
.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Wikipedia section */
.wiki-section {
  background: linear-gradient(135deg, #f0f7ff 0%, #e6f2ff 100%);
  border-left: 4px solid #2563eb;
  padding: 16px;
  border-radius: 8px;
  margin: 20px 0;
}

.wiki-section .section-content {
  color: #1f2937;
  line-height: 1.6;
  margin-bottom: 12px;
}

.btn-wiki {
  background: #2563eb;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  text-decoration: none;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.btn-wiki:hover {
  background: #1d4ed8;
  gap: 8px;
}

/* Error message */
.error-message {
  color: #dc2626;
  padding: 8px 12px;
  background: #fee2e2;
  border-radius: 6px;
  margin: 12px 0;
  font-size: 14px;
}

/* Result links container */
.result-links {
  display: flex;
  gap: 12px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.wiki-link {
  color: #2563eb;
  text-decoration: none;
  font-weight: 600;
  font-size: 13px;
  transition: color 0.2s ease;
}

.wiki-link:hover {
  color: #1d4ed8;
  text-decoration: underline;
}
```

---

## Todo List

- [ ] Update EventDetailModal with Wikipedia state
- [ ] Add useEffect for Wikipedia fetch
- [ ] Add Wikipedia section to modal JSX
- [ ] Create LoadingSpinner component
- [ ] Add error handling UI
- [ ] Update Search component with Wikipedia links
- [ ] Add CSS styles
- [ ] Test modal functionality
- [ ] Test search functionality
- [ ] Code review

---

## Success Criteria

1. ✅ EventDetailModal displays Wikipedia data when opened
2. ✅ Loading spinner shows while fetching
3. ✅ Wikipedia link opens in new tab
4. ✅ Search results have Wikipedia links
5. ✅ Error messages displayed gracefully
6. ✅ No console errors
7. ✅ Existing functionality still works
8. ✅ Responsive on mobile

---

## Testing Checklist

- [ ] Open event detail modal
- [ ] Verify Wikipedia data loads within 3 seconds
- [ ] Click Wikipedia link - opens in new tab
- [ ] Close and reopen modal - data loads again
- [ ] Search for an event
- [ ] Verify Wikipedia link in search result
- [ ] Test on mobile device
- [ ] Test with slow network (DevTools)

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Modal becomes cluttered | Low | Low | Limit excerpt to 300 chars |
| Slow Wikipedia response | Medium | Low | Show loading, 5s timeout |
| Mobile layout broken | Medium | Medium | Test responsive, adjust CSS |
| Existing features broken | Low | High | Thorough testing |

---

## Related Code Files

- `src/App.jsx` (lines 77-177) - EventDetailModal component
- `src/App.jsx` (lines 307-347) - Search component
- `src/styles.css` - Styling

---

## Next Phase

After Phase 2 completion, move to [Phase 3: UI/UX Enhancement](./phase-03-ui-enhancement.md) for visual improvements and polish.

