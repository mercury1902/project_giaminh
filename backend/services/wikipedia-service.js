import { NodeCache } from 'node-cache';

// Advanced Vietnamese Query Optimization System
export class VietnameseWikipediaService {
  constructor() {
    this.cache = new NodeCache({
      stdTTL: 3600,
      checkperiod: 600
    });

    // Vietnamese historical terms optimization
    this.vietnameseTerms = {
      // Dynasty names with variations
      dynasties: {
        'hùng vương': ['hùng vương', 'vuang vuong'],
        'ân lạc': ['an duong', 'au lac'],
        'triệu đà': ['trieu da', 'zhao da'],
        'lý nam': ['ly nam', 'li yue', 'li nam quoc', 'li yue quoc'],
        'trần': ['tran', 'tran dynasty'],
        'lê': ['le', 'le dynasty'],
        'hồ': ['ho', 'ho dynasty'],
        'nguyễn': ['nguyen', 'nguyen dynasty'],
        'tây sơn': ['tay son', 'tay son'],
        'mạc': ['mac', 'mac dynasty'],
        'hậu lê': ['hau le', 'le lao']
      },

      // Historical places with variations
      places: {
        'thăng long': ['thang long', 'thanglong', 'dong kinh'],
        'văn lang': ['van lang', 'van lang state'],
        'bạch đằng': ['bach dang', 'bach giang', 'white river'],
        'đà nẵng': ['da nang', 'danang', 'yangtze'],
        'hà nội': ['ha noi', 'hanoi'],
        'tây đô': ['tay do', 'taydo'],
        'đông đô': ['dong do', 'dongdo'],
        'hua anh': ['hua anh', 'huaxian', 'binh']
      },

      // Events and actions
      events: {
        'chiến thắng': ['chien thang', 'victory', 'battle won'],
        'khởi nghĩa': ['khoi nghia', 'insurrection', 'uprising'],
        'dời đô': ['chuy do', 'move capital', 'relocate capital'],
        'thống nhất': ['thong nhat', 'unified', 'reunified', 'reunification'],
        'độc lập': ['doc lap', 'independence', 'independent']
      }
    };
  }

  // Multi-strategy Vietnamese search optimization
  async searchVietnamese(query, language = 'vi', limit = 10) {
    const startTime = Date.now();

    // Normalize Vietnamese text
    const normalizedQuery = this.normalizeVietnameseText(query);

    // Generate search strategies
    const strategies = this.generateSearchStrategies(normalizedQuery);

    // Execute searches in parallel with timeouts
    const searchPromises = strategies.slice(0, 4).map(async (strategy, index) => {
      try {
        const response = await this.searchWithStrategy(
          strategy.keywords,
          language,
          8000, // 8 second timeout for parallel searches
          `strategy-${index}`
        );
        return {
          strategy: strategy.name,
          keywords: strategy.keywords,
          response,
          duration: Date.now() - startTime,
          fromCache: false
        };
      } catch (error) {
        return {
          strategy: strategy.name,
          keywords: strategy.keywords,
          response: null,
          duration: Date.now() - startTime,
          error: error.message,
          fromCache: false
        };
      }
    });

    // Wait for first successful response
    const results = await Promise.allSettled(searchPromises);

    // Process results
    const successfulResults = results
      .filter(result => result.response && result.response.success)
      .sort((a, b) => a.duration - b.duration);

    if (successfulResults.length > 0) {
      const bestResult = successfulResults[0];

      // Cache successful result
      this.cache.set(`vi_${normalizedQuery}`, {
        pages: bestResult.response.pages || [bestResult.response],
        found: true,
        language,
        query: normalizedQuery,
        fromCache: false,
        timestamp: new Date().toISOString(),
        strategy: bestResult.strategy,
        keywords: bestResult.keywords,
        queryTime: Date.now() - startTime
      }, 3600); // 1 hour TTL

      return {
        query: normalizedQuery,
        pages: bestResult.response.pages || [bestResult.response],
        found: true,
        language,
        fromCache: false,
        queryTime: Date.now() - startTime,
        strategy: bestResult.strategy,
        keywords: bestResult.keywords,
        performance: {
          totalDuration: Date.now() - startTime,
          parallelStrategies: strategies.length,
          successfulStrategy: bestResult.strategy,
          cacheHit: false
        }
      };
    }

    // Try fallback search if no success
    const fallbackStrategies = this.generateFallbackStrategies(normalizedQuery);

    for (const fallbackStrategy of fallbackStrategies.slice(0, 2)) {
      try {
        const response = await this.searchWithStrategy(
          fallbackStrategy.keywords,
          language,
          12000, // 12 second timeout for fallbacks
          'fallback'
        );

        if (response.success) {
          this.cache.set(`vi_${normalizedQuery}`, {
            pages: response.pages || [response],
            found: true,
            language,
            query: normalizedQuery,
            fromCache: false,
            timestamp: new Date().toISOString(),
            strategy: fallbackStrategy.name,
            keywords: fallbackStrategy.keywords,
            queryTime: Date.now() - startTime
          }, 7200); // 2 hour TTL for fallbacks

          return {
            query: normalizedQuery,
            pages: response.pages || [response],
            found: true,
            language,
            fromCache: false,
            queryTime: Date.now() - startTime,
            strategy: fallbackStrategy.name,
            keywords: fallbackStrategy.keywords,
            performance: {
              totalDuration: Date.now() - startTime,
              fallbackUsed: true,
              cacheHit: false
            }
          };
        }
      } catch (error) {
        console.warn(`Fallback strategy ${fallbackStrategy.name} failed:`, error.message);
      }
    }

    // Return no results if all failed
    return {
      query: normalizedQuery,
      pages: [],
      found: false,
      language,
      fromCache: false,
      queryTime: Date.now() - startTime,
      error: 'SEARCH_FAILED',
      message: 'All search strategies failed for Vietnamese query'
    };
  }

