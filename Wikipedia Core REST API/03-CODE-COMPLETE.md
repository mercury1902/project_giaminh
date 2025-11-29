# 03-CODE-COMPLETE.md - Toàn Bộ Source Code

## 📝 Giới Thiệu

File này chứa toàn bộ source code hoàn chỉnh, sẵn sàng copy-paste vào dự án của bạn.

---

## 🗂️ Cấu Trúc File

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
│   │   ├── ArticleCard.tsx
│   │   └── Loading.tsx
│   ├── history/
│   │   └── [title]/
│   │       └── page.tsx
│   ├── page.tsx
│   ├── layout.tsx
│   └── globals.css
├── .env.local
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

---

## 📦 File 1: lib/types.ts

```typescript
// lib/types.ts

export interface WikiArticle {
  id: number;
  key: string;
  title: string;
  excerpt: string;
  latest?: {
    id: number;
    timestamp: string;
  };
  content_model: string;
  source: string;
}

export interface SearchResult {
  id: number;
  key: string;
  title: string;
  excerpt: string;
  matched_title?: string;
  description?: string;
  thumbnail?: {
    url: string;
    width: number;
    height: number;
  };
}

export interface WikiRevision {
  id: number;
  timestamp: string;
  comment: string;
  size: number;
  user: {
    id: number;
    name: string;
  };
  minor: boolean;
  delta: number;
}

export interface SearchResponse {
  pages: SearchResult[];
}

export interface HistoryResponse {
  revisions: WikiRevision[];
  latest?: string;
  older?: string;
}

export interface ApiError {
  message: string;
  status: number;
  details?: unknown;
}
```

---

## 📦 File 2: lib/constants.ts

```typescript
// lib/constants.ts

export const WIKI_CONFIG = {
  API_BASE: 'https://api.wikimedia.org/core/v1/wikipedia/vi',
  USER_AGENT: process.env.WIKI_USER_AGENT || 'HistoryApp (contact@example.com)',
  CACHE_TTL: parseInt(process.env.NEXT_PUBLIC_CACHE_TTL || '86400'),
  SEARCH_LIMIT: 50,
  MAX_RETRIES: 3,
  TIMEOUT: 10000,
};

export const VIETNAM_HISTORY_ARTICLES = [
  'Lịch sử Việt Nam',
  'Triều Hung Vương',
  'Triều Lý',
  'Triều Trần',
  'Triều Lê',
  'Triều Tây Sơn',
  'Triều Nguyễn',
  'Chiến tranh Việt Nam',
  'Chiến dịch Điện Biên Phủ',
  'Hô Chi Minh',
  'Võ Nguyên Giáp',
  'Trần Hưng Đạo',
  'Quang Trung',
  'Gia Long',
  'Văn hóa Việt Nam',
];

export const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
  SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

export const ERROR_MESSAGES = {
  NOT_FOUND: 'Bài viết không được tìm thấy',
  BAD_REQUEST: 'Yêu cầu không hợp lệ',
  RATE_LIMIT: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.',
  SERVER_ERROR: 'Lỗi máy chủ. Vui lòng thử lại sau.',
  NETWORK_ERROR: 'Lỗi kết nối. Vui lòng kiểm tra kết nối mạng.',
  TIMEOUT: 'Hết thời gian chờ. Vui lòng thử lại.',
} as const;
```

---

## 📦 File 3: lib/wikipedia.ts

