import React, { useState, useRef, useEffect, useCallback } from 'react';
import useTouchGestures from '../hooks/useTouchGestures';
import Typography from './Typography';
import PeriodBadge from './PeriodBadge';
import { useWikipediaData } from '../hooks/useFetch';

/**
 * MobileTimeline Component - Enhanced with Wikipedia API Integration
 * Touch-optimized timeline for Vietnamese mobile users with automatic Wikipedia integration
 * Supports swipe navigation, progressive disclosure, and instant Wikipedia lookup
 */
const MobileTimeline = ({ events = [], onEventSelect, onEventExpand, className = '' }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [expandedCards, setExpandedCards] = useState(new Set());
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [wikipediaExpandedCards, setWikipediaExpandedCards] = useState(new Set());
  const [autoFetchEnabled, setAutoFetchEnabled] = useState(true);

  const timelineRef = useRef(null);
  const containerRef = useRef(null);

  // Enhanced Wikipedia data fetching for current event
  const currentEvent = events[activeIndex];
  const { data: wikipediaData, loading: wikipediaLoading, error: wikipediaError, retry } = useWikipediaData(
    autoFetchEnabled && currentEvent ? currentEvent.title : '',
    { maxRetries: 3 }
  );

  // Cache Wikipedia data in localStorage for offline access
  useEffect(() => {
    if (wikipediaData && currentEvent) {
      try {
        const cacheKey = `wikipedia_${currentEvent.id}`;
        const cacheData = {
          data: wikipediaData,
          timestamp: Date.now(),
          eventId: currentEvent.id
        };
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      } catch (error) {
        console.warn('Failed to cache Wikipedia data:', error);
      }
    }
  }, [wikipediaData, currentEvent]);

  // Handle swipe navigation between events
  const handleSwipe = useCallback((swipeData) => {
    const { direction, velocity } = swipeData;

    // Prevent rapid swipes during transitions
    if (isTransitioning) return;

    if (direction === 'left' && activeIndex < events.length - 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setActiveIndex(prev => prev + 1);
        setIsTransitioning(false);
      }, 200);
    } else if (direction === 'right' && activeIndex > 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        setActiveIndex(prev => prev - 1);
        setIsTransitioning(false);
      }, 200);
    }
  }, [activeIndex, events.length, isTransitioning, onEventSelect]);

  // Handle tap on timeline cards
  const handleTap = useCallback((tapData, eventIndex) => {
    if (isTransitioning) return;

    if (eventIndex !== activeIndex) {
      setActiveIndex(eventIndex);
      onEventSelect?.(events[eventIndex]);
    }
  }, [activeIndex, isTransitioning, onEventSelect, events]);

  // Handle card expansion with Wikipedia progressive disclosure
  const handleExpand = useCallback((eventIndex) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventIndex)) {
        newSet.delete(eventIndex);
        // Also collapse Wikipedia section when card is collapsed
        setWikipediaExpandedCards(prevWiki => {
          const newWikiSet = new Set(prevWiki);
          newWikiSet.delete(eventIndex);
          return newWikiSet;
        });
      } else {
        newSet.add(eventIndex);
        // Auto-enable Wikipedia fetch for expanded cards
        if (autoFetchEnabled) {
          setWikipediaExpandedCards(prevWiki => {
            const newWikiSet = new Set(prevWiki);
            newWikiSet.add(eventIndex);
            return newWikiSet;
          });
        }
      }
      return newSet;
    });

    // Callback to parent component
    onEventExpand?.(events[eventIndex], eventIndex);
  }, [autoFetchEnabled, events, onEventExpand]);

  // Handle Wikipedia section toggle
  const handleWikipediaToggle = useCallback((eventIndex) => {
    setWikipediaExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventIndex)) {
        newSet.delete(eventIndex);
      } else {
        newSet.add(eventIndex);
      }
      return newSet;
    });
  }, []);

  // Load cached Wikipedia data for events
  const getCachedWikipediaData = useCallback((eventId) => {
    try {
      const cacheKey = `wikipedia_${eventId}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { data, timestamp, eventId: cachedEventId } = JSON.parse(cached);
        // Return cached data if less than 24 hours old and matches current event
        if (cachedEventId === eventId && (Date.now() - timestamp) < 24 * 60 * 60 * 1000) {
          return data;
        }
      }
    } catch (error) {
      console.warn('Failed to load cached Wikipedia data:', error);
    }
    return null;
  }, []);

  // Touch gesture configuration for Vietnamese mobile users
  const { gestures } = useTouchGestures(containerRef, {
    swipeThreshold: 30, // Lower threshold for easier mobile interaction
    swipeVelocityThreshold: 0.2, // Lower velocity for better responsiveness
    holdDuration: 600, // Slightly longer for Vietnamese users
    enableHaptic: true, // Enhanced haptic feedback
    onSwipe: handleSwipe,
    onTap: handleTap
  });

  // Auto-scroll to active event
  useEffect(() => {
    if (!timelineRef.current) return;

    const activeCard = timelineRef.current.querySelector(`[data-index="${activeIndex}"]`);
    if (activeCard) {
      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      const cardRect = activeCard.getBoundingClientRect();

      // Calculate scroll position to center active card
      const scrollX = cardRect.left - containerRect.left + cardRect.width / 2 - containerRect.width / 2;

      container.scrollTo({
        left: scrollX,
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [activeIndex]);

  // Get period color for styling
  const getPeriodColor = (period) => {
    const colors = {
      'Cổ đại': 'var(--period-co-dai)',
      'Phong kiến': 'var(--period-phong-kien)',
      'Cận đại': 'var(--period-can-dai)',
      'Hiện đại': 'var(--period-hien-dai)'
    };
    return colors[period] || colors['Cổ đại'];
  };

  if (!events.length) return null;

  return (
    <div
      className={`mobile-timeline ${className || ''}`}
      ref={containerRef}
      role="region"
      aria-label="Timeline lịch sử Việt Nam"
      aria-roledescription="Vuốt sang trái phải để điều hướng, chạm để xem chi tiết"
    >
      {/* Mobile Header */}
      <div className="mobile-timeline-header">
        <Typography
          variant="viet-heading"
          size="3xl"
          className="text-center mb-4"
        >
          Timeline Lịch sử
        </Typography>

        {/* Progress Indicator */}
        <div className="timeline-progress">
          <Typography
            variant="viet-label"
            size="xs"
            color="muted"
            className="mb-2"
          >
            {activeIndex + 1} / {events.length}
          </Typography>

          <div className="progress-dots">
            {events.map((_, index) => (
              <button
                key={index}
                className={`progress-dot ${index === activeIndex ? 'active' : ''}`}
                onClick={() => setActiveIndex(index)}
                aria-label={`Chuyển đến sự kiện ${index + 1}`}
                aria-current={index === activeIndex}
              >
                <span className="sr-only">Sự kiện {index + 1}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Scrollable Timeline Container */}
      <div className="mobile-timeline-container" ref={timelineRef}>
        <div
          className="timeline-cards-track"
          style={{
            transform: `translateX(-${activeIndex * 100}%)`,
            transition: isTransitioning ? 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' : 'none'
          }}
        >
          {events.map((event, index) => {
            const isActive = index === activeIndex;
            const isExpanded = expandedCards.has(index);
            const periodColor = getPeriodColor(event.period);

            return (
              <div
                key={event.id}
                className={`mobile-timeline-card ${isActive ? 'active' : ''} ${isExpanded ? 'expanded' : ''}`}
                data-index={index}
                style={{
                  '--card-period-color': periodColor
                }}
                role="button"
                tabIndex={0}
                aria-expanded={isExpanded}
                aria-label={`${event.title}, ${event.year}, Chạm để xem chi tiết`}
                onClick={() => handleExpand(index)}
              >
                {/* Card Header - Always Visible */}
                <div className="mobile-card-header">
                  <div className="card-year-period">
                    <Typography
                      variant="viet-heading"
                      size="2xl"
                      color="primary"
                      weight="700"
                    >
                      {event.year}
                    </Typography>
                    <PeriodBadge
                      period={event.period}
                      size="sm"
                      variant="outline"
                    />
                  </div>

                  <Typography
                    variant="viet-title"
                    size="lg"
                    className="card-title"
                  >
                    {event.title}
                  </Typography>

                  <div className="card-actions">
                    <button
                      className="expand-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExpand(index);
                      }}
                      aria-label={isExpanded ? 'Thu gọn' : 'Mở rộng'}
                      aria-expanded={isExpanded}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.3s ease'
                        }}
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Expanded Content - Progressive Disclosure */}
                {isExpanded && (
                  <div className="mobile-card-expanded">
                    <div className="card-content">
                      <Typography
                        variant="viet-body"
                        size="base"
                        className="card-description"
                      >
                        {event.description}
                      </Typography>

                      {/* Dynasty Information */}
                      {event.dynasty && (
                        <div className="card-meta">
                          <Typography
                            variant="viet-label"
                            size="xs"
                            color="muted"
                          >
                            Triều đại
                          </Typography>
                          <Typography
                            variant="viet-body"
                            size="sm"
                            weight="600"
                          >
                            {event.dynasty}
                          </Typography>
                        </div>
                      )}

                      {/* Wikipedia Integration Section */}
                      <div className="wikipedia-section">
                        <button
                          className="wikipedia-toggle-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleWikipediaToggle(index);
                          }}
                          aria-label="Toggle Wikipedia content"
                          aria-expanded={wikipediaExpandedCards.has(index)}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{
                              transform: wikipediaExpandedCards.has(index) ? 'rotate(90deg)' : 'rotate(0deg)',
                              transition: 'transform 0.2s ease'
                            }}
                          >
                            <path d="M9 18l6-6-6-6" />
                          </svg>
                          <Typography
                            variant="viet-label"
                            size="sm"
                            weight="600"
                          >
                            Wikipedia
                          </Typography>
                          {wikipediaLoading && index === activeIndex && (
                            <div className="wikipedia-loading" aria-label="Loading Wikipedia content">
                              <div className="loading-spinner"></div>
                            </div>
                          )}
                        </button>

                        {/* Wikipedia Content - Progressive Disclosure */}
                        {wikipediaExpandedCards.has(index) && (
                          <div className="wikipedia-content">
                            {index === activeIndex && wikipediaData && (
                              <div className="wikipedia-data">
                                {wikipediaData.thumbnail && (
                                  <div className="wikipedia-thumbnail">
                                    <img
                                      src={wikipediaData.thumbnail.source}
                                      alt={wikipediaData.thumbnail.title || `Wikipedia image for ${event.title}`}
                                      className="wikipedia-image"
                                      loading="lazy"
                                    />
                                  </div>
                                )}

                                <div className="wikipedia-text">
                                  <Typography
                                    variant="viet-body"
                                    size="sm"
                                    className="wikipedia-description"
                                  >
                                    {wikipediaData.description || wikipediaData.extract?.substring(0, 150)}
                                  </Typography>

                                  {wikipediaData.extract && wikipediaData.extract.length > 150 && (
                                    <Typography
                                      variant="viet-body"
                                      size="sm"
                                      className="wikipedia-extract"
                                    >
                                      {wikipediaData.extract.substring(0, 300)}...
                                    </Typography>
                                  )}

                                  {wikipediaData.url && (
                                    <a
                                      href={wikipediaData.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="wikipedia-link"
                                      aria-label={`Read more about ${event.title} on Wikipedia`}
                                    >
                                      <Typography
                                        variant="viet-label"
                                        size="xs"
                                        className="wikipedia-link-text"
                                      >
                                        Đọc thêm trên Wikipedia
                                      </Typography>
                                    </a>
                                  )}
                                </div>
                              </div>
                            )}

                            {index === activeIndex && wikipediaError && (
                              <div className="wikipedia-error">
                                <Typography
                                  variant="viet-body"
                                  size="sm"
                                  color="muted"
                                  className="error-message"
                                >
                                  {wikipediaError.message || 'Không thể tải thông tin từ Wikipedia'}
                                </Typography>
                                {wikipediaError.retryable && (
                                  <button
                                    className="retry-wikipedia-btn"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      retry?.();
                                    }}
                                    aria-label="Retry loading Wikipedia content"
                                  >
                                    <Typography
                                      variant="viet-label"
                                      size="xs"
                                    >
                                      Thử lại
                                    </Typography>
                                  </button>
                                )}
                              </div>
                            )}

                            {index !== activeIndex && (
                              <div className="wikipedia-placeholder">
                                <Typography
                                  variant="viet-body"
                                  size="sm"
                                  color="muted"
                                >
                                  Chuyển đến sự kiện này để xem thông tin Wikipedia
                                </Typography>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Details Button */}
                      <button
                        className="btn-details"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventSelect?.(event);
                        }}
                        aria-label={`Xem chi tiết ${event.title}`}
                      >
                        <Typography
                          variant="viet-label"
                          size="sm"
                        >
                          Xem chi tiết
                        </Typography>
                      </button>
                    </div>
                  </div>
                )}

                {/* Visual Period Indicator */}
                <div
                  className="card-period-indicator"
                  style={{ backgroundColor: periodColor }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Gesture Status Indicator */}
      {gestures.isTracking && (
        <div className="gesture-indicator">
          <div className="gesture-feedback">
            {gestures.swipeDirection && (
              <Typography variant="viet-label" size="xs">
                Vuốt {gestures.swipeDirection === 'left' ? 'trái' : 'phải'}
              </Typography>
            )}
            {gestures.isHolding && (
              <Typography variant="viet-label" size="xs">
                Giữ...
              </Typography>
            )}
          </div>
        </div>
      )}

      {/* Swipe Instructions for First-Time Users */}
      {events.length > 1 && (
        <div className="swipe-instructions">
          <Typography
            variant="viet-body"
            size="sm"
            color="muted"
            className="text-center"
          >
            Vuốt trái/phải để điều hướng
          </Typography>
        </div>
      )}
    </div>
  );
};

export default MobileTimeline;