# Gemini Chatbot Integration Plan
**Date**: 251129
**Priority**: High (Phase 4 AI)
**Status**: ✅ COMPLETE (2025-11-29 23:06)

## Context Links
- [README.md](../README.md)
- [docs/design-guidelines.md](../docs/design-guidelines.md)
- [src/data/events.js](../src/data/events.js)
- [src/services/wikipediaService.js](../src/services/wikipediaService.js)
- [backend/server.js](../backend/server.js)
- [src/App.jsx](../src/App.jsx)

## Overview
Implement global Gemini-powered chatbot for Vietnamese history queries. Floating bottom-right button toggles slide-up panel. RAG: local events.js (18 events) + dynamic Wikipedia fetches via existing backend. Backend proxy secures GEMINI_API_KEY. Streaming responses. Matches design: surface #F4EFEC/text #1A1A1A/accent #D9AE8E #C41E3A; Montserrat/Lora; xl=24px spacing. KISS: Reuse wikipediaService/routes. YAGNI: No auth/images. DRY: Shared chat hook.

Phases (6 total, sequential):
1. [phase-01-backend-proxy.md](phase-01-backend-proxy.md) - Backend /api/gemini
2. [phase-02-rag-data-prep.md](phase-02-rag-data-prep.md) - Context prep (events+wiki)
3. [phase-03-frontend-chat-ui.md](phase-03-frontend-chat-ui.md) - Floating btn + panel in App.jsx
4. [phase-04-streaming-integration.md](phase-04-streaming-integration.md) - Streaming hook/chat state
5. [phase-05-tests.md](phase-05-tests.md) - Tests
6. [phase-06-docs.md](phase-06-docs.md) - Docs updates

Est: 4-6h impl. Risks: API key mgmt, streaming perf.

## Key Insights
- Existing wiki backend reusable for dynamic fetches.
- Local events grounding ensures project accuracy.
- Gemini 1.5-flash for chat/history/streaming.
- Design: Fixed btn (44px touch), slide-up panel (max 500px h).

## Requirements
- Global floating Gemini chat (non-intrusive).
- RAG: events.js summaries + wiki(title) for query terms.
- Streaming SSE. Accuracy: Cite sources. Vietnamese support.
- a11y/WCAG AA. Mobile-first.

## Arch
```
Frontend: App.jsx (ChatPanel + Btn) -> useGeminiChat hook -> /api/gemini (POST msg,history,context)
Backend: server.js + @google/generative-ai -> RAG prompt (events+wiki) -> stream
Context: events.js static + wikiService dynamic (extract entities -> fetch)
```

## Files
- Add: backend/routes/gemini-routes.js, src/hooks/useGeminiChat.js, src/components/ChatPanel.jsx
- Edit: server.js, App.jsx, wikipedia-routes.js?, docs/*

## Steps
1. Backend proxy (Gemini lib).
2. RAG prep util.
3. UI (design exact).
4. Streaming hook.
5. Tests.
6. Docs.

## Todos
- pending: Review Gemini RAG prompt templates.

## Success Criteria
- Chat responds grounded in events/wiki (1s latency).
- UI matches design (contrast/spacing/fonts).
- Tests pass (chat flow).
- Docs updated.

## Risks
- Gemini rate limits/costs.
- Vietnamese accuracy.
- Streaming fallback.

## Security
- GEMINI_API_KEY server-only (.env).
- Rate limit /api/gemini.
- Sanitize user msg.

## Next
Execute phases seq. /cook phase-01.
