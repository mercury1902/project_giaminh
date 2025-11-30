# Kế hoạch Sửa chữa AI Lịch sử Việt Nam
**Ngày**: 2025-11-30
**Phiên bản**: 1.0
**Trạng thái**: Đã phân tích, chờ triển khai

## Tổng quan vấn đề

Dựa trên phân tích bug.md và codebase, AI chatbot lịch sử Việt Nam gặp **4 vấn đề gốc**:

1. **Lỗi lọc dữ liệu tĩnh** - Exact string matching thất bại với các câu hỏi chung
2. **Wikipedia API bị hỏng** - Sử dụng deprecated REST endpoint (HTTP 404)
3. **Ngữ cảnh tiêu cực** - AI nhận "Không tìm thấy" và trả lời dựa trên đó
4. **Thiếu logic xử lý câu hỏi chung** - Không hiểu intent "cho tôi xem lịch sử Việt Nam"

## Kế hoạch triển khai

### Phase 1: Sửa lỗi nghiêm trọng (Priority: Critical)

#### 1.1 Khắc phục lỗi lọc dữ liệu tĩnh
**File**: `backend/services/rag-service.js:164-170`
**Vấn đề**: Exact string matching với 18 events bị fail với query chung

**Giải pháp**:
```javascript
// Thay thế exact string matching bằng semantic matching
const relevantEvents = EVENTS.filter(event => {
  const searchText = `${event.title} ${event.description} ${event.dynasty} ${event.period}`.toLowerCase();

  // Intent detection cho lịch sử Việt Nam
  const vietnameseHistoryIntent = lowerQuery.includes('lịch sử') &&
    (lowerQuery.includes('việt nam') || lowerQuery.includes('việt'));

  // Keyword matching mở rộng
  const hasKeywords = extractVietnameseHistoryKeywords(lowerQuery).some(keyword =>
    searchText.includes(keyword)
  );

  return vietnameseHistoryIntent || hasKeywords ||
         lowerQuery.split(' ').some(word => searchText.includes(word));
});
```

#### 1.2 Sửa Wikipedia API endpoint
**File**: `backend/services/wikipedia-service.js:128`
**Vấn đề**: Sử dụng deprecated endpoint trả về 404

**Giải pháp**:
```javascript
// Thay thế endpoint
const url = `https://vi.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=${limit}&format=json&origin=*`;
```

### Phase 2: Cải thiện System Prompt & Context (Priority: High)

#### 2.1 System prompt thông minh hơn
**File**: `backend/routes/gemini-routes.js:31-38`
**Vấn đề**: Prompt hiện tại không xử lý được khi ngữ cảnh tiêu cực

**Giải pháp**:
```javascript
function buildSystemPrompt(ragContent, ragMeta, query) {
  const hasVietnameseHistoryIntent = query.toLowerCase().includes('lịch sử') &&
    (query.toLowerCase().includes('việt nam') || query.toLowerCase().includes('việt'));

  const basePrompt = `Bạn là chuyên gia lịch sử Việt Nam thân thiện, luôn cố gắng giúp đỡ.

**Nguyên tắc quan trọng**:
- NGỪI BÀO "Tôi không tìm thấy thông tin" về lịch sử Việt Nam
- Nếu không có Wikipedia, sử dụng kiến thức chung về lịch sử Việt Nam
- Với câu hỏi chung, giới thiệu các thời kỳ chính
- Luôn trả lời bằng tiếng Việt tự nhiên, thân thiện

**Nguồn dữ liệu**: ${ragMeta?.success ? `Wikipedia (${ragMeta.articles} bài viết)` : 'Kiến thức chung'}

**Dữ liệu cụ thể**:
${ragContent}`;

  return basePrompt;
}
```

#### 2.2 Cải thiện ngữ cảnh fallback
**File**: `backend/services/rag-service.js:212-213`
**Vấn đề**: Context tiêu cực "Không tìm thấy" poisoning AI response

**Giải pháp**:
```javascript
// Thay thế thông báo tiêu cực bằng thông tin hữu ích
const staticContext = relevantEvents.length > 0
  ? relevantEvents.join('\n')
  : EVENTS.slice(0, 5).map(event =>
      `• ${event.year}: ${event.title} - ${event.description}`
    ).join('\n');

const wikiContext = wikiContext || 'Để có thông tin chi tiết hơn, bạn có thể hỏi về các sự kiện cụ thể.';

const context = `Thông tin về lịch sử Việt Nam:\n${staticContext}\n\n${wikiContext}`;
```

### Phase 3: Cải thiện UX/UI (Priority: Medium)

#### 3.1 Formatting phản hồi tốt hơn
**File**: `src/components/gemini-chat-panel.jsx:294-310`

**Thêm**:
- Markdown rendering cho bullet points, bold text
- Source indicators với icons dễ hiểu
- Better error messages với retry options

#### 3.2 Context indicators cho user
**Hiển thị**:
- ✅ "Dựa trên Wikipedia" khi có data
- 📚 "Dựa trên kiến thức chung" khi fallback
- 🔍 "Đang tìm kiếm thêm thông tin"

### Phase 4: Testing & Validation (Priority: Medium)

#### 4.1 Test cases quan trọng
```javascript
const testCases = [
  // Câu hỏi chung
  'cho tôi biết lịch sử hay ở việt nam',
  'bạn biết gì về lịch sử việt nam?',
  'tóm tắt lịch sử việt nam',

  // Câu hỏi cụ thể
  'khi nào nhà Trần sụp đổ?',
  'trận chiến Bạch Đằng',
  'Lý Thái Tổ dời đô',

  // Edge cases
  'lịch sử',  // chỉ 1 từ
  'việt nam', // chỉ 2 từ
];
```

#### 4.2 Validation metrics
- Success rate: >90% for Vietnamese history queries
- Response quality: Natural, helpful responses
- Wikipedia integration: Working for specific events
- Fallback handling: Graceful degradation

## Rủi ro và giảm thiểu

### Rủi ro cao
1. **Wikipedia rate limiting** → Implement exponential backoff
2. **Over-filtering** → Conservative approach với semantic matching

### Rủi ro trung bình
1. **Response time** → Cache optimization, timeout handling
2. **Context window limits** → Truncate Wikipedia summaries

## Kế hoạch triển khai

### Sprint 1 (2 ngày)
- [ ] Fix Wikipedia API endpoint
- [ ] Implement enhanced filtering logic
- [ ] Update system prompt

### Sprint 2 (1 ngày)
- [ ] Improve context formatting
- [ ] Add fallback strategy

### Sprint 3 (1 ngày)
- [ ] UI/UX improvements
- [ ] Testing & validation

## Success criteria

1. **Functional**: AI trả lời đúng cho >90% câu hỏi lịch sử Việt Nam
2. **User experience**: Phản hồi tự nhiên, không có "không tìm thấy" thông báo
3. **Technical**: Wikipedia integration hoạt động, cache hiệu quả
4. **Maintainability**: Code clean, documentation updated

## Unresolved questions

1. Should we implement local Vietnamese history knowledge base for faster responses?
2. Do we need multilingual support for historical terms?
3. Should we add image/media support for historical events?