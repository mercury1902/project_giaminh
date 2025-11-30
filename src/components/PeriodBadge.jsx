import React from 'react';

/**
 * PeriodBadge Component
 * Displays historical period with culturally appropriate colors
 * Based on Vietnamese Five-Element system
 */
const PeriodBadge = ({
  period,
  size = 'md',
  variant = 'default',
  showLabel = true,
  className = ''
}) => {
  // Vietnamese period labels with cultural context
  const periodLabels = {
    'Cổ đại': {
      label: 'Cổ đại',
      english: 'Ancient',
      element: 'Thủy (Water)',
      culturalContext: 'Thuỷ nguyên - Nguồn cội văn hóa'
    },
    'Phong kiến': {
      label: 'Phong kiến',
      english: 'Feudal',
      element: 'Hỏa (Fire)',
      culturalContext: 'Hỏa vương - Triều đại phong kiến'
    },
    'Cận đại': {
      label: 'Cận đại',
      english: 'Modern',
      element: 'Thổ (Earth)',
      culturalContext: 'Thổ kiến - Giai đoạn hiện đại hóa'
    },
    'Hiện đại': {
      label: 'Hiện đại',
      english: 'Contemporary',
      element: 'Mộc (Wood)',
      culturalContext: 'Mộc sinh - Phát triển đương đại'
    }
  };

  const periodInfo = periodLabels[period] || periodLabels['Cổ đại'];

  // Size variations
  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
    xl: 'px-6 py-3 text-lg'
  };

  // Variant styles
  const variantClasses = {
    default: 'border-2 bg-opacity-10',
    outline: 'border-2 bg-transparent',
    solid: 'border-0 text-white',
    subtle: 'border-0 bg-opacity-5 text-opacity-80'
  };

  // Period-specific colors using Five-Element system
  const periodColors = {
    'Cổ đại': {
      bg: 'var(--period-co-dai)',
      border: 'var(--period-co-dai)',
      text: 'var(--period-co-dai)',
      bgOpacity: 'rgba(31, 41, 55, 0.1)',
      cultural: 'Water element - Depth, wisdom, foundation'
    },
    'Phong kiến': {
      bg: 'var(--period-phong-kien)',
      border: 'var(--period-phong-kien)',
      text: 'var(--period-phong-kien)',
      bgOpacity: 'rgba(220, 38, 38, 0.1)',
      cultural: 'Fire element - Passion, transformation, imperial power'
    },
    'Cận đại': {
      bg: 'var(--period-can-dai)',
      border: 'var(--period-can-dai)',
      text: 'var(--period-can-dai)',
      bgOpacity: 'rgba(234, 179, 8, 0.1)',
      cultural: 'Earth element - Stability, transition, modernization'
    },
    'Hiện đại': {
      bg: 'var(--period-hien-dai)',
      border: 'var(--period-hien-dai)',
      text: 'var(--period-hien-dai)',
      bgOpacity: 'rgba(22, 99, 74, 0.1)',
      cultural: 'Wood element - Growth, renewal, contemporary'
    }
  };

  const colors = periodColors[period] || periodColors['Cổ đại'];
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 vi-label';
  const sizeClass = sizeClasses[size] || sizeClasses.md;
  const variantClass = variantClasses[variant] || variantClasses.default;

  const computedStyle = {
    backgroundColor: variant === 'solid' ? colors.bg : colors.bgOpacity,
    borderColor: colors.border,
    color: variant === 'solid' ? 'white' : colors.text,
    boxShadow: variant === 'default' ? `0 0 0 1px ${colors.bgOpacity}` : 'none'
  };

  return (
    <div
      className={`${baseClasses} ${sizeClass} ${variantClass} ${className}`}
      style={computedStyle}
      title={`${periodInfo.label} - ${periodInfo.element}: ${periodInfo.culturalContext}`}
      role="badge"
      aria-label={`Giai đoạn lịch sử: ${periodInfo.label}, ${periodInfo.english}, ${periodInfo.element}`}
    >
      {showLabel && (
        <span className="flex items-center gap-1">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: colors.border }}
            aria-hidden="true"
          />
          <span className="truncate">{periodInfo.label}</span>
        </span>
      )}
    </div>
  );
};

export default PeriodBadge;