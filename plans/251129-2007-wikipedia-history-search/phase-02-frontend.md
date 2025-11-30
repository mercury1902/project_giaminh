# Phase 02: Frontend AiHistory Search UI

## Context
src/pages/AiHistory.jsx placeholder → full search page. Fetch /api/history/search.

## Requirements
- Input: search box default 'lịch sử', submit on Enter/button.
- States: loading spinner (--space-xl), error msg (red --period-feudal?), results: 5 cards.
- Card: title (H4 Be Vietnam Pro 20px), desc (Lora 16px), url <a> (--accent-primary).
- Responsive: grid 1col mobile, 2col tablet+.
- <200lines total.

## Architecture
AiHistory: useState(query='lịch sử', loading, error, pages), useEffect fetch on query change (debounce? KISS no).
SearchForm: input+btn.
Results: {pages.map → HistoryCard(title,desc,url)}
useFetch? Reuse if exists, else fetch('/api/history/search?q='+query)

## Steps
1. Read src/pages/AiHistory.jsx → replace placeholder.
2. Add useState/effect: fetch on submit/change (debounce 300ms).
3. Components: SearchInput, LoadingSpinner, ErrorMsg, HistoryCard (title h4, p desc, a href=url).
4. Styles: .ai-history-search, .history-card (per design-guidelines: --shadow-sm, br16px).
5. Responsive @media.

## Rules
- Code-standards: JSDoc, destruct props, early returns.
- Design: Cards white bg, border --border, hover --shadow-md.
- Acc: aria-label input, role=img? No imgs.
- Perf: useMemo cards? Simple list ok.