```typescript
// lib/wikipedia.ts

import axios, { AxiosError } from 'axios';
import {
  WikiArticle,
  SearchResult,
  WikiRevision,
  SearchResponse,
  HistoryResponse,
  ApiError,
} from './types';
import { WIKI_CONFIG, HTTP_STATUS, ERROR_MESSAGES } from './constants';

// Create axios instance
const api = axios.create({
  baseURL: WIKI_CONFIG.API_BASE,
  headers: {
    'Api-User-Agent': WIKI_CONFIG.USER_AGENT,
  },
  timeout: WIKI_CONFIG.TIMEOUT,
});

// Search pages
export async function searchPages(
  query: string,
  limit: number = 10
): Promise<SearchResult[]> {
  try {
    const response = await api.get<SearchResponse>('/search/page', {
      params: {
        q: query,
        limit: Math.min(limit, 100),
      },
    });
    return response.data.pages || [];
  } catch (error) {
    console.error('Search pages error:', error);
    throw handleApiError(error);
  }
}

// Search titles (autocomplete)
export async function searchTitles(
  query: string,
  limit: number = 5
): Promise<SearchResult[]> {
  try {
    const response = await api.get<SearchResponse>('/search/title', {
      params: {
        q: query,
        limit: Math.min(limit, 100),
      },
    });
    return response.data.pages || [];
  } catch (error) {
    console.error('Search titles error:', error);
    throw handleApiError(error);
  }
}

// Get article info
export async function getArticle(title: string): Promise<WikiArticle | null> {
  try {
    const response = await api.get<WikiArticle>(
      `/page/${encodeURIComponent(title)}`
    );
    return response.data;
  } catch (error) {
    console.error('Get article error:', error);
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw handleApiError(error);
  }
}

// Get page history
export async function getPageHistory(
  title: string,
  limit: number = 20
): Promise<WikiRevision[]> {
  try {
    const response = await api.get<HistoryResponse>(
      `/page/${encodeURIComponent(title)}/history`
    );
    return response.data.revisions?.slice(0, limit) || [];
  } catch (error) {
    console.error('Get history error:', error);
    throw handleApiError(error);
  }
}

// Get HTML content
export async function getArticleHTML(title: string): Promise<string> {
  try {
    const response = await api.get(
      `/page/${encodeURIComponent(title)}/html`,
      { responseType: 'text' }
    );
    return response.data;
  } catch (error) {
    console.error('Get HTML error:', error);
    throw handleApiError(error);
  }
}

// Error handler
function handleApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    switch (axiosError.response?.status) {
      case 404:
        return {
          message: ERROR_MESSAGES.NOT_FOUND,
          status: HTTP_STATUS.NOT_FOUND,
        };
      case 429:
        return {
          message: ERROR_MESSAGES.RATE_LIMIT,
          status: HTTP_STATUS.TOO_MANY_REQUESTS,
        };
      case 400:
        return {
          message: ERROR_MESSAGES.BAD_REQUEST,
          status: HTTP_STATUS.BAD_REQUEST,
        };
      case 500:
      case 503:
        return {
          message: ERROR_MESSAGES.SERVER_ERROR,
          status: axiosError.response.status,
        };
      default:
        if (axiosError.code === 'ECONNABORTED') {
          return {
            message: ERROR_MESSAGES.TIMEOUT,
            status: 408,
          };
        }
        return {
          message: ERROR_MESSAGES.NETWORK_ERROR,
          status: 0,
        };
    }
  }

  return {
    message: 'Có lỗi xảy ra',
    status: 0,
    details: error,
  };
}
```

---

## 📦 File 4: app/api/history/search/route.ts

```typescript
// app/api/history/search/route.ts

import { searchPages } from '@/lib/wikipedia';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const limit = searchParams.get('limit') || '10';

  // Validate input
  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter is required' },
      { status: 400 }
    );
  }

  if (query.length > 100) {
    return NextResponse.json(
      { error: 'Query is too long (max 100 characters)' },
      { status: 400 }
    );
  }

  const limitNum = parseInt(limit);
  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    return NextResponse.json(
      { error: 'Limit must be between 1 and 100' },
      { status: 400 }
    );
  }

  try {
    const results = await searchPages(query, limitNum);

    return NextResponse.json(results, {
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Search failed';

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
```

---

## 📦 File 5: app/api/history/[title]/route.ts

```typescript
// app/api/history/[title]/route.ts

import { getArticle, getPageHistory } from '@/lib/wikipedia';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { title: string } }
) {
  const { title } = params;
  const action = request.nextUrl.searchParams.get('action') || 'article';

  if (!title) {
    return NextResponse.json(
      { error: 'Title is required' },
      { status: 400 }
    );
  }

  try {
    let data;

    if (action === 'history') {
      data = await getPageHistory(decodeURIComponent(title));
    } else {
      data = await getArticle(decodeURIComponent(title));
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to fetch article';

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
```

---

## 📦 File 6: components/HistorySearch.tsx

