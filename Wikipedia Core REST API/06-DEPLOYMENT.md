# 06-DEPLOYMENT.md - Triển Khai Sản Phẩm

## 🚀 Deploy to Vercel

### Bước 1: Chuẩn Bị Code

```bash
# 1. Commit code
git add .
git commit -m "Ready for deployment"

# 2. Push to GitHub
git push origin main
```

### Bước 2: Setup Vercel Account

1. Truy cập https://vercel.com
2. Click "Sign Up"
3. Chọn "Continue with GitHub"
4. Authorize Vercel
5. Confirm email

### Bước 3: Import Project

1. Vào Vercel Dashboard
2. Click "Add New..." → "Project"
3. Select GitHub repository
4. Click "Import"

### Bước 4: Configure Environment Variables

1. Click "Environment Variables"
2. Thêm các biến sau:

```
NEXT_PUBLIC_WIKI_API_BASE=https://api.wikimedia.org/core/v1/wikipedia
WIKI_LANGUAGE=vi
WIKI_USER_AGENT=HistoryApp (your-email@example.com)
NEXT_PUBLIC_CACHE_TTL=86400
```

Không cần thêm `:` sau mỗi key

### Bước 5: Deploy

1. Click "Deploy"
2. Đợi build process hoàn tất
3. Truy cập URL production

---

## 🔄 CI/CD Pipeline

### GitHub Actions Configuration

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npm run typecheck

      - name: Lint
        run: npm run lint

      - name: Build
        run: npm run build

      - name: Deploy to Vercel
        uses: vercel/action@main
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

### Setup Secrets

1. Vào GitHub Repo Settings
2. Click "Secrets and variables" → "Actions"
3. Thêm secrets:

```
VERCEL_TOKEN: <your-token-from-vercel>
VERCEL_ORG_ID: <your-org-id>
VERCEL_PROJECT_ID: <your-project-id>
```

---

## 💾 Database Setup (Optional)

### PostgreSQL with Railway

#### Step 1: Create Railway Account

1. Truy cập https://railway.app
2. Sign up with GitHub

#### Step 2: Create Database

1. Click "New Project"
2. Select "PostgreSQL"
3. Click "Add"

#### Step 3: Get Connection String

1. Click PostgreSQL service
2. Click "Connect"
3. Copy "DATABASE_URL"

#### Step 4: Setup Prisma

```bash
npm install prisma @prisma/client
npx prisma init
```

#### Step 5: Configure Prisma

```env
# .env.local
DATABASE_URL="postgresql://user:password@host:port/database"
```

#### Step 6: Create Schema

```prisma
# prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model ArticleCache {
  id        Int     @id @default(autoincrement())
  title     String  @unique
  data      Json
  cachedAt  DateTime @updatedAt
  createdAt DateTime @default(now())
}
```

#### Step 7: Migrate

```bash
npx prisma migrate dev --name init
npx prisma generate
```

---

## 📊 Monitoring & Analytics

### Setup Vercel Analytics

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

Install package:
```bash
npm install @vercel/analytics
```

### Web Vitals Monitoring

```typescript
// lib/vitals.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric: any) {
  // Send to your analytics endpoint
  fetch('/api/analytics', {
    method: 'POST',
    body: JSON.stringify(metric),
  }).catch(err => console.error(err));
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

---

## 🔍 Performance Testing

### Lighthouse CI

```bash
npm install -g @lhci/cli@latest

# Run locally
lhci autorun

# Or in CI/CD
```

```yaml
# lighthouserc.json
{
  "ci": {
    "collect": {
      "url": ["https://history-app.com"],
      "numberOfRuns": 3,
      "settings": {
        "configPath": "./lighthouserc-config.json"
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    },
    "assert": {
      "preset": "lighthouse:recommended"
    }
  }
}
```

---

## 🛡️ Security Checklist

- [ ] Enable HTTPS (Vercel default)
- [ ] Configure CORS properly
- [ ] Add security headers
- [ ] Setup rate limiting
- [ ] Validate all inputs
- [ ] Use environment variables
- [ ] Never commit secrets
- [ ] Keep dependencies updated
- [ ] Setup SSL/TLS (Vercel default)
- [ ] Enable DDoS protection

### Security Headers in next.config.ts

```typescript
export const headers = async () => {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
      ],
    },
  ];
};
```

---

## 📈 Production Checklist

- [ ] Environment variables configured
- [ ] Database setup (if using)
- [ ] Caching strategy implemented
- [ ] Rate limiting enabled
- [ ] SEO metadata added
- [ ] Analytics setup
- [ ] Error tracking setup
- [ ] Monitoring enabled
- [ ] Security headers added
- [ ] SSL certificate valid
- [ ] Domain configured
- [ ] Email alerts setup
- [ ] Backup strategy planned
- [ ] Load testing passed
- [ ] Performance targets met

---

## 🔧 Troubleshooting Deployment

### Build Fails

```bash
# Check build locally
npm run build

# Clear cache and retry
rm -rf .next
npm run build
```

### Runtime Errors

1. Check Vercel logs
2. Check environment variables
3. Verify database connection
4. Check API endpoints

### Performance Issues

1. Check Lighthouse scores
2. Optimize images
3. Enable caching
4. Reduce bundle size

---

## 📞 Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Railway**: https://docs.railway.app
- **Prisma**: https://www.prisma.io/docs

---

**Tiếp tục: 07-TROUBLESHOOTING.md**