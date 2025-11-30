import React from 'react';
import Typography from './Typography';

/**
 * Historical Content Component
 * Progressive disclosure for Vietnamese historical content
 * Supports different variants and hierarchy levels
 */
const HistoricalContent = ({
  variant = 'default',
  level = 1,
  children,
  className = '',
  cultural = false,
  ...props
}) => {
  const baseClasses = [
    'historical-content',
    `variant-${variant}`,
    `level-${level}`,
    `cultural-${cultural ? 'vietnamese' : 'default'}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={baseClasses} role="region" aria-label={`Historical content level ${level}`}>
      {children}
    </div>
  );
};

export default HistoricalContent;