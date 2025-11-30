# Gemini Chatbot Fixes - Implementation Plan

**Date**: 2025-11-29 23:24
**Status**: Ready for Implementation
**Priority**: High (Critical blocker for AI feature)

## Overview

Fix three blocking issues preventing Gemini chatbot functionality:
1. **CORS Header Misconfiguration** - Backend sends multiple origin values (violates HTTP spec)
2. **Model Version** - Update from gemini-1.5-flash to gemini-2.0-flash-001
3. **API Endpoint Configuration** - Frontend hardcodes localhost:3000 instead of relative path

## Issues Summary

| Issue | Severity | Impact | Root Cause |
|-------|----------|--------|-----------|
| CORS Error | Critical | Preflight fails, no API calls | Array passed directly to cors() middleware |
| Model Version | Medium | Possible failures/inefficiency | Version mismatch per user report |
| Endpoint URL | Medium | Inflexible deployment | Hardcoded localhost value |

## Implementation Phases

### Phase 1: Fix CORS Configuration
- File: `backend/server.js` (lines 20-25)
- Implement proper origin validation
- Test with curl/browser

**Status**: Pending
**Review**: Pending

---

### Phase 2: Update Gemini Model Version
- File: `backend/routes/gemini-routes.js` (line 112)
- Change string from 'gemini-1.5-flash' to 'gemini-2.0-flash-001'
- Verify API key supports model
- Implement comprehensive helper functions
- Add multi-layer error handling
- Establish streaming protocol with metadata

**Status**: ✅ COMPLETED
**Review**: ✅ APPROVED - See reports/251130-code-reviewer-phase2-gemini-routes-review.md
**Quality**: ⭐⭐⭐⭐⭐ (5/5) - Exceptional
**Tests**: 12/12 passing (100% coverage)
**Build**: ✅ Success (409KB bundle, 1.69s)

---

### Phase 3: Update Frontend API Endpoint
- File: `src/components/gemini-chat-panel.jsx` (line 31)
- Change from hardcoded 'http://localhost:3000/api/gemini/chat' to relative '/api/gemini/chat'
- Test routing in all environments

**Status**: Pending
**Review**: Pending

---

## Success Criteria

✅ CORS preflight request succeeds
✅ Backend accepts application/json Content-Type
✅ Gemini model responds with gemini-2.0-flash-001
✅ Frontend fetches from /api/gemini/chat successfully
✅ Chat messages send and receive without errors

---

## Timeline

1. Read and understand CORS issue → 5 min
2. Fix backend CORS → 10 min
3. Update model version → 2 min
4. Update API endpoint → 5 min
5. Test chatbot functionality → 10 min
6. Code review → 5 min
7. Commit → 3 min

**Total**: ~40 minutes

---

## Related Docs

- System Architecture: [docs/system-architecture.md](../../docs/system-architecture.md)
- Code Standards: [docs/code-standards.md](../../docs/code-standards.md)
- Backend Routes: [backend/routes/gemini-routes.js](../../backend/routes/gemini-routes.js)
- Frontend Component: [src/components/gemini-chat-panel.jsx](../../src/components/gemini-chat-panel.jsx)

---

**Next**: Proceed to Phase 1 implementation
