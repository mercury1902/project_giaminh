# UI/UX Cải thiện cho AI Lịch sử Việt Nam
**Ngày**: 2025-11-30
**Phiên bản**: 1.0

## Vấn đề hiện tại

### 1. Poor Message Formatting
- Responses display as plain text blocks
- No markdown rendering for structured information
- Vietnamese text formatting issues
- No visual hierarchy for different content types

### 2. Limited Source Indicators
- Wikipedia indicators confusing (🎯, 🔤, 🔓)
- Technical strategy names ("Chính xác", "Từ khóa")
- No clear distinction between cached vs fresh data

### 3. Inadequate Error States
- Generic error messages
- Limited retry functionality
- No progressive disclosure for technical issues

### 4. Poor Loading Feedback
- Loading states not informative
- No progress indication for multi-step operations
- Unclear wait times

## Kế hoạch cải thiện

### Phase 1: Message Formatting & Rendering

#### 1.1 Markdown Support
**Component**: `src/components/gemini-chat-panel.jsx`
**Target**: Lines 294-310

**Implementation**:
```jsx
// Import markdown processor
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Enhanced message content rendering
const MessageContent = ({ content, metadata }) => {
  const processedContent = content
    // Format Vietnamese dates and periods
    .replace(/(\d{4})\s*năm/g, '$1')
    .replace(/thời kỳ\s*(\w+)/gi, (match, period) => `**Thời kỳ ${period}**`)
    // Format dynasties
    .replace(/nhà\s*(\w+)/gi, (match, dynasty) => `**Nhà ${dynasty}**`)
    // Format key terms
    .replace(/sự kiện|trận đánh|cuộc kháng chiến/gi, '**$&**')
    // Format lists
    .replace(/^•\s+(.+)$/gm, '- $1')
    .replace(/^\d+\.\s+(.+)$/gm, '$1.');

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({children}) => <p className="message-paragraph">{children}</p>,
        ul: ({children}) => <ul className="message-list">{children}</ul>,
        li: ({children}) => <li className="message-list-item">{children}</li>,
        strong: ({children}) => <strong className="message-bold">{children}</strong>,
      }}
    >
      {processedContent}
    </ReactMarkdown>
  );
};
```

#### 1.2 Vietnamese-Specific Formatting
**Enhancements**:
- Dynasty highlighting: **Nhà Lý**, **Nhà Trần**
- Period emphasis: **Thời kỳ Phong kiến**
- Event emphasis: **Chiến thắng Bạch Đằng**
- Era formatting: (năm 938), (thế kỷ 15)

#### 1.3 Content Type Detection & Styling
```css
/* Message content styles */
.message-paragraph {
  margin-bottom: 1rem;
  line-height: 1.6;
}

.message-list {
  margin: 0.75rem 0;
  padding-left: 1.5rem;
}

.message-list-item {
  margin-bottom: 0.5rem;
  position: relative;
}

.message-list-item::before {
  content: '▪';
  color: var(--color-accent);
  position: absolute;
  left: -1rem;
  font-size: 0.8rem;
}

.message-bold {
  color: var(--color-primary);
  font-weight: 600;
}
```

### Phase 2: Enhanced Source Indicators

#### 2.1 Redesigned Source Display
**Component**: `src/components/gemini-chat-panel.jsx:66-88`

**Implementation**:
```jsx
const SourceIndicator = ({ metadata, streaming }) => {
  if (!metadata || streaming) return null;

  const getSourceInfo = () => {
    if (metadata.ragSuccess) {
      return {
        icon: '📚',
        label: 'Wikipedia',
        detail: `${metadata.articles} bài viết`,
        color: '#28a745',
        bgColor: '#d4edda'
      };
    } else {
      return {
        icon: '🧠',
        label: 'Kiến thức',
        detail: 'Chuyên gia lịch sử',
        color: '#17a2b8',
        bgColor: '#d1ecf1'
      };
    }
  };

  const source = getSourceInfo();

  return (
    <div
      className="source-indicator"
      style={{
        '--source-color': source.color,
        '--source-bg': source.bgColor
      }}
    >
      <span className="source-icon">{source.icon}</span>
      <div className="source-details">
        <span className="source-label">{source.label}</span>
        <span className="source-detail">{source.detail}</span>
      </div>
      {metadata.timestamp && (
        <span className="source-time">
          {new Date(metadata.timestamp).toLocaleTimeString('vi-VN')}
        </span>
      )}
    </div>
  );
};
```

