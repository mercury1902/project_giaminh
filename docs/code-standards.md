# Code Standards & Guidelines

**Project**: Vietnamese History Timeline
**Last Updated**: 2025-11-29
**Applies To**: All source code in `src/` directory

---

## Table of Contents

1. [File Organization](#file-organization)
2. [Naming Conventions](#naming-conventions)
3. [Component Standards](#component-standards)
4. [Code Structure](#code-structure)
5. [Styling Guidelines](#styling-guidelines)
6. [Best Practices](#best-practices)
7. [Common Patterns](#common-patterns)
8. [Anti-Patterns to Avoid](#anti-patterns-to-avoid)
9. [API Response Format Standards](#api-response-format-standards)

---

## File Organization

### Directory Structure

```
src/
├── data/           # Static data files
│   └── *.js        # Data modules (events, config)
├── hooks/          # Custom React hooks
│   └── *.js        # Hook files (useFetch, etc.)
├── pages/          # Page components (routes)
│   └── *.jsx       # Page component files
├── App.jsx         # Main application component
├── main.jsx        # Application entry point
└── styles.css      # Global styles
```

### File Naming Conventions

| File Type | Naming Pattern | Example |
|-----------|----------------|---------|
| React Components | PascalCase.jsx | `App.jsx`, `AiHistory.jsx` |
| Hooks | camelCase.js | `useFetch.js`, `useWikipediaData.js` |
| Data modules | camelCase.js | `events.js`, `config.js` |
| Styles | kebab-case.css | `styles.css`, `timeline.css` |
| Entry points | camelCase.jsx | `main.jsx`, `index.jsx` |

### File Size Guidelines

**Recommended**:
- Components: **< 200 lines** (excluding imports)
- Hooks: **< 150 lines**
- Data files: **< 100 lines**
- Style files: **< 300 lines**

**Current Status**:
- ⚠️ `App.jsx`: 457 lines (needs refactoring into smaller components)
- ✅ `AiHistory.jsx`: 60 lines
- ✅ `useFetch.js`: 229 lines (acceptable for complex hook)
- ✅ `events.js`: 33 lines
- ✅ `styles.css`: 160 lines

**Action Items**:
- Split `App.jsx` into separate component files
- Create `components/` directory for reusable components

---

## Naming Conventions

### JavaScript/React Naming

#### Variables
```javascript
// ✅ GOOD: camelCase for variables
const eventList = []
const activeIndex = 0
const selectedEvent = null

// ❌ BAD: snake_case, PascalCase for variables
const event_list = []
const ActiveIndex = 0
```

#### Constants
```javascript
// ✅ GOOD: UPPER_SNAKE_CASE for true constants
const MAX_RESULTS = 20
const DEFAULT_TIMEOUT = 5000
const API_BASE_URL = 'https://api.example.com'

// ✅ ACCEPTABLE: camelCase for configuration objects
const periods = ['Cổ đại', 'Phong kiến', 'Cận đại', 'Hiện đại']
const dynasties = ['Hồng Bàng', 'Ngô', 'Đinh', ...]
```

#### Functions
```javascript
// ✅ GOOD: camelCase, verb-based names
function scrollToElement(id) {}
function getPeriodColor(period) {}
function handleClick() {}
function openDetails(event) {}

// ❌ BAD: noun-based, unclear purpose
function element(id) {}
function color(period) {}
function click() {}
```

#### Components
```javascript
// ✅ GOOD: PascalCase, noun-based names
function Header() {}
function EventDetailModal({ event, isOpen, onClose }) {}
function Timeline({ events }) {}

// ❌ BAD: camelCase, verb-based, unclear
function header() {}
function showEventDetails() {}
function timelineComponent() {}
```

#### React Hooks
```javascript
// ✅ GOOD: camelCase with 'use' prefix
function useFetch(url) {}
function useWikipediaData(title, options) {}

// ❌ BAD: missing 'use' prefix
function fetch(url) {}
function wikipediaData(title) {}
```

#### Event Handlers
```javascript
// ✅ GOOD: 'handle' prefix for internal handlers
const handleClick = () => {}
const handleChange = (e) => {}
const handleSubmit = (e) => {}

// ✅ GOOD: 'on' prefix for props
<button onClick={handleClick} />
<Component onClose={handleClose} />
```

### CSS Naming

#### Class Names
```css
/* ✅ GOOD: kebab-case, BEM-like structure */
.site-header {}
.hero-section {}
.timeline-item {}
.timeline-item-content {}
.event-modal-overlay {}
.btn-primary {}

/* ❌ BAD: camelCase, snake_case, unclear */
.siteHeader {}
.hero_section {}
.item {}
.overlay {}
```

#### CSS Variables
```css
/* ✅ GOOD: kebab-case with descriptive names */
--bg: #ffffff;
--text-muted: #4b5563;
--primary-600: #1d4ed8;

/* ❌ BAD: unclear, too generic */
--color1: #ffffff;
--c: #4b5563;
```

---

## Component Standards

### Component Structure Template

```javascript
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
// Other imports

/**
 * Component description with accessibility compliance
 * @param {Object} props - Component props
 * @param {string} props.title - Prop description
 * @param {Function} props.onAction - Callback function
 * @returns {JSX.Element} Rendered component
 */
function ComponentName({ title, onAction }) {
  // 1. State declarations
  const [state, setState] = useState(initialValue)

  // 2. Refs for DOM manipulation and focus management
  const elementRef = useRef(null)
  const abortControllerRef = useRef(null)

  // 3. Computed values (useMemo) for performance
  const computedValue = useMemo(() => {
    return expensiveComputation(state)
  }, [state])

  // 4. Effects with proper cleanup
  useEffect(() => {
    // Effect logic with AbortController for async operations
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    // Async effect logic
    const fetchData = async () => {
      try {
        // API call with abort signal
        const response = await fetch(url, {
          signal: abortControllerRef.current.signal
        })
        // Process response
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Fetch error:', error)
        }
      }
    }

    fetchData()

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [dependencies])

  // 5. Event handlers with useCallback for performance
  const handleClick = useCallback(() => {
    onAction(state)
  }, [onAction, state])

  const handleKeyDown = useCallback((e) => {
    // Keyboard accessibility support
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }, [handleClick])

  // 6. Render helpers with proper key management
  const renderItem = useCallback((item) => {
    return (
      <div key={item.id} role="listitem" aria-label={item.name}>
        {item.name}
      </div>
    )
  }, [])

  // 7. Return JSX with semantic HTML and accessibility
  return (
    <div
      className="component-name"
      role="region"
      aria-labelledby="component-title"
      ref={elementRef}
    >
      <h2 id="component-title">{title}</h2>
      <button
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-label={`Action for ${title}`}
        className="action-button"
      >
        Perform Action
      </button>

      {/* Dynamic content with proper ARIA attributes */}
      <div role="list">
        {items.map(renderItem)}
      </div>
    </div>
  )
}

export default ComponentName
```

### Phase 3 Advanced Component Patterns

#### Streaming Response Component Pattern
```javascript
/**
 * Streaming Chat Component with Phase 3 UX enhancements
 * Includes metadata parsing, error recovery, and accessibility
 */
function StreamingChatPanel({ isOpen, onClose }) {
  // Multi-state management for complex interactions
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState(null);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Refs for request management and focus
  const panelRef = useRef(null);
  const inputRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Metadata parsing utility
  const parseMetadata = useCallback((text) => {
    const metadataMatch = text.match(/\[METADATA\](.*?)\[\/METADATA\]/s);
    if (metadataMatch) {
      try {
        return JSON.parse(metadataMatch[1]);
      } catch (e) {
        console.warn('Failed to parse metadata:', e);
        return null;
      }
    }
    return null;
  }, []);

  // Stream processing with error handling
  const processStream = useCallback(async (response) => {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';
    let metadata = null;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullResponse += chunk;

        // Extract metadata once found
        if (!metadata) {
          metadata = parseMetadata(fullResponse);
        }

        // Update UI incrementally
        const content = extractContent(fullResponse);
        setMessages(prev => {
          const updated = [...prev];
          if (updated[updated.length - 1]?.role === 'assistant') {
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              content,
              metadata,
              streaming: true
            };
          }
          return updated;
        });
      }

      // Finalize message
      setMessages(prev => {
        const updated = [...prev];
        if (updated[updated.length - 1]?.role === 'assistant') {
          updated[updated.length - 1].streaming = false;
        }
        return updated;
      });

    } catch (error) {
      throw new Error(`Stream processing failed: ${error.message}`);
    }
  }, [parseMetadata]);

  // Enhanced error handling with recovery
  const handleStreamError = useCallback((error, retryCallback) => {
    let errorMessage = 'Lỗi kết nối. Vui lòng thử lại.';
    let errorCode = 'UNKNOWN';
    let isRetryable = true;

    // Categorize error types
    if (error.name === 'AbortError') {
      errorMessage = 'Yêu cầu đã bị hủy.';
      errorCode = 'ABORTED';
      isRetryable = false;
    } else if (error.message.includes('timeout')) {
      errorMessage = 'Yêu cầu quá thời gian. Thử lại nhé.';
      errorCode = 'TIMEOUT';
    } else if (error.message.includes('GEMINI_API_KEY')) {
      errorMessage = 'Lỗi cấu hình chatbot. Thử lại sau.';
      errorCode = 'CONFIG_ERROR';
      isRetryable = false;
    }

    setError({
      message: errorMessage,
      code: errorCode,
      timestamp: new Date().toISOString(),
      retryable: isRetryable
    });
  }, []);

  // Retry mechanism for failed requests
  const retryLastMessage = useCallback(() => {
    if (messages.length < 2) return;

    const lastUserMessage = messages[messages.length - 2];
    if (!lastUserMessage || lastUserMessage.role !== 'user') return;

    setRetryCount(prev => prev + 1);
    setError(null);
    sendMessage(lastUserMessage.content);
  }, [messages]);

  // Focus management for accessibility
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  if (!isOpen) return null;

  // Render with full accessibility support
  return (
    <div
      className="chat-overlay"
      role="dialog"
      aria-label="Chat với trợ lý AI"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        className="chat-panel"
        onClick={e => e.stopPropagation()}
      >
        {/* Header with close button */}
        <div className="chat-header">
          <h3 id="chat-title">Trợ lý lịch sử Gemini</h3>
          <button
            onClick={onClose}
            aria-label="Đóng chat"
            className="chat-close-btn"
          >
            &times;
          </button>
        </div>

        {/* Messages with scroll management */}
        <div
          className="chat-messages"
          role="log"
          aria-live="polite"
          aria-relevant="additions text"
        >
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message ${message.role} ${message.isError ? 'error' : ''}`}
              role="article"
              aria-label={`${message.role}: ${message.content.substring(0, 50)}...`}
            >
              <div className="message-content">
                {message.content}
                {message.streaming && (
                  <span className="streaming-indicator" aria-label="Đang nhập...">✍️</span>
                )}
              </div>
            </div>
          ))}

          {/* Loading states with phase indicators */}
          {loading && (
            <div className="message assistant loading" role="status">
              <div className="loading-indicator">
                {getLoadingMessage(loadingPhase)}
                <div className="loading-progress" aria-hidden="true">
                  <div className="progress-bar"></div>
                </div>
              </div>
            </div>
          )}

          {/* Error states with retry options */}
          {error && !loading && (
            <div className="error-message" role="alert">
              <div className="error-content">
                <span className="error-icon" aria-hidden="true">⚠️</span>
                <span className="error-text">{error.message}</span>
              </div>
              {error.retryable && (
                <div className="error-actions">
                  <button
                    onClick={retryLastMessage}
                    className="retry-button"
                    aria-label={`Thử lại (${retryCount} lần)`}
                  >
                    🔄 Thử lại {retryCount > 0 && `(${retryCount})`}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Form with proper semantics */}
        <form
          onSubmit={handleSubmit}
          className="chat-input-form"
          role="form"
          aria-labelledby="chat-title"
        >
          <label htmlFor="chat-input" className="sr-only">Nhập câu hỏi</label>
          <input
            id="chat-input"
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Hỏi về lịch sử Việt Nam..."
            disabled={loading}
            aria-describedby={error ? 'error-message' : undefined}
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className={loading ? 'loading' : ''}
            aria-label="Gửi câu hỏi"
          >
            {loading ? '⏳' : 'Gửi'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

#### Phase-Aware Loading State Pattern
```javascript
// Loading phases for different stages
const LoadingPhase = {
  RAG_SEARCH: 'rag_search',      // Searching Wikipedia
  GEMINI_THINKING: 'gemini',     // Generating response
  STREAMING: 'streaming',        // Receiving response
  ERROR: 'error'                 // Error occurred
};

// Phase-aware loading message generator
const getLoadingMessage = (phase) => {
  switch (phase) {
    case LoadingPhase.RAG_SEARCH:
      return '🔍 Tìm kiếm Wikipedia...';
    case LoadingPhase.GEMINI_THINKING:
      return '🤔 Đang suy nghĩ...';
    case LoadingPhase.STREAMING:
      return '✍️ Đang viết câu trả lời...';
    case LoadingPhase.ERROR:
      return '❌ Đã xảy ra lỗi...';
    default:
      return '⏳ Đang xử lý...';
  }
};
```

#### Source Attribution Pattern
```javascript
// Wikipedia source indicators with strategy mapping
const getSourceIndicator = (metadata) => {
  if (!metadata?.ragSuccess || !metadata.ragStrategy) {
    return null;
  }

  const strategyIcons = {
    1: '🎯', // Primary search
    2: '🔤', // Keyword search
    3: '🔓'  // Diacritic removal
  };

  const strategyNames = {
    1: 'Chính xác',
    2: 'Từ khóa',
    3: 'Đơn giản'
  };

  return (
    <span
      className="source-indicator"
      title={`Wikipedia - Chiến lược ${metadata.ragStrategy} (${metadata.articles} bài viết)`}
      aria-label={`Nguồn: Wikipedia, ${strategyNames[metadata.ragStrategy]} chiến lược, ${metadata.articles} bài viết`}
    >
      {strategyIcons[metadata.ragStrategy]} Wikipedia ({strategyNames[metadata.ragStrategy]})
    </span>
  );
};
```
```

### Component Best Practices

#### 1. Single Responsibility
```javascript
// ✅ GOOD: Component does one thing
function SearchInput({ value, onChange }) {
  return <input type="search" value={value} onChange={onChange} />
}

// ❌ BAD: Component does too many things
function SearchSection() {
  // Handles search, results, pagination, filters...
}
```

#### 2. Props Destructuring
```javascript
// ✅ GOOD: Destructure props in parameter
function EventCard({ title, year, description }) {
  return <div>{title} - {year}</div>
}

// ❌ BAD: Use props object
function EventCard(props) {
  return <div>{props.title} - {props.year}</div>
}
```

#### 3. Prop Types (via JSDoc)
```javascript
// ✅ GOOD: Document prop types with JSDoc
/**
 * Event detail modal
 * @param {Object} props
 * @param {Object} props.event - Event object
 * @param {boolean} props.isOpen - Modal visibility
 * @param {Function} props.onClose - Close handler
 */
function EventDetailModal({ event, isOpen, onClose }) {}
```

#### 4. Default Props
```javascript
// ✅ GOOD: Provide defaults for optional props
function Pagination({ currentPage = 1, pageSize = 20 }) {}

// ✅ ALTERNATIVE: Default in destructuring
function Pagination({ currentPage, pageSize }) {
  currentPage = currentPage ?? 1
  pageSize = pageSize ?? 20
}
```

---

## Code Structure

### Import Order

```javascript
// 1. React and React-related
import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

// 2. Third-party libraries
import axios from 'axios'

// 3. Internal modules (data, hooks, utils)
import { events, periods, dynasties } from './data/events.js'
import { useFetch } from './hooks/useFetch.js'

// 4. Styles (last)
import './styles.css'
```

### Export Patterns

```javascript
// ✅ GOOD: Default export for main component
export default function App() {}

// ✅ GOOD: Named exports for utilities
export const periods = [...]
export const dynasties = [...]
export const events = [...]

// ✅ GOOD: Named exports for multiple hooks
export function useFetch() {}
export function useWikipediaData() {}
```

### Conditional Rendering

```javascript
// ✅ GOOD: Early return for null/empty states
if (!isOpen || !event) return null

// ✅ GOOD: Ternary for simple conditions
{isLoading ? <Spinner /> : <Content />}

// ✅ GOOD: Logical AND for conditional rendering
{error && <ErrorMessage error={error} />}

// ❌ BAD: Nested ternaries
{isLoading ? <Spinner /> : error ? <Error /> : data ? <Content /> : null}

// ✅ BETTER: Use early returns or separate logic
if (isLoading) return <Spinner />
if (error) return <Error />
if (!data) return null
return <Content />
```

### Array Rendering

```javascript
// ✅ GOOD: Map with proper key
{events.map(event => (
  <EventCard key={event.id} event={event} />
))}

// ❌ BAD: Using index as key (if order can change)
{events.map((event, idx) => (
  <EventCard key={idx} event={event} />
))}

// ✅ ACCEPTABLE: Index as key if order is stable and no unique ID
{staticArray.map((item, idx) => (
  <div key={idx}>{item}</div>
))}
```

---

## Styling Guidelines

### CSS Organization

```css
/* 1. CSS Variables */
:root {
  --bg: #ffffff;
  --text: #111827;
}

/* 2. Reset/Base styles */
*, *::before, *::after { box-sizing: border-box; }
html, body { height: 100%; }

/* 3. Utility classes */
.container { max-width: 1120px; margin: 0 auto; }
.sr-only { position: absolute; width: 1px; }

/* 4. Layout components */
.site-header {}
.site-footer {}

/* 5. Page sections */
.hero-section {}
.timeline-section {}

/* 6. Component styles */
.timeline-item {}
.event-modal {}

/* 7. State modifiers */
.timeline-item.active {}
.btn:hover {}

/* 8. Media queries (at the end) */
@media (max-width: 960px) {}
```

### Class Naming

```css
/* ✅ GOOD: Component-based naming */
.timeline-section {}
.timeline-wrap {}
.timeline-rail {}
.timeline-item {}
.timeline-item-content {}
.timeline-dot {}

/* ✅ GOOD: Modifier classes */
.timeline-item.active {}
.btn-primary {}
.btn-ghost {}

/* ❌ BAD: Generic names */
.item {}
.content {}
.wrapper {}
```

### CSS Variables Usage

```css
/* ✅ GOOD: Use CSS variables for theme values */
.button {
  background: var(--primary);
  color: var(--text);
  border: 1px solid var(--border);
}

/* ❌ BAD: Hardcoded colors */
.button {
  background: #2563eb;
  color: #111827;
  border: 1px solid #e5e7eb;
}
```

### Responsive Design

```css
/* ✅ GOOD: Mobile-first approach */
.timeline-wrap {
  padding: 24px 16px; /* Mobile default */
}

@media (min-width: 640px) {
  .timeline-wrap {
    padding: 32px 40px; /* Tablet */
  }
}

@media (min-width: 960px) {
  .timeline-wrap {
    padding: 40px 60px; /* Desktop */
  }
}
```

---

## Best Practices

### React Hooks Best Practices

#### useState
```javascript
// ✅ GOOD: Descriptive state names
const [query, setQuery] = useState('')
const [isOpen, setIsOpen] = useState(false)
const [selectedEvent, setSelectedEvent] = useState(null)

// ❌ BAD: Generic names
const [data, setData] = useState('')
const [flag, setFlag] = useState(false)
```

#### useEffect
```javascript
// ✅ GOOD: Cleanup function
useEffect(() => {
  const controller = new AbortController()

  fetchData(controller.signal)

  return () => {
    controller.abort()
  }
}, [dependencies])

// ✅ GOOD: Specific dependencies
useEffect(() => {
  document.title = `Event: ${event.title}`
}, [event.title])

// ❌ BAD: Missing dependencies
useEffect(() => {
  console.log(query) // 'query' should be in dependencies
}, [])
```

#### useMemo
```javascript
// ✅ GOOD: Memoize expensive computations
const filtered = useMemo(() => {
  return events.filter(e =>
    (period === 'all' || e.period === period) &&
    (dynasty === 'all' || e.dynasty === dynasty)
  ).sort((a, b) => a.year - b.year)
}, [events, period, dynasty])

// ❌ BAD: Unnecessary memoization
const simple = useMemo(() => value + 1, [value])
```

#### useCallback
```javascript
// ✅ GOOD: Memoize callbacks passed to children
const handleClick = useCallback(() => {
  setActive(true)
}, [])

// ❌ BAD: Unnecessary useCallback for internal use only
const handleChange = useCallback((e) => {
  setValue(e.target.value)
}, [])
```

### Event Handler Patterns

```javascript
// ✅ GOOD: Prevent default when needed
const handleSubmit = (e) => {
  e.preventDefault()
  onSubmit(formData)
}

// ✅ GOOD: Stop propagation for nested clickable elements
const handleCardClick = (e) => {
  e.stopPropagation()
  openDetails(event)
}

// ✅ GOOD: Extract data from events
const handleChange = (e) => {
  const { name, value } = e.target
  setFormData(prev => ({ ...prev, [name]: value }))
}
```

### Performance Optimization

```javascript
// ✅ GOOD: Limit re-renders with early returns
function ExpensiveComponent({ items }) {
  if (!items || items.length === 0) return null

  return <div>{/* expensive rendering */}</div>
}

// ✅ GOOD: Debounce/throttle expensive operations
const [query, setQuery] = useState('')

const handleSearch = (e) => {
  const value = e.target.value
  setQuery(value)
  // Search happens via useMemo, not on every keystroke
}
```

### Phase 3 Accessibility Standards

**Status**: ✅ Complete (Phase 3 Implementation - November 30, 2025)

Phase 3 introduced comprehensive WCAG 2.1 AA compliance with advanced patterns:
- **ARIA compliance** for dynamic content
- **Keyboard navigation** with proper focus management
- **Screen reader support** with semantic HTML and live regions
- **Error recovery** with accessible retry mechanisms
- **Real-time content updates** with proper announcements
- **Progressive enhancement** for streaming content

#### ARIA Compliance Standards

##### 1. Dialog Modal Pattern
```jsx
// ✅ Complete dialog implementation
<div
  className="gemini-chat-overlay"
  role="dialog"
  aria-label="Gemini Chat lịch sử Việt Nam"
  aria-modal="true"
  aria-describedby="chat-description"
  onClick={onClose}
>
  <div
    className="gemini-chat-panel"
    role="document"
    onClick={e => e.stopPropagation()}
  >
    <div className="chat-header">
      <h2 id="chat-title">Trợ lý lịch sử Gemini</h2>
      <button
        onClick={onClose}
        aria-label="Đóng chat"
        aria-controls="chat-messages"
        className="chat-close-btn"
      >
        <span aria-hidden="true">&times;</span>
      </button>
    </div>

    <div id="chat-description" className="sr-only">
      Chat với trợ lý AI về lịch sử Việt Nam. Các phản hồi được tạo ra bởi Google Gemini
      và có thể chứa thông tin từ Wikipedia.
    </div>

    {/* Chat messages with live region */}
    <div
      id="chat-messages"
      className="chat-messages"
      role="log"
      aria-live="polite"
      aria-relevant="additions text"
      aria-atomic="false"
    >
      {/* Messages will be rendered here */}
    </div>
  </div>
</div>
```

##### 2. Form Accessibility Pattern
```jsx
// ✅ Complete form with proper semantics
<form
  onSubmit={handleSubmit}
  className="chat-input-form"
  role="form"
  aria-labelledby="chat-title"
  noValidate
>
  <label htmlFor="chat-input" className="sr-only">
    Nhập câu hỏi về lịch sử Việt Nam
  </label>

  <input
    id="chat-input"
    ref={inputRef}
    type="text"
    value={input}
    onChange={e => setInput(e.target.value)}
    placeholder="Hỏi về lịch sử Việt Nam..."
    disabled={loading}
    aria-label="Nhập câu hỏi về lịch sử Việt Nam"
    aria-describedby={error ? 'error-message' : 'chat-input-help'}
    aria-invalid={error ? 'true' : 'false'}
    aria-required="true"
    autoComplete="off"
    spellCheck={false}
  />

  <div id="chat-input-help" className="sr-only">
    Nhập câu hỏi của bạn và nhấn Enter hoặc nhấn nút Gửi để nhận câu trả lời từ AI
  </div>

  <button
    type="submit"
    disabled={!input.trim() || loading}
    className={loading ? 'loading' : ''}
    aria-label={loading ? 'Đang gửi câu hỏi...' : 'Gửi câu hỏi'}
    aria-busy={loading}
  >
    <span aria-hidden="true">{loading ? '⏳' : 'Gửi'}</span>
    <span className="sr-only">
      {loading ? 'Đang gửi câu hỏi...' : 'Gửi câu hỏi'}
    </span>
  </button>

  {/* Error message with proper association */}
  {error && (
    <div
      id="error-message"
      role="alert"
      aria-live="assertive"
      className="error-message"
    >
      <span aria-hidden="true">⚠️</span>
      {error.message}
      {error.retryable && (
        <button
          onClick={retryLastMessage}
          aria-label={`Thử lại gửi câu hỏi. Lần thử thứ ${retryCount + 1}`}
          className="retry-button"
        >
          Thử lại
        </button>
      )}
    </div>
  )}
</form>
```

##### 3. Dynamic Content Updates Pattern
```jsx
// ✅ Live regions for streaming content
<div
  role="log"
  aria-live="polite"
  aria-relevant="additions text"
  aria-atomic="false"
  aria-label="Lịch sử trò chuyện với trợ lý AI"
>
  {messages.map((message, index) => (
    <div
      key={index}
      className={`message ${message.role} ${message.isError ? 'error' : ''}`}
      role="article"
      aria-label={`${message.role === 'user' ? 'Bạn' : 'Trợ lý AI'}: ${getMessagePreview(message.content)}`}
      aria-atomic={message.isError ? 'true' : 'false'}
    >
      <div className="message-content">
        {message.content}

        {/* Streaming indicator for accessibility */}
        {message.streaming && (
          <span
            className="streaming-indicator"
            aria-label="Đang tạo phản hồi"
            aria-live="polite"
          >
            <span aria-hidden="true">✍️</span>
            <span className="sr-only">Đang tạo phản hồi...</span>
          </span>
        )}

        {/* Source attribution for successful messages */}
        {message.role === 'assistant' && !message.isError && message.metadata && (
          <div
            className="source-attribution"
            role="complementary"
            aria-label={`Nguồn thông tin: Wikipedia, chiến lược ${message.metadata.ragStrategy}, ${message.metadata.articles} bài viết`}
          >
            <span aria-hidden="true">{getSourceIcon(message.metadata.ragStrategy)}</span>
            {' '}
            <span className="source-text">
              Wikipedia ({getSourceStrategyName(message.metadata.ragStrategy)}) -
              {message.metadata.articles} bài viết
            </span>
          </div>
        )}
      </div>

      {/* Error message details */}
      {message.isError && message.timestamp && (
        <div className="message-timestamp" aria-hidden="true">
          {new Date(message.timestamp).toLocaleTimeString('vi-VN')}
        </div>
      )}
    </div>
  ))}

  {/* Loading state with proper accessibility */}
  {loading && (
    <div
      className="message assistant loading"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="loading-indicator">
        <span aria-hidden="true">{getLoadingIcon(loadingPhase)}</span>
        {' '}
        <span className="loading-text">
          {getLoadingMessage(loadingPhase)}
        </span>

        {/* Progress bar for loading states */}
        {loadingPhase === 'rag_search' && (
          <div
            className="loading-progress"
            role="progressbar"
            aria-label="Đang tìm kiếm Wikipedia"
            aria-valuenow="0"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-busy="true"
          >
            <div
              className="progress-bar"
              style={{ width: '100%' }}
              aria-hidden="true"
            />
          </div>
        )}
      </div>
    </div>
  )}
</div>
```

##### 4. Focus Management Pattern
```jsx
// ✅ Proper focus management and keyboard navigation
function ChatPanel({ isOpen, onClose }) {
  const panelRef = useRef(null);
  const inputRef = useRef(null);
  const firstFocusableRef = useRef(null);
  const lastFocusableRef = useRef(null);

  // Focus trap implementation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      // ESC key to close
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      // Tab key navigation for focus trap
      if (e.key === 'Tab') {
        const focusableElements = panelRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (!focusableElements || focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          // Shift + Tab (backward)
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab (forward)
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Focus management for modal open/close
  useEffect(() => {
    if (isOpen) {
      // Save previous focus
      const previousFocus = document.activeElement;

      // Focus first focusable element or input
      const focusableElements = panelRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements && focusableElements.length > 0) {
        focusableElements[0].focus();
      } else if (inputRef.current) {
        inputRef.current.focus();
      }

      // Prevent body scroll
      document.body.style.overflow = 'hidden';

      // Return cleanup function
      return () => {
        // Restore previous focus
        if (previousFocus && typeof previousFocus.focus === 'function') {
          previousFocus.focus();
        }
        // Restore body scroll
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  return (
    <div
      ref={panelRef}
      className="gemini-chat-panel"
      role="document"
      tabIndex="-1"
    >
      {/* Chat content */}
      <input
        ref={inputRef}
        type="text"
        aria-label="Nhập câu hỏi về lịch sử Việt Nam"
        autoFocus={isOpen}
      />
    </div>
  );
}
```

#### WCAG 2.1 AA Compliance Checklist

##### 1. Perceivable (1.4.x)
- ✅ **Color and Contrast**: All text has minimum 4.5:1 contrast ratio
- ✅ **Resize Text**: Text scales up to 200% without loss of functionality
- ✅ **Images of Text**: No images of text used (all text is actual text)
- ✅ **Reflow**: Content reflows properly at 320px width
- ✅ **Non-text Contrast**: UI components have 3:1 contrast ratio
- ✅ **Text Spacing**: Line height, letter spacing, and word spacing customizable

##### 2. Operable (2.1.x - 2.5.x)
- ✅ **Keyboard Accessible**: All functionality available via keyboard
- ✅ **No Keyboard Trap**: Focus trap properly implemented for modals
- ✅ **Focus Order**: Logical tab order maintained
- ✅ **Focus Visible**: Clear focus indicators on all interactive elements
- ✅ **Character Key Shortcuts**: No keyboard shortcuts that conflict with browser
- ✅ **Timing Adjustable**: No time limits, all actions can be extended
- ✅ **Pause, Stop, Hide**: No auto-playing content that needs to be paused
- ✅ **Three Flashes**: No content that flashes more than three times per second
- ✅ **Navigation Mechanisms**: Multiple ways to navigate (keyboard, mouse, touch)
- ✅ **Headings and Labels**: Proper heading structure and form labels

##### 3. Understandable (3.1.x - 3.3.x)
- ✅ **Language of Page**: Language identified in HTML lang="vi"
- ✅ **Language of Parts**: Language changes marked appropriately
- ✅ **Identify Input Purpose**: HTML5 input types used where appropriate
- ✅ **Consistent Navigation**: Navigation patterns consistent across the application
- ✅ **Consistent Identification**: UI components with same function have same identification
- ✅ **Error Identification**: Error messages clearly identify input errors
- ✅ **Labels or Instructions**: Forms have proper labels and instructions
- ✅ **Error Suggestion**: Helpful error messages suggest corrections
- ✅ **Error Prevention**: Critical actions have confirmation where appropriate
- ✅ **Help**: Context-sensitive help and instructions provided
- ✅ **Input Assistance**: Input validation and auto-correction where helpful

##### 4. Robust (4.1.x)
- ✅ **Compatible**: Works with current and future user agents, including assistive technologies
- ✅ **Markup Validation**: Valid HTML5 with proper semantic structure
- ✅ **ARIA Usage**: ARIA used appropriately without conflicting with native semantics
- ✅ **Assistive Technology Compatibility**: Screen readers and other AT properly supported

#### Screen Reader Testing Requirements

##### VoiceOver (iOS/macOS)
- ✅ Proper announcement of new messages
- ✅ Focus management in modal dialogs
- ✅ Form field labels and error announcements
- ✅ Button states and loading indicators

##### NVDA (Windows)
- ✅ Navigation by headings, landmarks, and links
- ✅ Reading of dynamic content updates
- ✅ Focus tracking in chat interface
- ✅ Accessibility tree structure validation

##### JAWS (Windows)
- ✅ Forms mode navigation and entry
- ✅ Virtual buffer updates for streaming content
- ✅ Focus trap and escape functionality
- ✅ Screen reader announcements for all state changes

### Accessibility Standards

```javascript
// ✅ GOOD: Semantic HTML
<header className="site-header" role="banner">
  <nav className="site-nav" aria-label="Điều hướng chính">
    <ul>...</ul>
  </nav>
</header>

// ✅ GOOD: ARIA labels
<button
  onClick={handleClick}
  aria-label="Xem chi tiết cho Lý Thái Tổ"
>
  Chi tiết
</button>

// ✅ GOOD: Keyboard support
<div
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleActivate()
    }
  }}
>
```

---

## Common Patterns

### Pattern 1: Controlled Components

```javascript
// ✅ Standard pattern for form inputs
function SearchForm() {
  const [query, setQuery] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSearch(query)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
      />
      <button type="submit">Search</button>
    </form>
  )
}
```

### Pattern 2: Modal Management

```javascript
// ✅ Standard pattern for modals
function App() {
  const [selectedItem, setSelectedItem] = useState(null)

  const openModal = (item) => setSelectedItem(item)
  const closeModal = () => setSelectedItem(null)

  return (
    <>
      <ItemList onItemClick={openModal} />
      <Modal
        item={selectedItem}
        isOpen={selectedItem !== null}
        onClose={closeModal}
      />
    </>
  )
}

function Modal({ item, isOpen, onClose }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen || !item) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal content */}
      </div>
    </div>
  )
}
```

### Pattern 3: List Filtering

```javascript
// ✅ Standard pattern for filtering with useMemo
function FilterableList({ items }) {
  const [filter, setFilter] = useState('all')

  const filtered = useMemo(() => {
    if (filter === 'all') return items
    return items.filter(item => item.category === filter)
  }, [items, filter])

  return (
    <>
      <select value={filter} onChange={(e) => setFilter(e.target.value)}>
        <option value="all">All</option>
        {/* categories */}
      </select>
      <ul>
        {filtered.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </>
  )
}
```

### Pattern 4: Data Normalization

```javascript
// ✅ Pattern for Vietnamese text normalization
const normalized = (s) =>
  s.toLowerCase()
   .normalize('NFD')
   .replace(/\p{Diacritic}/gu, '')

// Usage in search
const results = items.filter(item =>
  normalized(item.title).includes(normalized(query))
)
```

---

## Anti-Patterns to Avoid

### ❌ Anti-Pattern 1: Mutating State

```javascript
// ❌ BAD: Mutating state directly
const [items, setItems] = useState([])
items.push(newItem) // WRONG
setItems(items)

// ✅ GOOD: Create new array
setItems([...items, newItem])
```

### ❌ Anti-Pattern 2: Missing Dependencies

```javascript
// ❌ BAD: Using external value without declaring dependency
useEffect(() => {
  console.log(query) // 'query' should be in dependency array
}, [])

// ✅ GOOD: Declare all dependencies
useEffect(() => {
  console.log(query)
}, [query])
```

### ❌ Anti-Pattern 3: Inline Function Props

```javascript
// ❌ BAD: Creates new function on every render
{items.map(item => (
  <Item key={item.id} onClick={() => handleClick(item.id)} />
))}

// ✅ GOOD: Stable reference or useCallback
const handleItemClick = useCallback((id) => {
  handleClick(id)
}, [])

{items.map(item => (
  <Item key={item.id} onClick={() => handleItemClick(item.id)} />
))}
```

### ❌ Anti-Pattern 4: Over-Engineering

```javascript
// ❌ BAD: Over-abstraction for simple case
const Button = ({ variant, size, color, rounded, shadow, ...props }) => {
  // Complex logic for simple button
}

// ✅ GOOD: Keep it simple
const Button = ({ className, children, ...props }) => (
  <button className={`btn ${className}`} {...props}>
    {children}
  </button>
)
```

### ❌ Anti-Pattern 5: God Components

```javascript
// ❌ BAD: Single component doing everything
function App() {
  // 500+ lines of code
  // Handles routing, state, UI, logic, data fetching...
}

// ✅ GOOD: Split into smaller components
function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
      <Footer />
    </>
  )
}
```

---

## Code Review Checklist

Before committing code, verify:

### Functionality
- [ ] Code works as expected
- [ ] No console errors
- [ ] All features functional
- [ ] Edge cases handled

### Code Quality
- [ ] Follows naming conventions
- [ ] Components < 200 lines
- [ ] No code duplication
- [ ] Proper error handling
- [ ] Clean, readable code

### React Best Practices
- [ ] Proper hook usage
- [ ] Correct dependencies in useEffect/useMemo
- [ ] No unnecessary re-renders
- [ ] Proper key props in lists
- [ ] Cleanup functions where needed

### Accessibility
- [ ] Semantic HTML
- [ ] ARIA labels present
- [ ] Keyboard navigation works
- [ ] Focus management correct

### Performance
- [ ] No unnecessary computations
- [ ] Expensive operations memoized
- [ ] Images optimized
- [ ] Bundle size acceptable

### Documentation
- [ ] JSDoc comments for complex functions
- [ ] README updated if needed
- [ ] Inline comments for tricky logic

---

## API Response Format Standards

### Phase 2 Streaming Response Pattern

**Status**: ✅ Established (Phase 2 Implementation)

**Standard**: Metadata + Streaming Content + End Marker

#### Response Structure
```
[HTTP Headers]
X-Request-ID: <uniqueRequestId>
Content-Type: text/plain; charset=utf-8
Cache-Control: no-cache
Connection: keep-alive

[Response Body]
[METADATA]{JSON_METADATA}[/METADATA]
<streaming_content_here>
[END]
```

#### Metadata Schema
```javascript
// Success Response Metadata
{
  "success": true,           // Required: Boolean
  "ragSuccess": true,        // Optional: Boolean - RAG context success
  "ragStrategy": 1,          // Optional: Number - Search strategy used (1, 2, 3)
  "articles": 3,             // Optional: Number - Wikipedia articles found
  "timestamp": "2025-11-30T...", // Required: String - ISO timestamp
  "requestId": "1738261234567-abc123def" // Required: String - Unique identifier
}

// Error Response Metadata
{
  "success": false,         // Required: Boolean
  "error": "Error message",  // Required: String - Error description
  "errorCode": "ERROR_CODE", // Optional: String - Machine-readable error code
  "timestamp": "2025-11-30T...", // Required: String - ISO timestamp
  "requestId": "1738261234567-abc123def", // Required: String - Unique identifier
  "duration": 1250          // Optional: Number - Request duration in ms
}
```

#### Request ID Pattern
```javascript
// Standard Request ID Generation
function generateRequestId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Example Output: "1738261234567-abc123def"
// Pattern: <timestamp>-<random_9_chars>
```

#### Backend Response Pattern
```javascript
// Phase 2 Response Implementation
router.post('/endpoint', async (req, res) => {
  const requestId = generateRequestId();
  const startTime = Date.now();

  try {
    // 1. Process request logic
    const result = await processRequest(req.body);

    // 2. Set response headers
    res.setHeader('X-Request-ID', requestId);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.flushHeaders();

    // 3. Write success metadata
    const metadata = {
      success: true,
      timestamp: new Date().toISOString(),
      requestId,
      // ... other fields
    };
    res.write('[METADATA]' + JSON.stringify(metadata) + '[/METADATA]\n');

    // 4. Stream content (if applicable)
    if (result.isStream) {
      for await (const chunk of result.stream) {
        res.write(chunk.text());
      }
    } else {
      res.write(result.content);
    }

    // 5. Write end marker
    res.write('\n[END]');
    res.end();

  } catch (error) {
    handleStreamError(res, error, requestId, startTime);
  }
});
```

#### Error Handling Pattern
```javascript
// Standard Error Handler
function handleStreamError(res, error, requestId, startTime) {
  const errorMetadata = {
    success: false,
    error: error.message || 'Internal server error',
    errorCode: error.code || 'UNKNOWN',
    timestamp: new Date().toISOString(),
    requestId,
    duration: Date.now() - startTime
  };

  // Only set headers if not already sent
  if (!res.headersSent) {
    res.setHeader('X-Request-ID', requestId);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.write('[METADATA]' + JSON.stringify(errorMetadata) + '[/METADATA]\n');
  }

  const userMessage = process.env.NODE_ENV === 'development'
    ? error.message
    : 'Đã có lỗi xảy ra. Vui lòng thử lại.';

  res.write(`Lỗi: ${userMessage}`);
  res.write('\n[END]');
  res.end();
}
```

### Frontend Response Parsing

#### Standard Parsing Function
```javascript
// Phase 2 Response Parser
async function parseStreamingResponse(response) {
  try {
    // 1. Extract request ID from headers
    const requestId = response.headers.get('X-Request-ID');

    // 2. Get response text
    const text = await response.text();

    // 3. Extract metadata
    const metadataMatch = text.match(/\[METADATA\]([\s\S]*?)\[\/METADATA\]/);
    if (!metadataMatch) {
      throw new Error('Invalid response format: missing metadata');
    }

    const metadata = JSON.parse(metadataMatch[1]);

    // 4. Check for backend errors
    if (!metadata.success) {
      throw new Error(metadata.error || 'Backend error occurred');
    }

    // 5. Extract content
    const content = text
      .replace(/\[METADATA\][\s\S]*?\[\/METADATA\]/, '')
      .replace(/\[END\]/, '')
      .trim();

    return {
      success: true,
      content,
      metadata,
      requestId
    };

  } catch (error) {
    return {
      success: false,
      error: error.message,
      requestId: response.headers.get('X-Request-ID')
    };
  }
}
```

#### Usage Pattern
```javascript
// Frontend Usage Example
const handleChatRequest = async (messages) => {
  try {
    const response = await fetch('/api/gemini/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await parseStreamingResponse(response);

    if (!result.success) {
      throw new Error(result.error);
    }

    // Success: display content and handle metadata
    displayAIResponse(result.content);
    logRequestMetrics(result.metadata);

  } catch (error) {
    // Error: display user-friendly message
    displayError(error.message);
    logError(error);
  }
};
```

### Logging Standards

#### Structured Logging Pattern
```javascript
// Standard Logging Function
function logRequest(requestId, event, data = {}) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${requestId}] [${timestamp}] ${event}: ${JSON.stringify(data)}`;

  console.log(logEntry);

  // Optional: Send to logging service
  if (process.env.LOG_ENDPOINT) {
    sendToLogService({
      requestId,
      timestamp,
      event,
      data,
      level: event.includes('error') ? 'error' : 'info'
    });
  }
}

// Standard Event Types
const LOG_EVENTS = {
  REQUEST_START: 'chat_start',
  RAG_COMPLETE: 'rag_complete',
  STREAM_CREATED: 'stream_created',
  STREAM_ERROR: 'stream_error',
  REQUEST_ERROR: 'chat_error',
  REQUEST_COMPLETE: 'chat_complete'
};
```

#### Event Logging Examples
```javascript
// Request Lifecycle Logging
logRequest(requestId, LOG_EVENTS.REQUEST_START, {
  query: userQuery,
  messageCount: messages.length,
  userAgent: req.headers['user-agent']
});

logRequest(requestId, LOG_EVENTS.RAG_COMPLETE, ragMeta);

logRequest(requestId, LOG_EVENTS.REQUEST_COMPLETE, {
  duration: Date.now() - startTime,
  tokens: totalTokens,
  ragSuccess: metadata.ragSuccess,
  contentLength: content.length
});
```

---

## Conclusion

Following these code standards ensures:
- **Consistency** across the codebase
- **Maintainability** for future development
- **Readability** for all developers
- **Quality** in production code
- **Performance** optimization
- **Accessibility** compliance
- **Standardized API responses** with proper error handling
- **Structured logging** with request tracking
- **Consistent error handling** patterns

**Next Steps**:
1. Refactor `App.jsx` to follow size guidelines
2. Add TypeScript for type safety
3. Implement automated linting (ESLint)
4. Add code formatting (Prettier)
5. Set up pre-commit hooks
6. Apply Phase 2 response standards to all new API endpoints
7. Add response format validation in automated tests
