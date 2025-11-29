/**
 * Wikipedia Service - Frontend
 * Communicates with backend API to fetch Wikipedia data
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export async function getWikipediaPageSummary(title, language = 'vi') {
  if (!title || !title.trim()) {
    return { error: true, errorCode: 'INVALID_TITLE' };
  }

  // Try fetching with exact title first
  let response = await _fetchWikipediaArticle(title, language);

  // If not found (404), try alternative keywords
  if (!response.success && response.statusCode === 404) {
    // Extract keywords from title (split by –, /, •, etc.)
    const keywords = title
      .split(/[–/•\-\|]/g)
      .map(k => k.trim())
      .filter(k => k.length > 0);

    // Try each keyword
    for (const keyword of keywords) {
      if (keyword !== title) { // Don't retry exact title
        response = await _fetchWikipediaArticle(keyword, language);
        if (response.success) break;
      }
    }
  }

  // Remove internal success flag before returning
  const { success, ...result } = response;
  return result;
}

async function _fetchWikipediaArticle(title, language = 'vi') {
  try {
    const response = await fetch(
      `${API_BASE_URL}/wikipedia/${encodeURIComponent(title)}?language=${language}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(15000)
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: true,
        errorCode: errorData.error || 'UNKNOWN',
        message: errorData.message || 'Lỗi khi tải dữ liệu từ Wikipedia',
        statusCode: response.status,
        fromCache: false
      };
    }

    const data = await response.json();
    return { success: true, error: false, ...data };
  } catch (error) {
    if (error.name === 'AbortError') {
      return {
        success: false,
        error: true,
        errorCode: 'TIMEOUT',
        fromCache: false
      };
    }

    return {
      success: false,
      error: true,
      errorCode: 'NETWORK_ERROR',
      message: 'Không thể kết nối đến máy chủ',
      fromCache: false
    };
  }
}

export function formatWikipediaData(data) {
  if (!data || data.error) {
    return null;
  }

  return {
    title: data.title || '',
    description: data.description || '',
    extract: data.extract || '',
    thumbnail: data.thumbnail || null,
    originalImage: data.originalImage || null,
    url: data.url || null,
    language: data.language || 'vi',
    fromCache: data.fromCache || false
  };
}

export async function searchWikipedia(query, limit = 10, language = 'vi') {
  if (!query || !query.trim()) {
    return { error: true, errorCode: 'INVALID_QUERY', pages: [] };
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/wikipedia/search/${encodeURIComponent(query)}?limit=${limit}&language=${language}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(15000)
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { error: true, errorCode: errorData.error || 'UNKNOWN', pages: [] };
    }

    const data = await response.json();
    return {
      error: false,
      query: data.query || query,
      pages: data.pages || [],
      fromCache: data.fromCache || false
    };
  } catch (error) {
    return {
      error: true,
      errorCode: error.name === 'AbortError' ? 'TIMEOUT' : 'NETWORK_ERROR',
      pages: []
    };
  }
}

export async function getCacheStats() {
  try {
    const response = await fetch('/api/cache/stats');
    if (!response.ok) throw new Error('Failed to fetch cache stats');
    return await response.json();
  } catch (error) {
    console.error('Cache stats error:', error);
    return null;
  }
}

export async function clearCache() {
  try {
    const response = await fetch('/api/cache/clear', {
      method: 'POST'
    });
    if (!response.ok) throw new Error('Failed to clear cache');
    return await response.json();
  } catch (error) {
    console.error('Clear cache error:', error);
    return null;
  }
}
