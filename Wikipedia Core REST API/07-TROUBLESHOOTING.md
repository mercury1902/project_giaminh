# 07-TROUBLESHOOTING.md - Xử Lý Lỗi & FAQ

## 🐛 Common Errors & Solutions

### Error 1: 404 Not Found

**Lỗi:**
```
GET https://api.wikimedia.org/core/v1/wikipedia/vi/page/Title → 404
```

**Nguyên Nhân:**
- Bài viết không tồn tại trên Wikipedia
- Tên bài viết sai chính tả
- URL encoding không đúng

**Giải Pháp:**

```typescript
// 1. Kiểm tra tên bài viết
// ✅ ĐÚNG: "Triều_Trần" hoặc "Triều Trần"
// ❌ SAI: "trieu tran", "triều trần" (case sensitive)

// 2. Sử dụng search trước để tìm tên chính xác
const results = await searchTitles('Triều', 5);
console.log(results[0].title); // Chính xác

// 3. URL encode đúng cách
const title = "Lịch sử Việt Nam";
const encoded = encodeURIComponent(title);
// Result: "L%E1%BB%8Bch%20s%E1%BB%A3%20Vi%E1%BB%87t%20Nam"

fetch(`https://api.wikimedia.org/core/v1/wikipedia/vi/page/${encoded}`)
```

---

### Error 2: 400 Bad Request

**Lỗi:**
```
{"detail": "Invalid title", "type": "bad_request"}
```

**Nguyên Nhân:**
- Thiếu query parameter
- Parameter format sai
- Special characters không được hỗ trợ

**Giải Pháp:**

```typescript
// ✅ ĐÚNG
fetch('https://api.wikimedia.org/core/v1/wikipedia/vi/search/page?q=Triều&limit=5')

// ❌ SAI - Thiếu query parameter
fetch('https://api.wikimedia.org/core/v1/wikipedia/vi/search/page')

// ❌ SAI - Limit quá lớn
fetch('https://api.wikimedia.org/core/v1/wikipedia/vi/search/page?q=test&limit=1000')
```

---

### Error 3: 429 Too Many Requests

**Lỗi:**
```
HTTP 429: Too Many Requests
```

**Nguyên Nhân:**
- Gọi API quá nhanh
- Không cache results
- Rate limit exceeded

**Giải Pháp:**

```typescript
// 1. Implement caching
const cache = new Map();

export async function getCachedArticle(title: string) {
  if (cache.has(title)) {
    return cache.get(title);
  }
  
  const data = await getArticle(title);
  cache.set(title, data);
  return data;
}

// 2. Add delay between requests
async function delayedFetch(url: string, delay: number = 1000) {
  await new Promise(resolve => setTimeout(resolve, delay));
  return fetch(url);
}

// 3. Use SWR for deduplication
const { data } = useSWR(url, fetcher, {
  dedupingInterval: 60000 // Cache for 1 minute
});
```

---

### Error 4: Network Timeout

**Lỗi:**
```
Error: Network timeout (after 30000ms)
```

**Nguyên Nhân:**
- Wikipedia API chậm
- Kết nối mạng yếu
- Firewall chặn request

**Giải Pháp:**

```typescript
// 1. Add timeout to axios
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.wikimedia.org/core/v1/wikipedia/vi',
  timeout: 10000, // 10 seconds
});

// 2. Retry logic
async function fetchWithRetry(
  url: string,
  maxRetries: number = 3
): Promise<Response> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fetch(url, { signal: AbortSignal.timeout(5000) });
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
    }
  }
  throw new Error('Max retries exceeded');
}

// 3. Use AbortController
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 5000);

try {
  const response = await fetch(url, { signal: controller.signal });
  clearTimeout(timeoutId);
  return response;
} catch (error) {
  if (error instanceof DOMException && error.name === 'AbortError') {
    console.error('Request timeout');
  }
}
```

---

### Error 5: CORS Error

**Lỗi:**
```
Access to XMLHttpRequest at 'https://api.wikimedia.org/...' 
from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Nguyên Nhân:**
- Calling API trực tiếp từ browser
- Missing User-Agent header
- CORS policy không cho phép

**Giải Pháp:**

```typescript
// ✅ ĐÚNG - Gọi qua API Route (backend)
fetch('/api/history/search?q=Triều')

// ❌ SAI - Gọi trực tiếp từ browser
fetch('https://api.wikimedia.org/core/v1/wikipedia/vi/search/page?q=Triều')

// Trong API Route (app/api/history/search/route.ts)
export async function GET(request: NextRequest) {
  const response = await fetch(
    'https://api.wikimedia.org/core/v1/wikipedia/vi/search/page?q=Triều',
    {
      headers: {
        'Api-User-Agent': 'HistoryApp (contact@example.com)'
      }
    }
  );
  return NextResponse.json(await response.json());
}
```

---

### Error 6: TypeScript Errors

**Lỗi:**
```
Property 'thumbnail' does not exist on type 'SearchResult'
```

**Giải Pháp:**

```typescript
// Ensure interfaces match response
export interface SearchResult {
  id: number;
  title: string;
  excerpt: string;
  thumbnail?: {  // Optional field
    url: string;
    width: number;
    height: number;
  };
}

// Safe access
if (result.thumbnail?.url) {
  console.log(result.thumbnail.url);
}
```

