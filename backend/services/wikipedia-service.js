import fetch from 'node-fetch';

// Simple LRU cache implementation
class LRUCache {
  constructor(maxSize = 100, ttl = 60 * 60 * 1000) { // 1 hour TTL
    this.maxSize = maxSize;
    this.ttl = ttl;
    this.cache = new Map();
    this.timestamps = new Map();
    this.hits = 0;
    this.misses = 0;
  }

  get(key) {
    if (!this.cache.has(key)) {
      this.misses++;
      return null;
    }

    const timestamp = this.timestamps.get(key);
    if (Date.now() - timestamp > this.ttl) {
      this.cache.delete(key);
      this.timestamps.delete(key);
      this.misses++;
      return null;
    }

    // Move to end (most recently used)
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);
    this.timestamps.delete(key);
    this.timestamps.set(key, Date.now());
    this.hits++;
    return value;
  }

  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
      this.timestamps.delete(key);
    }

    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
      this.timestamps.delete(firstKey);
    }

    this.cache.set(key, value);
    this.timestamps.set(key, Date.now());
  }

  clear() {
    this.cache.clear();
    this.timestamps.clear();
    this.hits = 0;
    this.misses = 0;
  }

  stats() {
    const total = this.hits + this.misses;
    const hitRate = total === 0 ? 0 : ((this.hits / total) * 100).toFixed(2);
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hits: this.hits,
      misses: this.misses,
      hitRate: `${hitRate}%`,
      ttlMs: this.ttl
    };
  }
}

class WikipediaService {
  constructor() {
    this.cache = new LRUCache();
    this.baseUrl = 'https://vi.wikipedia.org/api/rest_v1';
    this.maxRetries = 3;
    this.timeout = 10000; // 10 seconds
  }

  async getSummary(title, language = 'vi') {
    const cacheKey = `summary:${language}:${title}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return { ...cached, fromCache: true };
    }

    try {
      const baseUrl = language === 'vi'
        ? 'https://vi.wikipedia.org/api/rest_v1'
        : `https://${language}.wikipedia.org/api/rest_v1`;

      const url = `${baseUrl}/page/summary/${encodeURIComponent(title)}`;
      const data = await this._fetchWithRetry(url);

      // Extract relevant fields
      const summary = {
        title: data.title,
        description: data.description || '',
        extract: data.extract || '',
        thumbnail: data.thumbnail || null,
        originalImage: data.originalimage || null,
        url: data.content_urls?.desktop?.page || null,
        language
      };

      this.cache.set(cacheKey, summary);
      return { ...summary, fromCache: false };
    } catch (error) {
      this._handleError(error);
    }
  }

  async search(query, limit = 10, language = 'vi') {
    const cacheKey = `search:${language}:${query}:${limit}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return { ...cached, fromCache: true };
    }

    try {
      const baseUrl = language === 'vi'
        ? 'https://vi.wikipedia.org/api/rest_v1'
        : `https://${language}.wikipedia.org/api/rest_v1`;

      const url = `${baseUrl}/search/page?q=${encodeURIComponent(query)}&limit=${limit}`;
      const data = await this._fetchWithRetry(url);

      const results = {
        query,
        pages: (data.pages || []).map(page => ({
          id: page.id,
          title: page.title,
          description: page.description || '',
          thumbnail: page.thumbnail || null,
          url: page.content_urls?.desktop?.page || null
        })),
        language
      };

      this.cache.set(cacheKey, results);
      return { ...results, fromCache: false };
    } catch (error) {
      this._handleError(error);
    }
  }

  async _fetchWithRetry(url, retries = 0) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'HistoryTimelineApp/1.0 (Vietnamese History Timeline)',
          'Accept': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.status === 404) {
        const error = new Error('Bài viết không tìm thấy');
        error.type = 'WIKIPEDIA_ERROR';
        error.code = 'NOT_FOUND';
        error.statusCode = 404;
        throw error;
      }

      if (response.status === 429) {
        if (retries < this.maxRetries) {
          const backoff = Math.pow(2, retries) * 1000;
          await new Promise(resolve => setTimeout(resolve, backoff));
          return this._fetchWithRetry(url, retries + 1);
        }
        const error = new Error('Quá nhiều yêu cầu. Vui lòng thử lại sau.');
        error.type = 'WIKIPEDIA_ERROR';
        error.code = 'RATE_LIMIT';
        error.statusCode = 429;
        throw error;
      }

      if (!response.ok) {
        const error = new Error(`Lỗi Wikipedia API: ${response.status}`);
        error.type = 'WIKIPEDIA_ERROR';
        error.statusCode = response.status;
        throw error;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (retries < this.maxRetries && error.code !== 'NOT_FOUND') {
        const backoff = Math.pow(2, retries) * 1000;
        await new Promise(resolve => setTimeout(resolve, backoff));
        return this._fetchWithRetry(url, retries + 1);
      }
      throw error;
    }
  }

  _handleError(error) {
    console.error('Wikipedia Service Error:', error.message);

    if (error.type === 'WIKIPEDIA_ERROR') {
      throw error;
    }

    // Network timeout
    if (error.name === 'AbortError') {
      const timeoutError = new Error('Hết thời gian chờ kết nối Wikipedia');
      timeoutError.type = 'WIKIPEDIA_ERROR';
      timeoutError.code = 'TIMEOUT';
      timeoutError.statusCode = 504;
      throw timeoutError;
    }

    // Network error
    const networkError = new Error('Lỗi kết nối mạng');
    networkError.type = 'WIKIPEDIA_ERROR';
    networkError.code = 'NETWORK_ERROR';
    networkError.statusCode = 503;
    throw networkError;
  }

  getCacheStats() {
    return this.cache.stats();
  }

  clearCache() {
    this.cache.clear();
  }
}

export const wikipediaService = new WikipediaService();
