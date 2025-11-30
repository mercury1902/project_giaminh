# Phase 01: Backend Gemini Proxy
**Date**: 251129 **Priority**: High **Status**: ✅ Complete

## Context
[plan.md](../plan.md) [server.js](../backend/server.js) [Gemini Docs](https://ai.google.dev/gemini-api/docs/get-started/node)

## Overview
Add /api/gemini POST endpoint. Proxy chat reqs to Gemini 1.5-flash. Secure key. Streaming SSE. Init for RAG next.

## Key Insights
- @google/generative-ai npm.
- generateContentStream for SSE.
- Model: gemini-1.5-flash (cheap/fast Vietnamese).

## Requirements
- POST /api/gemini {messages: [{role,parts}], context?} -> SSE stream.
- Env: GEMINI_API_KEY.
- Rate limit wikipediaLimiter.
- Error: 429/500 JSON.

## Arch
```
POST /api/gemini -> gemini-routes.js -> GoogleGenerativeAI -> stream res.write chunks
```

## Files
Create: backend/routes/gemini-routes.js
Edit: backend/server.js (routes+deps), package.json (genai)

## Steps
1. npm i @google/generative-ai
2. mkdir routes/gemini-routes.js: router.post('/chat', async (req,res)=> { genAI = new... stream })
3. server.js: import routes; app.use('/api/gemini', limiter, geminiRoutes)
4. .env: GEMINI_API_KEY=...
5. Test curl POST stream.

## Todos
- pending: Install genai
- pending: Basic non-RAG stream

## Success Criteria
- curl /api/gemini streams Gemini resp.
- Logs key hidden.
- 500 on no key.

## Risks
- Dep bloat (1 dep).
- API quotas.

## Security
- No client key exposure.
- Validate msg len<4k.

## Next
Phase 02 RAG.
