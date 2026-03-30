/**
 * Wikipedia Service
 * Handles all interactions with Wikipedia Core REST API
 * Features: caching, error handling, timeout, retry logic, title mapping
 */

import { getWikipediaTitleOptions } from '../data/wikipediaTitleMap'

// Configuration
const WIKI_API_BASE = 'https://vi.wikipedia.org/w/api.php'
const CACHE_KEY_PREFIX = 'wiki_cache_'
const CACHE_DURATION_MS = 7 * 24 * 60 * 60 * 1000 // 7 days
const REQUEST_TIMEOUT_MS = 5000 // 5 seconds

/**
 * Fetch data from Wikipedia API for a single title
 * @private
 * @param {string} title - Wikipedia page title to fetch
 * @returns {Promise<Object|null>} Page data if found, null if not found, error object on failure
 */
async function fetchWikipediaPageData(title) {
  try {
    const params = new URLSearchParams({
      action: 'query',
      titles: title,
      prop: 'extracts|pageimages|info',
      pithumbsize: 300,
      explaintext: true,
      format: 'json',
      origin: '*'
    })

    const url = `${WIKI_API_BASE}?${params}`
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'VietnamHistoryTimeline/1.0 (Vietnamese History Learning App)'
      }
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      if (response.status === 429) {
        return {
          error: 'RATE_LIMIT',
          message: 'Rate limited. Please try again later.'
        }
      }
      return {
        error: 'API_ERROR',
        message: `API error: ${response.status}`
      }
    }

    const data = await response.json()

    // Parse Wikipedia response
    if (!data.query || !data.query.pages) {
      return {
        error: 'INVALID_RESPONSE',
        message: 'Invalid response from Wikipedia'
      }
    }

    const pages = Object.values(data.query.pages)
    if (!pages || pages.length === 0) {
      return null // Title not found, try next option
    }

    const page = pages[0]

    // Check if page is missing (redirect failed or doesn't exist)
    if (page.missing !== undefined) {
      return null // Title not found, try next option
    }

    // Success - return page data
    return page
  } catch (error) {
    // Handle timeout and network errors
    if (error.name === 'AbortError') {
      return {
        error: 'TIMEOUT',
        message: 'Request timeout. Wikipedia took too long to respond.'
      }
    }

    if (error.message.includes('Failed to fetch')) {
      return {
        error: 'NETWORK_ERROR',
        message: 'Network error. Please check your internet connection.'
      }
    }

    return {
      error: 'UNKNOWN_ERROR',
      message: error.message || 'Unknown error occurred'
    }
  }
}

/**
 * Get Wikipedia page summary
 * Tries multiple title options from the title mapping if available
 * @param {string} title - Wikipedia page title (Vietnamese)
 * @returns {Promise<{url, title, extract, thumbnail}>}
 */
export async function getWikipediaPageSummary(title) {
  if (!title || typeof title !== 'string') {
    return {
      error: 'Invalid title provided',
      errorCode: 'INVALID_TITLE'
    }
  }

  // Check cache first
  const cached = getCachedData(title)
  if (cached) {
    console.log('[Wiki] Cache hit for:', title)
    return cached
  }

  // Get list of title options to try (from mapping or just the original)
  const titleOptions = getWikipediaTitleOptions(title)
  console.log('[Wiki] Trying title options for:', title, '→', titleOptions)
  let lastError = null

  // Try each title option until one works
  for (const titleOption of titleOptions) {
    console.log('[Wiki] Attempting to fetch:', titleOption)
    const result = await fetchWikipediaPageData(titleOption)

    // If it's an error object, it's a real error (not just "not found")
    if (result && result.error) {
      lastError = result
      // For critical errors, stop trying other titles
      if (result.error === 'RATE_LIMIT' || result.error === 'TIMEOUT') {
        return {
          error: result.message,
          errorCode: result.error
        }
      }
      continue // Try next title
    }

    // If result is null, page wasn't found, try next title
    if (result === null) {
      continue
    }

    // Success! We found a page
    const page = result
    console.log('[Wiki] ✓ Found article:', page.title, 'for:', title)
    const result_data = {
      title: page.title || titleOption,
      url: `https://vi.wikipedia.org/wiki/${encodeURIComponent(page.title || titleOption)}`,
      extract: page.extract ? truncateText(page.extract, 300) : 'Không có mô tả',
      fullExtract: page.extract || '',
      thumbnail: page.thumbnail ? page.thumbnail.source : null,
      pageId: page.pageid,
      lastModified: page.lastrevid ? new Date().toISOString() : null
    }

    // Cache the result using original title as key
    setCachedData(title, result_data)

    return result_data
  }

  // None of the title options worked
  console.log('[Wiki] ✗ No articles found for:', title, 'tried:', titleOptions)
  // Return error with search link
  return {
    error: `No Wikipedia article found for "${title}"`,
    errorCode: 'NOT_FOUND',
    url: `https://vi.wikipedia.org/w/index.php?title=${encodeURIComponent(title)}&search=${encodeURIComponent(title)}`
  }
}

