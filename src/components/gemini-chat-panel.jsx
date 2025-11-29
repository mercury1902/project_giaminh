// Gemini Chat Panel - Phase 03
// Enhanced with metadata parsing, loading states, and error handling
// Matches design: #F4EFEC/#1A1A1A/#D9AE8E, Montserrat/Lora, 24px spacing
// a11y: role=dialog, aria-expanded, keyboard nav

import React, { useState, useRef, useEffect, useCallback } from 'react';

// Loading phases for different stages
const LoadingPhase = {
  RAG_SEARCH: 'rag_search',      // Searching Wikipedia
  GEMINI_THINKING: 'gemini',      // Generating response
  STREAMING: 'streaming',           // Receiving response
  ERROR: 'error'                   // Error occurred
};

const GeminiChatPanel = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState(null);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [lastSuccessfulRequest, setLastSuccessfulRequest] = useState(null);

  const panelRef = useRef(null);
  const inputRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Parse metadata from response stream
  const parseMetadata = (text) => {
    const metadataMatch = text.match(/\[METADATA\](.*?)\[\/METADATA\]/s);
    if (metadataMatch) {
      try {
        return JSON.parse(metadataMatch[1]);
      } catch (e) {
        console.warn('Failed to parse metadata:', e);
        return null;
      }
    }
    return null;
  };

  // Extract response content (remove metadata and end markers)
  const extractContent = (text) => {
    return text
      .replace(/\[METADATA\].*?\[\/METADATA\]/gs, '')
      .replace(/\[END\]$/gs, '')
      .trim();
  };

  // Get appropriate loading message
  const getLoadingMessage = () => {
    switch (loadingPhase) {
      case 'rag_search':
        return '🔍 Tìm kiếm Wikipedia...';
      case 'gemini':
        return '🤔 Đang suy nghĩ...';
      case 'streaming':
        return '✍️ Đang viết câu trả lời...';
      default:
        return '⏳ Đang xử lý...';
    }
  };

  // Get source indicator for successful messages
  const getSourceIndicator = (metadata) => {
    if (!metadata?.ragSuccess || !metadata.ragStrategy) {
      return null;
    }

    const strategyIcons = {
      1: '🎯', // Primary search
      2: '🔤', // Keyword search
      3: '🔓'  // Diacritic removal
    };

    const strategyNames = {
      1: 'Chính xác',
      2: 'Từ khóa',
      3: 'Đơn giản'
    };

    return (
      <span className="source-indicator" title={`Wikipedia - Chiến lược ${metadata.ragStrategy} (${metadata.articles} bài viết)`}>
        {strategyIcons[metadata.ragStrategy]} Wikipedia ({strategyNames[metadata.ragStrategy]})
      </span>
    );
  };

  // Retry last message
  const retryLastMessage = useCallback(() => {
    if (messages.length < 2) return;

    const lastUserMessage = messages[messages.length - 2];
    if (!lastUserMessage || lastUserMessage.role !== 'user') return;

    setRetryCount(prev => prev + 1);
    setError(null);
    sendMessage(lastUserMessage.content);
  }, [messages]);

  const sendMessage = useCallback(async (messageToSend = null) => {
    const msg = messageToSend || input;
    if (!msg.trim() || loading) return;

    const userMsg = {
      role: 'user',
      content: msg,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    setLoadingPhase('rag_search');
    setError(null);
    setInput('');
    setRetryCount(0);

    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      // Prepare request
      const messagesForAPI = [...messages, userMsg];

      setLoadingPhase('gemini');

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: messagesForAPI }),
        signal: abortControllerRef.current.signal
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';
      let metadata = null;

      setLoadingPhase('streaming');

      // Read streaming response
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullResponse += chunk;

        // Try to extract metadata if not found yet
        if (!metadata) {
          metadata = parseMetadata(fullResponse);
        }

        // Update assistant message content (remove metadata for display)
        const displayContent = extractContent(fullResponse);
        setMessages(prev => {
          const updated = [...prev];
          if (updated[updated.length - 1]?.role === 'assistant') {
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              content: displayContent,
              metadata,
              streaming: true
            };
          } else {
            updated.push({
              role: 'assistant',
              content: displayContent,
              metadata,
              streaming: true
            });
          }
          return updated;
        });
      }

      // Finalize message
      setMessages(prev => {
        const updated = [...prev];
        if (updated[updated.length - 1]?.role === 'assistant') {
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            streaming: false
          };
        }
        return updated;
      });

      setLastSuccessfulRequest({
        query: msg,
        metadata,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Chat error:', error);

      let errorMessage = 'Lỗi kết nối. Vui lòng thử lại.';
      let errorCode = 'UNKNOWN';

      // Handle specific error types
      if (error.name === 'AbortError') {
        errorMessage = 'Yêu cầu đã bị hủy.';
        errorCode = 'ABORTED';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Yêu cầu quá thời gian. Thử lại nhé.';
        errorCode = 'TIMEOUT';
      } else if (error.message.includes('GEMINI_API_KEY')) {
        errorMessage = 'Lỗi cấu hình chatbot. Thử lại sau.';
        errorCode = 'CONFIG_ERROR';
      }

      setError({
        message: errorMessage,
        code: errorCode,
        timestamp: new Date().toISOString(),
        retryable: errorCode !== 'CONFIG_ERROR' && errorCode !== 'ABORTED'
      });

      setMessages(prev => [...prev.slice(0, -1), {
        role: 'assistant',
        content: errorMessage,
        isError: true,
        errorCode
      }]);

    } finally {
      setLoading(false);
      setLoadingPhase(null);
      abortControllerRef.current = null;
    }
  }, [input, loading, messages]);

  // Handle form submission
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    sendMessage();
  }, [sendMessage]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div
      className="gemini-chat-overlay"
      role="dialog"
      aria-label="Gemini Chat lịch sử Việt Nam"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        className="gemini-chat-panel"
        onClick={e => e.stopPropagation()}
      >
        <div className="gemini-chat-header">
          <h3>Trợ lý lịch sử Gemini</h3>
          <button
            onClick={onClose}
            aria-label="Đóng chat"
            className="chat-close-btn"
          >
            &times;
          </button>
        </div>

        <div className="gemini-chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`message ${msg.role} ${msg.isError ? 'error' : ''}`}>
              <div className="message-content">
                {msg.content}

                {/* Show source indicator for successful assistant messages */}
                {msg.role === 'assistant' && !msg.isError && msg.metadata && getSourceIndicator(msg.metadata)}

                {/* Show streaming indicator */}
                {msg.streaming && <span className="streaming-indicator">✍️</span>}
              </div>

              {/* Show timestamp for error messages */}
              {msg.isError && msg.timestamp && (
                <div className="message-timestamp">
                  {new Date(msg.timestamp).toLocaleTimeString('vi-VN')}
                </div>
              )}
            </div>
          ))}

          {/* Enhanced loading state with phase indicator */}
          {loading && (
            <div className="message assistant loading">
              <div className="loading-indicator">
                {getLoadingMessage()}
                {loadingPhase === 'rag_search' && (
                  <div className="loading-progress">
                    <div className="progress-bar"></div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Enhanced error display with retry option */}
          {error && !loading && (
            <div className="error-message">
              <div className="error-content">
                <span className="error-icon">⚠️</span>
                <span className="error-text">{error.message}</span>
              </div>

              {error.retryable && (
                <div className="error-actions">
                  <button
                    onClick={retryLastMessage}
                    className="retry-button"
                    disabled={loading}
                  >
                    🔄 Thử lại ({retryCount > 0 ? `${retryCount}`: ''})
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="gemini-chat-input-form">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Hỏi về lịch sử Việt Nam..."
            disabled={loading}
            aria-label="Nhập câu hỏi"
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className={loading ? 'loading' : ''}
          >
            {loading ? '⏳' : 'Gửi'}
          </button>
        </form>

        {/* Show last successful request info */}
        {lastSuccessfulRequest && (
          <div className="request-info">
            <small>
              Truy cập cuối: {new Date(lastSuccessfulRequest.timestamp).toLocaleTimeString('vi-VN')}
              {lastSuccessfulRequest.metadata?.ragSuccess && (
                <span className="success-indicator">
                  ✅ Có dữ liệu Wikipedia
                </span>
              )}
            </small>
          </div>
        )}
      </div>
    </div>
  );
};

export default GeminiChatPanel;
