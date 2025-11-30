# Kế hoạch tối ưu tìm kiếm Wikipedia cho nội dung lịch sử Việt Nam

## Phân tích vấn đề

Hiện tại chức năng tìm kiếm Wikipedia gặp các vấn đề sau:
1. **Không tìm thấy bài viết** cho các truy vấn lịch sử quan trọng:
   - "Ngô Quyền chiến thắng Bạch Đằng"
   - "Đinh Bộ Lĩnh thống nhất đất nước"
   - "Lý Thái Tổ dời đô ra Thăng Long"

2. **Nguyên nhân chính**:
   - API tìm kiếm Wikipedia nhạy cảm với dấu tiếng Việt
   - Chiến lược tìm kiếm đơn giản, chỉ dùng truy vấn gốc
   - Không có fallback khi tìm kiếm thất bại

## Chiến lược tối ưu hóa

### 1. Text Normalization (Bắt buộc)
- **Loại bỏ dấu tiếng Việt**: "Ngô Quyền" → "Ngo Quyen"
- **Chuẩn hóa Unicode**: NFD → NFC
- **Xử lý ký tự đặc biệt**: đ → d, Đ → D

### 2. Multi-Strategy Search
Thực hiện song song 4 chiến lược:
- **Strategy 1**: Truy vấn gốc (với dấu)
- **Strategy 2**: Truy vấn đã chuẩn hóa (không dấu)
- **Strategy 3**: Tìm kiếm từ khóa chính
- **Strategy 4**: Tìm kiếm theo danh mục

### 3. Keyword Extraction
Trích xuất từ khóa quan trọng:
- "Ngô Quyền chiến thắng Bạch Đằng" → ["Ngô Quyền", "Bạch Đằng"]
- "Đinh Bộ Lĩnh thống nhất đất nước" → ["Đinh Bộ Lĩnh", "Đại Cồ Việt"]

### 4. Fallback Mechanism
Khi tất cả chiến lược thất bại:
- Tìm kiếm theo danh mục ("Thế kỷ 10", "Lịch sử Việt Nam")
- Tìm kiếm theo thuật ngữ chung ("Vua", "Triều đại")
- Sử dụng Google Site Search như fallback cuối cùng

### 5. Enhanced Caching
- Cache kết quả cho từng chiến lược
- Cache cả kết quả thất bại để tránh truy vấn lặp
- TTL theo mức độ liên quan (thành công lâu hơn, thất bại ngắn hơn)

## Implementation Plan

### Phase 1: Text Normalization (Ngày 1)
```javascript
// Vietnamese text normalization utility
function normalizeVietnameseText(text) {
    return text.normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D');
}

// Extract key historical terms
function extractHistoricalKeywords(query) {
    // List of Vietnamese historical figures, places, events
    const historicalTerms = [
        'Ngô Quyền', 'Bạch Đằng', 'Đinh Bộ Lĩnh', 'Đại Cồ Việt',
        'Lý Thái Tổ', 'Thăng Long', 'Hà Nội', 'Hồng Bàng',
        'An Dương Vương', 'Cổ Loa', 'Hai Bà Trưng'
    ];

    return historicalTerms.filter(term =>
        query.toLowerCase().includes(term.toLowerCase())
    );
}
```

