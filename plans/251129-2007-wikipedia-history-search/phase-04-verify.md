# Phase 04: Verification & Docs

## Steps
1. Backend: npm run dev:backend → curl /api/history/search?q=lịch sử → ok.
2. Frontend: npm run dev → /ai-history → search 'lịch sử' → 5 cards clickable.
3. Mobile: 320px responsive.
4. Tests: npm t → pass.
5. Docs: Update README.md (add /api/history), code-standards.md (if new patterns).
6. Commit: feat: wikipedia history search proxy+ui.

## QA Checklist
- [ ] Backend 200/400/429 handle.
- [ ] Frontend states: idle/loading/error/success.
- [ ] Cards: title/desc/url work.
- [ ] Acc: labels, keyboard Enter.
- [ ] Perf: <3s load.
- [ ] No console err.

Unresolved: None.