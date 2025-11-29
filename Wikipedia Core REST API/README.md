# 📚 Wikipedia Core REST API - Dự Án Lịch Sử Việt Nam

## 📖 Bộ Tài Liệu Đầy Đủ

Bộ tài liệu này hướng dẫn chi tiết cách xây dựng dự án lịch sử Việt Nam sử dụng Wikipedia Core REST API với Next.js.

---

## 📑 Danh Sách Tài Liệu

### 1. **README.md** (Tài liệu này)
   - Tổng quan bộ tài liệu
   - Mục lục chính
   - Quick start

### 2. **01-SETUP-GUIDE.md**
   - Setup project Next.js
   - Cầu hình environment
   - Folder structure
   - Install dependencies

### 3. **02-API-REFERENCE.md**
   - Thông tin API chi tiết
   - 5 endpoints chính
   - Response format
   - Error codes

### 4. **03-CODE-COMPLETE.md**
   - Toàn bộ source code
   - lib/types.ts
   - lib/constants.ts
   - lib/wikipedia.ts
   - API routes
   - Components

### 5. **04-VIETNAMESE-HISTORY.md**
   - Danh sách triều đại Việt Nam
   - Nhân vật lịch sử
   - Sự kiện quan trọng
   - URLs Wikipedia sẵn sàng

### 6. **05-BEST-PRACTICES.md**
   - Caching strategies
   - Rate limiting
   - Performance optimization
   - Security
   - SEO

### 7. **06-DEPLOYMENT.md**
   - Deploy to Vercel
   - Environment variables
   - Database setup (optional)
   - Monitoring

### 8. **07-TROUBLESHOOTING.md**
   - Common errors
   - Solutions
   - Debugging tips
   - FAQ

---

## 🚀 Quick Start

```bash
# 1. Tạo Next.js project
npx create-next-app@latest history-app --typescript

# 2. Cài dependencies
cd history-app
npm install axios swr

# 3. Copy các file từ 03-CODE-COMPLETE.md

# 4. Setup .env.local (xem 01-SETUP-GUIDE.md)

# 5. Run
npm run dev
```

---

## 📋 Cấu Trúc Project

```
history-app/
├── lib/
│   ├── types.ts              # TypeScript types
│   ├── constants.ts          # Constants
│   └── wikipedia.ts          # API utilities
├── app/
│   ├── api/
│   │   └── history/
│   │       ├── search/
│   │       │   └── route.ts
│   │       ├── [title]/
│   │       │   └── route.ts
│   │       └── history/
│   │           └── route.ts
│   ├── components/
│   │   ├── HistorySearch.tsx
│   │   ├── ArticleCard.tsx
│   │   └── Loading.tsx
│   ├── history/
│   │   └── [title]/
│   │       └── page.tsx
│   ├── page.tsx
│   ├── layout.tsx
│   └── globals.css
├── public/
├── .env.local
├── tsconfig.json
└── package.json
```

---

## 📚 Hướng Dẫn Đọc Tài Liệu

### Lần Đầu Tiên:
1. ✅ Đọc **README.md** (tài liệu này)
2. ✅ Đọc **01-SETUP-GUIDE.md** - setup project
3. ✅ Đọc **02-API-REFERENCE.md** - hiểu API
4. ✅ Đọc **03-CODE-COMPLETE.md** - copy code

### Khi Gặp Vấn Đề:
- Lỗi? → **07-TROUBLESHOOTING.md**
- Cấu hình? → **01-SETUP-GUIDE.md**
- API không hoạt động? → **02-API-REFERENCE.md**

### Tối Ưu Hóa:
- Performance? → **05-BEST-PRACTICES.md**
- Deploy? → **06-DEPLOYMENT.md**

---

## 🎯 Mục Tiêu Dự Án

- ✅ Tìm kiếm lịch sử Việt Nam
- ✅ Xem chi tiết bài viết
- ✅ Autocomplete suggestions
- ✅ Lịch sử chỉnh sửa
- ✅ Caching tối ưu
- ✅ SEO-friendly
- ✅ Mobile responsive
- ✅ Production-ready

---

## ⚡ Đặc Điểm API

| Tính Năng | Chi Tiết |
|----------|---------|
| **Miễn Phí** | 100% FREE, không cần API key |
| **Không Giới Hạn** | Unlimited requests |
| **Tiếng Việt** | Hỗ trợ đầy đủ (language code: vi) |
| **Dữ Liệu** | 300+ bài viết lịch sử Việt Nam |
| **Endpoints** | 5 endpoints chính |
| **Response** | JSON format |
| **Caching** | Hỗ trợ caching |

---

## 🔧 Công Nghệ Sử Dụng

```
Frontend:
  - Next.js 14+
  - React 18+
  - TypeScript
  - Tailwind CSS
  - SWR (for data fetching)

Backend:
  - Next.js API Routes
  - Axios
  - Node.js

API:
  - Wikipedia Core REST API
  - Wikimedia Foundation

Deployment:
  - Vercel (recommended)
  - Docker (optional)
  - Railway/Render (optional)

Database (optional):
  - PostgreSQL + Prisma
  - MongoDB + Mongoose
```

---

## 📞 Support & Resources

### Official Documentation
- [Wikimedia Core REST API](https://api.wikimedia.org/wiki/Core_REST_API)
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Wikipedia Việt Nam](https://vi.wikipedia.org/)

### Community
- [Next.js Discussions](https://github.com/vercel/next.js/discussions)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/nextjs)
- [Reddit r/reactjs](https://reddit.com/r/reactjs)

---

## ✅ Checklist

- [ ] Đọc README.md (tài liệu này)
- [ ] Setup theo 01-SETUP-GUIDE.md
- [ ] Hiểu API từ 02-API-REFERENCE.md
- [ ] Copy code từ 03-CODE-COMPLETE.md
- [ ] Tìm kiếm bài viết lịch sử (04-VIETNAMESE-HISTORY.md)
- [ ] Tối ưu hóa (05-BEST-PRACTICES.md)
- [ ] Deploy (06-DEPLOYMENT.md)
- [ ] Production ready

---

## 📞 Liên Hệ

Nếu có câu hỏi, vui lòng:
1. Kiểm tra **07-TROUBLESHOOTING.md** trước
2. Đọc lại tài liệu liên quan
3. Tìm kiếm trên Google/Stack Overflow
4. Hỏi ChatGPT/Claude

---

## 📄 Ghi Chú Quan Trọng

### Uy Tín & Chính Xác
✅ Tất cả thông tin từ:
- Tài liệu chính thức Wikimedia
- Cộng đồng Next.js
- Best practices của industry
- Real-world experience

### Không Sử Dụng
❌ Không sử dụng synthetic data
❌ Không hardcode API keys
❌ Không cache vô thời hạn
❌ Không ignore errors

---

**Chúc bạn thành công! 🚀**

Tiếp tục đọc: **01-SETUP-GUIDE.md**