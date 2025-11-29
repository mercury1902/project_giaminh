# System Architecture

**Project**: Vietnamese History Timeline
**Version**: 0.1.0
**Last Updated**: 2025-11-29

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [System Layers](#system-layers)
3. [Component Architecture](#component-architecture)
4. [Data Flow](#data-flow)
5. [State Management](#state-management)
6. [Routing Architecture](#routing-architecture)
7. [Build & Deployment](#build--deployment)
8. [Phase 2 Response Format & Error Handling](#phase-2-response-format--error-handling)
9. [Integration Points](#integration-points)
10. [Future Architecture](#future-architecture)

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     USER BROWSER                         │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │            React Application (SPA)              │    │
│  │                                                 │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐    │    │
│  │  │  Header  │  │  Routes  │  │  Footer  │    │    │
│  │  └──────────┘  └──────────┘  └──────────┘    │    │
│  │                      │                         │    │
│  │         ┌────────────┴────────────┐           │    │
│  │         │                         │           │    │
│  │    ┌────▼─────┐          ┌───────▼──────┐   │    │
│  │    │ HomePage │          │  AiHistory   │   │    │
│  │    └────┬─────┘          └──────────────┘   │    │
│  │         │                                     │    │
│  │  ┌──────┴──────┐                            │    │
│  │  │             │                            │    │
│  │  ▼      ▼      ▼      ▼                    │    │
│  │ Hero  About Timeline Search                 │    │
│  │                  │                           │    │
│  │            ┌─────┴──────┐                   │    │
│  │            ▼            ▼                   │    │
│  │    TimelineItem  EventDetailModal           │    │
│  └─────────────────────────────────────────────┘    │
│                                                      │
│  ┌─────────────────────────────────────────────┐   │
│  │         Static Data Layer                    │   │
│  │  ┌─────────┐  ┌──────────┐  ┌──────────┐  │   │
│  │  │ events  │  │ periods  │  │dynasties │  │   │
│  │  └─────────┘  └──────────┘  └──────────┘  │   │
│  └─────────────────────────────────────────────┘   │
│                                                      │
│  ┌─────────────────────────────────────────────┐   │
│  │           Custom Hooks Layer                 │   │
│  │  ┌──────────────┐  ┌───────────────────┐   │   │
│  │  │  useFetch    │  │ useWikipediaData  │   │   │
│  │  └──────────────┘  └───────────────────┘   │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │   Static Hosting     │
              │  (CDN / Web Server)  │
              └──────────────────────┘
```

### Architecture Type

**Single-Page Application (SPA)** with:
- Client-side rendering (CSR)
- Static data layer (no backend API)
- Client-side routing (React Router)
- No database (JSON data in source code)

---

## System Layers

### Layer 1: Presentation Layer

**Responsibility**: User interface rendering and user interactions

**Components**:
- React functional components with modern patterns
- JSX templates with accessibility features
- CSS styling with responsive design
- Event handlers with error recovery
- Form controls with validation
- Real-time streaming UI components

**Technologies**:
- React 18.3.1 (UI library)
- React Router DOM 7.9.6 (routing)
- CSS3 with custom properties and modern layout
- Streaming response handling with AbortController
- ARIA compliance and keyboard navigation

**Files**:
- `src/App.jsx` - Main application and all UI components
- `src/pages/AiHistory.jsx` - AI history page component
- `src/components/gemini-chat-panel.jsx` - Phase 3 AI chat interface
- `src/styles.css` - Global styles, component styles, and responsive design

---

### Layer 2: State Management Layer

**Responsibility**: Application state and component state management

**Current Architecture**:
- **Component-level state** (useState)
- **No global state management** (Redux, Context API not used)
- **Local state only** for each component

**State Categories**:

1. **UI State** (local to components)
   - Modal visibility: `selectedEvent`
   - Active item: `activeIndex`
   - Filter selections: `period`, `dynasty`
   - Search query: `query`

2. **Computed State** (useMemo)
   - Filtered events
   - Search results
   - Statistics

3. **Async State** (custom hooks)
   - Loading states
   - Error states
   - Data states

**State Flow**:
```
User Action
    ↓
Event Handler
    ↓
setState()
    ↓
Component Re-render
    ↓
useMemo Recomputation (if dependencies changed)
    ↓
UI Update
```

---

### Layer 3: Business Logic Layer

**Responsibility**: Application logic, data processing, computations

**Components**:

1. **Filtering Logic**
```javascript
const filtered = useMemo(() => {
  return events.filter(e =>
    (period === 'all' || e.period === period) &&
    (dynasty === 'all' || e.dynasty === dynasty)
  ).sort((a, b) => a.year - b.year)
}, [events, period, dynasty])
```

2. **Search Logic**
```javascript
const normalized = (s) => s.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')
const results = events.filter(e =>
  [e.title, e.description, e.dynasty, String(e.year), e.period]
    .filter(Boolean)
    .some(field => normalized(String(field)).includes(normalized(query)))
).slice(0, 20)
```

3. **Statistics Computation**
```javascript
const stats = useMemo(() => {
  const numEvents = allEvents.length
  const centuries = new Set(allEvents.map(e => Math.floor(e.year / 100)))
  const numCenturies = centuries.size
  const numDynasties = new Set(allEvents.map(e => e.dynasty).filter(Boolean)).size
  return { numEvents, numCenturies, numDynasties }
}, [])
```

**Technologies**:
- React useMemo for memoization
- JavaScript array methods (filter, map, sort)
- String normalization for Vietnamese text

---

### Layer 4: Data Layer

**Responsibility**: Data storage and retrieval

**Current Architecture**:
- **Static JSON data** in JavaScript modules
- **No backend API**
- **No database**
- **No data persistence** (except potential future localStorage)

**Data Structure**:

```javascript
// src/data/events.js

// 1. Configuration Data
export const periods = ['Cổ đại', 'Phong kiến', 'Cận đại', 'Hiện đại']
export const dynasties = ['Hồng Bàng', 'Ngô', 'Đinh', ...]

// 2. Event Data
export const events = [
  {
    id: 'hb-2879',              // Unique identifier
    year: -2879,                // Year (negative for BCE)
    title: 'Truyền thuyết...',  // Event title
    dynasty: 'Hồng Bàng',       // Dynasty name
    period: 'Cổ đại',           // Period classification
    description: '...',         // Short description
    details: ''                 // Extended details (optional)
  },
  // ... 17 more events
]
```

**Data Access Pattern**:
```javascript
// Import at component level
import { events, periods, dynasties } from './data/events.js'

// Use directly in component
const allEvents = events
```

---

### Layer 5: Custom Hooks Layer

**Responsibility**: Reusable stateful logic

**Hooks Available**:

#### 1. `useFetch(fetchFn, deps)`
**Purpose**: Generic data fetching with loading/error states

**Features**:
- Loading state management
- Error handling
- Request cancellation
- Retry mechanism

**Usage**:
```javascript
const { data, loading, error, retry } = useFetch(fetchFunction, [deps])
```

#### 2. `useWikipediaData(title, options)`
**Purpose**: Wikipedia API integration (future feature)

**Features**:
- Wikipedia page summary fetching
- Exponential backoff retry
- Vietnamese error messages
- Caching support

**Usage**:
```javascript
const { data, loading, error, retry, isRetryable } = useWikipediaData('Lý Thái Tổ')
```

**Location**: `src/hooks/useFetch.js`

---

## Phase 3 Frontend UX Architecture

### Overview

**Status**: ✅ Complete (Phase 3 Implementation - November 30, 2025)

Phase 3 introduced a comprehensive frontend UX enhancement focused on:
- **Real-time streaming interface** for AI interactions
- **Advanced accessibility compliance** (WCAG 2.1 AA)
- **Error recovery and retry mechanisms**
- **Progressive loading states with phase indicators**
- **Responsive design optimization**
- **Modern CSS architecture with design tokens**

### Component Architecture: Gemini Chat Panel

**File**: `src/components/gemini-chat-panel.jsx`

**Design System Compliance**:
- **Color Palette**: `#F4EFEC` (surface), `#1A1A1A` (text), `#D9AE8E` (accent)
- **Typography**: Be Vietnam Pro (headings), Lora (body), Montserrat (labels)
- **Spacing**: 24px base unit with 8px increments
- **Accessibility**: Full ARIA compliance, keyboard navigation, screen reader support

**Component Breakdown**:

#### 1. State Management Architecture
```javascript
// Multi-state management for complex interactions
const [messages, setMessages] = useState([]);
const [loading, setLoading] = useState(false);
const [loadingPhase, setLoadingPhase] = useState(null); // NEW
const [error, setError] = useState(null);
const [retryCount, setRetryCount] = useState(0); // NEW
const [lastSuccessfulRequest, setLastSuccessfulRequest] = useState(null); // NEW
```

**Loading Phases** (NEW):
- `RAG_SEARCH`: Wikipedia context searching
- `GEMINI_THINKING`: AI response generation
- `STREAMING`: Real-time content delivery
- `ERROR`: Error state with recovery options

#### 2. Metadata Parsing System
```javascript
// Phase 2 enhanced response format handling
const parseMetadata = (text) => {
  const metadataMatch = text.match(/\[METADATA\](.*?)\[\/METADATA\]/s);
  // Parse success, strategy, articles, request ID
};

const extractContent = (text) => {
  return text
    .replace(/\[METADATA\].*?\[\/METADATA\]/gs, '')
    .replace(/\[END\]$/gs, '')
    .trim();
};
```

#### 3. Real-time Streaming Interface
```javascript
// Streaming response with AbortController
const reader = res.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value, { stream: true });
  fullResponse += chunk;

  // Real-time UI updates
  setMessages(prev => {
    // Update assistant message with streaming content
  });
}
```

#### 4. Advanced Error Handling
```javascript
// Comprehensive error categorization and recovery
catch (error) {
  let errorMessage = 'Lỗi kết nối. Vui lòng thử lại.';
  let errorCode = 'UNKNOWN';
  let isRetryable = true;

  // Specific error handling:
  // - AbortError: User cancellation
  // - Timeout: Request exceeded time limit
  // - ConfigError: API key issues

  setError({
    message: errorMessage,
    code: errorCode,
    timestamp: new Date().toISOString(),
    retryable: errorCode !== 'CONFIG_ERROR' && errorCode !== 'ABORTED'
  });
}
```

#### 5. Source Attribution System
```javascript
// Wikipedia source indicators with strategy mapping
const getSourceIndicator = (metadata) => {
  const strategyIcons = {
    1: '🎯', // Primary search
    2: '🔤', // Keyword search
    3: '🔓'  // Diacritic removal
  };

  return (
    <span className="source-indicator"
          title={`Wikipedia - Chiến lược ${metadata.ragStrategy} (${metadata.articles} bài viết)`}>
      {strategyIcons[metadata.ragStrategy]} Wikipedia ({strategyNames[metadata.ragStrategy]})
    </span>
  );
};
```

### CSS Architecture & Responsive Design

**File**: `src/styles.css` (Enhanced in Phase 3)

#### 1. Design Token System
```css
:root {
  /* Primary Neutrals - Minimalist Foundation */
  --bg: #ffffff;
  --surface: #f4efec;
  --text: #1a1a1a;
  --text-muted: #4e4c4f;
  --border: #9f8d8d;

  /* Vietnamese Period Colors - Cultural System */
  --period-cds: #1f2937;        /* Cổ đại (Ancient) */
  --period-pks: #dc2626;        /* Phong kiến (Feudal) */
  --period-cds-modern: #eabb00; /* Cận đại (Modern) */
  --period-hds: #16a34a;        /* Hiện đại (Contemporary) */

  /* Accent Colors */
  --accent-primary: #d9ae8e;
  --accent-emphasis: #c41e3a;
}
```

#### 2. Typography System with Vietnamese Support
```css
/* Font Families - Google Fonts with Vietnamese Support */
--font-heading: 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-body: 'Lora', 'Georgia', serif;
--font-label: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

#### 3. Modern CSS Architecture
```css
/* Component-based CSS organization */

/* Layout Patterns */
.container { /* Grid/Flexbox layouts */ }

/* Component Patterns */
.gemini-chat-overlay { /* Fixed overlay with backdrop blur */ }
.gemini-chat-panel { /* Responsive chat container */ }
.gemini-chat-messages { /* Scrollable message area */ }

/* State Modifiers */
.message.user { /* User message alignment and styling */ }
.message.assistant { /* Assistant message styling */ }
.message.error { /* Error message highlighting */ }

/* Animation System */
@keyframes messageSlide { /* Smooth message appearance */ }
.loading-progress { /* Progress bar animation */ }
```

#### 4. Responsive Design Breakpoints
```css
/* Mobile-first responsive design */
.gemini-chat-panel {
  width: 90%;
  height: 70vh;
  max-height: 600px;
}

/* Tablet adjustments */
@media (min-width: 768px) {
  .gemini-chat-panel {
    width: 80%;
    height: 75vh;
  }
}

/* Desktop optimizations */
@media (min-width: 1024px) {
  .gemini-chat-panel {
    width: 800px;
    max-width: 90%;
  }
}
```

### Accessibility Implementation (Phase 3)

#### 1. ARIA Compliance
```jsx
<div
  className="gemini-chat-overlay"
  role="dialog"
  aria-label="Gemini Chat lịch sử Việt Nam"
  aria-modal="true"
  onClick={onClose}
>
  <button
    aria-label="Đóng chat"
    className="chat-close-btn"
  >
    &times;
  </button>
</div>
```

#### 2. Keyboard Navigation
```jsx
// Focus management
useEffect(() => {
  if (isOpen) {
    inputRef.current?.focus();
  }
}, [isOpen]);

// Form submission handling
const handleSubmit = useCallback((e) => {
  e.preventDefault();
  sendMessage();
}, [sendMessage]);
```

#### 3. Screen Reader Support
```jsx
// Semantic HTML structure
<form onSubmit={handleSubmit} className="gemini-chat-input-form">
  <input
    ref={inputRef}
    aria-label="Nhập câu hỏi"
    autoComplete="off"
    disabled={loading}
  />
</form>
```

### Error Recovery & User Experience

#### 1. Progressive Error Handling
```javascript
// Multi-level error recovery
const retryLastMessage = useCallback(() => {
  if (messages.length < 2) return;

  const lastUserMessage = messages[messages.length - 2];
  if (!lastUserMessage || lastUserMessage.role !== 'user') return;

  setRetryCount(prev => prev + 1);
  setError(null);
  sendMessage(lastUserMessage.content);
}, [messages]);
```

#### 2. Loading State Management
```javascript
// Phase-aware loading indicators
const getLoadingMessage = () => {
  switch (loadingPhase) {
    case 'rag_search': return '🔍 Tìm kiếm Wikipedia...';
    case 'gemini': return '🤔 Đang suy nghĩ...';
    case 'streaming': return '✍️ Đang viết câu trả lời...';
    default: return '⏳ Đang xử lý...';
  }
};
```

#### 3. Visual Feedback Systems
```jsx
{/* Enhanced loading state with phase indicator */}
{loading && (
  <div className="message assistant loading">
    <div className="loading-indicator">
      {getLoadingMessage()}
      {loadingPhase === 'rag_search' && (
        <div className="loading-progress">
          <div className="progress-bar"></div>
        </div>
      )}
    </div>
  </div>
)}

{/* Enhanced error display with retry option */}
{error && !loading && (
  <div className="error-message">
    <div className="error-content">
      <span className="error-icon">⚠️</span>
      <span className="error-text">{error.message}</span>
    </div>
    {error.retryable && (
      <div className="error-actions">
        <button onClick={retryLastMessage} className="retry-button">
          🔄 Thử lại ({retryCount > 0 ? `${retryCount}` : ''})
        </button>
      </div>
    )}
  </div>
)}
```

### Performance Optimizations (Phase 3)

#### 1. Stream Processing Optimization
```javascript
// Efficient stream reading with TextDecoder
const reader = res.body.getReader();
const decoder = new TextDecoder();

// Process chunks incrementally
while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value, { stream: true });
  // Incremental UI updates
}
```

#### 2. Memory Management
```javascript
// Cleanup AbortController on unmount
useEffect(() => {
  return () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };
}, []);
```

#### 3. Request Cancellation
```javascript
// Cancel previous requests when new ones start
if (abortControllerRef.current) {
  abortControllerRef.current.abort();
}
abortControllerRef.current = new AbortController();
```

---

## Component Architecture

### Component Hierarchy

```
App (Root Component)
│
├── Header
│   └── Navigation
│       ├── Link: Trang chủ (/)
│       ├── Link: Timeline (/#timeline)
│       ├── Link: Tìm kiếm (/#search)
│       ├── Link: Lịch sử với AI (/ai-history)
│       └── Link: Khái quát (/#about)
│
├── Routes (React Router)
│   │
│   ├── Route: / (HomePage)
│   │   ├── Hero
│   │   │   ├── Hero Copy (text content)
│   │   │   └── Visual Card
│   │   │       └── Stats (events, centuries, dynasties)
│   │   │
│   │   ├── About
│   │   │   └── Historical overview text
│   │   │
│   │   ├── Timeline
│   │   │   ├── Section Header
│   │   │   │   └── Filter Controls
│   │   │   │       ├── Period Select
│   │   │   │       └── Dynasty Select
│   │   │   │
│   │   │   ├── Timeline Container
│   │   │   │   ├── Timeline Wrap (scrollable)
│   │   │   │   │   ├── Timeline Line (visual)
│   │   │   │   │   └── Timeline Rail
│   │   │   │   │       └── Timeline Items (dynamic)
│   │   │   │   │           ├── Timeline Dot
│   │   │   │   │           └── Timeline Card
│   │   │   │   │               ├── Year
│   │   │   │   │               ├── Title
│   │   │   │   │               ├── Meta (dynasty, period)
│   │   │   │   │               ├── Description
│   │   │   │   │               └── Details Button
│   │   │   │   │
│   │   │   │   └── EventDetailModal
│   │   │   │       ├── Close Button
│   │   │   │       ├── Header
│   │   │   │       │   ├── Period Badge
│   │   │   │       │   ├── Title
│   │   │   │       │   └── Meta (year, dynasty)
│   │   │   │       └── Body
│   │   │   │           ├── Description Section
│   │   │   │           └── Details Section
│   │   │
│   │   └── Search
│   │       ├── Search Form
│   │       │   ├── Search Input
│   │       │   └── Search Button
│   │       └── Search Results
│   │           └── Result Cards (dynamic)
│   │               ├── Title
│   │               ├── Meta (year, dynasty, period)
│   │               ├── Description
│   │               └── Link to Timeline
│   │
│   └── Route: /ai-history (AiHistory)
│       └── Placeholder Content
│           ├── Icon
│           ├── Title
│           ├── Description
│           └── Disabled Form
│
└── Footer
    ├── Copyright Text
    └── Back to Top Link
```

### Component Responsibilities

| Component | Responsibility | State | Props |
|-----------|---------------|-------|-------|
| **App** | Root, routing, layout | None | None |
| **Header** | Navigation, sticky header | None | None |
| **Hero** | Hero section, stats | None | `stats` |
| **About** | Historical overview | None | None |
| **Timeline** | Timeline display, filtering | `period`, `dynasty`, `activeIndex`, `selectedEvent` | `events` |
| **EventDetailModal** | Event details modal | Internal effects | `event`, `isOpen`, `onClose`, `getPeriodColor` |
| **Search** | Search functionality | `query` | `events` |
| **Footer** | Site footer | None | None |
| **HomePage** | Home page composition | None | `stats`, `allEvents` |
| **AiHistory** | AI feature placeholder | `query` | None |

---

## Data Flow

### Event Data Flow

```
┌─────────────────┐
│  events.js      │  Static data file
└────────┬────────┘
         │ import
         ▼
┌─────────────────┐
│  App.jsx        │  Root component
└────────┬────────┘
         │ pass as props
         ├─────────────┐
         ▼             ▼
┌──────────────┐  ┌──────────┐
│  Timeline    │  │  Search  │
└──────┬───────┘  └────┬─────┘
       │ filter        │ filter
       ▼               ▼
┌──────────────┐  ┌──────────┐
│ Filtered     │  │ Results  │
│ Events       │  │ Events   │
└──────┬───────┘  └────┬─────┘
       │ render        │ render
       ▼               ▼
┌──────────────┐  ┌──────────┐
│ Timeline UI  │  │Result UI │
└──────────────┘  └──────────┘
```

### User Interaction Flow

#### Timeline Filtering Flow
```
User selects period/dynasty
         │
         ▼
onChange event fires
         │
         ▼
setPeriod() / setDynasty()
         │
         ▼
State updates
         │
         ▼
useMemo dependency changes
         │
         ▼
Filter recomputes
         │
         ▼
Component re-renders
         │
         ▼
useEffect scrolls to active item
         │
         ▼
UI updates
```

#### Search Flow
```
User types in search input
         │
         ▼
onChange event fires
         │
         ▼
setQuery(value)
         │
         ▼
State updates
         │
         ▼
useMemo dependency changes
         │
         ▼
Search results recompute
         │
         ▼
Component re-renders
         │
         ▼
Results displayed
```

#### Modal Flow
```
User clicks "Chi tiết" button
         │
         ▼
onClick event fires
         │
         ▼
openDetails(event)
         │
         ▼
setSelectedEvent(event)
         │
         ▼
State updates
         │
         ▼
Modal component receives props
         │
         ▼
useEffect prevents body scroll
         │
         ▼
Modal renders
         │
         ▼
User interacts (ESC, click outside, close button)
         │
         ▼
closeDetails()
         │
         ▼
setSelectedEvent(null)
         │
         ▼
State updates
         │
         ▼
useEffect restores body scroll
         │
         ▼
Modal closes
```

---

## State Management

### Current State Architecture

**Pattern**: Component-level state (no global state)

**Advantages**:
- ✅ Simple and straightforward
- ✅ No additional dependencies
- ✅ Easy to understand
- ✅ Good for small/medium apps

**Limitations**:
- ⚠️ Props drilling (if deeply nested)
- ⚠️ Difficult to share state across routes
- ⚠️ No centralized state inspection

### State Categories

#### 1. UI State (Component-specific)

**Location**: Timeline component
```javascript
const [period, setPeriod] = useState('all')
const [dynasty, setDynasty] = useState('all')
const [activeIndex, setActiveIndex] = useState(0)
const [selectedEvent, setSelectedEvent] = useState(null)
```

**Location**: Search component
```javascript
const [query, setQuery] = useState('')
```

**Location**: AiHistory component
```javascript
const [query, setQuery] = useState('')
```

#### 2. Computed State (Derived from props/state)

**Location**: App component
```javascript
const stats = useMemo(() => {
  const numEvents = allEvents.length
  const centuries = new Set(allEvents.map(e => Math.floor(e.year / 100)))
  const numCenturies = centuries.size
  const numDynasties = new Set(allEvents.map(e => e.dynasty).filter(Boolean)).size
  return { numEvents, numCenturies, numDynasties }
}, [])
```

**Location**: Timeline component
```javascript
const filtered = useMemo(() => {
  return events.filter(e =>
    (period === 'all' || e.period === period) &&
    (dynasty === 'all' || e.dynasty === dynasty)
  ).sort((a, b) => a.year - b.year)
}, [events, period, dynasty])
```

**Location**: Search component
```javascript
const results = useMemo(() => {
  const q = normalized(query.trim())
  if (!q) return []
  return events.filter(e => /* search logic */).slice(0, 20)
}, [events, query])
```

#### 3. Side Effect State (useEffect)

**Location**: EventDetailModal
```javascript
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
```

**Location**: Timeline
```javascript
useEffect(() => {
  const el = railRef.current
  if (!el || filtered.length === 0) return
  const active = el.querySelector(`[data-index="${activeIndex}"]`)
  if (active) {
    active.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
  }
}, [activeIndex, filtered])
```

---

## Routing Architecture

### Routing Configuration

**Library**: React Router DOM v7.9.6

**Router Type**: BrowserRouter

**Setup**:
```javascript
// main.jsx
<BrowserRouter>
  <App />
</BrowserRouter>

// App.jsx
<Routes>
  <Route path="/" element={<HomePage stats={stats} allEvents={allEvents} />} />
  <Route path="/ai-history" element={<AiHistory />} />
</Routes>
```

### Route Structure

| Route Path | Component | Description | Hash Sections |
|------------|-----------|-------------|---------------|
| `/` | HomePage | Main landing page | `#home`, `#timeline`, `#search`, `#about` |
| `/ai-history` | AiHistory | AI features page | None |

### Hash Navigation

**Purpose**: Scroll to specific sections on home page

**Implementation**:
```javascript
// App.jsx - Header component
const scrollTo = (id) => {
  if (!isHome) return
  const element = document.querySelector(id)
  if (element) element.scrollIntoView({ behavior: 'smooth' })
}

// Navigation links
<a href="#timeline" onClick={(e) => {
  e.preventDefault()
  scrollTo('#timeline')
}}>Timeline</a>
```

**Supported Hashes**:
- `/#home` → Hero section
- `/#timeline` → Timeline section
- `/#search` → Search section
- `/#about` → About section

### Route-Aware Navigation

**Active Link Highlighting**:
```javascript
const location = useLocation()
const isHome = location.pathname === '/'

<Link
  to="/ai-history"
  className={location.pathname === '/ai-history' ? 'active-link' : ''}
>
  Lịch sử với AI
</Link>
```

**Hash Scrolling on Load**:
```javascript
useEffect(() => {
  if (location.hash) {
    const id = location.hash
    setTimeout(() => {
      const element = document.querySelector(id)
      if (element) element.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  } else if (location.pathname !== '/') {
    window.scrollTo(0, 0)
  }
}, [location])
```

---

## Build & Deployment

### Build System

**Tool**: Vite 5.4.8

**Configuration**:
```javascript
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

**Build Scripts**:
```json
{
  "scripts": {
    "dev": "vite --port 5173",
    "build": "vite build",
    "preview": "vite preview --port 5174"
  }
}
```

### Development Server

**Command**: `npm run dev`

**Port**: 5173

**Features**:
- Hot Module Replacement (HMR)
- Fast refresh for React
- Error overlay
- Source maps

### Production Build

**Command**: `npm run build`

**Output Directory**: `dist/`

**Build Output**:
```
dist/
├── index.html              (0.69 kB)
└── assets/
    ├── index-[hash].css    (15.43 kB raw, 3.69 kB gzip)
    └── index-[hash].js     (162.63 kB raw, 52.92 kB gzip)
```

**Build Metrics**:
- Build time: ~655ms
- Total bundle: 162.63 KB (52.92 KB gzip)
- Modules: 34 transformed

**Preview Server**:
- Command: `npm run preview`
- Port: 5174
- Serves production build locally

### Deployment Architecture

**Deployment Type**: Static hosting

**Compatible Platforms**:
- ✅ Netlify
- ✅ Vercel
- ✅ GitHub Pages
- ✅ Cloudflare Pages
- ✅ AWS S3 + CloudFront
- ✅ Any web server (Apache, Nginx)

**Deployment Requirements**:
- Serve `dist/index.html` for all routes (SPA routing)
- Support client-side routing
- HTTPS recommended
- Gzip/Brotli compression recommended

**Sample Netlify Configuration**:
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## Backend Architecture

### Backend Services Layer

**Technology Stack**:
- Node.js + Express.js
- Google Generative AI (Gemini 2.0 Flash)
- Wikipedia Core REST API
- LRU Cache

**Architecture Diagram**:

```
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend (SPA)                      │
│  ┌────────────────────────────────────────────────────┐     │
│  │  GeminiChatPanel Component                         │     │
│  └────────────────┬───────────────────────────────────┘     │
│                   │ POST /api/gemini/chat                    │
└───────────────────┼──────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│                  Backend Server (Express)                    │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Routes Layer (gemini-routes.js)              │  │
│  │  - POST /api/gemini/chat                             │  │
│  │  - RAG context fetching                              │  │
│  │  - Streaming response handling                       │  │
│  └────────────────┬─────────────────────────────────────┘  │
│                   │                                          │
│                   ▼                                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │      RAG Service (rag-service.js)                    │  │
│  │                                                       │  │
│  │  ┌─────────────────────────────────────────────┐    │  │
│  │  │  Multi-Tier Wikipedia Search (2.5s max)     │    │  │
│  │  │                                              │    │  │
│  │  │  Strategy 1: Direct Search                  │    │  │
│  │  │       ↓ (if fails)                          │    │  │
│  │  │  Strategy 2: Keyword Extraction             │    │  │
│  │  │       ↓ (if fails)                          │    │  │
│  │  │  Strategy 3: Diacritics Removal             │    │  │
│  │  └─────────────────────────────────────────────┘    │  │
│  │                                                       │  │
│  │  - getRAGContext(query) → {content, meta}            │  │
│  │  - Static events filtering                           │  │
│  │  - Wikipedia summaries fetching                      │  │
│  │  - LRU Cache (5min TTL, 100 entries)                │  │
│  └────────────────┬─────────────────────────────────────┘  │
│                   │                                          │
│                   ▼                                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │   Wikipedia Service (wikipedia-service.js)           │  │
│  │  - search(query, limit)                              │  │
│  │  - getSummary(title)                                 │  │
│  │  - LRU Cache (5min TTL)                              │  │
│  └────────────────┬─────────────────────────────────────┘  │
│                   │                                          │
└───────────────────┼──────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│            External APIs                                     │
│  ┌────────────────────┐  ┌──────────────────────────┐      │
│  │  Wikipedia Core    │  │  Google Gemini API       │      │
│  │  REST API          │  │  (gemini-2.0-flash-001)  │      │
│  │  (vi.wikipedia)    │  │                          │      │
│  └────────────────────┘  └──────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

### RAG Service Multi-Tier Fallback Architecture

**Purpose**: Resilient Wikipedia search with graceful degradation

**Flow Diagram**:

```
User Query: "Chiến thắng Bạch Đằng của Trần Hưng Đạo"
                    │
                    ▼
┌───────────────────────────────────────────────────────────┐
│        searchWikipediaMultiTier(query)                    │
│        Timeout Budget: 2500ms                             │
└───────────────────┬───────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
   Strategy 1   Strategy 2   Strategy 3
   (Direct)     (Keywords)   (Simplified)
        │           │           │
        │           │           │
   ┌────▼─────┐ ┌──▼────────┐ ┌▼──────────────┐
   │ Search:  │ │ Extract:  │ │ Normalize:    │
   │ "Chiến   │ │ ['Chiến', │ │ "Chien thang  │
   │  thắng   │ │  'thắng', │ │  Bach Dang..."│
   │  Bạch    │ │  'Bạch']  │ │               │
   │  Đằng..." │ │           │ │ Remove diacri.│
   └────┬─────┘ │ Search    │ │               │
        │       │ each      │ │ Search simpl. │
        │       │ keyword   │ │ query         │
   ┌────▼─────┐ └──┬────────┘ └┬──────────────┘
   │ Results? │    │ Results?  │ Results?
   │  YES ✓   │    │   NO ✗    │   NO ✗
   └────┬─────┘    └───────────┴───────────────┘
        │
        ▼
┌───────────────────────────────────────────────────────────┐
│  Return: {                                                │
│    results: {...},                                        │
│    strategy: 1,                                           │
│    reason: "Primary search"                               │
│  }                                                        │
└───────────────────────────────────────────────────────────┘
        │
        ▼
Fetch summaries for top 3 articles (300-600ms)
        │
        ▼
┌───────────────────────────────────────────────────────────┐
│  Return: {                                                │
│    content: "Sự kiện...\n\nWikipedia...",                │
│    meta: {                                                │
│      success: true,                                       │
│      strategy: 1,                                         │
│      articles: 3,                                         │
│      reason: "Primary search"                             │
│    }                                                      │
│  }                                                        │
└───────────────────────────────────────────────────────────┘
```

**Timeout Guard Implementation**:

```javascript
const TIMEOUT_MS = 2500  // 2.5s max total
const startTime = Date.now()

const getTimeRemaining = () => Math.max(0, TIMEOUT_MS - (Date.now() - startTime))

// Each strategy races against remaining time
if (getTimeRemaining() > 0) {
  results = await Promise.race([
    searchStrategy1_PrimarySearch(query),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), getTimeRemaining())
    )
  ])
}
```

**Performance Budget**:

| Component | Target Time | Actual Avg |
|-----------|-------------|------------|
| Static events filter | 5-10ms | 8ms |
| Multi-tier Wikipedia search | ≤2500ms | 800-1200ms |
| Fetch summaries (top 3) | 300-600ms | 450ms |
| Context assembly | 5-10ms | 6ms |
| **Total RAG** | **<3000ms** | **~1264ms** |

---

## Phase 2 Response Format & Error Handling

### Metadata Response Format

**Status**: ✅ Implemented (Phase 2)

**Response Structure**:
```
[HTTP Headers]
X-Request-ID: <requestId>
Content-Type: text/plain; charset=utf-8
Cache-Control: no-cache
Connection: keep-alive

[Response Body]
[METADATA]{
  "success": true,
  "ragSuccess": true,
  "ragStrategy": 1,
  "articles": 3,
  "timestamp": "2025-11-30T...",
  "requestId": "1738261234567-abc123def"
}[/METADATA]

<AI response content stream...>

[END]
```

**Error Response Format**:
```
[HTTP Headers]
X-Request-ID: <requestId>
Content-Type: text/plain; charset=utf-8

[Response Body]
[METADATA]{
  "success": false,
  "error": "Error message",
  "errorCode": "ERROR_CODE",
  "timestamp": "2025-11-30T...",
  "requestId": "1738261234567-abc123def",
  "duration": 1250
}[/METADATA]

Lỗi: <Vietnamese error message>

[END]
```

**Frontend Parsing Pattern**:
```javascript
// Phase 2 Response Parsing
const response = await fetch('/api/gemini/chat', {...});
const text = await response.text();

// Extract metadata
const metadataMatch = text.match(/\[METADATA\]([\s\S]*?)\[\/METADATA\]/);
const metadata = metadataMatch ? JSON.parse(metadataMatch[1]) : null;

// Extract content
const content = text.replace(/\[METADATA\][\s\S]*?\[\/METADATA\]/, '').replace(/\[END\]/, '').trim();

// Extract request ID from headers
const requestId = response.headers.get('X-Request-ID');
```

### Structured Logging with Request IDs

**Status**: ✅ Implemented (Phase 2)

**Logging Pattern**:
```javascript
// Request ID Generation
function generateRequestId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Structured Logging
function logRequest(requestId, event, data) {
  const timestamp = new Date().toISOString();
  console.log(`[${requestId}] [${timestamp}] ${event}:`, JSON.stringify(data));
}

// Log Events During Request Lifecycle
logRequest(requestId, 'chat_start', { query, messageCount: messages.length });
logRequest(requestId, 'rag_complete', ragMeta);
logRequest(requestId, 'chat_complete', {
  duration: Date.now() - startTime,
  tokens: totalTokens,
  ragSuccess: metadata.ragSuccess
});
```

**Log Event Types**:
- `chat_start` - Request initialization with query and message count
- `rag_complete` - RAG context retrieval with strategy and article count
- `stream_creation_error` - Gemini stream creation failures
- `stream_error` - Streaming response errors with tokens processed
- `chat_error` - General chat errors with error codes and duration
- `chat_complete` - Successful completion with performance metrics

### Stream Error Handling Strategy

**Status**: ✅ Implemented (Phase 2)

**Error Handling Flow**:
```
Client Request → Request ID Assignment → RAG Context Fetching
                ↓
           Stream Creation Attempt
                ↓
    ┌─────────────────────────────────┐
    │   Stream Creation Success?      │
    └─────────┬───────────────────────┘
              │ YES                   │ NO
              ▼                        ▼
    Write Success Metadata    Write Error Metadata
    Response Headers            Response Headers
              │                        │
              ▼                        ▼
    Start Streaming           Write Error Message
    AI Response               + [END] Marker
              │
              ▼
    Stream Processing
         (for await chunk)
              │
   ┌────────┼────────────────┐
   │        │                 │
   ▼        ▼                 ▼
Success   Stream Error     Stream Complete
   │        │                 │
   │        ▼                 ▼
   │    Log + Throw      Log + Write [END]
   │    Error            Success Metrics
   └─────────────────────────┘
```

**Error Categorization**:
```javascript
// Stream Creation Errors
- GEMINI_API_KEY not configured
- Invalid messages array
- Model initialization failure
- Network connectivity issues

// Stream Processing Errors
- Token limit exceeded
- Content policy violations
- Network interruptions during streaming
- Model response generation failures

// RAG Context Errors
- Wikipedia API timeouts
- Cache retrieval failures
- Multi-tier search strategy failures
```

**Client-Side Error Recovery**:
```javascript
// Phase 2 Error Handling Pattern
try {
  const response = await fetch('/api/gemini/chat', {...});

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const text = await response.text();
  const metadata = extractMetadata(text);

  if (!metadata.success) {
    // Handle structured error from backend
    throw new Error(metadata.error);
  }

  // Process successful response
  const content = extractContent(text);
  return { metadata, content };

} catch (error) {
  // Log with request ID if available
  console.error(`[${requestId}] Chat error:`, error);

  // Show user-friendly error
  const userMessage = error.message.includes('API')
    ? 'Không thể kết nối đến AI. Vui lòng thử lại sau.'
    : 'Đã có lỗi xảy ra. Vui lòng thử lại.';

  return { error: userMessage };
}
```

---

## Integration Points

### Current Integrations

1. **Google Fonts**
   - Font: Inter (weights 400, 500, 600, 700)
   - CDN: fonts.googleapis.com

2. **Static Data**
   - Source: `src/data/events.js`
   - Format: JavaScript module exports

3. **Wikipedia Core REST API**
   - Endpoint: `https://vi.wikipedia.org/api/rest_v1/`
   - Features: Article search, summaries
   - Cache: 5min TTL LRU cache
   - CORS: Proxy enabled

4. **Google Gemini API**
   - Model: `gemini-2.0-flash-001`
   - Features: Streaming chat, RAG context
   - Authentication: API key (env var)
   - Response Format: Metadata headers + streaming content + [END] marker
   - Error Handling: Structured errors with request ID tracking

### Future Integration Points

#### 1. RAG Optimization (Phase 2 & 3)
**Status**: 🚧 Planned

**Phase 2 - Cache Optimization**:
- Separate LRU cache per strategy
- Cache hit/miss metrics
- TTL tuning based on query patterns
- Pre-warming for common queries

**Phase 3 - Hybrid RAG**:
- Semantic search with embeddings (OpenAI/Cohere)
- Re-ranking of Wikipedia results
- Citation tracking and verification
- Source quality scoring

#### 2. Backend API Expansion (Future)
**Purpose**: Replace static JSON with dynamic data

**Proposed Architecture**:
```
React Component
      ↓
Custom Hook (useFetch)
      ↓
API Service Layer
      ↓
fetch() / axios
      ↓
REST API Backend
      ↓
Database (PostgreSQL/MongoDB)
```

**Benefits**:
- Dynamic data updates
- User-generated content
- Search optimization
- Analytics
- Content management

#### 3. Authentication (Future)
**Purpose**: User accounts, bookmarks, personalization

**Proposed Stack**:
- Firebase Auth
- Or: JWT + Backend API
- Or: Auth0

#### 4. Analytics (Future)
**Purpose**: User behavior tracking

**Proposed Tools**:
- Google Analytics 4
- Or: Plausible
- Or: Mixpanel

---

## Future Architecture

### Scalability Considerations

#### Phase 1: Immediate Optimizations (No architecture change)
- Code splitting by route
- Lazy loading components
- Image optimization
- Virtual scrolling for 100+ events

#### Phase 2: State Management (Medium refactor)
**Problem**: Props drilling, shared state

**Solution**: React Context API
```
┌─────────────────────────────────────┐
│        App (Context Provider)        │
│  ┌────────────────────────────────┐ │
│  │  EventsContext                 │ │
│  │  - events                      │ │
│  │  - filters (period, dynasty)   │ │
│  │  - selectedEvent               │ │
│  └────────────────────────────────┘ │
│                │                     │
│    ┌───────────┼───────────┐        │
│    ▼           ▼           ▼        │
│ Timeline    Search    EventModal     │
└─────────────────────────────────────┘
```

**Benefits**:
- No props drilling
- Shared state across components
- Easier to add features

#### Phase 3: Backend Integration (Major refactor)
**Architecture**:
```
┌──────────────────────────────────────────────┐
│          React Frontend (SPA)                 │
│  ┌────────────────────────────────────────┐  │
│  │  Components + Context + Hooks          │  │
│  └──────────────────┬─────────────────────┘  │
│                     │ fetch()                 │
│                     ▼                         │
│  ┌────────────────────────────────────────┐  │
│  │      API Service Layer                 │  │
│  │  - eventsAPI.getAll()                  │  │
│  │  - eventsAPI.search(query)             │  │
│  │  - eventsAPI.getById(id)               │  │
│  └──────────────────┬─────────────────────┘  │
└─────────────────────┼────────────────────────┘
                      │ HTTP
                      ▼
┌──────────────────────────────────────────────┐
│          Backend API (Node.js/Python)         │
│  ┌────────────────────────────────────────┐  │
│  │  REST API Endpoints                    │  │
│  │  - GET /api/events                     │  │
│  │  - GET /api/events/:id                 │  │
│  │  - GET /api/events/search?q=           │  │
│  └──────────────────┬─────────────────────┘  │
│                     │                         │
│                     ▼                         │
│  ┌────────────────────────────────────────┐  │
│  │      Database (PostgreSQL/MongoDB)     │  │
│  │  - events table                        │  │
│  │  - periods, dynasties (lookup tables)  │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

**Benefits**:
- Dynamic content updates
- Better search (full-text search)
- User accounts
- Content management system
- Analytics
- Scalability

#### Phase 4: Progressive Web App (PWA)
**Features**:
- Offline support
- Add to home screen
- Push notifications
- Background sync

**Architecture Changes**:
- Add service worker
- Cache assets and data
- Implement offline mode
- Add manifest.json

#### Phase 5: Mobile App (React Native)
**Shared Code**:
- Business logic (hooks, utilities)
- Data models
- API client

**Platform-specific**:
- UI components (React Native)
- Navigation (React Navigation)
- Storage (AsyncStorage)

---

## Architecture Decision Records (ADRs)

### ADR-001: No Global State Management
**Decision**: Use component-level state only

**Rationale**:
- Simple application with limited shared state
- No deep component nesting
- Avoid unnecessary complexity
- Faster development

**Consequences**:
- ✅ Simpler codebase
- ✅ No additional dependencies
- ⚠️ May need refactor if app grows

### ADR-002: Static Data in Source Code
**Decision**: Store events data in JavaScript file

**Rationale**:
- Small dataset (18 events)
- No need for dynamic updates
- No backend infrastructure
- Faster initial development

**Consequences**:
- ✅ No backend required
- ✅ Fast loading
- ⚠️ Content updates require code deploy
- ⚠️ No user-generated content

### ADR-003: Client-Side Routing
**Decision**: Use React Router with BrowserRouter

**Rationale**:
- Single-page application
- Better UX (no page reloads)
- Support for hash navigation
- Standard for React apps

**Consequences**:
- ✅ Fast navigation
- ✅ Good UX
- ⚠️ Requires server configuration for SPA routing
- ⚠️ SEO requires additional work (SSR/SSG)

### ADR-004: Vite as Build Tool
**Decision**: Use Vite instead of Create React App

**Rationale**:
- Faster development server
- Faster builds
- Better HMR
- Modern tooling
- Smaller bundle size

**Consequences**:
- ✅ Excellent developer experience
- ✅ Fast builds
- ✅ Modern features
- ⚠️ Less mature than Webpack

---

## Conclusion

The Vietnamese History Timeline application follows a **simple, modern, client-side architecture** optimized for:
- Fast development
- Excellent performance
- Easy deployment
- Future extensibility

**Current Architecture Strengths**:
- ✅ Clean separation of concerns
- ✅ Modern React patterns
- ✅ Minimal dependencies
- ✅ Fast and lightweight

**Future Architecture Opportunities**:
- 🔄 Context API for shared state
- 🔄 Backend integration for dynamic content
- 🔄 PWA for offline support
- 🔄 React Native for mobile apps

The architecture is **production-ready** and well-positioned for future growth.
