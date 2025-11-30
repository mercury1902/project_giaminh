import React from 'react';

/**
 * Content Layers Component
 * Layered content architecture for better information hierarchy
 * Vietnamese cultural integration with z-index management
 */
const ContentLayers = ({
  baseLayer,
  overlayLayer = null,
  isOverlayVisible = false,
  className = '',
  children,
  ...props
}) => {
  return (
    <div className={`content-layers ${className}`} role="region" aria-label="Layered content">
      {/* Base Content Layer */}
      <div className="content-layer-base" role="region" aria-label="Base content">
        {baseLayer}
      </div>

      {/* Overlay Content Layer */}
      {overlayLayer && (
        <div
          className={`content-layer-overlay ${isOverlayVisible ? 'visible' : 'hidden'}`}
          role="region"
          aria-label="Overlay content"
          aria-hidden={!isOverlayVisible}
        >
          {overlayLayer}
        </div>
      )}

      {/* Children as Additional Layers */}
      {children}
    </div>
  );
};

export default ContentLayers;