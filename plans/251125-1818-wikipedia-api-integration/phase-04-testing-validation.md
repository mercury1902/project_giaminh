# Phase 4: Testing & Validation

**Status**: Pending
**Duration**: 1-2 hours
**Owner**: QA Team

---

## Context & Overview

This phase ensures the Wikipedia API integration is robust and reliable:
1. Unit tests for Wikipedia service
2. Integration tests for components
3. Manual testing across browsers/devices
4. Edge case validation
5. Performance testing
6. Security review

---

## Key Insights

- Real network tests catch issues unit tests miss
- Manual testing on actual devices required
- Edge cases often found during exploratory testing
- Performance matters for user experience

---

## Testing Strategy

### 1. Service Layer Testing

**Test wikipediaService.js:**
```javascript
// Test successful API call
test('getWikipediaPageSummary returns data', async () => {
  const result = await getWikipediaPageSummary('Lý Thái Tổ')
  expect(result).toHaveProperty('url')
  expect(result).toHaveProperty('extract')
  expect(result).toHaveProperty('title')
})

// Test error handling
test('handles page not found', async () => {
  const result = await getWikipediaPageSummary('XYZ123NONEXISTENT')
  expect(result.error).toBeDefined()
})

// Test timeout
test('handles request timeout', async () => {
  // Mock slow response
  const result = await getWikipediaPageSummary('Test', { timeout: 100 })
  expect(result.error).toContain('timeout')
})

// Test caching
test('returns cached data on second call', async () => {
  const result1 = await getWikipediaPageSummary('Test')
  const result2 = await getWikipediaPageSummary('Test')
  expect(result1).toEqual(result2)
})
```

### 2. Hook Testing

**Test useFetch hook:**
```javascript
test('useFetch hook returns data', async () => {
  const { result } = renderHook(() => useWikipediaData('Test'))
  await waitFor(() => expect(result.current.loading).toBe(false))
  expect(result.current.data).toBeDefined()
})

test('hook handles errors', async () => {
  const { result } = renderHook(() => useWikipediaData('Invalid'))
  await waitFor(() => expect(result.current.error).toBeDefined())
})

test('hook provides retry mechanism', async () => {
  const { result } = renderHook(() => useWikipediaData('Invalid'))
  await waitFor(() => expect(result.current.error).toBeDefined())
  act(() => result.current.retry())
  // Verify retry attempt
})
```

### 3. Component Integration Testing

**Test EventDetailModal:**
```javascript
test('modal displays Wikipedia data when opened', async () => {
  const event = { id: '1', title: 'Test Event' }
  render(<EventDetailModal event={event} isOpen={true} />)
  await waitFor(() => {
    expect(screen.getByText(/Wikipedia/i)).toBeInTheDocument()
  })
})

test('Wikipedia link opens in new tab', async () => {
  const event = { id: '1', title: 'Test Event' }
  render(<EventDetailModal event={event} isOpen={true} />)
  const link = await screen.findByRole('link', { name: /Wikipedia/i })
  expect(link).toHaveAttribute('target', '_blank')
})

test('shows loading spinner while fetching', async () => {
  const event = { id: '1', title: 'Test Event' }
  render(<EventDetailModal event={event} isOpen={true} />)
  expect(screen.getByText(/Đang tải/i)).toBeInTheDocument()
})
```

---

## Manual Testing Checklist

### Desktop Testing

**Chrome/Edge (Windows):**
- [ ] Modal opens and closes smoothly
- [ ] Wikipedia data loads within 3 seconds
- [ ] Link opens in new tab
- [ ] No console errors
- [ ] Styles render correctly
- [ ] Loading spinner animates smoothly

**Firefox (Windows):**
- [ ] Repeat above steps
- [ ] Check for any rendering differences

**Safari (macOS):**
- [ ] Repeat above steps
- [ ] Verify font rendering

### Mobile Testing

**iPhone (iOS 14+):**
- [ ] Landscape/portrait orientation works
- [ ] Touch targets are proper size
- [ ] Wikipedia link opens in new window
- [ ] No layout issues

**Android (Samsung Galaxy S21):**
- [ ] Same as iPhone
- [ ] Test with Chrome and Firefox

**iPad:**
- [ ] Landscape mode optimized
- [ ] Touch interactions smooth

### Network Conditions

**Slow 3G:**
- [ ] Loading indicator visible
- [ ] Data loads within 5 seconds
- [ ] Error handling works

**Offline:**
- [ ] Cache serves data
- [ ] Graceful error message

**High Latency:**
- [ ] Timeout triggers
- [ ] Error message displayed

---

## Edge Case Testing

### Test Scenarios

1. **Empty Event Title**
   - Verify no API call made
   - Show appropriate message

2. **Special Characters in Title**
   - Test with: "Đinh Bộ Lĩnh", "Hồng Bàng"
   - Verify proper URL encoding

3. **Very Long Wikipedia Excerpt**
   - Verify truncation works
   - Check responsive layout

4. **Wikipedia Page Not Found**
   - Mock 404 response
   - Show error message
   - Provide helpful fallback

