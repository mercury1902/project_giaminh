# 02-API-REFERENCE.md - Tham Khảo API Chi Tiết

## 📡 Wikipedia Core REST API

### Thông Tin Chung

| Thuộc Tính | Chi Tiết |
|-----------|---------|
| **API Name** | Wikipedia Core REST API |
| **Base URL** | `https://api.wikimedia.org/core/v1/wikipedia` |
| **Language** | `vi` (Tiếng Việt) |
| **Authentication** | Không bắt buộc |
| **Rate Limit** | Unlimited (reasonable use) |
| **Response Format** | JSON |
| **CORS** | Hỗ trợ |
| **HTTPS** | ✅ Required |

---

## 📋 Endpoint 1: Lấy Nội Dung Trang

### URL
```
GET /core/v1/wikipedia/{language}/page/{title}
```

### Parameters

| Tham Số | Kiểu | Bắt Buộc | Mô Tả |
|---------|------|---------|-------|
| `language` | string | ✅ | Language code: `vi` |
| `title` | string | ✅ | Tên bài viết (URL-encoded) |

### Ví Dụ

```bash
# Get page info
curl "https://api.wikimedia.org/core/v1/wikipedia/vi/page/Lịch_sử_Việt_Nam" \
  -H "Api-User-Agent: HistoryApp (contact@example.com)"

# Result
{
  "id": 7859,
  "key": "Lịch_sử_Việt_Nam",
  "title": "Lịch sử Việt Nam",
  "excerpt": "Lịch sử Việt Nam là các sự kiện chính trị, kinh tế, xã hội, văn hóa diễn ra...",
  "latest": {
    "id": 1234567,
    "timestamp": "2024-11-25T10:30:00Z"
  },
  "content_model": "wikitext",
  "source": "https://vi.wikipedia.org/wiki/Lịch_sử_Việt_Nam"
}
```

### Response Fields

| Field | Kiểu | Mô Tả |
|-------|------|-------|
| `id` | number | Page ID trên Wikipedia |
| `key` | string | Page key (URL-safe title) |
| `title` | string | Tiêu đề bài viết |
| `excerpt` | string | Tóm tắt nội dung |
| `latest` | object | Thông tin phiên bản mới nhất |
| `content_model` | string | Model nội dung (`wikitext`) |
| `source` | string | Link Wikipedia gốc |

### Common URLs

```
/vi/page/Lịch_sử_Việt_Nam
/vi/page/Triều_Trần
/vi/page/Triều_Lý
/vi/page/Chiến_tranh_Việt_Nam
/vi/page/Hô_Chi_Minh
/vi/page/Võ_Nguyên_Giáp
```

### Error Responses

```json
// 404 Not Found
{
  "detail": "The resource does not exist",
  "type": "not_found"
}

// 400 Bad Request
{
  "detail": "Invalid title",
  "type": "bad_request"
}
```

---

## 🔍 Endpoint 2: Tìm Kiếm Nội Dung

### URL
```
GET /core/v1/wikipedia/{language}/search/page?q={query}&limit={limit}
```

### Parameters

| Tham Số | Kiểu | Bắt Buộc | Default | Mô Tả |
|---------|------|---------|---------|-------|
| `language` | string | ✅ | - | Language code |
| `q` | string | ✅ | - | Search query |
| `limit` | number | ❌ | 50 | Results limit (1-100) |

### Ví Dụ

```bash
# Search for pages
curl "https://api.wikimedia.org/core/v1/wikipedia/vi/search/page?q=Triều&limit=5" \
  -H "Api-User-Agent: HistoryApp (contact@example.com)"

# Result
{
  "pages": [
    {
      "id": 1001,
      "key": "Triều_Trần",
      "title": "Triều Trần",
      "excerpt": "Triều Trần là một triều đại của Việt Nam kéo dài từ 1225 đến 1427...",
      "matched_title": "Triều <span class=\"searchmatch\">Trần</span>",
      "description": "Triều đại Việt Nam",
      "thumbnail": {
        "url": "//upload.wikimedia.org/wikipedia/commons/thumb/.../200px-...jpg",
        "width": 200,
        "height": 200
      }
    }
  ]
}
```

### Response Fields

| Field | Kiểu | Mô Tả |
|-------|------|-------|
| `pages` | array | Mảng kết quả tìm kiếm |
| `id` | number | Page ID |
| `key` | string | Page key |
| `title` | string | Tiêu đề |
| `excerpt` | string | Tóm tắt |
| `matched_title` | string | Tiêu đề có highlight |
| `description` | string | Mô tả ngắn |
| `thumbnail` | object | Hình thumbnail |

### Ví Dụ Queries

```
?q=Triều Trần&limit=10
?q=Hùng Vương&limit=5
?q=lịch sử&limit=20
?q=Chiến tranh&limit=15
```

---

## 🎯 Endpoint 3: Tìm Kiếm Tiêu Đề (Autocomplete)

### URL
```
GET /core/v1/wikipedia/{language}/search/title?q={query}&limit={limit}
```

### Parameters

| Tham Số | Kiểu | Bắt Buộc | Default | Mô Tả |
|---------|------|---------|---------|-------|
| `q` | string | ✅ | - | Search query |
| `limit` | number | ❌ | 50 | Results limit |

### Ví Dụ

```bash
# Autocomplete for titles
curl "https://api.wikimedia.org/core/v1/wikipedia/vi/search/title?q=Tri&limit=10" \
  -H "Api-User-Agent: HistoryApp (contact@example.com)"

# Result
{
  "pages": [
    {
      "id": 1001,
      "title": "Triều Trần",
      "excerpt": "Triều Trần"
    },
    {
      "id": 1002,
      "title": "Triều Lý",
      "excerpt": "Triều Lý"
    },
    {
      "id": 1003,
      "title": "Triều Nguyễn",
      "excerpt": "Triều Nguyễn"
    }
  ]
}
```