#### 2.2 Interactive Source Details
**Features**:
- Click to expand Wikipedia articles
- Show search strategy used
- Display cache status
- Refresh option for stale data

### Phase 3: Improved Error Handling

#### 3.1 Better Error Messages
**Component**: `src/components/gemini-chat-panel.jsx:328-347`

**Implementation**:
```jsx
const ErrorMessage = ({ error, onRetry, retryCount }) => {
  const getErrorConfig = (errorCode) => {
    const configs = {
      'TIMEOUT': {
        icon: '⏰',
        title: 'Quá thời gian',
        message: 'Yêu cầu mất quá nhiều thời gian. Thử lại nhé!',
        action: 'Thử lại'
      },
      'RATE_LIMIT': {
        icon: '🚦',
        title: 'Quá nhiều yêu cầu',
        message: 'Đợi chút rồi thử lại nhé.',
        action: `Thử lại ${retryCount > 0 ? `(${retryCount})` : ''}`
      },
      'NETWORK_ERROR': {
        icon: '🌐',
        title: 'Lỗi kết nối',
        message: 'Kiểm tra kết nối mạng và thử lại.',
        action: 'Thử lại'
      },
      'CONFIG_ERROR': {
        icon: '⚙️',
        title: 'Lỗi hệ thống',
        message: 'Hệ thống đang bảo trì. Thử lại sau nhé.',
        action: null
      }
    };

    return configs[errorCode] || configs['NETWORK_ERROR'];
  };

  const config = getErrorConfig(error.code);

  return (
    <div className="error-message enhanced">
      <div className="error-header">
        <span className="error-icon">{config.icon}</span>
        <div className="error-title">{config.title}</div>
      </div>

      <div className="error-content">
        <p className="error-description">{config.message}</p>

        {error.details && (
          <details className="error-details">
            <summary>Chi tiết kỹ thuật</summary>
            <pre>{error.details}</pre>
          </details>
        )}
      </div>

      {config.action && (
        <div className="error-actions">
          <button
            onClick={onRetry}
            className="retry-button"
            disabled={!error.retryable}
          >
            🔄 {config.action}
          </button>
        </div>
      )}
    </div>
  );
};
```

### Phase 4: Enhanced Loading States

#### 4.1 Multi-Phase Loading Indicators
**Component**: `src/components/gemini-chat-panel.jsx:314-325`

**Implementation**:
```jsx
const LoadingIndicator = ({ phase, progress }) => {
  const phases = {
    'rag_search': {
      icon: '🔍',
      title: 'Tìm kiếm Wikipedia',
      description: 'Đang tìm thông tin liên quan...',
      duration: '~2 giây'
    },
    'gemini': {
      icon: '🤔',
      title: 'Đang suy nghĩ',
      description: 'Đang phân tích và tổng hợp câu trả lời...',
      duration: '~3 giây'
    },
    'streaming': {
      icon: '✍️',
      title: 'Viết câu trả lời',
      description: 'Đang soạn thảo phản hồi chi tiết...',
      duration: '~1 giây'
    }
  };

  const currentPhase = phases[phase] || phases['rag_search'];

  return (
    <div className="loading-indicator enhanced">
      <div className="loading-header">
        <span className="loading-icon">{currentPhase.icon}</span>
        <div className="loading-title">{currentPhase.title}</div>
        <span className="loading-duration">{currentPhase.duration}</span>
      </div>

      <p className="loading-description">{currentPhase.description}</p>

      {phase === 'rag_search' && (
        <div className="loading-progress">
          <div
            className="progress-bar"
            style={{ width: `${progress || 50}%` }}
          >
            <div className="progress-glow"></div>
          </div>
        </div>
      )}

      <div className="loading-tips">
        <small>Mẹo: Wikipedia có thể mất thời gian tìm kiếm thông tin lịch sử.</small>
      </div>
    </div>
  );
};
```

