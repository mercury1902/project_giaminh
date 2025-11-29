# Tài Liệu Thiết Kế & Trải Nghiệm Người Dùng (UX)

## 🎨 Triết Lý Thiết Kế

### Core Principles

1. **Clarity (Tính Rõ Ràng)**
   - Mọi yếu tố giao diện phục vụ một mục đích rõ ràng
   - Không có decoration không cần thiết
   - Thông tin được tổ chức logic

2. **Hierarchy (Phân Cấp)**
   - Tiêu đề chính > Tiêu đề phụ > Nội dung chi tiết
   - Kích thước, màu sắc, vị trí phản ánh tầm quan trọng
   - Người dùng biết được cái gì quan trọng nhất

3. **Consistency (Tính Nhất Quán)**
   - Các màu sắc nhất quán trên toàn app
   - Kiểu chữ nhất quán
   - Pattern interaction nhất quán

4. **Accessibility (Khả Năng Tiếp Cận)**
   - Tất cả người dùng có thể sử dụng
   - Không phụ thuộc vào màu sắc riêng (colorblind-friendly)
   - Hỗ trợ keyboard navigation
   - Screen reader compatible

5. **Responsiveness (Tính Thích Ứng)**
   - Hoạt động trơn tru trên mọi kích thước màn hình
   - Layout tự động điều chỉnh
   - Touch-friendly cho mobile

---

## 🎯 Design System

### 1. Color Palette

#### Primary Colors
```
Primary Blue:     #2563eb  (Main actions, highlights)
Accent Amber:     #f59e0b  (Secondary actions)
Background White: #ffffff  (Main content area)
Text Dark Gray:   #111827  (Body text)
```

#### Period Colors (Meaningful Association)
```
Cổ Đại (Ancient):    #8b5cf6  (Purple - Mystical, Ancient)
Phong Kiến (Feudal): #3b82f6  (Blue - Royal, Traditional)
Cận Đại (Modern):    #f59e0b  (Amber - Transition, Change)
Hiện Đại (Current):  #ef4444  (Red - Energy, Modern)
```

#### Neutral Colors
```
Light Gray:  #f3f4f6
Medium Gray: #d1d5db
Dark Gray:   #6b7280
```

#### Functional Colors
```
Success: #10b981 (Green - Positive actions)
Error:   #ef4444 (Red - Errors, warnings)
Info:    #3b82f6 (Blue - Information)
```

### 2. Typography

#### Font Family
```css
/* Primary Font */
font-family: 'Inter', -apple-system, BlinkMacSystemFont,
             'Segoe UI', sans-serif;

/* Reasons for choice:
   - Modern, clean, highly readable
   - Excellent for web (open source)
   - Supports Vietnamese diacritical marks
   - Great on all screen sizes */
```

#### Font Scale
```
Heading 1 (H1):  32px / 40px   - Main page title
Heading 2 (H2):  24px / 32px   - Section titles
Heading 3 (H3):  20px / 28px   - Subsection titles
Body Large:      18px / 28px   - Large content
Body Regular:    16px / 24px   - Normal content
Body Small:      14px / 20px   - Secondary info
Caption:         12px / 16px   - Labels, captions
```

#### Font Weights
```
Light:   300  (Secondary information)
Regular: 400  (Body content)
Medium:  500  (Emphasis)
Bold:    600  (Headings, important text)
```

### 3. Spacing System (8px Grid)

```
xs: 4px    (0.25rem)
sm: 8px    (0.5rem)
md: 16px   (1rem)
lg: 24px   (1.5rem)
xl: 32px   (2rem)
2xl: 48px  (3rem)
3xl: 64px  (4rem)
```

**Ứng dụng:**
- Padding components: sm, md, lg
- Margin between sections: lg, xl, 2xl
- Gap in grids: md, lg

### 4. Elevation/Shadows

```css
/* Shadow Depth Hierarchy */
shadow-sm:   0 1px 2px rgba(0,0,0,0.05)
shadow-md:   0 4px 6px rgba(0,0,0,0.1)
shadow-lg:   0 10px 15px rgba(0,0,0,0.1)
shadow-xl:   0 20px 25px rgba(0,0,0,0.1)

/* Usage:
   - shadow-sm: Hover states, subtle elevation
   - shadow-md: Cards, containers
   - shadow-lg: Dropdowns, popovers
   - shadow-xl: Modals, focus states */
```

### 5. Border Radius

```
None:     0px
sm:       4px    (Small buttons, inputs)
md:       8px    (Cards, containers)
lg:       12px   (Large containers)
full:     9999px (Pills, circles)
```

---

## 🖼️ Layout Design

### Page Layout Structure