### Khi Nào Sử Dụng

- ✅ Autocomplete search box
- ✅ Suggestions khi nhập
- ✅ Quick navigation
- ❌ Không để hiển thị danh sách dài

---

## 📜 Endpoint 4: Lịch Sử Chỉnh Sửa

### URL
```
GET /core/v1/wikipedia/{language}/page/{title}/history
```

### Parameters

| Tham Số | Kiểu | Bắt Buộc | Mô Tả |
|---------|------|---------|-------|
| `title` | string | ✅ | Tên bài viết |
| `older_than` | number | ❌ | Revision ID |
| `newer_than` | number | ❌ | Revision ID |
| `filter` | string | ❌ | `anonymous`, `bot`, `bots` |

### Ví Dụ

```bash
# Get page history
curl "https://api.wikimedia.org/core/v1/wikipedia/vi/page/Triều_Trần/history" \
  -H "Api-User-Agent: HistoryApp (contact@example.com)"

# Result
{
  "revisions": [
    {
      "id": 1234567890,
      "timestamp": "2024-11-25T10:30:00Z",
      "comment": "Cập nhật thông tin",
      "size": 45678,
      "user": {
        "id": 5678,
        "name": "Contributor_Name"
      },
      "minor": false,
      "delta": 245
    }
  ],
  "latest": "https://api.wikimedia.org/core/v1/wikipedia/vi/page/Triều_Trần/history",
  "older": "https://api.wikimedia.org/core/v1/wikipedia/vi/page/Triều_Trần/history?older_than=1234567890"
}
```

### Response Fields

| Field | Kiểu | Mô Tả |
|-------|------|-------|
| `revisions` | array | Danh sách chỉnh sửa |
| `id` | number | Revision ID |
| `timestamp` | string | Thời gian chỉnh sửa (ISO 8601) |
| `comment` | string | Nội dung chỉnh sửa |
| `size` | number | Kích thước trang (bytes) |
| `user.name` | string | Tên người chỉnh sửa |
| `minor` | boolean | Có phải chỉnh sửa nhỏ không |
| `delta` | number | Số ký tự thay đổi |

---

## 🎨 Endpoint 5: Lấy Nội Dung HTML

### URL
```
GET /core/v1/wikipedia/{language}/page/{title}/html
```

### Ví Dụ

```bash
# Get HTML rendered content
curl "https://api.wikimedia.org/core/v1/wikipedia/vi/page/Lịch_sử_Việt_Nam/html" \
  -H "Api-User-Agent: HistoryApp (contact@example.com)"

# Result: HTML string (có thể render trực tiếp)
```

### Khi Nào Sử Dụng

- ✅ Render full article
- ✅ WYSIWYG editor
- ❌ Không để tìm kiếm (quá lớn)
- ❌ Không để lưu cache dài hạn

---

## ⚠️ Error Codes

| Status | Meaning | Giải Pháp |
|--------|---------|----------|
| 200 | OK | ✅ Success |
| 400 | Bad Request | Kiểm tra parameters |
| 404 | Not Found | Bài viết không tồn tại |
| 429 | Too Many Requests | Rate limit, dùng cache |
| 500 | Server Error | Retry lại |
| 503 | Service Unavailable | Server tạm down, retry |

---

## 🔐 Headers Bắt Buộc

```bash
# User-Agent BẮT BUỘC
Api-User-Agent: AppName (contact@example.com)

# Hoặc
User-Agent: AppName (contact@example.com)

# Optional nhưng khuyến nghị
Accept: application/json
Accept-Language: vi
```

---

## ⚡ Performance Tips

### 1. Cache Results
```bash
# Các response được cache tự động
# Thêm header để cache lâu hơn
Cache-Control: public, max-age=86400
```

### 2. Limit Results
```bash
# Luôn sử dụng limit
?limit=10 (tốt)
?limit=1000 (xấu)
```

### 3. Use Compression
```bash
# Enable gzip compression
Accept-Encoding: gzip, deflate
```

---

## 🧪 Test Endpoints

### CURL Command

```bash
# 1. Test page endpoint
curl -H "Api-User-Agent: Test (test@example.com)" \
  "https://api.wikimedia.org/core/v1/wikipedia/vi/page/Lịch_sử_Việt_Nam"

# 2. Test search endpoint
curl -H "Api-User-Agent: Test (test@example.com)" \
  "https://api.wikimedia.org/core/v1/wikipedia/vi/search/page?q=Triều&limit=5"

# 3. Test title search
curl -H "Api-User-Agent: Test (test@example.com)" \
  "https://api.wikimedia.org/core/v1/wikipedia/vi/search/title?q=Tri&limit=10"

# 4. Test history
curl -H "Api-User-Agent: Test (test@example.com)" \
  "https://api.wikimedia.org/core/v1/wikipedia/vi/page/Triều_Trần/history"
```

### JavaScript Fetch

```javascript
const headers = {
  'Api-User-Agent': 'HistoryApp (contact@example.com)'
};

// Test search
fetch('https://api.wikimedia.org/core/v1/wikipedia/vi/search/page?q=Triều&limit=5', { headers })
  .then(r => r.json())
  .then(data => console.log(data))
  .catch(e => console.error(e));
```

---

## 📚 Tài Liệu Chính Thức

- **API Documentation**: https://api.wikimedia.org/wiki/Core_REST_API
- **API Reference**: https://api.wikimedia.org/wiki/Core_REST_API/Reference
- **Wikipedia Việt Nam**: https://vi.wikipedia.org/

---

**Tiếp tục: 03-CODE-COMPLETE.md**