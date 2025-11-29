# Wikipedia Core REST API Research

## 1. Core Endpoints for Article Summaries

**Base URL:** `https://en.wikipedia.org/w/rest.php/v1/`

**Key Endpoints:**
- `GET /page/{title}` - Get page metadata and latest revision info
- `GET /page/{title}/html` - Get rendered HTML content
- `GET /page/{title}/source` - Get wiki markup source
- `GET /search/page` - Search articles by title/query

**For History Articles:**
Use `/page/{title}` with parameters:
- `{title}` - URL-encoded article title (e.g., `World_War_II`, `Napoleon`)
- Optional: `?redirect=true` (follow redirects automatically)

---

## 2. Response Format & Data Structure

**Summary Response (JSON):**
```json
{
  "id": 12345,
  "key": "Article_Title",
  "title": "Article Title",
  "source": "https://en.wikipedia.org/wiki/Article_Title",
  "redirect": false,
  "revision": "1234567890",
  "latest_revision": "1234567890",
  "content_model": "wikitext",
  "license": {
    "url": "https://creativecommons.org/licenses/by-sa/3.0/",
    "title": "CC BY-SA 3.0"
  }
}
```

**HTML Response** (from `/page/{title}/html`):
- Returns full rendered HTML with all formatting
- Suitable for direct display or parsing

**Search Response:**
```json
{
  "pages": [
    {
      "id": 12345,
      "key": "Article_Title",
      "title": "Article Title",
      "excerpt": "First 200 chars of content...",
      "matched_title": null,
      "description": "Short description if available"
    }
  ]
}
```

---

## 3. Rate Limiting & Best Practices

**Rate Limits:**
- **Unauthenticated:** 500 requests/hour per IP
- **With API token:** 5,000 requests/hour

**Best Practices:**
- Set User-Agent header to identify your application
- Use `Accept-Encoding: gzip` for compression
- Make serial requests, not parallel (wait for response before next request)
- Use pipe (`|`) to request multiple items in one call: `?titles=Page1|Page2|Page3`
- Implement exponential backoff on rate-limit errors (HTTP 429)
- Add `maxlag` parameter (`?maxlag=5`) to throttle during high server load
- Cache responses aggressively to minimize requests

**Error Handling:**
- Rate limit error returns `429` status code
- Retry with increasing delay (e.g., 1s, 2s, 4s, 8s...)

---

## 4. Example Endpoints & Parameters

**Get Page Metadata:**
```
GET /w/rest.php/v1/page/Napoleon
```

**Get Page with Parameters:**
```
GET /w/rest.php/v1/page/World_War_II?redirect=true
```

**Search History Articles:**
```
GET /w/rest.php/v1/search/page?q=French_Revolution&limit=10
```

**Get HTML Content:**
```
GET /w/rest.php/v1/page/History_of_Rome/html
```

**Multiple Titles (from legacy API):**
```
GET /w/api.php?action=query&titles=Page1|Page2&format=json
```

---

## 5. Implementation Notes

**Authentication:** Not required for reading public content. Optional API tokens increase rate limits.

**Response Headers:**
- `Content-Type: application/json` or `text/html`
- `Cache-Control: max-age=3600` (caching recommendations included)

**Common Use Cases for History:**
- Fetch article intro/summary by parsing `/html` endpoint
- Get revision timestamp for temporal analysis via revision endpoints
- Search for related historical articles using search endpoint
- Extract infobox data from HTML response

**Practical Implementation:**
1. Validate article exists before heavy parsing
2. Cache responses with appropriate TTL
3. Use search endpoint for discovery; use page endpoint for details
4. Parse HTML for richer content extraction

---

## Sources

1. Wikimedia REST API - https://www.mediawiki.org/wiki/Wikimedia_REST_API
2. Core REST API Reference - https://api.wikimedia.org/wiki/Core_REST_API/Reference
3. API Rate Limiting - https://api.wikimedia.org/wiki/Rate_limits
4. API Etiquette - https://www.mediawiki.org/wiki/API:Etiquette
5. REST API Overview - https://www.mediawiki.org/wiki/API:REST_API
6. Zuplo Wikipedia API Guide - https://zuplo.com/blog/2024/09/30/wikipedia-api-guide

---

## Unresolved Questions

- Whether Wikimedia Enterprise API (`/v2/articles` endpoint) provides better summary extraction than Core REST API
- Specific endpoint URL structure for accessing extracted summaries (if separate endpoint exists)
- Live testing required to confirm exact response field names for article summaries