```typescript
// components/HistorySearch.tsx

'use client';

import { useState, useMemo } from 'react';
import useSWR from 'swr';
import { SearchResult } from '@/lib/types';
import ArticleCard from './ArticleCard';
import Loading from './Loading';

const fetcher = (url: string) =>
  fetch(url).then(r => {
    if (!r.ok) throw new Error('Failed to fetch');
    return r.json();
  });

export default function HistorySearch() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search
  useMemo(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 500);
    return () => clearTimeout(timer);
  }, [query]);

  const { data, isLoading, error } = useSWR<SearchResult[]>(
    debouncedQuery
      ? `/api/history/search?q=${encodeURIComponent(debouncedQuery)}&limit=10`
      : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000,
    }
  );

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-gray-900">
          📚 Lịch Sử Việt Nam
        </h1>
        <p className="text-gray-600 mb-6">
          Tìm kiếm và khám phá lịch sử phong phú của Việt Nam
        </p>
        <input
          type="text"
          placeholder="Tìm kiếm lịch sử Việt Nam (ví dụ: Triều Trần, Hô Chi Minh)..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
        />
      </div>

      {isLoading && <Loading />}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          ⚠️ Lỗi: {error.message}
        </div>
      )}

      {data && data.length === 0 && debouncedQuery && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-700">
          ℹ️ Không tìm thấy kết quả cho "{debouncedQuery}"
        </div>
      )}

      <div className="space-y-4">
        {data?.map(result => (
          <ArticleCard key={result.id} result={result} />
        ))}
      </div>
    </div>
  );
}
```

---

## 📦 File 7: components/ArticleCard.tsx

```typescript
// components/ArticleCard.tsx

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { SearchResult } from '@/lib/types';

export default function ArticleCard({ result }: { result: SearchResult }) {
  return (
    <Link href={`/history/${encodeURIComponent(result.title)}`}>
      <div className="block p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition cursor-pointer group">
        <div className="flex gap-4">
          {result.thumbnail?.url ? (
            <div className="relative w-20 h-20 flex-shrink-0 rounded overflow-hidden bg-gray-100">
              <Image
                src={result.thumbnail.url}
                alt={result.title}
                fill
                className="object-cover group-hover:scale-110 transition"
                sizes="80px"
              />
            </div>
          ) : (
            <div className="w-20 h-20 flex-shrink-0 rounded bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
              <span className="text-2xl">📖</span>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition line-clamp-2">
              {result.title}
            </h3>
            {result.description && (
              <p className="text-gray-500 text-sm mt-1">
                {result.description}
              </p>
            )}
            <p className="text-gray-600 text-sm mt-2 line-clamp-2">
              {result.excerpt}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
```

---

## 📦 File 8: components/Loading.tsx

```typescript
// components/Loading.tsx

export default function Loading() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div
          key={i}
          className="p-4 border-2 border-gray-200 rounded-lg animate-pulse"
        >
          <div className="flex gap-4">
            <div className="w-20 h-20 rounded bg-gray-200" />
            <div className="flex-1">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-full mb-2" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

## 📦 File 9: app/history/[title]/page.tsx

```typescript
// app/history/[title]/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { WikiArticle, WikiRevision } from '@/lib/types';

interface ArticlePageProps {
  params: { title: string };
}

