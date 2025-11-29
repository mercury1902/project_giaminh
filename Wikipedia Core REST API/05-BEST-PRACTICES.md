# 05-BEST-PRACTICES.md - Best Practices & Optimization

## ⚡ Caching Strategy

### 1. ISR (Incremental Static Regeneration)

```typescript
// app/api/history/[title]/route.ts
export const revalidate = 3600; // Revalidate every hour

export async function GET(
  request: NextRequest,
  { params }: { params: { title: string } }
) {
  const data = await getArticle(params.title);
  
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
```

### 2. SWR Client-Side Caching

```typescript
// components/HistorySearch.tsx
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function HistorySearch() {
  const { data, isLoading, error } = useSWR(
    `/api/history/search?q=${query}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // Cache for 1 minute
      focusThrottleInterval: 300000, // 5 minutes
    }
  );
  
  return <div>{/* ... */}</div>;
}
```

### 3. Database Caching (Optional - Prisma)

```typescript
// lib/cache.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getCachedArticle(title: string) {
  // Check cache first (1 day TTL)
  const cached = await prisma.articleCache.findFirst({
    where: {
      title,
      cachedAt: {
        gte: new Date(Date.now() - 86400000) // 24 hours
      }
    }
  });

  if (cached) {
    return cached.data;
  }

  // Fetch from Wikipedia
  const article = await getArticle(title);

  // Store in cache
  if (article) {
    await prisma.articleCache.upsert({
      where: { title },
      update: { data: article, cachedAt: new Date() },
      create: { title, data: article, cachedAt: new Date() }
    });
  }

  return article;
}
```

---

## 🚦 Rate Limiting

### 1. Basic Rate Limiting

```typescript
// lib/ratelimit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(100, '1 h'),
});
```

### 2. Apply in API Routes

```typescript
// app/api/history/search/route.ts
import { ratelimit } from '@/lib/ratelimit';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Rate limit by IP
  const ip = request.ip ?? 'anonymous';
  const { success, pending, limit, reset, remaining } = await ratelimit.limit(ip);

  if (!success) {
    return NextResponse.json(
      { 
        error: 'Rate limit exceeded',
        remaining,
        limit,
        reset: new Date(reset).toISOString()
      },
      { status: 429 }
    );
  }

  // Process request
  const query = request.nextUrl.searchParams.get('q');
  // ...
}
```

---

## 🖼️ Image Optimization

### 1. Next.js Image Component

```typescript
// components/ArticleCard.tsx
import Image from 'next/image';

export function ArticleCard({ article }: { article: SearchResult }) {
  if (!article.thumbnail?.url) {
    return <div className="w-20 h-20 bg-gray-200 rounded" />;
  }

  return (
    <Image
      src={article.thumbnail.url}
      alt={article.title}
      width={200}
      height={200}
      quality={75}
      placeholder="blur"
      blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect fill='%23f3f4f6' width='200' height='200'/%3E%3C/svg%3E"
      sizes="(max-width: 768px) 100px, 200px"
    />
  );
}
```

### 2. Remote Patterns Configuration

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        pathname: '/wikipedia/**',
      },
      {
        protocol: 'https',
        hostname: '*.wikimedia.org',
      },
    ],
    // Optimize image loading
    formats: ['image/avif', 'image/webp'],
    // Cache images for 1 month
    minimumCacheTTL: 2592000,
  },
};
```

---

## ⚙️ Performance Optimization

### 1. Code Splitting

```typescript
// app/components/HistorySearch.tsx
import dynamic from 'next/dynamic';

// Load component dynamically (lazy loading)
const SearchResults = dynamic(
  () => import('./SearchResults'),
  { 
    loading: () => <div>Loading...</div>,
    ssr: false
  }
);
```

### 2. Request Batching

```typescript
// lib/batch.ts
export class RequestBatcher {
  private queue: Array<{ title: string; resolve: Function; reject: Function }> = [];
  private timer: NodeJS.Timeout | null = null;

  async fetch(title: string): Promise<WikiArticle> {
    return new Promise((resolve, reject) => {
      this.queue.push({ title, resolve, reject });
      this.scheduleFlush();
    });
  }

  private scheduleFlush() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => this.flush(), 100);
  }

  private async flush() {
    if (this.queue.length === 0) return;

    const batch = this.queue.splice(0, 10);
    const promises = batch.map(item => 
      getArticle(item.title)
        .then(result => item.resolve(result))
        .catch(err => item.reject(err))
    );

    await Promise.all(promises);
    if (this.queue.length > 0) this.scheduleFlush();
  }
}

export const batcher = new RequestBatcher();
```

