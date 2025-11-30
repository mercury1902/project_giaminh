/**
 * Wikipedia Service - Frontend
 * Enhanced fallback mechanism for Vietnamese historical events
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Event-specific keyword mapping for Vietnamese history
const EVENT_KEYWORD_MAPPING = {
  'hb-2879': 'Hồng Bàng',
  'ngo-939': 'Ngô Quyền',
  'dinh-968': 'Đinh Bộ Lĩnh',
  'ly-1010': 'Lý Thái Tổ',
  'tran-1288': 'Trần Hưng Đạo',
  'hau-le-1428': 'Lê Lợi',
  'tay-son-1789': 'Quang Trung',
  'nguyen-1802': 'Nguyễn',
  'fr-1858': 'Pháp',
  'au-1930': 'Thành lập Đảng Cộng sản',
  'bd-1954': 'Chiến thắng Điện Biên Phủ',
  'tet-1968': 'Tết Mậu Thân 1968',
  'reunify-1975': 'Giải phóng miền Nam, thống nhất đất nước',
  'doi-moi-1986': 'Đổi mới',
  'modern-1990': '1990 - Nay: Hội nhập và phát triển'
};

// Enhanced keyword extraction with event-specific mapping
export async function getVietnameseHistoricalEventKeywords(title) {
  const keywords = [];

  // Check if title matches any event mapping
  for (const [eventId, primaryKeyword] of Object.entries(EVENT_KEYWORD_MAPPING)) {
    if (title.includes(primaryKeyword)) {
      return [primaryKeyword]; // Direct match for this event
    }
  }

  // Enhanced keyword extraction for complex titles
  const extractedKeywords = title
    .split(/[–/•\-\|]/g)
    .map(k => k.trim())
    .filter(k => k.length > 2); // Filter very short terms

  // Add event-specific keywords if no direct match
  for (const [eventId, keyword] of Object.entries(EVENT_KEYWORD_MAPPING)) {
    if (title.includes(keyword)) {
      keywords.push(keyword);
    }
  }

  // Remove duplicates and prioritize
  const uniqueKeywords = [...new Set([...extractedKeywords, ...keywords])];

  return uniqueKeywords;
}

export async function getWikipediaPageSummary(title, language = 'vi') {
  if (!title || !title.trim()) {
    return { error: true, errorCode: 'INVALID_TITLE' };
  }

  // Smart keyword extraction and testing
  const keywords = getVietnameseHistoricalEventKeywords(title);

  // Try each keyword in order of relevance
  for (const keyword of keywords) {
    if (keyword !== title && keyword.length > 0) {
      const response = await _fetchWikipediaArticle(keyword, language);
      if (response.success) {
        // Remove internal success flag before returning
        const { success, ...result } = response;
        return result;
      }
    }
  }

  // Remove internal success flag before returning
  return {
    error: true,
    errorCode: 'NOT_FOUND',
    message: 'Bài viết không tìm thấy',
    statusCode: 404
  };
}

async function _fetchWikipediaArticle(title, language = 'vi') {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/wikipedia/${encodeURIComponent(title)}?language=${language}`,
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
    // Use enhanced search for Vietnamese historical content
    const endpoint = (language === 'vi') ? 'search-enhanced' : 'search';
    const response = await fetch(
      `${API_BASE_URL}/api/wikipedia/${endpoint}/${encodeURIComponent(query)}?limit=${limit}&language=${language}`,
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