```
┌─────────────────────────────────────┐
│           HEADER / NAV              │ (Fixed)
├─────────────────────────────────────┤
│                                     │
│            HERO SECTION             │ (Full-width background)
│  - Title, subtitle, statistics      │
│  - Call-to-action buttons           │
│                                     │
├─────────────────────────────────────┤
│                                     │
│          ABOUT SECTION              │ (Container max-width)
│  - Description of project           │
│                                     │
├─────────────────────────────────────┤
│                                     │
│        TIMELINE SECTION             │ (Container max-width)
│  - Filters (Period, Dynasty)        │
│  - Timeline events list             │
│  - Event cards                      │
│                                     │
├─────────────────────────────────────┤
│                                     │
│         SEARCH SECTION              │ (Container max-width)
│  - Search input                     │
│  - Search results                   │
│                                     │
├─────────────────────────────────────┤
│             FOOTER                  │ (Full-width)
│  - Copyright, links                 │
└─────────────────────────────────────┘
```

### Grid System

**Desktop (1200px+)**
```
Container width: 1200px
Columns: 12 columns
Gutter: 24px

Timeline cards: 3 columns per card
```

**Tablet (768px - 1199px)**
```
Container width: 100% - 32px margin
Columns: 8 columns
Gutter: 20px

Timeline cards: 2 columns per card
```

**Mobile (< 768px)**
```
Container width: 100% - 16px margin
Single column layout
Gutter: 16px

Timeline cards: Full width
```

---

## 🎭 Component Design

### 1. Header

**Visual:**
```
┌────────────────────────────────────┐
│ Logo   Navigation Menu    Search   │
│ 📜     Home About Timeline Contact │
└────────────────────────────────────┘
```

**States:**
- **Desktop:** Full navigation menu visible
- **Tablet:** Hamburger menu appears
- **Mobile:** Burger menu, navigation in drawer

**Spacing:**
- Padding: 16px vertical, 24px horizontal
- Logo: 32px height
- Menu items: 16px gap

### 2. Hero Section

**Visual:**
```
╔════════════════════════════════════════╗
║   Lịch Sử Việt Nam                     ║
║   Hành Trình Hòa Bình Qua Thời Gian    ║
║                                        ║
║   📊 16 Sự Kiện    📚 11 Triều Đại     ║
║   ⏰ 4,869 Năm     📍 Toàn Lịch Sử     ║
║                                        ║
║   [Khám Phá]  [Tìm Hiểu Thêm]         ║
╚════════════════════════════════════════╝
```

**Styling:**
- Background: Linear gradient (Blue to Purple)
- Text: White, centered
- Statistics: Large numbers with icons
- Buttons: Two CTA buttons (Primary + Secondary)

**Responsive:**
- Desktop: Full-width hero with large text
- Mobile: Stacked text, smaller statistics

### 3. About Section

**Structure:**
- Title: "Về Dự Án Này"
- Content: Paragraph text
- Highlight boxes: Key features

**Visual Hierarchy:**
- Title: Bold, large (28px)
- Content: Regular, medium (16px)
- Highlights: Cards with icon + text

### 4. Timeline Section

#### Filter Bar
```
┌─────────────────────────────────────┐
│ Lọc Theo Thời Kỳ:                  │
│ [Tất Cả] [Cổ Đại] [Phong Kiến] ...│
│                                     │
│ Lọc Theo Triều Đại:                │
│ [Tất Cả] [Hồng Bàng] [Ngô] ...     │
└─────────────────────────────────────┘
```

**Filter Buttons:**
- Inactive: Light gray background, dark text
- Active: Period color background, white text
- Hover: Darker shade, scale 1.05
- Transition: Smooth 0.3s

#### Timeline Events
```
┌─────────────────────────┐
│  📅 1010                │
│  🏰 Triều Đại Lý      │
│                         │
│  Thành Lập Đô Thành     │
│                         │
│ Lý Thái Tổ dời đô từ    │
│ Hoa Lư...               │
│                         │
│  [Xem Chi Tiết]         │
└─────────────────────────┘
```

**Card Styling:**
- Border-left: 4px solid period-color
- Background: White
- Border-radius: 8px
- Shadow: md
- Hover: shadow-lg, translateY(-4px)
- Padding: 16px 20px

**Timeline Visual:**
- Vertical line connecting events
- Dots at each event
- Active dot: Larger, colored
- Inactive dot: Small, gray

### 5. Search Section

```
┌──────────────────────────────────────────┐
│ 🔍 Tìm Kiếm Sự Kiện Lịch Sử             │
│ ┌────────────────────────────────────────┤
│ │ Nhập từ khóa (tên sự kiện, năm, v.v) │
│ └────────────────────────────────────────┤
│                                          │
│ Kết Quả:                                 │
│ ┌────────────────────────────────────────┐
│ │ Thống Nhất Đất Nước (1990)             │
│ │ Triều Đại Nguyễn                       │
│ └────────────────────────────────────────┘
└──────────────────────────────────────────┘
```

**Search Input:**
- Padding: 12px 16px
- Border: 1px solid #d1d5db
- Border-radius: 8px
- Focus: Border blue, shadow outline
- Placeholder: Light gray, italic

**Results:**
- Result cards similar to timeline
- Highlight matching terms
- No results state: Icon + message

### 6. EventDetailModal

