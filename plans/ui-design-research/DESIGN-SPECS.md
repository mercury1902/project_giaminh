# Design Specifications - Vietnamese History Timeline UI Patterns

**Version**: 1.0 | **Last Updated**: November 29, 2025

---

## 1. Floating Button (FAB) Specification

### Anatomy & Dimensions
```
┌─────────────────────────┐
│                         │
│        Chat Icon        │  (24x24px SVG)
│                         │  Centered in button
└─────────────────────────┘
  56px × 56px (outer)
```

### Positioning
```
Desktop/Tablet:
┌──────────────────────────────────────┐
│                                 | |  │
│                                [FAB] │ 24px from right
│                                      │ 24px from bottom
│                                      │
└──────────────────────────────────────┘

Mobile (landscape):
├─ Right edge: 16-24px margin
├─ Bottom edge: 16-24px margin
└─ Not occluding chat input (if expandable)
```

### Interaction States
```
RESTING
├─ Background: #2563eb (--primary)
├─ Border: none
├─ Shadow: var(--shadow)
├─ Scale: 1.0
└─ Cursor: pointer

HOVER
├─ Background: #2563eb (unchanged)
├─ Scale: 1.08 (8% enlarge)
├─ Shadow: var(--shadow) + elevated
└─ Transition: 200ms cubic-bezier(0.4, 0, 0.2, 1)

FOCUS (Keyboard)
├─ Outline: 2px solid #2563eb
├─ Outline-offset: 4px
├─ Background: #2563eb
└─ Visible focus indicator (high contrast)

ACTIVE/PRESSED
├─ Transform: translateY(1px) (press-down feedback)
└─ Duration: 100ms
```

### Accessibility Markup
```jsx
<button
  type="button"
  aria-label="Open history assistant chat"
  aria-expanded="false"  // Toggle to true when chat opens
  aria-haspopup="dialog"  // Indicates button opens modal
  className="fab-chat"
>
  <ChatIcon size={24} aria-hidden="true" />
</button>

/* Or with tooltip (optional) */
<button
  type="button"
  aria-label="Open history assistant chat"
  title="Chat with AI history guide"
>
  {/* ... */}
</button>
```

---

## 2. Timeline Item Interaction Specification

### Card States

#### DEFAULT (Inactive)
```
┌─────────────────────────────────────┐
│ 1945 - Cách mạng tháng Tám          │
│                                     │
│ Xã hội: Khởi đầu DCS               │
│ Triều đại: Triều Lê Giữa            │
│                                     │
│ [Xem chi tiết →]                    │
└─────────────────────────────────────┘

Opacity: 0.7
Border: 1px solid #e5e7eb
Shadow: 0 2px 8px rgba(0,0,0,.06)
```

#### HOVER
```
┌─────────────────────────────────────┐
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│  ← Accent bar appears
│ 1945 - Cách mạng tháng Tám          │
│                                     │
│ Xã hội: Khởi đầu DCS               │
│ Triều đại: Triều Lê Giữa            │
│                                     │
│ [Xem chi tiết →]                    │
└─────────────────────────────────────┘

Transform: translateX(4px) + translateY(-2px)
Shadow: 0 4px 16px rgba(0,0,0,.1)
Border-color: var(--period-color)
```

#### ACTIVE (Selected)
```
┌─────────────────────────────────────┐
│████ PERIOD ACCENT BAR (4px wide)   │  ← Animated color
│ 1945 - Cách mạng tháng Tám          │
│                                     │
│ Xã hội: Khởi đầu DCS               │
│ Triều đại: Triều Lê Giữa            │
│                                     │
│ [Xem chi tiết →]                    │
└─────────────────────────────────────┘

Opacity: 1.0
Border: 2px solid var(--period-color)
Shadow: 0 8px 24px rgba(0,0,0,.12)
Transform: translateX(4px)
Accent bar color: --period-color (animated)
```

### Animation Sequence
```
Timeline Item Fade-In:
├─ Item 1: delay 0ms,   duration 500ms
├─ Item 2: delay 50ms,  duration 500ms
├─ Item 3: delay 100ms, duration 500ms
└─ Item 4: delay 150ms, duration 500ms

Easing: cubic-bezier(0.4, 0, 0.2, 1)
Path: opacity 0→1, transform translateY(12px)→0
```

