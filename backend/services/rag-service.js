/**
 * RAG Service for Gemini Chatbot
 * Prepares context from static events + dynamic Wikipedia summaries
 * KISS: Filter events by query keywords, top-3 wiki search summaries
 */

import { wikipediaService } from './wikipedia-service.js';
import { LRUCache } from 'lru-cache';

const ragCache = new LRUCache({ max: 100, ttl: 5 * 60 * 1000 }); // 5min TTL

const EVENTS = [
  { id: 'hb-2879', year: -2879, title: 'Truyền thuyết Hồng Bàng – Văn Lang', dynasty: 'Hồng Bàng', period: 'Cổ đại', description: 'Thời kỳ dựng nước theo truyền thuyết, hình thành nhà nước Văn Lang của các vua Hùng.', details: '' },
  { id: 'ngo-939', year: 939, title: 'Ngô Quyền chiến thắng Bạch Đằng', dynasty: 'Ngô', period: 'Phong kiến', description: 'Đánh bại quân Nam Hán trên sông Bạch Đằng, mở ra thời kỳ độc lập tự chủ.', details: '' },
  { id: 'dinh-968', year: 968, title: 'Đinh Bộ Lĩnh thống nhất đất nước', dynasty: 'Đinh', period: 'Phong kiến', description: 'Lập nước Đại Cồ Việt, chấm dứt loạn 12 sứ quân.', details: '' },
  { id: 'ly-1010', year: 1010, title: 'Lý Thái Tổ dời đô ra Thăng Long', dynasty: 'Lý', period: 'Phong kiến', description: 'Ban Chiếu dời đô, đặt nền móng phát triển lâu dài cho quốc gia.', details: '' },
  { id: 'tran-1288', year: 1288, title: 'Chiến thắng Bạch Đằng (Trần Hưng Đạo)', dynasty: 'Trần', period: 'Phong kiến', description: 'Đại thắng quân Nguyên Mông lần thứ ba, bảo vệ độc lập dân tộc.', details: '' },
  { id: 'hau-le-1428', year: 1428, title: 'Khởi nghĩa Lam Sơn thắng lợi', dynasty: 'Hậu Lê', period: 'Phong kiến', description: 'Lê Lợi lên ngôi, lập triều Hậu Lê sau chiến thắng quân Minh.', details: '' },
  { id: 'tay-son-1789', year: 1789, title: 'Quang Trung đại phá quân Thanh', dynasty: 'Tây Sơn', period: 'Phong kiến', description: 'Trận Ngọc Hồi – Đống Đa vang dội, giữ vững độc lập.', details: '' },
  { id: 'nguyen-1802', year: 1802, title: 'Gia Long thống nhất, lập triều Nguyễn', dynasty: 'Nguyễn', period: 'Phong kiến', description: 'Quốc gia thống nhất sau nội chiến, bắt đầu thời Nguyễn.', details: '' },
  { id: 'fr-1858', year: 1858, title: 'Pháp nổ súng xâm lược Đà Nẵng', dynasty: 'Nguyễn', period: 'Cận đại', description: 'Mở đầu thời kỳ thực dân Pháp xâm lược Việt Nam.', details: '' },
  { id: 'au-1930', year: 1930, title: 'Thành lập Đảng Cộng sản Việt Nam', dynasty: '', period: 'Cận đại', description: 'Đánh dấu bước ngoặt trong phong trào cách mạng giải phóng dân tộc.', details: '' },
  { id: 'aug-1945', year: 1945, title: 'Cách mạng tháng Tám', dynasty: '', period: 'Hiện đại', description: 'Giành chính quyền trong cả nước, khai sinh nước Việt Nam Dân chủ Cộng hòa.', details: '' },
  { id: 'bd-1954', year: 1954, title: 'Chiến thắng Điện Biên Phủ', dynasty: '', period: 'Hiện đại', description: 'Kết thúc thắng lợi cuộc kháng chiến chống Pháp, ký Hiệp định Genève.', details: '' },
  { id: 'tet-1968', year: 1968, title: 'Tổng tiến công và nổi dậy Tết Mậu Thân', dynasty: '', period: 'Hiện đại', description: 'Bước ngoặt chiến lược trong cuộc kháng chiến chống Mỹ.', details: '' },
  { id: 'reunify-1975', year: 1975, title: 'Giải phóng miền Nam, thống nhất đất nước', dynasty: '', period: 'Hiện đại', description: 'Chiến dịch Hồ Chí Minh toàn thắng, đất nước thống nhất.', details: '' },
  { id: 'doi-moi-1986', year: 1986, title: 'Khởi xướng Đổi mới', dynasty: '', period: 'Hiện đại', description: 'Chuyển đổi mô hình kinh tế, mở cửa và hội nhập quốc tế.', details: '' },
  { id: 'modern-1990', year: 1990, title: '1990 - Nay: Hội nhập và phát triển', dynasty: '', period: 'Hiện đại', description: 'Giai đoạn hội nhập quốc tế sâu rộng, phát triển kinh tế thị trường định hướng xã hội chủ nghĩa, và nâng cao vị thế Việt Nam trên trường quốc tế.', details: '' }
];

