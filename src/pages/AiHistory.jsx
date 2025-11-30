import React, { useState, useCallback } from 'react'
import { fetchWithBackendFallback } from '../utils/wikipedia-api.js'

/**
 * AI History page - Wikipedia search integration
 * @param {Object} props
 * @param {string} [props.apiBaseUrl='/api'] - API base URL for fetch
 * @returns {JSX.Element}
 */
export default function AiHistory({ apiBaseUrl = '/api' }) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [results, setResults] = useState([])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    const trimmedQuery = query.trim()
    if (!trimmedQuery) {
      setError('Vui lòng nhập từ khóa tìm kiếm')
      setResults([])
      return
    }
    setLoading(true)
    setError('')
    setResults([])
    try {
      // Use enhanced fetch with fallback mechanism
      const data = await fetchWithBackendFallback(trimmedQuery, apiBaseUrl, 5, 'vi')

      if (data.error && !data.fromFallback) {
        // If backend error and no fallback, show error
        throw new Error(data.error)
      }

      // Set results from either backend or fallback
      setResults(data.pages || [])

      // Show info message if fallback was used
      if (data.fromFallback && data.found) {
        console.log('Sử dụng kết quả từ trực tiếp Wikipedia API:', data.message)
      } else if (data.fromFallback && !data.found) {
        console.log('Không tìm thấy kết quả từ trực tiếp Wikipedia API')
      }

    } catch (err) {
      const errorMessage = err.message || 'Đã xảy ra lỗi khi tìm kiếm. Vui lòng thử lại.'
      console.error('Wikipedia search error:', err)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [query, apiBaseUrl])

  return (
    <section className="ai-history-section section" style={{ minHeight: '60vh' }}>
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Tìm kiếm Lịch sử với Wikipedia</h2>
        </div>

        <form className="search-form" onSubmit={handleSubmit} role="search">
          <div className="search-input-group">
            <input
              type="search"
              className="search-input"
              placeholder="Nhập từ khóa lịch sử (ví dụ: lịch sử, Lý Thái Tổ)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Từ khóa tìm kiếm"
              disabled={loading}
            />
            <button
              type="submit"
              className={`search-submit btn ${loading ? 'btn-disabled' : 'btn-primary'}`}
              disabled={loading}
              aria-label="Tìm kiếm"
            >
              {loading ? 'Đang tìm...' : 'Tìm kiếm'}
            </button>
          </div>
        </form>

        {error && (
          <div className="error-message" role="alert" aria-live="assertive">
            {error}
          </div>
        )}

        {loading && (
          <div className="loading-spinner" role="status" aria-label="Đang tải kết quả tìm kiếm">
            <div className="spinner"></div>
          </div>
        )}

        {results.length > 0 && (
          <div className="search-results-grid">
            {results.map((result) => (
              <article key={result.id || result.title} className="history-card">
                {result.thumbnail?.source && (
                  <img
                    src={result.thumbnail.source}
                    alt={result.title}
                    className="history-card-image"
                    loading="lazy"
                  />
                )}
                <div className="history-card-content">
                  <h3 className="history-card-title">
                    <a href={result.url} target="_blank" rel="noopener noreferrer">
                      {result.title || 'Untitled'}
                    </a>
                  </h3>
                  <p className="history-card-desc">{result.description || 'No description available'}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}