---

## 3. Color System Specification

### Vietnamese Five-Element Period Colors

#### Period: Cổ đại (Ancient: 2879 BCE - 938 CE)
```
Element: Water (Thuỷ)
Primary Color: #1F2937 (Dark Gray-Black)
Semantic Meaning: Mystery, depth, foundation, continuity
Hex Breakdown:
  - Very dark for authority & timelessness
  - Near-black evokes ancient wisdom
Contrast: 15.75:1 against white (AAA+)
Psychology: Contemplative, scholarly
```

#### Period: Phong kiến (Feudal: 938 - 1858 CE)
```
Element: Fire (Hỏa)
Primary Color: #DC2626 (Vibrant Red)
Semantic Meaning: Passion, power, energy, revolution
Hex Breakdown:
  - Warm, commanding presence
  - Evokes imperial dynasties & conflict
Contrast: 3.68:1 against white (AA)
Psychology: Dynamic, powerful, memorable
```

#### Period: Cận đại (Modern: 1858 - 1945 CE)
```
Element: Earth (Thổ)
Primary Color: #EABB00 (Imperial Gold)
Semantic Meaning: Authority, stability, wealth, transition
Hex Breakdown:
  - Warm gold signals importance & change
  - Imperial associations with dynastic rule
Contrast: 2.14:1 against white (Fails AA - use for accents only)
Psychology: Prestigious, transitional, aspirational
```

#### Period: Hiện đại (Contemporary: 1945 - Present)
```
Element: Wood (Mộc)
Primary Color: #16A34A (Rich Green)
Semantic Meaning: Growth, vitality, prosperity, renewal
Hex Breakdown:
  - Natural, living green
  - Modern hope & forward momentum
Contrast: 6.47:1 against white (AAA)
Psychology: Growth-oriented, contemporary, optimistic
```

### Implementation in CSS
```css
:root {
  /* Period Colors (Five-Element System) */
  --period-ancient: #1F2937;
  --period-feudal: #DC2626;
  --period-modern: #EABB00;
  --period-contemporary: #16A34A;

  /* Dynamic Period Color (Set by JavaScript) */
  --period-color: var(--period-feudal);
}

/* Period-based styling */
.timeline-period {
  background: var(--period-color);
  color: #fff;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 8px;
}

.timeline-item[data-period="ancient"] {
  --period-color: var(--period-ancient);
}
.timeline-item[data-period="feudal"] {
  --period-color: var(--period-feudal);
}
.timeline-item[data-period="modern"] {
  --period-color: var(--period-modern);
}
.timeline-item[data-period="contemporary"] {
  --period-color: var(--period-contemporary);
}
```

### Advanced Color Palettes (Optional)

#### Heritage-Inspired Palette (Level 2)
```
Primary: Lacquer Crimson #8B2E2E
  → Used for major dynasties, important events
  → More sophisticated than bright red
  → High cultural resonance

Secondary: Jade Green #6B8E23
  → Prosperity, growth, harmony
  → Complements crimson naturally
  → Traditional Vietnamese colors

Accent: Imperial Gold #D4AF37
  → Rare event highlighting
  → Dynasty badges for prominent rulers
  → High-value content marker

Background: Heritage Parchment #F5E6D3
  → Aged paper aesthetic
  → Reduces eye strain vs. pure white
  → Evokes historical documents
```

#### Contrast Validation Table
| Color | Text | Against White | WCAG Level |
|---|---|---|---|
| #1F2937 (Ancient) | White | 15.75:1 | AAA+ |
| #DC2626 (Feudal) | White | 3.68:1 | AA |
| #EABB00 (Modern) | Black | 2.14:1 | FAIL |
| #16A34A (Contemporary) | White | 6.47:1 | AAA |

**Note**: Use #EABB00 for badges/accents only. Pair with darker text or use as background behind dark text.

---

## 4. Microinteraction Timing Specification

### Standard Easing Function
```
cubic-bezier(0.4, 0, 0.2, 1)
- Fast out (0.2 at 100%)
- Slow in (0.4 at 0%)
- Natural, graceful motion
- Recommended for all state changes
```

