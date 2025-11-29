# Phase 3: Frontend User Experience Enhancement

**Parent Plan**: [plan.md](./plan.md)
**Phase Status**: Pending Implementation
**Priority**: High (Improves user satisfaction)
**Implementation Status**: Not Started
**Review Status**: Ready for Review
**Depends On**: Phase 1 & 2 completion

---

## Context & Dependencies

**Related Files**:
- `src/components/gemini-chat-panel.jsx` - Chat UI (main changes)
- `src/styles.css` - Styling (add new classes)
- `backend/routes/gemini-routes.js` - Provides metadata (from Phase 2)

**Dependencies**:
- Phase 1 & 2 must be complete (metadata available)
- Requires parsing metadata from response stream
- Styling updates for indicators

**Prerequisites**:
- Understanding of React hooks and streaming
- Knowledge of CSS styling
- Familiarity with chat UI patterns

---

## Overview

**Objective**: Enhance user experience by showing data source indicators, loading states, error messages, and retry functionality.

**Key Changes**:
1. **Source Indicators**: Show whether response uses Wikipedia data
2. **Loading States**: Display RAG search status during fetch
3. **Error Messages**: Clear user-facing error messages
4. **Retry UI**: Easy retry for failed requests

---

## Key Insights

### Current Problem
Current chat UI (gemini-chat-panel.jsx):
- No indicator of whether Wikipedia was used
- Simple "Đang suy nghĩ..." loading message
- Generic error message on failure
- No retry mechanism

Users don't know:
- Whether response is accurate (sourced or guessed)
- Whether Wikipedia was available
- Why request failed
- If they should try again

### Solution Approach

Enhance chat panel with:
```
[Header: Gemini Chat]
[Messages...]
Gemini: "Trần Hưng Đạo là..."
  📚 Sourced from Wikipedia (Strategy 2)

User: "Chi tiết hơn"
  ⏳ Searching Wikipedia...
  🤔 Thinking...

[Error handling with retry button]
```

---

## Requirements

### Functional Requirements

**R1**: Source Attribution
- Display indicator when Wikipedia data used
- Show which search strategy succeeded (1, 2, or 3)
- Show number of articles retrieved
- Only show if RAG was successful

**R2**: Loading States
- Show "Searching Wikipedia..." during RAG phase
- Show "Thinking..." during Gemini API phase
- Display progress indicators
- Cancel button for long-running requests

**R3**: Error Messages
- User-friendly error descriptions
- No technical jargon
- Suggest retry actions
- Include timestamp for debugging

**R4**: Retry Functionality
- Retry button on error
- Re-send last message with new attempt
- Track retry count
- Indicate if retrying with different approach

### Non-Functional Requirements

**NF1**: UX Quality
- Indicators don't clutter interface
- Smooth transitions
- Responsive and snappy
- Accessible to screen readers

**NF2**: Performance
- No additional overhead
- Smooth streaming
- Responsive UI updates
- No lag from parsing metadata

---

## Architecture

### Enhanced Chat Message Format

```javascript
// Message with source metadata
{
  role: 'assistant',
  content: '...response text...',
  metadata: {
    ragSuccess: true,
    ragStrategy: 2,
    articles: 2,
    requestId: '123456-abc',
    duration: 2341
  }
}
```

### Loading State Types

```javascript
const LoadingPhase = {
  RAG_SEARCH: 'rag_search',      // Searching Wikipedia
  GEMINI_THINKING: 'gemini',      // Generating response
  STREAMING: 'streaming',         // Receiving response
}
```

### Modified Chat Component