```
╔════════════════════════════════════════╗
║ Năm 1010 - Thành Lập Đô Thành       ✕  ║
║ Triều Đại Lý                          ║
║                                        ║
║ Mô Tả Chi Tiết:                       ║
║ Lý Thái Tổ, vị vua đầu tiên của      ║
║ triều Lý, đã dời đô từ Hoa Lư        ║
║ (Ninh Bình ngày nay) đến Thăng Long  ║
║ (Hà Nội), gây dựng một trung tâm     ║
║ kinh tế và chính trị mới cho nước.    ║
║                                        ║
║ Thời Gian: 1010                        ║
║ Giai Đoạn: Phong Kiến                 ║
║                                        ║
║             [Đóng]                     ║
╚════════════════════════════════════════╝
```

**Modal Styling:**
- Overlay: Black, 50% opacity
- Modal: White, rounded corners 12px
- Shadow: xl (prominent)
- Max-width: 600px
- Padding: 32px
- Animation: Fade in + slide up 0.3s

**Close Button:**
- Position: Top-right
- Size: 32px × 32px
- Icon: "✕" or "×"
- Hover: Red tint

### 7. Footer

```
┌─────────────────────────────────────┐
│                                     │
│  © 2024 Lịch Sử Việt Nam Timeline   │
│  Tất Cả Quyền Lợi Được Bảo Vệ       │
│                                     │
│  Privacy | Terms | Contact          │
│                                     │
└─────────────────────────────────────┘
```

---

## 🎬 Animations & Transitions

### Global Transitions
```css
/* Smooth transitions for all interactive elements */
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

/* Specific:
   - color: 0.2s
   - transform: 0.2s
   - opacity: 0.3s
   - shadow: 0.2s */
```

### Component Animations

1. **Button Hover:**
   - Scale: 1.05
   - Shadow: Increase depth
   - Duration: 0.2s

2. **Card Hover:**
   - Transform: translateY(-4px)
   - Shadow: md → lg
   - Duration: 0.3s

3. **Modal Open:**
   - Overlay: fade-in (0.3s)
   - Modal: slide-up + fade-in (0.3s)

4. **Modal Close:**
   - Reverse animation
   - Duration: 0.2s

5. **Filter Button Click:**
   - Scale: 0.95 → 1.0
   - Duration: 0.1s

6. **Page Scroll:**
   - Smooth scroll behavior
   - No jarring jumps

---

## 📱 Responsive Design Details

### Mobile (< 768px)

**Changes:**
- Container: Full width - 16px margin (32px total)
- Header: Burger menu instead of full nav
- Hero: Smaller text, stacked elements
- Grid: Single column
- Timeline cards: Full width
- Font sizes: Reduced 2-4px
- Padding/Margin: Reduced 25-50%

**Touch Optimization:**
- Buttons: Minimum 44px × 44px
- Links: Minimum 44px height
- Spacing: More space for touch targets
- No hover states (use active states instead)

### Tablet (768px - 1199px)

**Changes:**
- Container: 100% - 32px margin (64px total)
- Header: Full nav menu visible
- Grid: 2 columns
- Timeline cards: Side by side
- Font sizes: Slightly reduced

### Desktop (1200px+)

**Full Design:**
- Container: 1200px fixed
- All features fully visible
- Hover states active
- 3-column grid for some sections

---

## 🌈 Dark Mode Considerations (Future)

**CSS Variables prepared for easy theming:**
```css
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --border-color: #e5e7eb;
  --primary-color: #2563eb;
  --accent-color: #f59e0b;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #111827;
    --bg-secondary: #1f2937;
    --text-primary: #f9fafb;
    --text-secondary: #d1d5db;
    --border-color: #374151;
  }
}
```

---

## ✨ User Experience Journey

### First-Time User Journey

1. **Land on Page**
   - Hero section with clear value proposition
   - Statistics showing scope
   - CTA buttons clearly visible

2. **Browse Timeline**
   - See events displayed in chronological order
   - Period colors help distinguish different eras
   - Click card to see more details

3. **Explore Filters**
   - Try filtering by period
   - Try filtering by dynasty
   - See results update in real-time

4. **Use Search**
   - Try searching for a specific year
   - Try searching for a keyword
   - Find relevant events quickly

5. **Read Details**
   - Click an event to open modal
   - Read full description
   - Understand historical context

### Returning User Journey

1. **Quick Access**
   - Header navigation for quick jumps
   - Search for specific events
   - Filter to specific periods

2. **Deep Dive**
   - Read multiple events
   - Compare different eras
   - Build historical understanding

---

## 📊 UX Metrics & Goals

| Metric | Target | How Measured |
|--------|--------|-------------|
| **Task Success Rate** | > 95% | User can find event in < 10s |
| **Time on Page** | 3-10 min | User engagement |
| **Bounce Rate** | < 20% | User interest |
| **Accessibility Score** | 95+ | Lighthouse audit |
| **Mobile Responsiveness** | 100% | Works on all devices |

---

## 🎓 Conclusion

The design of this project emphasizes **clarity, accessibility, and beauty** to create an engaging experience that helps users learn and appreciate Vietnamese history. Every design decision serves the core purpose: **making history education interactive and enjoyable**.
