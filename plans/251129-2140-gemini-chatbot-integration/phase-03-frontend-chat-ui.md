# Phase 03: Frontend Chat UI
**Date**: 251129 **Priority**: High **Status**: ✅ Complete

## Context
[plan.md](../plan.md) [design-guidelines.md](../docs/design-guidelines.md) [App.jsx](../src/App.jsx)

## Overview
Global floating btn (bottom-right) toggles ChatPanel slide-up. Design exact: #F4EFEC surface, #1A1A1A text, #D9AE8E accent; Montserrat labels/Lora body; 24px xl space.

## Key Insights
- Reuse existing FloatingChatButton? Enhance to toggle vs route.
- Panel: max-h-500px, input+msgs, close X.
- a11y: aria-expanded, role=dialog.

## Requirements
- Btn: fixed b-6 r-6 w-14 h-14 rounded-full shadow-lg #D9AE8E hover:scale-105.
- Panel: slide-up from bottom, bg-#F4EFEC, border-t #9F8D8D.

## Arch
```
App.jsx: <ChatPanel isOpen={chatOpen} /> + Btn toggle
New: src/components/ChatPanel.jsx (msgs, input)
```

## Files
Create: src/components/ChatPanel.jsx
Edit: src/App.jsx (+state +Btn), styles.css (+chat classes)

## Steps
1. App: useState(chatOpen=false), ToggleBtn.
2. ChatPanel: msgs=[], input, send. Design tokens.
3. Anim: translate-y-full -> 0.
4. Mobile: full-width bottom sheet.

## Todos
- pending: Extract design CSS vars.

## Success Criteria
- Btn toggles panel smooth.
- Matches design contrast/spacing/fonts.

## Risks
- z-index conflicts (header/timeline).

## Security
- Client no key.

## Next
Phase 04 streaming.