/**
 * Search Wikipedia
 * @param {string} query - Search query
 * @param {number} limit - Number of results (default: 5)
 * @returns {Promise<Array>}
 */
export async function searchWikipedia(query, limit = 5) {
  if (!query || typeof query !== 'string') {
    return {
      error: 'Invalid search query',
      errorCode: 'INVALID_QUERY',
      results: []
    }
  }

  try {
    const params = new URLSearchParams({
      action: 'query',
      list: 'search',
      srsearch: query,
      srnamespace: 0,
      srlimit: limit,
      format: 'json',
      origin: '*'
    })

    const url = `${WIKI_API_BASE}?${params}`
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'VietnamHistoryTimeline/1.0'
      }
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      return {
        error: `Search failed: ${response.status}`,
        errorCode: 'SEARCH_ERROR',
        results: []
      }
    }

    const data = await response.json()

    if (!data.query || !data.query.search) {
      return {
        error: 'No results found',
        errorCode: 'NO_RESULTS',
        results: []
      }
    }

    return {
      results: data.query.search.map(item => ({
        title: item.title,
        snippet: item.snippet.replace(/<[^>]*>/g, ''), // Remove HTML tags
        pageid: item.pageid
      }))
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      return {
        error: 'Search timeout',
        errorCode: 'TIMEOUT',
        results: []
      }
    }
    return {
      error: error.message || 'Search error',
      errorCode: 'SEARCH_ERROR',
      results: []
    }
  }
}

/**
 * Get cached data
 * @private
 * @param {string} title - Cache key
 * @returns {Object|null}
 */
function getCachedData(title) {
  try {
    const key = `${CACHE_KEY_PREFIX}${title}`
    const cached = localStorage.getItem(key)

    if (!cached) {
      return null
    }

    const parsed = JSON.parse(cached)

    // Check if cache is expired
    if (parsed.timestamp + CACHE_DURATION_MS < Date.now()) {
      localStorage.removeItem(key)
      return null
    }

    return parsed.data
  } catch (error) {
    console.error('Cache retrieval error:', error)
    return null
  }
}

/**
 * Set cached data
 * @private
 * @param {string} title - Cache key
 * @param {Object} data - Data to cache
 */
function setCachedData(title, data) {
  try {
    const key = `${CACHE_KEY_PREFIX}${title}`
    const cacheObj = {
      timestamp: Date.now(),
      data: data
    }
    localStorage.setItem(key, JSON.stringify(cacheObj))
  } catch (error) {
    console.error('Cache storage error:', error)
    // Silently fail - app still works without cache
  }
}

/**
 * Clear cache for a specific title
 * @param {string} title - Title to clear from cache
 */
export function clearCache(title) {
  try {
    const key = `${CACHE_KEY_PREFIX}${title}`
    localStorage.removeItem(key)
  } catch (error) {
    console.error('Cache clear error:', error)
  }
}

/**
 * Clear all Wikipedia cache
 */
export function clearAllCache() {
  try {
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith(CACHE_KEY_PREFIX)) {
        localStorage.removeItem(key)
      }
    })
  } catch (error) {
    console.error('Clear all cache error:', error)
  }
}

/**
 * Truncate text to specified length
 * @private
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Max length
 * @returns {string}
 */
function truncateText(text, maxLength) {
  if (!text) return ''
  if (text.length <= maxLength) return text

  // Truncate and find last space for clean break
  const truncated = text.substring(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')

  return lastSpace > 0
    ? truncated.substring(0, lastSpace) + '...'
    : truncated + '...'
}

/**
 * Format Wikipedia data for display
 * @param {Object} data - Raw Wikipedia data
 * @returns {Object} Formatted data
 */
export function formatWikipediaData(data) {
  if (data.error) {
    return {
      error: data.error,
      errorCode: data.errorCode
    }
  }

  return {
    title: data.title,
    url: data.url,
    extract: data.extract,
    fullExtract: data.fullExtract,
    thumbnail: data.thumbnail,
    pageId: data.pageId
  }
}

export default {
  getWikipediaPageSummary,
  searchWikipedia,
  clearCache,
  clearAllCache,
  formatWikipediaData
}
