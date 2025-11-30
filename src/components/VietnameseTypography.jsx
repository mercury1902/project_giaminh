import React from 'react';
import Typography from './Typography';

/**
 * Vietnamese Typography Component
 * Enhanced typography with cultural integration for Vietnamese content
 * Combines Typography component with Vietnamese-specific optimizations
 */
const VietnameseTypography = ({
  variant = 'body',
  cultural = false,
  vietnamese = false,
  diacriticOptimized = true,
  className = '',
  ...props
}) => {
  // Vietnamese-specific typography variants
  const vietnameseVariants = {
    'viet-heading': 'viet-heading',
    'viet-subheading': 'viet-subheading',
    'viet-title': 'viet-title',
    'viet-body': 'viet-body',
    'viet-caption': 'viet-caption',
    'viet-label': 'viet-label',
    'viet-nav': 'viet-nav'
  };

  // Choose variant (Vietnamese or standard)
  const finalVariant = vietnamese && vietnameseVariants[variant]
    ? vietnameseVariants[variant]
    : variant;

  // Enhanced Vietnamese typography classes
  const vietnameseClasses = [
    vietnamese ? 'vietnamese-text' : '',
    vietnamese && diacriticOptimized ? 'viet-diacritic-optimized' : '',
    cultural ? 'viet-cultural-content' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <Typography
      variant={finalVariant}
      className={`${vietnameseClasses} ${className}`}
      {...props}
    />
  );
};

export default VietnameseTypography;