### 3. Search Debouncing

```typescript
// hooks/useDebounce.ts
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// Usage
const debouncedQuery = useDebounce(query, 500);
```

---

## 🔒 Security

### 1. Environment Variables

```bash
# ✅ GOOD - Never commit .env.local
NEXT_PUBLIC_WIKI_API_BASE=https://api.wikimedia.org/core/v1/wikipedia
WIKI_USER_AGENT=HistoryApp (contact@example.com)

# ❌ BAD - Never hardcode sensitive data
const API_KEY = 'secret123'
```

### 2. Input Validation

```typescript
// lib/validation.ts
import { z } from 'zod';

export const searchSchema = z.object({
  q: z.string()
    .min(1, 'Query required')
    .max(100, 'Query too long')
    .regex(/^[a-zA-Z0-9\s\u0100-\uFFFF_-]+$/, 'Invalid characters'),
  limit: z.number()
    .int()
    .min(1)
    .max(100)
    .default(10)
});

// Usage
export function validateSearch(data: unknown) {
  return searchSchema.parse(data);
}
```

### 3. CORS Headers

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  return response;
}

export const config = {
  matcher: ['/api/:path*']
};
```

---

## 📊 SEO Optimization

### 1. Metadata

```typescript
// app/layout.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lịch Sử Việt Nam - Encyclopedia',
  description: 'Tìm hiểu lịch sử Việt Nam qua Wikipedia. Triều đại, sự kiện, nhân vật lịch sử.',
  keywords: ['lịch sử Việt Nam', 'triều đại', 'sự kiện lịch sử', 'nhân vật'],
  authors: [{ name: 'History App' }],
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: 'https://history-app.com',
    siteName: 'Lịch Sử Việt Nam',
    title: 'Lịch Sử Việt Nam - Encyclopedia',
    description: 'Tìm hiểu lịch sử Việt Nam',
    images: [
      {
        url: 'https://history-app.com/og-image.png',
        width: 1200,
        height: 630,
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lịch Sử Việt Nam',
    description: 'Tìm hiểu lịch sử Việt Nam'
  }
};
```

### 2. Structured Data

```typescript
// app/history/[title]/page.tsx
import { Metadata } from 'next';

export async function generateMetadata(
  { params }: { params: { title: string } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const article = await getArticle(params.title);

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url: `https://history-app.com/history/${params.title}`,
      type: 'article',
      images: article.thumbnail ? [{ url: article.thumbnail.url }] : [],
    },
  };
}

// Structured Data JSON-LD
export default function ArticlePage({ article }: { article: WikiArticle }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    image: article.thumbnail?.url,
    dateModified: article.latest?.timestamp,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {/* Article content */}
    </>
  );
}
```

### 3. Sitemap

```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next';
import { VIETNAM_HISTORY_ARTICLES } from '@/lib/constants';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://history-app.com';

  const articles = VIETNAM_HISTORY_ARTICLES.map(article => ({
    url: `${baseUrl}/history/${encodeURIComponent(article)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...articles,
  ];
}
```

---

## 📈 Monitoring & Analytics

### 1. Performance Monitoring

```typescript
// lib/metrics.ts
export async function logPerformance(
  endpoint: string,
  duration: number,
  status: number
) {
  // Send to your analytics service
  console.log(`[${new Date().toISOString()}] ${endpoint}: ${duration}ms (${status})`);
  
  // Or send to external service
  // await fetch('https://analytics.example.com', {
  //   method: 'POST',
  //   body: JSON.stringify({ endpoint, duration, status, timestamp: Date.now() })
  // });
}
```

### 2. Error Tracking

```typescript
// lib/error.ts
export async function logError(
  error: Error,
  context: Record<string, unknown>
) {
  console.error({
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString()
  });
  
  // Send to error tracking service (e.g., Sentry)
  // await Sentry.captureException(error, { extra: context });
}
```

---

## ✅ Performance Checklist

- [ ] Implement ISR caching
- [ ] Setup SWR with proper options
- [ ] Optimize images with Next.js Image
- [ ] Implement rate limiting
- [ ] Add input validation
- [ ] Setup CORS headers
- [ ] Add SEO metadata
- [ ] Create sitemap
- [ ] Setup monitoring
- [ ] Test performance with Lighthouse

---

**Tiếp tục: 06-DEPLOYMENT.md**