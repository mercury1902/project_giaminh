import React from 'react';

/**
 * Typography Component
 * Enhanced Vietnamese typography with diacritic optimization
 * Supports fluid scaling and cultural text patterns
 */
const Typography = ({
  as: Component = 'p',
  variant = 'body',
  size = 'base',
  weight = 'normal',
  color = 'default',
  align = 'left',
  transform = 'none',
  decoration = 'none',
  spacing = 'normal',
  className = '',
  children,
  ...props
}) => {
  // Vietnamese typography variants with cultural considerations
  const variants = {
    // Cultural headings
    'viet-heading': {
      fontFamily: 'var(--font-heading)',
      fontWeight: weight || '700',
      letterSpacing: 'var(--tracking-tight)',
      lineHeight: 'var(--leading-tight)',
      size: 'var(--text-3xl)',
      className: 'viet-heading'
    },
    'viet-subheading': {
      fontFamily: 'var(--font-heading)',
      fontWeight: weight || '600',
      letterSpacing: 'var(--tracking-tight)',
      lineHeight: 'var(--leading-tight)',
      size: 'var(--text-2xl)',
      className: 'viet-subheading'
    },
    'viet-title': {
      fontFamily: 'var(--font-heading)',
      fontWeight: weight || '600',
      letterSpacing: 'var(--tracking-normal)',
      lineHeight: 'var(--leading-normal)',
      size: 'var(--text-xl)',
      className: 'viet-title'
    },

    // Body text optimized for Vietnamese
    'viet-body': {
      fontFamily: 'var(--font-body)',
      fontWeight: weight || '400',
      letterSpacing: 'var(--tracking-wide)',
      lineHeight: 'var(--leading-relaxed)',
      size: 'var(--text-base)',
      className: 'viet-text'
    },
    'viet-caption': {
      fontFamily: 'var(--font-body)',
      fontWeight: weight || '400',
      letterSpacing: 'var(--tracking-wide)',
      lineHeight: 'var(--leading-normal)',
      size: 'var(--text-sm)',
      className: 'viet-caption'
    },

    // UI Labels and navigation
    'viet-label': {
      fontFamily: 'var(--font-label)',
      fontWeight: weight || '600',
      letterSpacing: 'var(--tracking-wider)',
      lineHeight: 'var(--leading-normal)',
      size: 'var(--text-sm)',
      textTransform: 'uppercase',
      className: 'viet-label'
    },
    'viet-nav': {
      fontFamily: 'var(--font-label)',
      fontWeight: weight || '500',
      letterSpacing: 'var(--tracking-wide)',
      lineHeight: 'var(--leading-normal)',
      size: 'var(--text-sm)',
      className: 'viet-nav'
    },

    // Standard variants
    'h1': {
      fontFamily: 'var(--font-heading)',
      fontWeight: weight || '700',
      letterSpacing: 'var(--tracking-tight)',
      lineHeight: 'var(--leading-tight)',
      size: 'var(--text-6xl)',
      className: ''
    },
    'h2': {
      fontFamily: 'var(--font-heading)',
      fontWeight: weight || '700',
      letterSpacing: 'var(--tracking-tight)',
      lineHeight: 'var(--leading-tight)',
      size: 'var(--text-5xl)',
      className: ''
    },
    'h3': {
      fontFamily: 'var(--font-heading)',
      fontWeight: weight || '600',
      letterSpacing: 'var(--tracking-tight)',
      lineHeight: 'var(--leading-tight)',
      size: 'var(--text-4xl)',
      className: ''
    },
    'h4': {
      fontFamily: 'var(--font-heading)',
      fontWeight: weight || '600',
      letterSpacing: 'var(--tracking-normal)',
      lineHeight: 'var(--leading-normal)',
      size: 'var(--text-3xl)',
      className: ''
    },
    'h5': {
      fontFamily: 'var(--font-heading)',
      fontWeight: weight || '600',
      letterSpacing: 'var(--tracking-normal)',
      lineHeight: 'var(--leading-normal)',
      size: 'var(--text-2xl)',
      className: ''
    },
    'h6': {
      fontFamily: 'var(--font-heading)',
      fontWeight: weight || '600',
      letterSpacing: 'var(--tracking-normal)',
      lineHeight: 'var(--leading-normal)',
      size: 'var(--text-xl)',
      className: ''
    },
    'body': {
      fontFamily: 'var(--font-body)',
      fontWeight: weight || '400',
      letterSpacing: 'var(--tracking-normal)',
      lineHeight: 'var(--leading-normal)',
      size: 'var(--text-base)',
      className: ''
    },
    'small': {
      fontFamily: 'var(--font-body)',
      fontWeight: weight || '400',
      letterSpacing: 'var(--tracking-normal)',
      lineHeight: 'var(--leading-normal)',
      size: 'var(--text-sm)',
      className: ''
    }
  };

  // Color system with cultural meaning
  const colors = {
    'default': 'var(--text)',
    'muted': 'var(--text-muted)',
    'subtle': 'var(--text-subtle)',
    'primary': 'var(--accent-primary)',
    'emphasis': 'var(--accent-emphasis)',
    'success': 'var(--accent-success)',
    'warning': 'var(--accent-warning)',
    'info': 'var(--accent-info)',
    'imperial': 'var(--viet-imperial-yellow)',
    'lucky': 'var(--viet-lucky-red)',
    'jade': 'var(--viet-jade-green)',
    'royal': 'var(--viet-royal-purple)',
    'sky': 'var(--viet-sky-blue)',
    'period-co-dai': 'var(--period-co-dai)',
    'period-phong-kien': 'var(--period-phong-kien)',
    'period-can-dai': 'var(--period-can-dai)',
    'period-hien-dai': 'var(--period-hien-dai)'
  };

  // Text alignment
  const alignments = {
    'left': 'text-left',
    'center': 'text-center',
    'right': 'text-right',
    'justify': 'text-justify'
  };

  // Text transformation
  const transformations = {
    'none': '',
    'uppercase': 'uppercase',
    'lowercase': 'lowercase',
    'capitalize': 'capitalize',
    'full-width': 'full-width'
  };

  // Text decoration
  const decorations = {
    'none': '',
    'underline': 'underline',
    'line-through': 'line-through',
    'overline': 'overline'
  };

  // Vietnamese diacritic-friendly letter spacing
  const spacings = {
    'tighter': 'var(--tracking-tighter)',
    'tight': 'var(--tracking-tight)',
    'normal': 'var(--tracking-normal)',
    'wide': 'var(--tracking-wide)',
    'wider': 'var(--tracking-wider)'
  };

  const variantConfig = variants[variant] || variants.body;
  const baseClasses = [
    variantConfig.className,
    alignments[align] || alignments.left,
    transformations[transform] || transformations.none,
    decorations[decoration] || decorations.none
  ].filter(Boolean).join(' ');

  const computedStyle = {
    fontFamily: variantConfig.fontFamily,
    fontWeight: variantConfig.fontWeight,
    letterSpacing: spacings[spacing] || spacings.normal,
    lineHeight: variantConfig.lineHeight,
    fontSize: size !== 'base' ? `var(--text-${size})` : variantConfig.size,
    color: colors[color] || colors.default,
    textAlign: align
  };

  return (
    <Component
      className={`${baseClasses} ${className}`}
      style={computedStyle}
      {...props}
    >
      {children}
    </Component>
  );
};

// Removed PropTypes for performance - component works without runtime validation

export default Typography;