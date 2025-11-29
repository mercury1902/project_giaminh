# 01-SETUP-GUIDE.md - Hướng Dẫn Setup Chi Tiết

## 🔧 Setup Dự Án Next.js

### Bước 1: Tạo Next.js Project

```bash
# Tạo project với TypeScript
npx create-next-app@latest history-app \
  --typescript \
  --tailwind \
  --eslint \
  --git \
  --no-src-dir

# Chọn lựa chọn:
# ✔ Would you like to use ESLint? › Yes
# ✔ Would you like to use Tailwind CSS? › Yes
# ✔ Would you like your code inside a `src/` directory? › No
# ✔ Would you like to initialize a git repository? › Yes
```

### Bước 2: Di Chuyển Vào Folder

```bash
cd history-app
```

### Bước 3: Cài Dependencies

```bash
# Các package cần thiết
npm install axios swr

# Optional - để caching
npm install --save-dev prisma @prisma/client

# Optional - để rate limiting
npm install @upstash/ratelimit @upstash/redis
```

### Bước 4: Tạo Folder Structure

```bash
# Tạo các folders
mkdir -p lib app/api/history/search app/components
```

Kết quả:
```
history-app/
├── lib/
│   ├── types.ts
│   ├── constants.ts
│   └── wikipedia.ts
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
│   │   └── ArticleCard.tsx
│   ├── page.tsx
│   ├── layout.tsx
│   ├── globals.css
├── public/
├── .env.local
├── .gitignore
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

---

## ⚙️ Environment Variables

### Bước 1: Tạo File .env.local

Tạo file `.env.local` ở root của project:

```bash
# .env.local

# ========== WIKIPEDIA API ==========
NEXT_PUBLIC_WIKI_API_BASE=https://api.wikimedia.org/core/v1/wikipedia
WIKI_LANGUAGE=vi
WIKI_USER_AGENT=HistoryApp (contact@your-email.com)

# ========== CACHE CONFIG ==========
NEXT_PUBLIC_CACHE_TTL=86400

# ========== OPTIONAL - DATABASE ==========
# DATABASE_URL=postgresql://user:password@localhost:5432/history_db

# ========== OPTIONAL - RATE LIMITING ==========
# UPSTASH_REDIS_REST_URL=your-url
# UPSTASH_REDIS_REST_TOKEN=your-token
```

### Bước 2: Giải Thích Environment Variables

| Biến | Bắt Buộc | Mô Tả | Ví Dụ |
|------|---------|-------|--------|
| `NEXT_PUBLIC_WIKI_API_BASE` | ✅ | Base URL API | `https://api.wikimedia.org/core/v1/wikipedia` |
| `WIKI_LANGUAGE` | ✅ | Language code | `vi` |
| `WIKI_USER_AGENT` | ✅ | User agent for API | `HistoryApp (contact@example.com)` |
| `NEXT_PUBLIC_CACHE_TTL` | ❌ | Cache time-to-live (seconds) | `86400` (24 hours) |
| `DATABASE_URL` | ❌ | Database connection (optional) | `postgresql://...` |

### Bước 3: Cấu Hình User-Agent

⚠️ **Quan Trọng**: Wikimedia yêu cầu User-Agent header.

Format: `AppName (contact-email@example.com)`

```
✅ Đúng:
  HistoryApp (contact@example.com)
  MyHistoryProject (your-email@gmail.com)
  
❌ Sai:
  Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.9.2.8)
  python-requests/2.27.1
  curl/7.64.1
```

### Bước 4: Git Ignore

Đảm bảo `.gitignore` chứa:

```bash
# .gitignore

# Environment variables
.env.local
.env.*.local
.env

# Node modules
node_modules/

# Build output
.next/
out/
dist/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
```

---

## 📦 Package.json Configuration

Kiểm tra `package.json`:

```json
{
  "name": "history-app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "next": "^14.0.0",
    "axios": "^1.6.0",
    "swr": "^2.2.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.14",
    "postcss": "^8.4.24",
    "eslint": "^8.0.0",
    "eslint-config-next": "^14.0.0"
  }
}
```

---

## ✅ Kiểm Tra Setup

### 1. Kiểm Tra Cài Đặt

```bash
# Kiểm tra Node version (cần 16+)
node --version

# Kiểm tra npm version (cần 8+)
npm --version

# Kiểm tra dependencies
npm ls
```

### 2. Test API Connection

Tạo file test `test-api.js`:

```bash
# test-api.js
const https = require('https');

https.get('https://api.wikimedia.org/core/v1/wikipedia/vi/search/page?q=Việt+Nam&limit=1', {
  headers: {
    'Api-User-Agent': 'HistoryApp (contact@example.com)'
  }
}, (res) => {
  console.log('Status:', res.statusCode);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(JSON.parse(data)));
}).on('error', e => console.error(e));
```

Chạy:
```bash
node test-api.js
```

Kết quả nên là JSON response từ Wikipedia.

### 3. Chạy Development Server

```bash
npm run dev
```

Output:
```
▲ Next.js 14.0.0
- Local:        http://localhost:3000
- Environments: .env.local

✓ Ready in 2.1s
```

Truy cập: http://localhost:3000

---

## 🔍 TypeScript Configuration

Kiểm tra `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "preserve",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    },
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

## 🎨 Tailwind CSS Configuration

Kiểm tra `tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        history: {
          50: '#f5f3ff',
          100: '#ede9fe',
          600: '#7c3aed',
          700: '#6d28d9',
        },
      },
    },
  },
  plugins: [],
}
export default config
```

---

## 📝 Next.js Configuration

Kiểm tra `next.config.ts`:

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
      {
        protocol: 'https',
        hostname: '*.wikimedia.org',
      },
    ],
  },
  headers: async () => [
    {
      source: '/api/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=3600, s-maxage=3600',
        },
      ],
    },
  ],
}

export default nextConfig
```

---

## 🚀 Chạy Development Server

```bash
# Development mode
npm run dev

# Production build
npm run build

# Production mode
npm start

# Type checking
npm run typecheck
```

---

## ✅ Completion Checklist

- [ ] Node 16+ cài đặt
- [ ] npm 8+ cài đặt
- [ ] Next.js project tạo
- [ ] Dependencies cài đặt
- [ ] Folder structure tạo
- [ ] .env.local cấu hình
- [ ] TypeScript kiểm tra
- [ ] Test API connection thành công
- [ ] Development server chạy được
- [ ] Truy cập http://localhost:3000 thành công

---

## ⚠️ Common Issues

### Issue 1: Port 3000 đã sử dụng
```bash
# Giải pháp: Dùng port khác
npm run dev -- -p 3001
```

### Issue 2: Permission denied cho .env.local
```bash
# Giải pháp: Cấp quyền
chmod 644 .env.local
```

### Issue 3: Node modules lỗi
```bash
# Giải pháp: Cài lại
rm -rf node_modules package-lock.json
npm install
```

---

**Tiếp tục: 02-API-REFERENCE.md**