---

## 🔍 Debugging Tips

### 1. Check Request Headers

```bash
# Using curl
curl -v \
  -H "Api-User-Agent: HistoryApp (contact@example.com)" \
  "https://api.wikimedia.org/core/v1/wikipedia/vi/page/Triều_Trần"

# Expected response headers
# < HTTP/2 200
# < content-type: application/json
# < cache-control: public, max-age=...
```

### 2. Browser DevTools

```javascript
// Open DevTools (F12)
// Go to Network tab
// Make request
// Check:
// - Status code
// - Response body
// - Headers
// - Timing
```

### 3. Add Logging

```typescript
// lib/logger.ts
export const logger = {
  request: (url: string, config: any) => {
    console.log('[REQUEST]', url, config);
  },
  response: (url: string, status: number, data: any) => {
    console.log('[RESPONSE]', url, status, data);
  },
  error: (url: string, error: any) => {
    console.error('[ERROR]', url, error);
  }
};

// Usage
export async function searchPages(query: string) {
  const url = `${API_BASE}/search/page?q=${query}`;
  logger.request(url, { headers: HEADERS });
  
  try {
    const response = await fetch(url, { headers: HEADERS });
    logger.response(url, response.status, await response.json());
  } catch (error) {
    logger.error(url, error);
  }
}
```

### 4. Test API Directly

```bash
# Test page endpoint
curl -H "Api-User-Agent: Test (test@example.com)" \
  "https://api.wikimedia.org/core/v1/wikipedia/vi/page/Lịch_sử_Việt_Nam" | jq

# Test search
curl -H "Api-User-Agent: Test (test@example.com)" \
  "https://api.wikimedia.org/core/v1/wikipedia/vi/search/page?q=Triều&limit=5" | jq

# jq helps format JSON output
```

---

## ❓ FAQ - Câu Hỏi Thường Gặp

### Q1: Tôi có thể sử dụng API này cho sản phẩm thương mại không?

**A:** Có, Wikipedia content có sử dụng Creative Commons license. Bạn phải:
- Credit Wikipedia và contributors
- Share content dưới same license
- Không declare copyright độc quyền

---

### Q2: Có giới hạn rate limit không?

**A:** Wikipedia API không có hard rate limit, nhưng:
- Nên gọi < 1000 requests/day cho production
- Luôn cache results
- Respect robots.txt

---

### Q3: Có thể lấy toàn bộ nội dung bài viết không?

**A:** Có, sử dụng `/html` endpoint:
```
GET /core/v1/wikipedia/vi/page/{title}/html
```

Nhưng trả về HTML raw, cần parse lại.

---

### Q4: Dữ liệu có update thường xuyên không?

**A:** Có, Wikipedia updates realtime. Cache thường xuyên sẽ outdated. Recommend:
- Revalidate cache mỗi 24 hours
- Hoặc kiểm tra `latest.timestamp`

---

### Q5: Tôi có thể search bằng tiếng Việt không?

**A:** Có:
```
?q=Triều Trần
?q=lịch sử Việt Nam
?q=Hô Chi Minh
```

Wikipedia supports Unicode.

---

### Q6: Support tiếng Việt khác không (regional variants)?

**A:** Chỉ hỗ trợ `vi` (Tiếng Việt chung). Không support:
- `zh-Hans`, `zh-Hant` (Chinese variants)
- Regional Vietnamese dialects

---

### Q7: Làm cách nào để contribute lại Wikipedia?

**A:** Để update articles:
1. Truy cập https://vi.wikipedia.org/wiki/Trang_Chính
2. Đăng ký account
3. Click "Edit" trên bài viết
4. Thay đổi content
5. Click "Save"

---

## 📋 Debugging Checklist

- [ ] Kiểm tra User-Agent header
- [ ] Verify API URL correct
- [ ] Test query parameters
- [ ] Check response status code
- [ ] Validate response format
- [ ] Check error message
- [ ] Verify authentication (nếu cần)
- [ ] Test network connectivity
- [ ] Check rate limit status
- [ ] Review logs

---

## 🔗 Tài Liệu Tham Khảo

- **Wikimedia API Docs**: https://api.wikimedia.org/wiki/Core_REST_API
- **Wikipedia Content License**: https://en.wikipedia.org/wiki/Wikipedia:Licensing_update
- **HTTP Status Codes**: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
- **TypeScript Errors**: https://www.typescriptlang.org/docs/handbook/2/narrowing.html

---

## 📞 Cách Lấy Hỗ Trợ

1. **Kiểm tra tài liệu trước**: Xem các file .md này
2. **Google Search**: Search error message
3. **Stack Overflow**: Tag `wikipedia-api` hoặc `nextjs`
4. **Reddit**: r/reactjs, r/typescript
5. **GitHub Issues**: https://github.com/wikimedia/api-gateway/issues

---

**Tài liệu hoàn tất! 🎉**

Nếu có câu hỏi hoặc cần thêm chi tiết, hãy tham khảo các file khác hoặc tìm kiếm online.