# System Architecture

**Frontend (React/Vite SPA):**
- App.jsx: Router/state.
- Timeline: Filter/memo/modal.
- GeminiChatPanel: Streaming fetch('/api/gemini').
- WikipediaSummary: fetch('/api/wikipedia').

**Backend Proxy (Express):**
- /api/gemini/chat: RAG (Wiki search) → Gemini 1.5 Pro.
- /api/wikipedia/*: Cache/search/extract (node-cache/LRU).

**External:** Gemini API, Wikipedia API (vi).

**Data Flow:** User query → Proxy RAG → Gemini → Stream SSE.

**Deployment:** Vercel (static + serverless funcs).
