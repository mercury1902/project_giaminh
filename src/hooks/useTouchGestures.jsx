import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Touch Gesture Hook (Plain JavaScript)
 * Enhanced mobile interaction support for Vietnamese users
 * Supports swipe, pinch, tap, and hold gestures
 */

const useTouchGestures = (elementRef, options = {}) => {
  const {
    swipeThreshold = 50,
    swipeVelocityThreshold = 0.3,
    pinchThreshold = 20,
    holdDuration = 500,
    tapTimeout = 300,
    enableHaptic = true,
    onSwipe,
    onPinch,
    onTap,
    onHold,
    onTouchStart,
    onTouchMove,
    onTouchEnd
  } = options;

  const [gestures, setGestures] = useState({
    isTracking: false,
    swipeDirection: null,
    swipeVelocity: 0,
    pinchDistance: 0,
    isHolding: false,
    tapCount: 0
  });

  const touchStartRef = useRef(null);
  const lastTouchRef = useRef(null);
  const holdTimerRef = useRef(null);
  const tapTimerRef = useRef(null);

  // Haptic feedback for Vietnamese mobile users
  const triggerHaptic = useCallback((type = 'light') => {
    if (!enableHaptic || !window.navigator?.vibrate) return;

    const patterns = {
      light: [10],
      medium: [50],
      heavy: [100],
      success: [10, 50, 10],
      error: [100, 50, 100]
    };

    window.navigator.vibrate(...(patterns[type] || patterns.light));
  }, [enableHaptic]);

  // Calculate distance between two touch points
  const getDistance = useCallback((touch1, touch2) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  // Calculate center point of multiple touches
  const getCenter = useCallback((touches) => {
    const sum = Array.from(touches).reduce((acc, touch) => ({
      x: acc.x + touch.clientX,
      y: acc.y + touch.clientY
    }), { x: 0, y: 0 });

    return {
      x: sum.x / touches.length,
      y: sum.y / touches.length
    };
  }, []);

  // Determine swipe direction and velocity
  const calculateSwipe = useCallback((startTouch, endTouch, duration) => {
    const deltaX = endTouch.clientX - startTouch.clientX;
    const deltaY = endTouch.clientY - startTouch.clientY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance < swipeThreshold) return null;

    const velocity = distance / duration;
    const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;

    let direction;
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      direction = deltaX > 0 ? 'right' : 'left';
    } else {
      direction = deltaY > 0 ? 'down' : 'up';
    }

    return {
      direction,
      velocity,
      distance,
      angle: angle < 0 ? angle + 360 : angle
    };
  }, [swipeThreshold]);

  // Handle touch start
  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    if (!touch) return;

    const currentTime = Date.now();

    // Store initial touch data
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: currentTime,
      count: (touchStartRef.current?.count || 0) + 1
    };

    lastTouchRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: currentTime
    };

    setGestures(prev => ({
      ...prev,
      isTracking: true,
      swipeDirection: null,
      swipeVelocity: 0
    }));

    // Start hold timer
    if (onHold) {
      holdTimerRef.current = setTimeout(() => {
        setGestures(prev => ({ ...prev, isHolding: true }));
        triggerHaptic('medium');
        onHold({
          x: touch.clientX,
          y: touch.clientY,
          duration: holdDuration
        });
      }, holdDuration);
    }

    onTouchStart?.(e);
  }, [onTouchStart, onHold, holdDuration, triggerHaptic]);

  // Handle touch move
  const handleTouchMove = useCallback((e) => {
    if (!touchStartRef.current) return;

    const touches = e.touches;
    const currentTime = Date.now();

    // Handle pinch gesture
    if (touches.length === 2 && onPinch) {
      const distance = getDistance(touches[0], touches[1]);
      const initialDistance = touchStartRef.current?.pinchDistance || distance;

      if (Math.abs(distance - initialDistance) > pinchThreshold) {
        const scale = distance / initialDistance;
        const center = getCenter(touches);

        setGestures(prev => ({
          ...prev,
          pinchDistance: distance,
          isHolding: false
        }));

        // Clear hold timer if pinch detected
        if (holdTimerRef.current) {
          clearTimeout(holdTimerRef.current);
          holdTimerRef.current = null;
        }

        onPinch({
          scale,
          center,
          distance,
          direction: distance > initialDistance ? 'out' : 'in'
        });

        triggerHaptic('light');
      }
    }

    // Update last touch for swipe calculation
    if (touches.length === 1) {
      lastTouchRef.current = {
        x: touches[0].clientX,
        y: touches[0].clientY,
        time: currentTime
      };
    }

    onTouchMove?.(e);
  }, [onTouchMove, onPinch, getDistance, getCenter, pinchThreshold, triggerHaptic]);

  // Handle touch end
  const handleTouchEnd = useCallback((e) => {
    if (!touchStartRef.current || !lastTouchRef.current) return;

    const currentTime = Date.now();
    const touches = e.changedTouches;

    // Clear timers
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }

    // Handle single touch end (potential swipe or tap)
    if (touches.length === 1) {
      const touch = touches[0];
      const duration = currentTime - touchStartRef.current.time;
      const swipe = calculateSwipe(touchStartRef.current, touch, duration);

      if (swipe && onSwipe) {
        setGestures(prev => ({
          ...prev,
          swipeDirection: swipe.direction,
          swipeVelocity: swipe.velocity,
          isTracking: false,
          isHolding: false
        }));

        triggerHaptic('light');
        onSwipe(swipe);
      } else if (duration < tapTimeout && onTap) {
        // Handle potential double tap
        const tapDelay = currentTime - (tapTimerRef.current || 0);

        if (tapDelay < 300) {
          // Double tap detected
          setGestures(prev => ({
            ...prev,
            tapCount: prev.tapCount + 2,
            isTracking: false,
            isHolding: false
          }));

          triggerHaptic('success');
          onTap({
            x: touch.clientX,
            y: touch.clientY,
            doubleTap: true,
            count: gestures.tapCount + 2
          });
        } else {
          // Single tap
          setGestures(prev => ({
            ...prev,
            tapCount: prev.tapCount + 1,
            isTracking: false,
            isHolding: false
          }));

          triggerHaptic('light');
          onTap({
            x: touch.clientX,
            y: touch.clientY,
            doubleTap: false,
            count: gestures.tapCount + 1
          });
        }

        tapTimerRef.current = currentTime;
      }
    }

    // Reset gesture state
    setTimeout(() => {
      setGestures(prev => ({
        ...prev,
        isTracking: false,
        isHolding: false,
        swipeDirection: null,
        swipeVelocity: 0,
        pinchDistance: 0
      }));
    }, 100);

    onTouchEnd?.(e);
  }, [onTouchEnd, onTap, calculateSwipe, tapTimeout, triggerHaptic, gestures.tapCount]);

  // Setup event listeners
  useEffect(() => {
    const element = elementRef?.current;
    if (!element) return;

    const options = { passive: false, capture: true };

    element.addEventListener('touchstart', handleTouchStart, options);
    element.addEventListener('touchmove', handleTouchMove, options);
    element.addEventListener('touchend', handleTouchEnd, options);
    element.addEventListener('touchcancel', handleTouchEnd, options);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart, options);
      element.removeEventListener('touchmove', handleTouchMove, options);
      element.removeEventListener('touchend', handleTouchEnd, options);
      element.removeEventListener('touchcancel', handleTouchEnd, options);

      // Clear timers
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
      }
      if (tapTimerRef.current) {
        clearTimeout(tapTimerRef.current);
      }
    };
  }, [elementRef, handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
      }
      if (tapTimerRef.current) {
        clearTimeout(tapTimerRef.current);
      }
    };
  }, []);

  return {
    gestures,
    // Helper functions for manual gesture triggering
    triggerSwipe: (direction, velocity = 1) => {
      if (onSwipe) {
        triggerHaptic('light');
        onSwipe({ direction, velocity, distance: swipeThreshold, angle: 0 });
      }
    },
    triggerTap: (x = 0, y = 0) => {
      if (onTap) {
        triggerHaptic('light');
        onTap({ x, y, doubleTap: false, count: gestures.tapCount + 1 });
      }
    },
    triggerHold: (x = 0, y = 0) => {
      if (onHold) {
        triggerHaptic('medium');
        onHold({ x, y, duration: holdDuration });
      }
    }
  };
};

export default useTouchGestures;