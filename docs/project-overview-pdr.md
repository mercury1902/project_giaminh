# Project Overview & PDR

## Product Development Requirements

**Vision:** AI-powered interactive Vietnamese history explorer promoting peace via education on historical transitions.

**Functional Req:**
- Timeline: 16 events, filter (period/dynasty), search, modal+Wiki summary.
- AI Chat: Gemini queries w/ RAG (Wiki context), streaming, error/retry.
- AI Search: Dedicated page for history/Wiki.
- UX: Progressive disclosure, touch gestures, Viet Typography.

**Non-Functional:**
- Perf: <1s load, 60fps interactions.
- Responsive: Mobile-first.
- A11y: WCAG AA.
- Scalable: Add events/community/AI paths.

**Success Metrics:** 100% feature coverage, tests pass, deployable (Vercel).

**Dependencies:** Gemini API key, Wiki proxy.
