import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Centralized animation configuration matching the DashboardRing spring animation
 * Used for consistent feel across all animated components
 */
export const SPRING_CONFIG = {
  mass: 1.2,
  damping: 25,
  stiffness: 80,
} as const;

/**
 * Easing function for smooth count-up animations
 * Ease-out cubic with no oscillation or bounce
 */
export const easeOutCubic = (t: number): number => {
  return 1 - Math.pow(1 - t, 3);
};

/**
 * Hook for animating number reveals with subtle flicker and smooth count-up
 * Features:
 * - Instant updates for tiny changes (≤2 units)
 * - Optional flicker effect for significant changes (>15 units)
 * - Smooth ease-out cubic animation (2000ms)
 * - Constrained randomness in flicker phase
 */
export const useNumberReveal = (initial: number) => {
  const prevRef = useRef(initial);
  const [display, setDisplay] = useState(initial);
  const flickerRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<number | null>(null);

  const animateTo = useCallback((target: number, delay: number = 0) => {
    const startPrev = prevRef.current;
    prevRef.current = target;

    // Clear any existing animations
    if (flickerRef.current) {
      clearInterval(flickerRef.current);
      flickerRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    const from = isNaN(startPrev) ? 0 : startPrev;
    const difference = Math.abs(target - from);

    // Skip animation entirely for very small changes (≤2 units)
    if (difference <= 2) {
      if (delay > 0) {
        setTimeout(() => setDisplay(target), delay);
      } else {
        setDisplay(target);
      }
      return;
    }

    const shouldFlicker = difference > 15; // Only flicker for significant changes

    const startCountAnimation = () => {
      // Smooth count-up/down with gentle ease-out cubic (~2000ms)
      const total = 2000;
      const start = Date.now();

      const tick = () => {
        const t = Math.min(1, (Date.now() - start) / total);
        const eased = easeOutCubic(t);
        const val = Math.round(from + (target - from) * eased);
        setDisplay(val);

        if (t < 1) {
          animationRef.current = requestAnimationFrame(tick);
        } else {
          animationRef.current = null;
        }
      };

      animationRef.current = requestAnimationFrame(tick);
    };

    const startAnimation = () => {
      if (shouldFlicker) {
        // Phase 1: Gentler slot-machine effect (120ms with constrained randomness)
        const flickerDuration = 120;
        const flickerStep = 60;
        let elapsed = 0;

        const min = Math.min(from, target);
        const max = Math.max(from, target);
        const range = max - min;

        flickerRef.current = setInterval(() => {
          elapsed += flickerStep;

          // Constrained randomness - flicker within 40% of the actual range
          const jitter = Math.random() * range * 0.4;
          const flickerValue = Math.max(0, Math.round(min + jitter));
          setDisplay(flickerValue);

          if (elapsed >= flickerDuration) {
            if (flickerRef.current) {
              clearInterval(flickerRef.current);
              flickerRef.current = null;
            }
            startCountAnimation();
          }
        }, flickerStep);
      } else {
        // Skip flicker for smaller changes, go straight to smooth count
        startCountAnimation();
      }
    };

    if (delay > 0) {
      setTimeout(startAnimation, delay);
    } else {
      startAnimation();
    }
  }, []);

  const setValue = useCallback((value: number) => {
    // Clear any existing animations
    if (flickerRef.current) {
      clearInterval(flickerRef.current);
      flickerRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    // Set value instantly without animation
    prevRef.current = value;
    setDisplay(value);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (flickerRef.current) {
        clearInterval(flickerRef.current);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return { display, animateTo, setValue } as const;
};