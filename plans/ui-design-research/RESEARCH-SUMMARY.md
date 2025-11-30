# UI Design Patterns Research - Executive Summary

**Date**: November 29, 2025 | **Status**: Complete

---

## Quick Reference

### 1. Floating Buttons (Chatbot/AI Feature)
| Aspect | Recommendation |
|---|---|
| **Position** | Bottom-right corner, 24-40px from edges |
| **Size** | 56px diameter minimum (48px + padding) |
| **Element** | Use native `<button>` (not `<div>`) |
| **Accessibility** | Focus outline 2px solid with 4px offset |
| **Contrast** | 4.5:1 minimum (your blue #2563eb passes) |
| **Animation** | 200ms ease, scale 1.08 on hover |
| **Z-index** | 50 (below modals) |
| **Icon** | Chat/question mark in white |

**Skip Link Pattern**: For screen readers: `aria-label="Skip to chat button"`

---

### 2. Timeline Design
| Pattern | Action |
|---|---|
| **Interaction** | Hover expands card (4-8px shadow lift) |
| **Microinteractions** | Staggered fade-in 50-100ms per item |
| **Selection** | Smooth border color to period color |
| **Performance** | Use cubic-bezier(0.4, 0, 0.2, 1) easing |
| **Feedback** | Scroll-spy highlights active period |
| **Structure** | Current vertical scroll + semantic zoom recommended |

**Future Enhancement**: Add relationship mapping for causally-related events (when expanding content).

---

### 3. Color Psychology & Vietnamese Cultural Design

#### Five-Element Color System (Ngu Hanh)
```
Ancient (Cổ đại)       → Water/Black (#1F2937)
Feudal (Phong kiến)    → Fire/Red (#DC2626)
Modern (Cận đại)       → Earth/Yellow (#EABB00)
Contemporary (Hiện đại) → Wood/Green (#16A34A)
```

#### Palette Options
**Option A (Current)**: Keep light theme, enhance with period badges using five-element colors
**Option B (Cultural)**: Introduce lacquer-inspired crimson (#8B2E2E) + jade green accents
**Option C (Progressive)**: Timeline background shifts subtly by period (ice → warm → gold → nature tones)

**Psychology Rules**:
- Warm = draw attention, signal importance
- Cool = calm, trust, growth
- Reserve high saturation for CTAs only
- Desaturate neutrals for text/backgrounds

---

## Implementation Priorities

### Phase 1 (Current - Polish)
- [ ] Add period-based color coding to timeline
- [ ] Enhance existing button accessibility (contrast audit)
- [ ] Add staggered animation delays to timeline items
- [ ] Verify modal color dynamically matches event period

### Phase 2 (AI Integration)
- [ ] Implement floating chat button per FAB spec
- [ ] Add skip link for keyboard/screen reader users
- [ ] Theme chat modal border with period color
- [ ] Test WCAG 2.1 AA compliance (keyboard nav, contrast)

### Phase 3 (Content Expansion)
- [ ] Semantic zoom for timeline periods
- [ ] Relationship mapping UI between events
- [ ] Vietnamese design system documentation
- [ ] Guided exploration tutorials with microinteractions

---

## Key Metrics to Track

| Metric | Target | Why |
|---|---|---|
| FAB Click Rate | 73%+ | Industry standard for bottom-right positioning |
| Task Completion | +22% with microinteractions | Figma research baseline |
| Color Contrast Ratio | 4.5:1+ (AA) | WCAG accessibility requirement |
| Animation Duration | 200-300ms | Sweet spot for responsiveness |
| Modal Entry Time | <300ms | Feels instantaneous to users |

---

## Files & Documentation

- **Full Research Report**: `./plans/ui-design-research/reports/251129-modern-ui-design-patterns.md`
- **Implementation Examples**: See report sections 3-4 (code samples included)
- **Cultural References**: Vietnamese five-element theory, UNESCO heritage standards

---

## Next Steps

1. **Review Report**: Deep-dive into `251129-modern-ui-design-patterns.md` for full implementation details
2. **Design Review**: Validate period color choices with cultural consultant (if available)
3. **Sprint Planning**: Prioritize Phase 1 items for next sprint
4. **A/B Testing**: If implementing multiple color palettes, test user preference
5. **Accessibility Audit**: Run WCAG validator on any new FAB implementation

---

**Questions?** See "Unresolved Questions" section in full research report.