// Utility: Extract Vietnamese keywords
function extractKeywords(query) {
  // Split by spaces, filter stop words, return meaningful terms
  const stopWords = new Set(['là', 'của', 'được', 'có', 'với', 'vào', 'để', 'trong', 'tại', 'từ', 'và', 'hoặc']);
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w));
}

// Utility: Remove Vietnamese diacritics
function removeDiacritics(text) {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

// Strategy 1: Direct Wikipedia search (exact query)
async function searchStrategy1_PrimarySearch(query) {
  try {
    return await wikipediaService.search(query, 3);
  } catch (error) {
    console.warn(`Strategy 1 (primary) failed for "${query}":`, error.message);
    return null;
  }
}

// Strategy 2: Keyword-based search
async function searchStrategy2_KeywordSearch(query) {
  const keywords = extractKeywords(query);
  if (keywords.length === 0) return null;

  // Limit keyword search to first 3 keywords to prevent excessive API calls
  const keywordsToSearch = keywords.slice(0, 3);

  for (const keyword of keywordsToSearch) {
    try {
      const results = await wikipediaService.search(keyword, 3);
      if (results?.pages?.length > 0) {
        console.log(`Strategy 2 (keyword) succeeded with keyword "${keyword}"`);
        return results;
      }
    } catch (error) {
      console.warn(`Strategy 2: search for keyword "${keyword}" failed:`, error.message);
    }
  }
  return null;
}

// Strategy 3: Simplified search (remove Vietnamese diacritics)
async function searchStrategy3_SimplifiedSearch(query) {
  try {
    const simplified = removeDiacritics(query);
    if (simplified === query) return null; // No diacritics to remove
    const results = await wikipediaService.search(simplified, 3);
    if (results?.pages?.length > 0) {
      console.log(`Strategy 3 (simplified) succeeded: "${query}" → "${simplified}"`);
    }
    return results;
  } catch (error) {
    console.warn(`Strategy 3 (simplified) failed for "${query}":`, error.message);
    return null;
  }
}

// Multi-tier search orchestrator with timeout guard (max 2.5s total)
async function searchWikipediaMultiTier(query) {
  const TIMEOUT_MS = 2500; // 2.5s max for all strategies (leaves 0.5s buffer)
  const startTime = Date.now();

  const getTimeRemaining = () => Math.max(0, TIMEOUT_MS - (Date.now() - startTime));

  try {
    // Strategy 1: Primary (exact query)
    if (getTimeRemaining() > 0) {
      let results = await Promise.race([
        searchStrategy1_PrimarySearch(query),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Strategy 1 timeout')), getTimeRemaining())
        )
      ]).catch(() => null);

      if (results?.pages?.length > 0) {
        return { results, strategy: 1, reason: 'Primary search' };
      }
    }

    // Strategy 2: Keyword-based
    if (getTimeRemaining() > 0) {
      let results = await Promise.race([
        searchStrategy2_KeywordSearch(query),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Strategy 2 timeout')), getTimeRemaining())
        )
      ]).catch(() => null);

      if (results?.pages?.length > 0) {
        return { results, strategy: 2, reason: 'Keyword extraction' };
      }
    }

    // Strategy 3: Simplified (no diacritics)
    if (getTimeRemaining() > 0) {
      let results = await Promise.race([
        searchStrategy3_SimplifiedSearch(query),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Strategy 3 timeout')), getTimeRemaining())
        )
      ]).catch(() => null);

      if (results?.pages?.length > 0) {
        return { results, strategy: 3, reason: 'Diacritics removed' };
      }
    }

    return { results: null, strategy: 0, reason: 'All strategies failed or timed out' };
  } catch (error) {
    console.warn(`searchWikipediaMultiTier error after ${Date.now() - startTime}ms:`, error.message);
    return { results: null, strategy: 0, reason: `Error: ${error.message}` };
  }
}

