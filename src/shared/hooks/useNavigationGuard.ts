import { useRouter, useNavigation } from "expo-router";
import { useEffect, useRef, useState, useCallback } from "react";

/**
 * Navigation guard hook to prevent multiple rapid navigation calls.
 * Uses core navigation events (blur, beforeRemove) to safely re-enable navigation after completion.
 * Includes timeout fallback for edge cases.
 *
 * @returns Object with safeNavigate function and isNavigating state
 */
export function useNavigationGuard() {
  const router = useRouter();
  const navigation = useNavigation();
  const lockedRef = useRef(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Unified unlock function called by all events
  const unlockNavigation = useCallback(() => {
    lockedRef.current = false;
    setIsNavigating(false);

    // Clear timeout if it exists
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    // Listen to navigation events that can indicate completion
    const unsubscribeBeforeRemove = navigation.addListener(
      "beforeRemove",
      () => {
        unlockNavigation();
      }
    );

    const unsubscribeBlur = navigation.addListener("blur", () => {
      unlockNavigation();
    });

    // Cleanup function
    return () => {
      unsubscribeBeforeRemove();
      unsubscribeBlur();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [navigation, unlockNavigation]);

  /**
   * Safe navigation function that prevents multiple rapid calls.
   * Uses router.navigate (idempotent) to avoid duplicate screens.
   * Includes 1-second timeout fallback for edge cases.
   *
   * @param route - The route to navigate to
   */
  const safeNavigate = useCallback(
    (route: string) => {
      if (lockedRef.current) {
        return;
      }

      lockedRef.current = true;
      setIsNavigating(true);

      // Set 1-second timeout fallback
      timeoutRef.current = setTimeout(() => {
        unlockNavigation();
      }, 1000);

      router.navigate(route);
    },
    [router, unlockNavigation]
  );

  /**
   * Safe push function for cases where you specifically need push behavior.
   * Note: This can still create duplicate screens if called rapidly,
   * but will prevent multiple rapid calls.
   * Includes 1-second timeout fallback for edge cases.
   *
   * @param route - The route to push to
   */
  const safePush = useCallback(
    (route: string) => {
      if (lockedRef.current) {
        return;
      }

      lockedRef.current = true;
      setIsNavigating(true);

      // Set 1-second timeout fallback
      timeoutRef.current = setTimeout(() => {
        unlockNavigation();
      }, 1000);

      router.push(route);
    },
    [router, unlockNavigation]
  );

  return {
    safeNavigate,
    safePush,
    isNavigating,
  };
}
