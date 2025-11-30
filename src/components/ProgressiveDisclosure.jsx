import React, { useState, useRef, useEffect } from 'react';
import VietnameseTypography from './VietnameseTypography';

/**
 * Progressive Disclosure Component
 * Expandable/collapsible content with smooth animations
 * Optimized for Vietnamese historical content
 */
const ProgressiveDisclosure = ({
  title,
  content,
  isExpanded = false,
  onToggle,
  variant = 'default',
  className = '',
  children,
  ...props
}) => {
  const [expanded, setExpanded] = useState(isExpanded);
  const contentRef = useRef(null);
  const [height, setHeight] = useState(0);

  // Calculate content height for smooth animation
  useEffect(() => {
    if (contentRef.current) {
      const contentHeight = contentRef.current.scrollHeight;
      setHeight(expanded ? contentHeight : 0);
    }
  }, [contentRef.current, expanded]);

  const handleToggle = () => {
    const newExpanded = !expanded;
    setExpanded(newExpanded);
    onToggle?.(newExpanded);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleToggle();
    }
  };

  const baseClasses = [
    'progressive-disclosure',
    `variant-${variant}`,
    expanded ? 'expanded' : 'collapsed',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={baseClasses} role="region" aria-label={`${title} - Expandable content`}>
      <div className="disclosure-header">
        <button
          className="disclosure-trigger"
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          aria-expanded={expanded}
          aria-controls={`disclosure-content-${title}`}
        >
          <VietnameseTypography
            variant="viet-label"
            cultural={true}
            className="disclosure-title"
          >
            {title}
          </VietnameseTypography>
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`disclosure-icon ${expanded ? 'expanded' : 'collapsed'}`}
            aria-hidden="true"
          >
            <path d="M9 5l7 7-7" />
          </svg>
        </button>
      </div>

      <div
        id={`disclosure-content-${title}`}
        className="disclosure-content-wrapper"
        style={{ height: expanded ? `${height}px` : '0px' }}
      >
        <div className="disclosure-content" ref={contentRef}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default ProgressiveDisclosure;