  // Generate multiple search strategies
  generateSearchStrategies(query) {
    const strategies = [];

    // Strategy 1: Exact historical terms
    const exactTerms = this.extractExactHistoricalTerms(query);
    if (exactTerms.length > 0) {
      strategies.push({
        name: 'exact-historical',
        keywords: exactTerms,
        priority: 1
      });
    }

    // Strategy 2: Dynasty names
    const dynasties = this.extractDynastyTerms(query);
    if (dynasties.length > 0) {
      strategies.push({
        name: 'dynasty-match',
        keywords: dynasties,
        priority: 2
      });
    }

    // Strategy 3: Location terms
    const places = this.extractLocationTerms(query);
    if (places.length > 0) {
      strategies.push({
        name: 'location-match',
        keywords: places,
        priority: 3
      });
    }

    // Strategy 4: Smart split for complex queries
    const smartSplits = this.smartVietnameseSplit(query);
    if (smartSplits.length > 0) {
      strategies.push({
        name: 'smart-split',
        keywords: smartSplits,
        priority: 4
      });
    }

    return strategies;
  }

  // Generate fallback strategies
  generateFallbackStrategies(query) {
    const strategies = [];

    // Extract short meaningful terms
    const meaningfulTerms = this.extractMeaningfulTerms(query);
    if (meaningfulTerms.length > 0) {
      strategies.push({
        name: 'meaningful-terms',
        keywords: meaningfulTerms,
        priority: 5
      });
    }

    // Try single common Vietnamese historical terms
    const commonTerms = ['hùng vương', 'thăng long', 'văn lang', 'bach dang', 'triệu da'];
    const matchedCommonTerms = commonTerms.filter(term =>
      query.toLowerCase().includes(term) ||
      this.vietnameseTerms.dynasties[term]?.some(variant => query.toLowerCase().includes(variant))
    );

    if (matchedCommonTerms.length > 0) {
      strategies.push({
        name: 'common-historical',
        keywords: matchedCommonTerms,
        priority: 6
      });
    }

    return strategies;
  }

  // Extract exact historical terms
  extractExactHistoricalTerms(query) {
    const terms = [];
    const lowerQuery = query.toLowerCase();

    // Check against our Vietnamese terms database
    Object.entries(this.vietnameseTerms).forEach(([category, terms]) => {
      if (category === 'events') {
        Object.entries(terms).forEach(([term, variants]) => {
          if (variants.some(variant => lowerQuery.includes(variant))) {
            terms.push(term);
          }
        });
      } else {
        terms.forEach(term => {
          if (Array.isArray(term)) {
            if (term.some(variant => lowerQuery.includes(variant))) {
              terms.push(term[0]); // Use main variant
            }
          } else if (lowerQuery.includes(term)) {
            terms.push(term);
          }
        });
      }
    });

    return [...new Set(terms)];
  }

  // Extract dynasty terms
  extractDynastyTerms(query) {
    const terms = [];
    const lowerQuery = query.toLowerCase();

    Object.entries(this.vietnameseTerms.dynasties).forEach(([dynasty, variants]) => {
      if (variants.some(variant => lowerQuery.includes(variant))) {
        terms.push(dynasty);
      }
    });

    return terms;
  }

