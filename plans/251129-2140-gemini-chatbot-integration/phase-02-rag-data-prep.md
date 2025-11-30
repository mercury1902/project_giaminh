# Phase 02: RAG Data Prep
**Date**: 251129 **Priority**: High **Status**: Pending

## Context
[plan.md](../plan.md) [events.js](../src/data/events.js) [wikipedia-service.js](../backend/services/wikipedia-service.js)

## Overview
Prep context: static events summaries + dynamic wiki fetches (query entities -> titles).

## Key Insights
- Events: 18 items, stringify w/ year/title/desc/period.
- Dynamic: Extract nouns/dates from query -> wiki.getSummary(title).
- Prompt: 'Grounded in: {context}. Answer accurately re Vietnamese history.'

## Requirements
- Util: getRAGContext(query): Promise<{events: str, wiki: str}>
- Cache wiki (reuse service).
- Limit: 8k tokens context.

## Arch
```
query -> extractEntities(query) -> wiki.getSummary(entities) -> formatContext(events+wiki)
```

## Files
Edit: backend/services/rag-service.js (new), gemini-routes.js (inject context)

## Steps
1. New rag-service.js: import wikipediaService, events (copy from src/data).
2. extractEntities: simple regex dates/names.
3. getSummaries(entities): Promise.all wiki calls.
4. formatRAG(ctx): bullet summaries.
5. routes: context = await getRAGContext(req.body.query)

## Todos
- pending: Copy/parse events.js to backend.

## Success Criteria
- getRAGContext('Lý Thái Tổ') -> events filter + wiki 'Lý Thái Tổ'.

## Risks
- Wiki fetch timeout (15s).
- Entity extract false pos.

## Security
- No PII in context.

## Next
Phase 03 UI.