export default function ArticlePage() {
  const params = useParams();
  const title = params.title as string;
  const [article, setArticle] = useState<WikiArticle | null>(null);
  const [revisions, setRevisions] = useState<WikiRevision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'article' | 'history'>('article');

  useEffect(() => {
    async function fetchArticle() {
      try {
        // Fetch article
        const articleRes = await fetch(
          `/api/history/${encodeURIComponent(title)}`
        );

        if (!articleRes.ok) {
          throw new Error('Article not found');
        }

        const articleData = await articleRes.json();
        setArticle(articleData);

        // Fetch history
        try {
          const historyRes = await fetch(
            `/api/history/${encodeURIComponent(title)}?action=history`
          );

          if (historyRes.ok) {
            const historyData = await historyRes.json();
            setRevisions(historyData);
          }
        } catch (historyError) {
          console.error('Failed to fetch history:', historyError);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchArticle();
  }, [title]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-3/4 mb-4" />
            <div className="h-6 bg-gray-200 rounded w-full mb-4" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
            <h2 className="text-xl font-bold mb-2">⚠️ Lỗi</h2>
            <p>{error}</p>
            <Link href="/" className="text-red-600 underline hover:no-underline mt-4 inline-block">
              ← Quay lại
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-blue-700">
            <h2 className="text-xl font-bold mb-2">ℹ️ Không Tìm Thấy</h2>
            <p>Bài viết này không tồn tại.</p>
            <Link href="/" className="text-blue-600 underline hover:no-underline mt-4 inline-block">
              ← Quay lại
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
          >
            ← Quay lại
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {article.title}
          </h1>
          <a
            href={article.source}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Xem trên Wikipedia →
          </a>
        </div>

        {/* Tabs */}
        <div className="mb-8 border-b-2 border-gray-200">
          <button
            onClick={() => setActiveTab('article')}
            className={`px-4 py-2 font-semibold transition ${
              activeTab === 'article'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📄 Bài Viết
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 font-semibold transition ${
              activeTab === 'history'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📜 Lịch Sửa ({revisions.length})
          </button>
        </div>

        {/* Content */}
        {activeTab === 'article' && (
          <article className="bg-white rounded-lg p-8 shadow-sm">
            <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
              {article.excerpt}
            </p>
          </article>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            {revisions.length === 0 ? (
              <p className="text-gray-600 text-center py-8">
                Không có dữ liệu lịch sửa
              </p>
            ) : (
              revisions.map(revision => (
                <div
                  key={revision.id}
                  className="bg-white rounded-lg p-4 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {revision.user.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(revision.timestamp).toLocaleString('vi-VN')}
                      </p>
                    </div>
                    <span className="text-sm text-gray-500">
                      +{Math.abs(revision.delta)} ký tự
                    </span>
                  </div>
                  <p className="text-gray-700">{revision.comment || '(Không có nội dung sửa)'}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </main>
  );
}
```

---

## 📦 File 10: app/page.tsx

```typescript
// app/page.tsx

import HistorySearch from '@/components/HistorySearch';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <HistorySearch />
    </main>
  );
}
```

---

## 📦 File 11: app/layout.tsx

```typescript
// app/layout.tsx

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Lịch Sử Việt Nam - Encyclopedia',
  description:
    'Tìm hiểu lịch sử Việt Nam qua Wikipedia. Triều đại, sự kiện, nhân vật lịch sử.',
  keywords: ['lịch sử Việt Nam', 'triều đại', 'sự kiện lịch sử', 'nhân vật'],
  authors: [{ name: 'History App' }],
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    title: 'Lịch Sử Việt Nam',
    description: 'Tìm hiểu lịch sử Việt Nam qua Wikipedia',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

---

## 📦 File 12: app/globals.css

```css
/* app/globals.css */

@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #ffffff;
  --foreground: #000000;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #000000;
    --foreground: #ffffff;
  }
}

body {
  color: var(--foreground);
  background: var(--background);
  font-family: Arial, Helvetica, sans-serif;
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 5px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}
```

---

## 📦 File 13: tsconfig.json

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

## 📦 File 14: tailwind.config.ts

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

## 📦 File 15: next.config.ts

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
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 2592000,
  },
  headers: async () => [
    {
      source: '/api/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=3600, s-maxage=3600',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
      ],
    },
  ],
}

export default nextConfig
```

---

## 📦 File 16: .env.local

```bash
# .env.local - Wikipedia API Configuration
NEXT_PUBLIC_WIKI_API_BASE=https://api.wikimedia.org/core/v1/wikipedia
WIKI_LANGUAGE=vi
WIKI_USER_AGENT=HistoryApp (contact@your-email.com)
NEXT_PUBLIC_CACHE_TTL=86400
```

---

## 🚀 Cách Sử Dụng

### Bước 1: Copy Toàn Bộ File

Copy các file trên vào project của bạn theo cấu trúc folder được chỉ định.

### Bước 2: Install Dependencies

```bash
npm install
```

### Bước 3: Setup Environment

```bash
# .env.local
NEXT_PUBLIC_WIKI_API_BASE=https://api.wikimedia.org/core/v1/wikipedia
WIKI_LANGUAGE=vi
WIKI_USER_AGENT=HistoryApp (your-email@example.com)
NEXT_PUBLIC_CACHE_TTL=86400
```

### Bước 4: Run Development Server

```bash
npm run dev
```

### Bước 5: Truy Cập

```
http://localhost:3000
```

---

## ✅ Checklist

- [ ] Copy tất cả 16 files
- [ ] Cài dependencies: `npm install`
- [ ] Setup `.env.local`
- [ ] Run `npm run dev`
- [ ] Test search functionality
- [ ] Test article detail page
- [ ] Check console for errors
- [ ] Build production: `npm run build`
- [ ] Deploy to Vercel

---

**File 03-CODE-COMPLETE.md hoàn chỉnh! 🎉**