```javascript
// src/components/gemini-chat-panel.jsx

import React, { useState, useRef, useEffect, useCallback } from 'react'

const GeminiChatPanel = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingPhase, setLoadingPhase] = useState(null)
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const panelRef = useRef(null)
  const inputRef = useRef(null)
  const abortControllerRef = useRef(null)

  const sendMessage = useCallback(async (messageToSend = null) => {
    const msg = messageToSend || input
    if (!msg.trim() || loading) return

    const userMsg = { role: 'user', content: msg }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)
    setLoadingPhase('rag_search')
    setError(null)
    setInput('')
    abortControllerRef.current = new AbortController()

    try {
      // Prepare request
      const messagesForAPI = [...messages, userMsg]

      setLoadingPhase('streaming')

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: messagesForAPI }),
        signal: abortControllerRef.current.signal
      })

      if (!res.ok) {
        throw new Error(getErrorMessage(res.status))
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      let fullResponse = ''
      let metadata = null
      let assistantMsg = {
        role: 'assistant',
        content: '',
        metadata: null,
        loadingPhase: null
      }

      setMessages(prev => [...prev, assistantMsg])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        fullResponse += chunk

        // Try to parse metadata if present
        if (!metadata && fullResponse.includes('[METADATA]')) {
          const matches = fullResponse.match(/\[METADATA\](.*?)\[\/METADATA\]/)
          if (matches) {
            try {
              metadata = JSON.parse(matches[1])
              assistantMsg.metadata = metadata
            } catch (e) {
              console.warn('Failed to parse metadata:', e)
            }
            // Remove metadata from display
            assistantMsg.content = fullResponse
              .replace(/\[METADATA\].*?\[\/METADATA\]\n?/, '')
              .replace(/\n?\[END\]$/, '')
          }
        } else {
          assistantMsg.content = fullResponse
            .replace(/\[METADATA\].*?\[\/METADATA\]\n?/, '')
            .replace(/\n?\[END\]$/, '')
        }

        setMessages(prev =>
          prev.map(m => m === assistantMsg ? { ...assistantMsg } : m)
        )
      }

      setRetryCount(0)

    } catch (error) {
      if (error.name === 'AbortError') {
        // Request cancelled
        setMessages(prev => prev.slice(0, -1))
        return
      }

      console.error('Chat error:', error)
      setError({
        message: error.message || 'Lỗi không xác định',
        canRetry: true,
        retryCount
      })

      // Add error message
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `❌ ${error.message}`,
          isError: true
        }
      ])
    } finally {
      setLoading(false)
      setLoadingPhase(null)
    }
  }, [input, loading, messages])

  const handleRetry = useCallback(async () => {
    if (messages.length === 0) return

    // Remove last user message and all responses
    const lastUserMsgIndex = [...messages].reverse()
      .findIndex(m => m.role === 'user')
    const truncatedMessages = messages.slice(
      0,
      messages.length - lastUserMsgIndex - 1
    )

    setMessages(truncatedMessages)
    setRetryCount(prev => prev + 1)

    // Get last user message and retry
    const lastUserMessage = [...messages]
      .reverse()
      .find(m => m.role === 'user')

    if (lastUserMessage) {
      await sendMessage(lastUserMessage.content)
    }
  }, [messages, sendMessage])

  const handleCancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setLoading(false)
      setLoadingPhase(null)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="gemini-chat-overlay"
      role="dialog"
      aria-label="Gemini Chat lịch sử Việt Nam"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        className="gemini-chat-panel"
        onClick={e => e.stopPropagation()}
      >
        <ChatHeader onClose={onClose} />

        <div className="gemini-chat-messages">
          {messages.map((msg, i) => (
            <ChatMessage
              key={i}
              message={msg}
              showSourceIndicator={msg.metadata?.ragSuccess}
              metadata={msg.metadata}
            />
          ))}

          {loading && (
            <LoadingIndicator
              phase={loadingPhase}
              retryCount={retryCount}
            />
          )}

          {error && (
            <ErrorMessage
              error={error}
              onRetry={handleRetry}
              onCancel={handleCancel}
            />
          )}
        </div>

        <ChatInputForm
          input={input}
          setInput={setInput}
          onSend={sendMessage}
          loading={loading}
          onCancel={handleCancel}
          inputRef={inputRef}
        />
      </div>
    </div>
  )
}

// Sub-components

function ChatHeader({ onClose }) {
  return (
    <div className="gemini-chat-header">
      <h3>Trợ lý lịch sử Gemini</h3>
      <button
        onClick={onClose}
        aria-label="Đóng chat"
        className="chat-close-btn"
        title="Đóng chat (Esc)"
      >
        &times;
      </button>
    </div>
  )
}

function ChatMessage({ message, showSourceIndicator, metadata }) {
  if (message.isError) {
    return (
      <div className="message assistant error">
        <div className="message-content">{message.content}</div>
      </div>
    )
  }

  return (
    <div className={`message ${message.role}`}>
      <div className="message-content">{message.content}</div>
      {showSourceIndicator && metadata && (
        <SourceIndicator metadata={metadata} />
      )}
    </div>
  )
}

function SourceIndicator({ metadata }) {
  const strategyNames = {
    1: 'Tìm kiếm chính xác',
    2: 'Tìm kiếm từ khóa',
    3: 'Tìm kiếm đơn giản'
  }

  const strategyName = strategyNames[metadata.ragStrategy] || 'Không xác định'

  return (
    <div className="source-indicator">
      <span className="source-icon">📚</span>
      <span className="source-text">
        Từ Wikipedia ({strategyName}) · {metadata.articles} bài viết
      </span>
      <span className="source-time">
        {new Date(metadata.timestamp).toLocaleTimeString('vi-VN')}
      </span>
    </div>
  )
}

function LoadingIndicator({ phase, retryCount }) {
  const phaseText = {
    rag_search: '🔍 Đang tìm kiếm Wikipedia...',
    streaming: '✍️ Đang suy nghĩ...'
  }

  return (
    <div className="message assistant loading">
      <div className="message-content">
        {phaseText[phase] || '⏳ Đang xử lý...'}
      </div>
      {retryCount > 0 && (
        <div className="retry-indicator">
          (Nỗ lực thứ {retryCount + 1})
        </div>
      )}
    </div>
  )
}

function ErrorMessage({ error, onRetry, onCancel }) {
  return (
    <div className="message assistant error">
      <div className="message-content">
        ❌ {error.message}
      </div>
      <div className="error-actions">
        {error.canRetry && (
          <button onClick={onRetry} className="btn btn-retry">
            🔄 Thử lại
          </button>
        )}
        <button onClick={onCancel} className="btn btn-cancel">
          ✕ Hủy
        </button>
      </div>
    </div>
  )
}

function ChatInputForm({ input, setInput, onSend, loading, onCancel, inputRef }) {
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return
    onSend()
  }

  return (
    <form onSubmit={handleSubmit} className="gemini-chat-input-form">
      <input
        ref={inputRef}
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Hỏi về lịch sử Việt Nam..."
        disabled={loading}
        aria-label="Nhập câu hỏi"
      />
      <button
        type="submit"
        disabled={!input.trim() || loading}
        title={loading ? 'Đang xử lý...' : 'Gửi'}
      >
        {loading ? '⏸' : '→'}
      </button>
      {loading && (
        <button
          type="button"
          onClick={onCancel}
          className="btn-cancel"
          title="Hủy yêu cầu"
        >
          ✕
        </button>
      )}
    </form>
  )
}

export default GeminiChatPanel
```