function clearRAGCache() {
  ragCache.clear();
}

async function getRAGContext(query) {
  const lowerQuery = query.toLowerCase();
  const cacheKey = `rag:${lowerQuery}`;
  if (ragCache.has(cacheKey)) {
    return ragCache.get(cacheKey);
  }

  try {
    // 1. Get static event context
    const relevantEvents = EVENTS
      .filter(event =>
        event.title.toLowerCase().includes(lowerQuery) ||
        event.description.toLowerCase().includes(lowerQuery) ||
        event.dynasty.toLowerCase().includes(lowerQuery) ||
        event.period.toLowerCase().includes(lowerQuery)
      )
      .slice(0, 5)
      .map(event =>
        `• ${event.year}: ${event.title} (${event.dynasty || 'Không'}, ${event.period}): ${event.description}`
      )
      .join('\n');

    // 2. Try Wikipedia with multi-tier fallback
    const wikiSearch = await searchWikipediaMultiTier(query);

    let wikiContext = '';
    let wikiMetadata = { success: false, strategy: 0 };

    if (wikiSearch.results?.pages?.length > 0) {
      const summaries = await Promise.all(
        wikiSearch.results.pages
          .slice(0, 3)
          .map(page =>
            wikipediaService.getSummary(page.title)
              .catch(err => {
                console.warn(`Summary failed for ${page.title}:`, err.message);
                return null;
              })
          )
      );

      const validSummaries = summaries.filter(s => s);
      if (validSummaries.length > 0) {
        wikiContext = validSummaries
          .map(s => `• ${s.title}: ${s.description || s.extract?.substring(0, 200) || ''}`)
          .join('\n');
        wikiMetadata = {
          success: true,
          strategy: wikiSearch.strategy,
          articles: validSummaries.length,
          reason: wikiSearch.reason
        };
      }
    } else {
      console.warn(`Wiki RAG failed: ${wikiSearch.reason}`);
    }

    // 3. Build context
    const context = `Sự kiện liên quan từ dữ liệu lịch sử Việt Nam:\n${relevantEvents || 'Không tìm thấy sự kiện phù hợp.'}\n\nThông tin Wikipedia liên quan:\n${wikiContext || 'Không tìm thấy thông tin Wikipedia phù hợp.'}`;

    // 4. Cache with metadata
    const contextWithMeta = {
      content: context,
      meta: wikiMetadata
    };
    ragCache.set(cacheKey, contextWithMeta);
    return contextWithMeta;
  } catch (error) {
    console.error('RAG Context Error:', error);
    return {
      content: 'Không thể chuẩn bị ngữ cảnh. Vui lòng thử lại.',
      meta: { success: false, strategy: 0, error: error.message }
    };
  }
}

export { getRAGContext, clearRAGCache };
