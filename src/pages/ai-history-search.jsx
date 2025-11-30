import React, { useState, useEffect, useCallback } from 'react';

export default function AiHistory() {
  const [query, setQuery] = useState('lịch sử');
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchResults = useCallback(async (q) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ q, limit: 5 });
      const response = await fetch(`/api/history/search?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      if (data.error) {
        throw new Error(data.message || 'Lỗi tìm kiếm');
      }
      setPages(data.pages || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (query.trim()) {
      fetchResults(query);
    }
  }, [query, fetchResults]);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchResults(query);
  };

  return (
    <section className="ai-history-section section" aria-labelledby="ai-title">
      <div className="container">
        <div className="section-header">
          <h2 id="ai-title" className="section-title">Tìm kiếm Lịch sử Việt Nam (Wikipedia)</h2>
          <p className="section-subtitle">Nhập từ khóa để tìm 5 bài viết liên quan nhất</p>
        </div>

        <form className="search-form ai-search-form" onSubmit={handleSubmit} role="search">
          <input
            type="search"
            className="search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ví dụ: lịch sử, Hồng Bàng, Trần Hưng Đạo..."
            aria-label="Từ khóa tìm kiếm"
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Đang tìm...' : 'Tìm kiếm'}
          </button>
        </form>

        {loading && (
          <div className="loading-state" role="status" aria-live="polite">
            <div className="spinner"></div>
            <p>Đang tìm kiếm trên Wikipedia...</p>
          </div>
        )}

        {error && (
          <div className="error-state" role="alert">
            <span>❌</span> {error}
            <button onClick={() => fetchResults(query)} className="btn-retry">Thử lại</button>
          </div>
        )}

        {pages.length > 0 && (
          <div className="search-results-grid">
            {pages.map((page, index) => (
              <article key={index} className="history-card">
                <h4 className="history-title">
                  {page.title}
                </h4>
                <p className="history-desc">{page.description}</p>
                {page.url && (
                  <a href={page.url} target="_blank" rel="noopener noreferrer" className="history-link">
                    Đọc trên Wikipedia →
                  </a>
                )}
              </article>
            ))}
          </div>
        )}

        {pages.length === 0 && !loading && !error && query.trim() && (
          <div className="no-results">Không tìm thấy kết quả phù hợp.</div>
        )}
      </div>
    </section>
  );
}
