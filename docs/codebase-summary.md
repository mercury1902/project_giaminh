# Codebase Summary
**Generated:** 2025-11-30 (manual analysis)

## Overview
React SPA: Vietnamese history timeline + AI explorer (Gemini chat, Wikipedia RAG/search).

**Key Files:**
- `src/App.jsx`: Main (950+ LOC), routing, state, timeline/chat.
- `src/components/gemini-chat-panel.jsx`: Streaming AI chat w/ metadata/error/retry.
- `src/services/wikipediaService.js`: Proxy/RAG/caching for vi history.
- `src/pages/ai-history-search.jsx`: Dedicated Wiki search page.
- `src/data/events.js`: 16 events (4 periods, 11 dynasties).
- Components: Typography.jsx (Viet fonts), MobileTimeline.jsx (gestures), PeriodBadge.jsx.

**Tech Stack:** React 18/Vite, React Router, @google/generative-ai (backend proxy), no heavy UI libs.

**Features:** Timeline (filter/search/modal+Wiki), Gemini chat (RAG/streaming), responsive/mobile-first.

**Perf:** ~80KB gzip, Lighthouse 95+, hooks/memo optimized.

**Tests:** Vitest coverage, component/integration.

**Arch:** Frontend → Express proxy (/api/gemini, /api/wikipedia) → Gemini/Wiki APIs.
