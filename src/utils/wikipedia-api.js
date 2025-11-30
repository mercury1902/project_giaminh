/**
 * Wikipedia API utility functions for fallback mechanism
 * Used when backend API is unavailable or rate limited
 */

// Vietnamese text normalization
function normalizeVietnameseText(text) {
  return text.normalize('NFD')
             .replace(/[\u0300-\u036f]/g, '')  // Remove combining diacritics
             .replace(/đ/g, 'd')
             .replace(/Đ/g, 'D')
             .trim();
}

// Generate fallback search strategies for Vietnamese content
function generateFallbackStrategies(query) {
  const strategies = [];

  // Strategy 1: Original query with diacritics
  strategies.push({
    name: 'original',
    query: query.trim(),
    priority: 1
  });

  // Strategy 2: Normalized query without diacritics
  const normalized = normalizeVietnameseText(query);
  if (normalized !== query.trim()) {
    strategies.push({
      name: 'normalized',
      query: normalized,
      priority: 2
    });
  }

  // Strategy 3: Key historical terms extraction
  const historicalTerms = [
    'Hùng Vương', 'An Dương Vương', 'Hai Bà Trưng', 'Lý Bí', 'Triệu Thị Trinh',
    'Ngô Quyền', 'Đinh Bộ Lĩnh', 'Lê Hoàn', 'Lý Thái Tổ', 'Lý Thường Kiệt',
    'Trần Hưng Đạo', 'Lê Lợi', 'Quang Trung', 'Nguyễn Huệ', 'Hồ Chí Minh',
    'Cổ Loa', 'Bạch Đằng', 'Thăng Long', 'Hà Nội', 'Huế', 'Đại La', 'Đại Việt',
    'Văn Lang', 'Âu Lạc', 'Nam Việt', 'Lý Nam Đế', 'Vạn Xuân', 'Nhà Ngô',
    'Nhà Đinh', 'Nhà Tiền Lê', 'Nhà Lý', 'Nhà Trần', 'Nhà Hồ', 'Nhà Hậu Lê',
    'Nhà Mạc', 'Nhà Tây Sơn', 'Nhà Nguyễn'
  ];

  const lowerQuery = query.toLowerCase();
  const foundKeywords = historicalTerms.filter(term =>
    lowerQuery.includes(term.toLowerCase())
  );

  if (foundKeywords.length > 0) {
    strategies.push({
      name: 'keywords',
      query: foundKeywords.join(' '),
      priority: 3
    });
  }

  return strategies.sort((a, b) => a.priority - b.priority);
}

// Direct Wikipedia API search using opensearch endpoint
async function searchWikipediaDirect(query, limit = 5, language = 'vi') {
  try {
    const baseUrl = `https://${language}.wikipedia.org/w/api.php`;
    const params = new URLSearchParams({
      action: 'opensearch',
      search: query,
      limit: limit.toString(),
      format: 'json',
      namespace: '0', // Main namespace only
      utf8: '1',
      origin: '*'
    });

    const response = await fetch(`${baseUrl}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'HistoryTimelineApp/1.0 (Vietnamese History Timeline)'
      }
    });

    if (!response.ok) {
      throw new Error(`Wikipedia API error: ${response.status}`);
    }

    const data = await response.json();

    // Handle opensearch format: [query, [titles], [descriptions], [urls]]
    const searchResults = {
      query: data && data[0] || query,
      titles: data && Array.isArray(data[1]) ? data[1] : [],
      descriptions: data && Array.isArray(data[2]) ? data[2] : [],
      urls: data && Array.isArray(data[3]) ? data[3] : []
    };

    const pages = searchResults.titles.map((title, index) => ({
      id: null,
      title: title || '',
      description: searchResults.descriptions[index] || '',
      thumbnail: null,
      url: searchResults.urls[index] || `https://vi.wikipedia.org/wiki/${encodeURIComponent(title || '')}`
    }));

    return {
      query,
      pages,
      language,
      found: pages.length > 0,
      fromFallback: true
    };

  } catch (error) {
    console.error('Direct Wikipedia search failed:', error);
    return {
      query,
      pages: [],
      language,
      found: false,
      error: error.message,
      fromFallback: true
    };
  }
}

// Enhanced fallback search with multiple strategies
export async function searchWikipediaWithFallback(query, limit = 5, language = 'vi') {
  const strategies = generateFallbackStrategies(query);

  for (const strategy of strategies) {
    try {
      console.log(`Trying fallback strategy: ${strategy.name} with query: "${strategy.query}"`);
      const result = await searchWikipediaDirect(strategy.query, limit, language);

      if (result.found && result.pages.length > 0) {
        return {
          ...result,
          strategy: strategy.name,
          originalQuery: query,
          message: `Tìm thấy ${result.pages.length} kết quả (${strategy.name})`
        };
      }
    } catch (error) {
      console.log(`Fallback strategy ${strategy.name} failed:`, error.message);
      continue;
    }
  }

  // If all strategies fail, return empty result
  return {
    query,
    pages: [],
    language,
    found: false,
    strategy: 'none',
    originalQuery: query,
    message: 'Không tìm thấy bài viết Wikipedia phù hợp',
    fromFallback: true
  };
}

// Enhanced fetch with backend fallback
export async function fetchWithBackendFallback(query, apiBaseUrl = '/api', limit = 5, language = 'vi') {
  try {
    // Try backend first
    const backendUrl = `${apiBaseUrl}/history/search?q=${encodeURIComponent(query)}&limit=${limit}&language=${language}`;
    console.log('Fetching from backend:', backendUrl);
    const response = await fetch(backendUrl);

    if (response.ok) {
      const data = await response.json();
      console.log('Backend search successful:', data);
      return { ...data, fromBackend: true };
    }

    // If backend returns error, log it and try fallback
    const errorData = await response.json().catch(() => ({}));
    console.warn(`Backend error: ${response.status}`, errorData);
    throw new Error(`Backend error: ${response.status} - ${errorData.message || 'Unknown error'}`);

  } catch (backendError) {
    console.warn('Backend search failed, trying direct Wikipedia API:', backendError.message);

    // Fallback to direct Wikipedia API
    const fallbackResult = await searchWikipediaWithFallback(query, limit, language);
    return fallbackResult;
  }
}

// Utility function to extract Vietnamese historical keywords
export function extractVietnameseHistoricalKeywords(text) {
  const historicalTerms = [
    // Historical figures
    'Hùng Vương', 'An Dương Vương', 'Hai Bà Trưng', 'Lý Bí', 'Triệu Thị Trinh',
    'Ngô Quyền', 'Đinh Bộ Lĩnh', 'Lê Hoàn', 'Lý Thái Tổ', 'Lý Thường Kiệt',
    'Trần Hưng Đạo', 'Lê Lợi', 'Quang Trung', 'Nguyễn Huệ', 'Hồ Chí Minh',

    // Events and concepts
    'chiến thắng', 'thống nhất', 'dời đô', 'kháng chiến', 'độc lập',
    'chống giặc ngoại xâm', 'Bạch Đằng', 'Cổ Loa', 'Thăng Long'
  ];

  const lowerText = text.toLowerCase();
  return historicalTerms.filter(term => lowerText.includes(term.toLowerCase()));
}