5. **Rate Limit (429 Response)**
   - Mock 429 error
   - Verify graceful handling
   - Show user-friendly message

6. **Network Timeout**
   - Simulate slow response
   - Verify timeout triggers
   - Show error message

7. **Rapid Modal Open/Close**
   - Click open/close quickly
   - Verify no race conditions
   - Abort previous requests

8. **Multiple Events Clicked**
   - Click different events
   - Verify data switches correctly
   - No lingering from previous fetch

---

## Performance Testing

### Metrics to Monitor

1. **Time to Interactive (TTI)**
   - Target: < 3 seconds for Wikipedia data

2. **First Paint**
   - Target: Modal appears immediately

3. **API Response Time**
   - Target: < 1 second (typical)
   - Timeout: 5 seconds

4. **Bundle Size**
   - New code should add < 5KB

5. **Memory Usage**
   - Check for memory leaks
   - Verify cache doesn't grow unbounded

### DevTools Testing

```javascript
// Measure API call performance
console.time('wikipedia-fetch')
const data = await getWikipediaPageSummary('Test')
console.timeEnd('wikipedia-fetch')

// Check memory
console.memory.usedJSHeapSize

// Profile performance
performance.measure('wiki-integration')
```

---

## Security Testing

### Checklist

- [ ] No API keys in code
- [ ] No sensitive data in localStorage
- [ ] XSS protection for fetched content
- [ ] CORS headers validated
- [ ] No eval() or innerHTML for external data
- [ ] User-Agent header set correctly
- [ ] Content Security Policy compatible

### Content Security

```javascript
// Sanitize Wikipedia content before display
const sanitizeHtml = (html) => {
  const div = document.createElement('div')
  div.textContent = html // Use textContent, not innerHTML
  return div.innerHTML
}
```

---

## Accessibility Testing

### WCAG 2.1 AA Checklist

- [ ] Color contrast 4.5:1 for text
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Loading indicator has aria-live
- [ ] Error messages announced
- [ ] Links have descriptive text
- [ ] No flashing content
- [ ] Vietnamese screen reader support

### Manual Accessibility Testing

```bash
# Using axe DevTools
1. Open application
2. Run axe DevTools
3. Verify 0 violations
4. Check contrast ratios
5. Test with keyboard only
6. Test with screen reader (NVDA/JAWS)
```

---

## Todo List

- [ ] Write unit tests for service
- [ ] Write unit tests for hook
- [ ] Write integration tests
- [ ] Manual testing on Chrome/Edge
- [ ] Manual testing on Firefox
- [ ] Manual testing on Safari
- [ ] Manual testing on iOS
- [ ] Manual testing on Android
- [ ] Edge case testing
- [ ] Performance testing
- [ ] Security review
- [ ] Accessibility audit
- [ ] Document test results

---

## Success Criteria

1. ✅ All unit tests pass
2. ✅ All integration tests pass
3. ✅ Manual testing on all browsers passes
4. ✅ Mobile testing passes
5. ✅ No console errors in any test
6. ✅ Error scenarios handled gracefully
7. ✅ WCAG AA compliance
8. ✅ No security vulnerabilities
9. ✅ Performance acceptable
10. ✅ No breaking changes

---

## Test Coverage Report Template

```markdown
# Test Coverage Report - Wikipedia API Integration

## Unit Tests
- wikipediaService.js: 95% coverage
- useFetch.js: 92% coverage

## Integration Tests
- EventDetailModal: 8/8 tests pass
- Search component: 5/5 tests pass

## Manual Testing Results
- ✅ Chrome (Windows)
- ✅ Firefox (Windows)
- ✅ Safari (macOS)
- ✅ iPhone (iOS)
- ✅ Android
- ✅ iPad

## Performance Metrics
- API Response: 800ms avg
- Modal Load: 2.5s avg
- Memory: No leaks detected
- Bundle: +3KB (gzipped)

## Known Issues
(List any issues found during testing)

## Approval
- Tested by: [Team]
- Date: [Date]
- Status: ✅ PASSED / ❌ NEEDS FIXES
```

---

## Bug Report Template

```markdown
# Bug Report - Wikipedia Integration

**Title**: [Brief description]
**Severity**: [Critical/High/Medium/Low]
**Browser**: [Browser + version]
**Device**: [Device type]

**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected**: [What should happen]
**Actual**: [What actually happened]

**Screenshot/Video**: [Attach if applicable]

**Console Error**: [Any JavaScript errors]
```

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| API failures not caught | Low | High | Comprehensive error testing |
| Browser compatibility | Medium | Medium | Test all major browsers |
| Performance degradation | Low | Medium | Monitor TTI, optimize |
| Security vulnerability | Low | High | Security review, audit |

---

## Related Code Files

- `src/services/wikipediaService.js` - Service to test
- `src/hooks/useFetch.js` - Hook to test
- `src/App.jsx` - Components to test

---

## Next Phase

After Phase 4 completion, move to [Phase 5: Documentation & Deployment](./phase-05-documentation-deployment.md) for final documentation and launch preparation.

