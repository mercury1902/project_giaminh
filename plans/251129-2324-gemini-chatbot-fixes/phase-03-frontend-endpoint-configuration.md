# Phase 3: Update Frontend API Endpoint Configuration

**Status**: Pending Implementation
**Review Status**: Pending

## Context

Parent Plan: [plan.md](./plan.md)
Depends On: Phase 1 & 2 (backend fixes)
Files: `src/components/gemini-chat-panel.jsx` (line 31)

## Overview

**Date**: 2025-11-29
**Description**: Update hardcoded API endpoint from 'http://localhost:3000/api/gemini/chat' to relative path '/api/gemini/chat'
**Priority**: Medium - Improves deployment flexibility
**Implementation Status**: Not Started
**Review Status**: Pending

## Key Insights

1. **Current**: Hardcoded full URL `'http://localhost:3000/api/gemini/chat'` (line 31)
2. **Issue**: Only works on localhost:3000, breaks in production/other environments
3. **Solution**: Use relative path `/api/gemini/chat` (browser auto-resolves to current host)
4. **Benefit**: Works across all environments (dev, staging, production)
5. **Implementation**: Single line change in fetch call

## Requirements

- Change absolute URL to relative path
- Relative path uses current host + port
- Frontend on :5173 can reach backend on :3000 (verified working)
- Supports development, staging, production without changes

## Architecture

**Current (Hardcoded)**:
```javascript
const res = await fetch('http://localhost:3000/api/gemini/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ messages: [...messages, userMsg] })
})
```

**Fixed (Relative)**:
```javascript
const res = await fetch('/api/gemini/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ messages: [...messages, userMsg] })
})
```

## Related Code Files

- `src/components/gemini-chat-panel.jsx` - sendMessage function (lines 21-59)
- `vite.config.js` - Vite proxy configuration (allows dev server to reach backend)
- `backend/server.js` - API backend (line 39)

## Implementation Steps

1. Open src/components/gemini-chat-panel.jsx
2. Find fetch call on line 31
3. Change 'http://localhost:3000/api/gemini/chat' to '/api/gemini/chat'
4. Test in browser dev environment (5173 → 3000)
5. Verify chat functionality works

## Todo List

- [ ] Read gemini-chat-panel.jsx
- [ ] Locate fetch URL string
- [ ] Replace with relative path
- [ ] Test with browser on localhost:5173
- [ ] Verify messages send/receive
- [ ] Code review

## Success Criteria

✅ Fetch URL is relative path '/api/gemini/chat'
✅ Frontend on localhost:5173 reaches backend on localhost:3000
✅ Chat messages send successfully
✅ Chat responses received without errors
✅ No hardcoded localhost references in code

## Risk Assessment

**Technical Risk**: Very Low
- Simple URL change
- Browser automatically resolves relative paths
- No API changes needed

**Deployment Risk**: Very Low
- Makes code more portable
- Works across all environments
- Improved over current hardcoded approach

## Performance Considerations

- No performance impact
- Same number of HTTP requests
- No additional parsing needed
- Browser handles URL resolution efficiently

## Security Considerations

- ✅ Relative paths more secure (no exposed localhost)
- ✅ Same-origin requests (implicit with relative path)
- ✅ CORS still validated by backend
- ✅ Credentials still properly sent

## Testing Notes

- Test on localhost (frontend :5173, backend :3000)
- Verify Vite proxy reaches backend correctly
- Test message send/receive flow
- Check browser network tab for correct URLs

## Future Considerations

**For Production**:
- Frontend deployed to same origin as backend (no relative path needed)
- Or: Use environment variable for API_BASE_URL if different origins
- Or: Configure reverse proxy (Nginx) to route /api → backend

**Example for future**:
```javascript
const API_BASE = process.env.REACT_APP_API_BASE || ''
const res = await fetch(`${API_BASE}/api/gemini/chat`, {...})
```

## Next Steps

1. Make URL change
2. Test chatbot functionality
3. Verify all 3 phases complete
4. Run code review
5. Commit changes
