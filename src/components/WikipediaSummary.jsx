import React, { useState } from 'react';
import { useWikipediaData } from '../hooks/useFetch';
import '../styles/wikipedia-summary.css';

export function WikipediaSummary({ title, language = 'vi' }) {
  const { data, loading, error, retry, isRetryable } = useWikipediaData(title, { maxRetries: 3 });
  const [isExpanded, setIsExpanded] = useState(false);

  if (!title) {
    return null;
  }

  if (loading) {
    return (
      <div className="wiki-summary wiki-loading" role="status" aria-live="polite">
        <div className="wiki-spinner">
          <div className="spinner-dot"></div>
          <div className="spinner-dot"></div>
          <div className="spinner-dot"></div>
        </div>
        <p>Đang tải thông tin từ Wikipedia...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wiki-summary wiki-error" role="alert">
        <div className="error-icon">⚠️</div>
        <div className="error-content">
          <p className="error-message">{error.message}</p>
          {isRetryable && (
            <button className="btn-retry" onClick={retry} aria-label="Thử lại">
              Thử lại
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const maxExtractLength = 300;
  const truncatedExtract = data.extract && data.extract.length > maxExtractLength
    ? data.extract.substring(0, maxExtractLength) + '...'
    : data.extract;

  return (
    <div className="wiki-summary wiki-success">
      <div className="wiki-header">
        <div className="wiki-title-section">
          <h3 className="wiki-title">{data.title}</h3>
          {data.fromCache && (
            <span className="wiki-badge wiki-cached" title="Dữ liệu từ bộ nhớ đệm">
              Từ cache
            </span>
          )}
        </div>
        {data.url && (
          <a
            href={data.url}
            target="_blank"
            rel="noopener noreferrer"
            className="wiki-link-external"
            aria-label={`Đọc toàn bộ bài viết ${data.title} trên Wikipedia`}
            title="Mở Wikipedia trong tab mới"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M13.5 2.5v4h-4m4-4L8 8m.5 5.5H2A1.5 1.5 0 01.5 12V2A1.5 1.5 0 012 .5h8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Wikipedia
          </a>
        )}
      </div>

      {data.description && (
        <p className="wiki-description">{data.description}</p>
      )}

      <div className="wiki-content">
        {data.thumbnail && (
          <img
            src={data.thumbnail.source}
            alt={data.title}
            className="wiki-thumbnail"
            loading="lazy"
            width={data.thumbnail.width}
            height={data.thumbnail.height}
          />
        )}
        <div className="wiki-text">
          {truncatedExtract ? (
            <p className={`wiki-extract ${!isExpanded && data.extract?.length > maxExtractLength ? 'truncated' : ''}`}>
              {isExpanded ? data.extract : truncatedExtract}
            </p>
          ) : null}

          {data.extract && data.extract.length > maxExtractLength && (
            <button
              className="btn-expand"
              onClick={() => setIsExpanded(!isExpanded)}
              aria-expanded={isExpanded}
              aria-label={isExpanded ? 'Thu gọn' : 'Xem thêm'}
            >
              {isExpanded ? 'Thu gọn' : 'Xem thêm'}
            </button>
          )}
        </div>
      </div>

      {data.url && (
        <div className="wiki-footer">
          <a
            href={data.url}
            target="_blank"
            rel="noopener noreferrer"
            className="wiki-full-link"
          >
            Đọc bài viết đầy đủ trên Wikipedia →
          </a>
        </div>
      )}
    </div>
  );
}

export default WikipediaSummary;