  // Extract location terms
  extractLocationTerms(query) {
    const terms = [];
    const lowerQuery = query.toLowerCase();

    Object.entries(this.vietnameseTerms.places).forEach(([place, variants]) => {
      if (variants.some(variant => lowerQuery.includes(variant))) {
        terms.push(place);
      }
    });

    return terms;
  }

  // Smart Vietnamese text splitting
  smartVietnameseSplit(query) {
    const separators = ['–', '-', '•', '/', '"', "'"];
    let terms = [];
    let currentTerm = '';

    for (let i = 0; i < query.length; i++) {
      if (separators.includes(query[i])) {
        if (currentTerm.trim().length >= 2 && currentTerm.trim().length <= 12) {
          terms.push(currentTerm.trim());
        }
        currentTerm = '';
      } else {
        currentTerm += query[i];
      }
    }

    if (currentTerm.trim().length >= 2 && currentTerm.trim().length <= 12) {
      terms.push(currentTerm.trim());
    }

    return [...new Set(terms)];
  }

  // Extract meaningful terms
  extractMeaningfulTerms(query) {
    const words = query.split(/\s+/).filter(word => word.length >= 3);
    const meaningfulWords = words.filter(word =>
      !['và', 'của', 'cho', 'trong', 'tại', 'một', 'năm'].includes(word.toLowerCase()) &&
      word.charAt(0) === word.charAt(0).toUpperCase()
    );

    return meaningfulWords;
  }

  // Vietnamese text normalization
  normalizeVietnameseText(text) {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove combining diacritical marks
      .replace(/[Đđ]/g, 'D') // Vietnamese 'D' normalization
      .replace(/[Ăă]/g, 'a')
      .replace(/[Ââ]/g, 'a')
      .replace(/[Êê]/g, 'e')
      .replace(/[Ôô]/g, 'o')
      .replace(/[Ơơ]/g, 'o')
      .replace(/[Ưư]/g, 'u')
      .replace(/[Ấá]/g, 'a')
      .replace(/[Ấả]/g, 'a')
      .toLowerCase()
      .trim();
  }

  // Search with specific strategy
  async searchWithStrategy(keywords, language, timeout, strategyName) {
    const searchPromises = keywords.slice(0, 2).map(keyword =>
      this.searchWikipediaArticle(keyword, language, timeout, `${strategyName}-${keyword}`)
    );

    const results = await Promise.allSettled(searchPromises);

    // Return first successful result
    const successfulResults = results.filter(result => result.value && result.value.success);
    if (successfulResults.length > 0) {
      return successfulResults[0].value;
    }

    return null;
  }

  // Search Wikipedia article
  async searchWikipediaArticle(title, language, timeout = 8000, source = 'search') {
    const cacheKey = `vi_${this.normalizeVietnameseText(title)}`;
    const cached = this.cache.get(cacheKey);

    if (cached) {
      return {
        ...cached,
        fromCache: true,
        source
      };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const endpoint = process.env.WIKIPEDIA_API_ENDPOINT || 'https://vi.wikipedia.org/api/rest_v1';
      const url = `${endpoint}/page/summary/${encodeURIComponent(title)}?redirect=true&origin=*`;

      const response = await fetch(url, {
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
        if (response.status === 404) {
          return {
            success: false,
            error: 'PAGE_NOT_FOUND',
            message: `Article "${title}" not found on Wikipedia`,
            statusCode: 404
          };
        }

        throw new Error(`Wikipedia API error: ${response.status}`);
      }

      const data = await response.json();

      const result = {
        success: true,
        title: data.title || title,
        description: data.description || '',
        extract: data.extract || '',
        thumbnail: data.thumbnail?.source || null,
        originalImage: data.originalimage?.source || null,
        url: data.content_urls?.desktop?.page || `https://vi.wikipedia.org/wiki/${encodeURIComponent(title)}`,
        language,
        fromCache: false,
        source,
        queryTime: Date.now()
      };

      // Cache successful result
      this.cache.set(cacheKey, result, 1800); // 30 minutes

      return result;
    } catch (error) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: 'TIMEOUT',
          message: `Search timeout for "${title}" after ${timeout}ms`,
          fromCache: false,
          source
        };
      }

      return {
        success: false,
        error: 'NETWORK_ERROR',
        message: error.message,
        fromCache: false,
        source
      };
    }
  }

  // Cache stats
  getCacheStats() {
    return this.cache.getStats();
  }

  // Clear cache
  clearCache() {
    this.cache.flushAll();
  }

  // Search method (main entry point)
  async search(query, limit = 5, language = 'vi') {
    return this.searchVietnamese(query, language, limit);
  }
}

// Export singleton instance
export const wikipediaService = new VietnameseWikipediaService();