### Timing Reference
```
100ms  → Button press feedback (too-fast threshold)
200ms  → Hover effects, button scaling
300ms  → Modal entry, major transitions
400ms  → Scroll animations, complex sequences
500ms+ → Staggered animations, sequential reveals
```

### Animation Examples

#### FAB Hover
```css
@keyframes fabHover {
  from { transform: scale(1.0); }
  to { transform: scale(1.08); }
}

.fab-chat:hover {
  animation: fabHover 200ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
  box-shadow: var(--shadow), 0 12px 28px rgba(37, 99, 235, 0.3);
}
```

#### Timeline Item Staggered Entrance
```css
@keyframes timelineItemEntry {
  0% {
    opacity: 0;
    transform: translateY(12px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.timeline-item {
  animation: timelineItemEntry 500ms cubic-bezier(0.4, 0, 0.2, 1) backwards;
}

.timeline-item:nth-child(n) {
  animation-delay: calc(50ms * (n - 1));
}
```

#### Card Accent Bar Animation
```css
@keyframes accentBarExpand {
  from {
    width: 2px;
    opacity: 0;
  }
  to {
    width: 4px;
    opacity: 1;
  }
}

.timeline-item.active .timeline-card::before {
  animation: accentBarExpand 300ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## 5. Accessibility Checklist

### Floating Button Accessibility
- [ ] Element is native `<button>`, not `<div>` or `<span>`
- [ ] Has descriptive `aria-label` ("Open history assistant chat")
- [ ] Visible focus indicator (outline: 2px solid, 4px offset)
- [ ] Color contrast 4.5:1 minimum against background
- [ ] 56px × 56px minimum touch target
- [ ] Keyboard navigable (part of tab order)
- [ ] `aria-expanded` toggles when chat opens/closes
- [ ] Not occluding critical page content
- [ ] Z-index managed properly (FAB: 50, modals: 1000)

### Timeline Accessibility
- [ ] Keyboard navigation with arrow keys or Tab
- [ ] Active state clearly visible (not color-only)
- [ ] Modal has focus trap (focus bounces within modal)
- [ ] Close button is keyboard accessible
- [ ] Period/dynasty labels have sufficient contrast
- [ ] Search input is properly labeled
- [ ] Filter controls have labels/ARIA descriptions

### Color Contrast Requirements
- [ ] Primary text on white: 4.5:1 (AA) or 7:1 (AAA)
- [ ] UI elements: 3:1 minimum (AA)
- [ ] Large text: 3:1 minimum
- [ ] Functional colors: not sole differentiator

---

## 6. Responsive Breakpoints

### Timeline FAB Positioning
```
Desktop (960px+):
├─ FAB: 40px from right edge
├─ FAB: 40px from bottom edge
└─ Timeline: Two-column grid possible

Tablet (640px - 960px):
├─ FAB: 24px from right edge
├─ FAB: 24px from bottom edge
└─ Timeline: Single-column with adjusted padding

Mobile (< 640px):
├─ FAB: 16px from right edge
├─ FAB: 16px from bottom edge (above mobile keyboard)
├─ FAB: 48px × 48px (reduced size acceptable)
└─ Timeline: Full-width cards, reduced padding
```

---

## 7. Implementation Checklist

### Before Launch
- [ ] FAB meets WCAG 2.1 AA accessibility standards
- [ ] All microinteractions perform at 60fps (no jank)
- [ ] Color palette tested with color-blind simulators
- [ ] Modal focus management working correctly
- [ ] Keyboard navigation complete (Tab, Arrow, Escape)
- [ ] Screen reader testing (NVDA/JAWS on Windows)
- [ ] Mobile touch targets validated (44px+ minimum)
- [ ] Performance: animations < 50ms CPU time
- [ ] Contrast ratios validated programmatically

### Testing Tools
```
Accessibility:
├─ axe DevTools (Chrome extension)
├─ WAVE (WCAG validator)
├─ NVDA (screen reader - Windows)
└─ Lighthouse (Chrome built-in)

Color:
├─ Contrast Checker (WebAIM)
├─ Color Oracle (color-blind simulator)
└─ Accessible Colors (online tool)

Performance:
├─ Chrome DevTools > Performance tab
├─ Lighthouse > Metrics
└─ Animation Inspector
```

---

**Document Version**: 1.0
**Last Reviewed**: November 29, 2025
**Status**: Ready for Implementation
