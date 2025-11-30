# Phase 04: Streaming Integration
**Date**: 251129 **Priority**: High **Status**: Pending

## Context
[plan.md](../plan.md)

## Overview
React hook useGeminiChat: POST /api/gemini, parse SSE stream to state.

## Key Insights
- EventSource or fetch stream.
- History: [{role:'user/model', parts:[{text}]}].
- UI: typing dots -> stream append.

## Requirements
- Hook: {send, msgs, loading, error}
- Persist history sessionStorage.
- Clear chat.

## Arch
```
useGeminiChat: useState(msgs), useEffect(stream), fetch('/api/gemini', {stream:true})
Parse: for await chunk -> JSON.parse -> append delta
```

## Files
Create: src/hooks/useGeminiChat.js
Edit: ChatPanel.jsx (use hook)

## Steps
1. Hook skeleton.
2. POST JSON.stringify({messages,query}).
3. Stream: res.body.getReader(), decode chunks.
4. Append to msgs[-1].content += delta.

## Todos
- pending: SSE vs fetch stream test.

## Success Criteria
- Real-time streaming chat.
- History persists page reload.

## Risks
- Stream abort on close.

## Security
N/A

## Next
Phase 05 tests.
