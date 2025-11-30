/**
 * Vercel Serverless Function: Wikipedia History Search
 * Endpoint: /api/history/search?q=query&limit=5&language=vi
 */

// Vietnamese text normalization
function normalizeVietnameseText(text) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[Đđ]/g, 'd')
    .toLowerCase()
    .trim();
}

// Extract keywords from query
function extractKeywords(query) {
  const stopWords = new Set(['là', 'của', 'được', 'có', 'với', 'vào', 'để', 'trong', 'tại', 'từ', 'và', 'hoặc']);
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w));
}

// Search Wikipedia with timeout (for multiple results)
async function searchWikipedia(query, language = 'vi', limit = 5, timeout = 8000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const endpoint = language === 'vi' ? 'https://vi.wikipedia.org' : 'https://en.wikipedia.org';
    const searchUrl = `${endpoint}/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&utf8=&srlimit=${limit}&srprop=snippet|titlesnippet|size|wordcount|timestamp|redirecttitle&origin=*`;

    const response = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'LichSuVietNam/1.0',
        'Accept-Language': `${language},vi;q=0.9,en;q=0.8`,
        'Accept': 'application/json'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Wikipedia API error: ${response.status}`);
    }

    const data = await response.json();
    const searchResults = data.query?.search || [];

    // Process results one by one to avoid timeout issues
    const detailedResults = [];
    for (let i = 0; i < Math.min(searchResults.length, limit); i++) {
      const result = searchResults[i];

      try {
        // Try to get detailed summary
        const summaryUrl = `${endpoint}/api/rest_v1/page/summary/${encodeURIComponent(result.title)}?redirect=true&origin=*`;
        const summaryResponse = await fetch(summaryUrl, {
          headers: {
            'User-Agent': 'LichSuVietNam/1.0',
            'Accept-Language': `${language},vi;q=0.9,en;q=0.8`,
          }
        });

        if (summaryResponse.ok) {
          const summaryData = await summaryResponse.json();
          detailedResults.push({
            success: true,
            title: summaryData.title || result.title,
            description: summaryData.description || '',
            extract: summaryData.extract || '',
            thumbnail: summaryData.thumbnail?.source || null,
            url: summaryData.content_urls?.desktop?.page || `${endpoint}/wiki/${encodeURIComponent(result.title)}`,
            language
          });
        } else {
          // Fallback to basic info
          detailedResults.push({
            success: true,
            title: result.title,
            description: '',
            extract: result.snippet?.replace(/<[^>]*>/g, '') || '',
            thumbnail: null,
            url: `${endpoint}/wiki/${encodeURIComponent(result.title)}`,
            language
          });
        }
      } catch (error) {
        // Always add fallback result even if summary fails
        detailedResults.push({
          success: true,
          title: result.title,
          description: '',
          extract: result.snippet?.replace(/<[^>]*>/g, '') || '',
          thumbnail: null,
          url: `${endpoint}/wiki/${encodeURIComponent(result.title)}`,
          language
        });
      }
    }

    return detailedResults.filter(result => result.success);
  } catch (error) {
    if (error.name === 'AbortError') {
      return [];
    }
    console.error('Wikipedia search error:', error);
    return [];
  }
}

// Multi-strategy search (simplified version)
async function searchMultiStrategy(query, language = 'vi', limit = 5) {
  // Strategy 1: Exact query
  let result = await searchWikipedia(query, language, limit);
  if (result.length > 0) {
    return { pages: result, strategy: 'exact' };
  }

  // Strategy 2: First keyword
  const keywords = extractKeywords(query);
  if (keywords.length > 0) {
    result = await searchWikipedia(keywords[0], language, limit);
    if (result.length > 0) {
      return { pages: result, strategy: 'keyword' };
    }
  }

  // Strategy 3: Normalized query (remove diacritics)
  const normalized = normalizeVietnameseText(query);
  if (normalized !== query.toLowerCase()) {
    result = await searchWikipedia(normalized, language, limit);
    if (result.length > 0) {
      return { pages: result, strategy: 'normalized' };
    }
  }

  return { pages: [], strategy: 'failed' };
}

// Main handler
export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200)
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type')
      .end();
  }

  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'METHOD_NOT_ALLOWED',
      message: 'Only GET requests allowed'
    });
  }

  try {
    const { q: query, limit = '5', language = 'vi' } = req.query;

    // Validate query
    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        error: 'INVALID_QUERY',
        message: 'Truy vấn tìm kiếm không được để trống'
      });
    }

    // Search Wikipedia
    const limitNum = parseInt(limit) || 5;
    const searchResult = await searchMultiStrategy(query, language, limitNum);

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Content-Type', 'application/json');

    // Return results
    return res.status(200).json({
      query,
      pages: searchResult.pages.slice(0, limitNum),
      found: searchResult.pages.length > 0,
      strategy: searchResult.strategy,
      language,
      totalFound: searchResult.pages.length,
      limit: limitNum
    });

  } catch (error) {
    console.error('Search error:', error);

    // Set CORS headers even on error
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    return res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Lỗi khi tìm kiếm Wikipedia'
    });
  }
}