### Phase 5: Enhanced Input Experience

#### 5.1 Smart Input Suggestions
**Features**:
- Historical event autocomplete
- Vietnamese history keyword suggestions
- Query history for the session
- Quick action buttons for common questions

#### 5.2 Input Validation & Feedback
```jsx
const SmartInput = ({ onSend, loading, suggestions }) => {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const vietnameseHistoryKeywords = [
    'lịch sử Việt Nam',
    'nhà Lý', 'nhà Trần', 'nhà Lê', 'nhà Nguyễn',
    'Bạch Đằng', 'Điện Biên Phủ', 'chống Pháp', 'chống Mỹ',
    'thời kỳ phong kiến', 'thời kỳ cổ đại', 'cách mạng tháng Tám'
  ];

  // Implementation for smart suggestions...
};
```

### Phase 6: Accessibility & Mobile Improvements

#### 6.1 Enhanced Keyboard Navigation
- Tab order through messages
- Keyboard shortcuts for retry/refresh
- Screen reader improvements
- Focus management

#### 6.2 Mobile Optimizations
- Touch-friendly buttons
- Swipe gestures for quick actions
- Optimized spacing for thumbs
- Better viewport handling

## Technical Implementation

### Component Structure
```
src/components/
├── gemini-chat-panel.jsx (main)
├── chat/MessageContent.jsx
├── chat/SourceIndicator.jsx
├── chat/ErrorMessage.jsx
├── chat/LoadingIndicator.jsx
├── chat/SmartInput.jsx
└── chat/ChatStyles.css
```

### CSS Variables for Theming
```css
:root {
  --source-primary: #28a745;
  --source-secondary: #17a2b8;
  --error-primary: #dc3545;
  --warning-primary: #ffc107;
  --loading-primary: #007bff;
  --loading-secondary: #6c757d;
}
```

## Success Metrics

1. **User Experience**
   - Reduced bounce rate on chat interactions
   - Increased session duration
   - Better user satisfaction scores

2. **Functional Performance**
   - Faster message rendering
   - Reduced JavaScript execution time
   - Improved accessibility scores

3. **Technical Quality**
   - Reduced bundle size impact
   - Better maintainability
   - Comprehensive error handling

## Testing Strategy

### Component Tests
- Message rendering with markdown
- Source indicator display
- Error state handling
- Loading state transitions

### Integration Tests
- End-to-end chat flows
- Wikipedia integration
- Error recovery scenarios
- Mobile responsiveness

### Accessibility Tests
- Screen reader compatibility
- Keyboard navigation
- Color contrast compliance
- Touch target sizes

## Implementation Timeline

### Week 1: Core Improvements
- [ ] Message formatting & markdown
- [ ] Enhanced source indicators
- [ ] Better error messages

### Week 2: Advanced Features
- [ ] Loading improvements
- [ ] Smart input suggestions
- [ ] Mobile optimizations

### Week 3: Polish & Testing
- [ ] Accessibility improvements
- [ ] Performance optimization
- [ ] Comprehensive testing

## Risks & Mitigations

### Performance Risks
- **Markdown parsing overhead** → Use lightweight parser
- **Large message rendering** → Virtualization for long chats
- **Animation performance** → Use CSS transforms

### Compatibility Risks
- **Browser markdown support** → Graceful degradation
- **Mobile viewport issues** → Responsive testing
- **Screen reader gaps** → Accessibility testing