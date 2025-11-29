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
import React, { useState, useEffect, useMemo, useRef } from 'react'
// Other imports

/**
 * Component description
 * @param {Object} props - Component props
 * @param {string} props.title - Prop description
 * @returns {JSX.Element}
 */
function ComponentName({ title, onAction }) {
  // 1. State declarations
  const [state, setState] = useState(initialValue)

  // 2. Refs
  const elementRef = useRef(null)

  // 3. Computed values (useMemo)
  const computedValue = useMemo(() => {
    return expensiveComputation(state)
  }, [state])

  // 4. Effects
  useEffect(() => {
    // Effect logic
    return () => {
      // Cleanup
    }
  }, [dependencies])

  // 5. Event handlers
  const handleClick = () => {
    // Handler logic
  }

  // 6. Render helpers (if needed)
  const renderItem = (item) => {
    return <div key={item.id}>{item.name}</div>
  }

  // 7. Return JSX
  return (
    <div className="component-name">
      {/* JSX content */}
    </div>
  )
}

export default ComponentName
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

## Conclusion

Following these code standards ensures:
- **Consistency** across the codebase
- **Maintainability** for future development
- **Readability** for all developers
- **Quality** in production code
- **Performance** optimization
- **Accessibility** compliance

**Next Steps**:
1. Refactor `App.jsx` to follow size guidelines
2. Add TypeScript for type safety
3. Implement automated linting (ESLint)
4. Add code formatting (Prettier)
5. Set up pre-commit hooks
