# Phase 1: Fix CORS Configuration

**Status**: Pending Implementation
**Review Status**: Pending

## Context

Parent Plan: [plan.md](./plan.md)
Related Docs: [System Architecture](../../docs/system-architecture.md#integration-points)
Files: `backend/server.js` (lines 20-25)

## Overview

**Date**: 2025-11-29
**Description**: Fix CORS header misconfiguration causing "multiple values not allowed" error
**Priority**: Critical - Blocks all API communication
**Implementation Status**: Not Started
**Review Status**: Pending

## Key Insights

1. **Root Cause**: CORS middleware receives array `['http://localhost:5173', 'http://localhost:5174']` but HTTP spec requires single origin per response
2. **Current Config**: Line 20-25 passes array directly to `cors()` function
3. **Solution**: Implement origin validation function that returns single origin based on request Origin header
4. **Test**: CORS preflight requests should return valid single origin in response header

## Requirements

- CORS middleware must validate requesting origin against whitelist
- Return single origin matching request if in whitelist
- Return error if origin not in whitelist
- Support both development origins: localhost:5173, localhost:5174
- Allow future extension for production origins

## Architecture

**Current (Broken)**:
```javascript
cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
})
```

**Fix (Proper)**:
```javascript
cors({
  origin: function(origin, callback) {
    const whitelist = ['http://localhost:5173', 'http://localhost:5174']
    if (!origin || whitelist.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('CORS not allowed'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
})
```

## Related Code Files

- `backend/server.js` - CORS middleware configuration
- `backend/middleware/error-handler.js` - Error handling (reference)
- `backend/routes/gemini-routes.js` - Uses CORS middleware

## Implementation Steps

1. Read backend/server.js lines 20-25
2. Replace array origin with function-based validation
3. Update whitelist from env variable if available
4. Test preflight request with browser dev tools
5. Verify Access-Control-Allow-Origin header shows single origin

## Todo List

- [ ] Read current CORS configuration
- [ ] Create origin validation function
- [ ] Test with localhost:5173
- [ ] Test with localhost:5174
- [ ] Verify preflight request returns single origin
- [ ] Code review

## Success Criteria

✅ CORS preflight OPTIONS request succeeds
✅ Access-Control-Allow-Origin header contains exactly one origin
✅ Frontend receives valid response
✅ No CORS policy errors in browser console
✅ gemini-chat-panel.jsx fetch succeeds with 200+ response

## Risk Assessment

**Technical Risk**: Low
- Standard CORS pattern
- No breaking changes
- Easy to test

**Production Risk**: Low
- Affects development only (localhost)
- Can be extended for production origins

## Security Considerations

- ✅ Whitelist-based validation prevents unauthorized origins
- ✅ Credentials flag still true (needed for cookies)
- ✅ Methods limited to required actions
- ⚠️ Consider HTTPS in production
- ⚠️ Update whitelist for production domains

## Next Steps

1. Implement CORS validation function
2. Verify browser preflight succeeds
3. Proceed to Phase 2 (model version update)
4. Test end-to-end before code review