### CSS Styling Additions

```css
/* src/styles.css - Add new styles */

/* Source indicator */
.source-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  padding: 8px 12px;
  background: var(--surface-2);
  border-radius: 6px;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.source-icon {
  font-size: 1.1rem;
}

.source-text {
  flex: 1;
}

.source-time {
  font-size: 0.75rem;
  opacity: 0.7;
}

/* Loading indicator */
.message.loading .message-content {
  display: flex;
  align-items: center;
  gap: 8px;
  font-style: italic;
}

.message.loading .message-content::after {
  content: '';
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--primary);
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

/* Error message */
.message.error {
  background-color: rgba(239, 68, 68, 0.1);
  border-left: 3px solid #ef4444;
}

.error-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.btn-retry, .btn-cancel {
  padding: 6px 12px;
  border: 1px solid var(--border);
  background: var(--surface);
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
}

.btn-retry:hover {
  background: var(--surface-2);
}

.btn-cancel {
  background: transparent;
}

.retry-indicator {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-top: 4px;
}
```

---

## Related Code Files

**Primary File**: `src/components/gemini-chat-panel.jsx`
- Lines 1-104: Entire component (complete rewrite)

**Supporting Files**:
- `src/styles.css` - Add CSS classes
- `backend/routes/gemini-routes.js` - Provides metadata