### Phase 2: Enhanced Search Service (Ngày 2)
```javascript
class EnhancedWikipediaService extends WikipediaService {
    async searchWithStrategies(query, limit = 10, language = 'vi') {
        const strategies = this.generateSearchStrategies(query);
        const results = [];

        for (const strategy of strategies) {
            try {
                const strategyResult = await this.search(
                    strategy.query,
                    limit,
                    language
                );

                if (strategyResult.pages && strategyResult.pages.length > 0) {
                    results.push({
                        strategy: strategy.name,
                        query: strategy.query,
                        pages: strategyResult.pages
                    });

                    // Return early on first success
                    if (strategy.priority === 'high') {
                        break;
                    }
                }
            } catch (error) {
                console.log(`Strategy ${strategy.name} failed:`, error.message);
            }
        }

        return this.consolidateResults(results, query);
    }

    generateSearchStrategies(query) {
        const strategies = [];

        // Strategy 1: Original query (highest priority)
        strategies.push({
            name: 'original',
            query: query,
            priority: 'high'
        });

        // Strategy 2: Normalized query
        strategies.push({
            name: 'normalized',
            query: normalizeVietnameseText(query),
            priority: 'high'
        });

        // Strategy 3: Key terms
        const keywords = extractHistoricalKeywords(query);
        if (keywords.length > 0) {
            strategies.push({
                name: 'keywords',
                query: keywords.join(' '),
                priority: 'medium'
            });
        }

        // Strategy 4: Individual terms
        keywords.forEach(keyword => {
            strategies.push({
                name: 'individual',
                query: keyword,
                priority: 'low'
            });
        });

        return strategies;
    }
}
```

### Phase 3: Testing & Validation (Ngày 3)
- Test với các truy vấn thất bại hiện tại
- Đo lường tỷ lệ thành công trước và sau
- Performance testing với cache

### Phase 4: Integration & Deployment (Ngày 4)
- Cập nhật routes để sử dụng enhanced service
- Migration data cache hiện có
- Monitoring và logging

## Expected Results

### Success Rate Improvement
- **Current**: ~30% cho truy vấn lịch sử Việt Nam
- **Target**: ~85% cho truy vấn lịch sử Việt Nam

### Specific Query Success
- "Ngô Quyền chiến thắng Bạch Đằng" → Should find "Ngô Quyền" article
- "Đinh Bộ Lĩnh thống nhất đất nước" → Should find "Đinh Bộ Lĩnh" article
- "Lý Thái Tổ dời đô ra Thăng Long" → Should find "Lý Thái Tổ" article

### Performance Impact
- **Latency**: +200ms cho multi-strategy search
- **Cache Hit Rate**: Tăng từ 60% → 85%
- **API Calls**: Giảm 40% nhờ cache thông minh

## Risk Mitigation

### API Rate Limits
- Implement exponential backoff
- Cache failed requests to avoid repeated failures
- Monitor usage quotas

### Cache Bloat
- Implement LRU eviction with smart sizing
- Separate caches for successful vs failed searches
- TTL management per query type

### Search Quality
- Manual testing for historical accuracy
- User feedback mechanism for continuous improvement
- Fallback to English Wikipedia if needed

## Success Metrics

1. **Search Success Rate**: >85% for Vietnamese historical queries
2. **Response Time**: <2s for enhanced search
3. **Cache Efficiency**: >80% hit rate
4. **User Satisfaction**: Reduce "không tìm thấy" complaints by 90%

## Timeline

- **Day 1**: Text normalization utilities
- **Day 2**: Enhanced search service implementation
- **Day 3**: Testing and validation
- **Day 4**: Integration and deployment

## Testing Scenarios

```javascript
const testCases = [
    {
        query: "Ngô Quyền chiến thắng Bạch Đằng",
        expectedResults: ["Ngô Quyền", "Trận Bạch Đằng (938)"],
        shouldFind: true
    },
    {
        query: "Đinh Bộ Lĩnh thống nhất đất nước",
        expectedResults: ["Đinh Bộ Lĩnh", "Đại Cồ Việt"],
        shouldFind: true
    },
    {
        query: "Lý Thái Tổ dời đô ra Thăng Long",
        expectedResults: ["Lý Thái Tổ", "Thăng Long"],
        shouldFind: true
    }
];
```

## Questions cần làm rõ

1. Có nên sử dụng Google Site Search như fallback cuối cùng không?
2. Timeout cho multi-strategy search nên là bao nhiêu?
3. Có cần implement fallback sang English Wikipedia không?
4. Cache policy cho failed searches nên như thế nào?