---

## Implementation Steps

### Step 1: Refactor Message State
1. Update message object structure to include metadata
2. Add loading phase state
3. Add error state with retry info
4. Add retry count tracking

**File**: `src/components/gemini-chat-panel.jsx`
**Lines**: 8-14 (state declarations)
**Complexity**: Low (add new state variables)

### Step 2: Implement Metadata Parsing
1. Parse metadata header from response stream
2. Extract RAG success/strategy/articles
3. Store in message object
4. Remove metadata from display text

**File**: `src/components/gemini-chat-panel.jsx`
**Lines**: 45-80 (streaming loop)
**Complexity**: Medium (regex parsing, state management)

### Step 3: Add Loading States
1. Create LoadingIndicator component
2. Show different text based on phase
3. Add spinner animation
4. Display retry count

**File**: `src/components/gemini-chat-panel.jsx`
**New**: LoadingIndicator component
**Complexity**: Low (simple component)

### Step 4: Add Source Attribution
1. Create SourceIndicator component
2. Show Wikipedia icon + metadata
3. Display search strategy name
4. Show article count and timestamp

**File**: `src/components/gemini-chat-panel.jsx`
**New**: SourceIndicator component
**Complexity**: Low (simple component)

### Step 5: Add Error Handling
1. Create ErrorMessage component
2. Add retry button
3. Add cancel button
4. Track retry attempts
5. Implement retry logic

**File**: `src/components/gemini-chat-panel.jsx`
**New**: ErrorMessage component + retry handler
**Complexity**: Medium (complex state management)

### Step 6: Add Cancel Functionality
1. Implement abort controller
2. Add cancel button during loading
3. Clean up on abort
4. Reset UI state

**File**: `src/components/gemini-chat-panel.jsx`
**Lines**: 21, 43 (AbortController)
**Complexity**: Medium (async abort handling)

### Step 7: Add CSS Styling
1. Add source indicator styles
2. Add loading animation
3. Add error styling
4. Add button styles
5. Responsive adjustments

**File**: `src/styles.css`
**Lines**: Add ~100 lines
**Complexity**: Low (CSS only)

---

## Todo List

- [ ] Update message state structure
- [ ] Add loading phase state
- [ ] Add error state
- [ ] Implement metadata parsing
- [ ] Create LoadingIndicator component
- [ ] Create SourceIndicator component
- [ ] Create ErrorMessage component
- [ ] Implement retry logic
- [ ] Implement cancel functionality (AbortController)
- [ ] Add CSS styles
- [ ] Test with successful response
- [ ] Test with RAG failure
- [ ] Test with Gemini API error
- [ ] Test retry functionality
- [ ] Test cancel functionality
- [ ] Verify accessibility

---

## Success Criteria

1. ✓ Source indicator shows when Wikipedia used
2. ✓ Loading phases displayed correctly
3. ✓ Error messages are user-friendly
4. ✓ Retry button works and repeats message
5. ✓ Cancel button stops request
6. ✓ No jargon in user-facing messages
7. ✓ Accessible to screen readers
8. ✓ Responsive on mobile

---

## Next Steps

1. Implement Phase 3 (this phase)
2. Test all user interactions
3. Verify accessibility with screen reader
4. Polish UI/UX based on testing
5. Proceed to Phase 4 (testing & validation)
