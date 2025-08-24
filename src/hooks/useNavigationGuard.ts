import { useRouter, useNavigation } from "expo-router";
import { useEffect, useRef, useState, useCallback } from "react";

/**
 * Navigation guard hook to prevent multiple rapid navigation calls.
 * Uses core navigation events (blur, beforeRemove) to safely re-enable navigation after completion.
 * Includes timeout fallback for edge cases.
 * Now includes route validation and debouncing for improved stability.
 *
 * @returns Object with safeNavigate function and isNavigating state
 */
export function useNavigationGuard() {
  const router = useRouter();
  const navigation = useNavigation();
  const lockedRef = useRef(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Route validation helper
  const isValidRoute = useCallback((route: string): boolean => {
    try {
      // Basic route validation - check if route follows expected patterns
      const validPatterns = [
        /^\/$/, // Root route
        /^\/\w+$/, // Single level routes
        /^\/\w+\/\w+$/, // Two level routes
        /^\/\w+\/\w+\/\w+$/, // Three level routes (like /settings/proteinCalculator/editProtein)
        /^\/\(tabs\)\/\w+$/, // Tab routes
        /^\/\(tabs\)\/\w+\/\w+$/, // Tab sub-routes
        /^\/\(tabs\)\/\w+\/\w+\/\w+$/, // Tab nested routes
      ];

      return validPatterns.some((pattern) => pattern.test(route));
    } catch (error) {
      console.warn("[NavigationGuard] Route validation error:", error);
      return false;
    }
  }, []);

  // Unified unlock function called by all events
  const unlockNavigation = useCallback(() => {
    // Avoid unnecessary state updates if we're already unlocked and idle
    if (!lockedRef.current && !isNavigating) {
      return;
    }

    lockedRef.current = false;
    if (isNavigating) {
      setIsNavigating(false);
    }

    // Clear all timeouts if they exist
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }
  }, [isNavigating]);

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
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [navigation, unlockNavigation]);

  /**
   * Debounced navigation helper
   */
  const debouncedNavigate = useCallback(
    (navigationFn: () => void, delay: number = 150) => {
      // Clear existing debounce timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Set new debounce timeout
      debounceTimeoutRef.current = setTimeout(() => {
        navigationFn();
        debounceTimeoutRef.current = null;
      }, delay);
    },
    []
  );

  /**
   * Safe navigation function that prevents multiple rapid calls.
   * Uses router.navigate (idempotent navigation).
   * Includes route validation, debouncing, and error recovery.
   *
   * @param route - The route to navigate to
   */
  const safeNavigate = useCallback(
    (route: string) => {
      if (lockedRef.current) {
        return;
      }

      // Validate route before proceeding
      if (!isValidRoute(route)) {
        console.warn("[NavigationGuard] Invalid route attempted:", route);
        return;
      }

      const performNavigation = () => {
        try {
          lockedRef.current = true;
          setIsNavigating(true);

          // Set 1-second timeout fallback
          timeoutRef.current = setTimeout(() => {
            unlockNavigation();
          }, 1000);

          router.navigate(route);
        } catch (error) {
          console.error("[NavigationGuard] Navigation failed:", error);
          // Immediately unlock on navigation failure
          unlockNavigation();
        }
      };

      // Use debounced navigation to prevent rapid-fire calls
      debouncedNavigate(performNavigation);
    },
    [router, unlockNavigation, isValidRoute, debouncedNavigate]
  );

  /**
   * Safe replace function that prevents multiple rapid calls.
   * Uses router.replace to replace the current screen.
   * Includes route validation, debouncing, and error recovery.
   *
   * @param route - The route to replace with
   */
  const safeReplace = useCallback(
    (route: string) => {
      if (lockedRef.current) {
        return;
      }

      // Validate route before proceeding
      if (!isValidRoute(route)) {
        console.warn(
          "[NavigationGuard] Invalid route attempted (replace):",
          route
        );
        return;
      }

      const performNavigation = () => {
        try {
          lockedRef.current = true;
          setIsNavigating(true);

          // Set 1-second timeout fallback
          timeoutRef.current = setTimeout(() => {
            unlockNavigation();
          }, 1000);

          router.replace(route);
        } catch (error) {
          console.error("[NavigationGuard] Replace navigation failed:", error);
          // Immediately unlock on navigation failure
          unlockNavigation();
        }
      };

      // Use debounced navigation to prevent rapid-fire calls
      debouncedNavigate(performNavigation);
    },
    [router, unlockNavigation, isValidRoute, debouncedNavigate]
  );

  /**
   * Safe push function for cases where you specifically need push behavior.
   * Note: This can still create duplicate screens if called rapidly,
   * but will prevent multiple rapid calls.
   * Includes route validation, debouncing, and error recovery.
   *
   * @param route - The route to push to
   */
  const safePush = useCallback(
    (route: string) => {
      if (lockedRef.current) {
        return;
      }

      // Validate route before proceeding
      if (!isValidRoute(route)) {
        console.warn(
          "[NavigationGuard] Invalid route attempted (push):",
          route
        );
        return;
      }

      const performNavigation = () => {
        try {
          lockedRef.current = true;
          setIsNavigating(true);

          // Set 1-second timeout fallback
          timeoutRef.current = setTimeout(() => {
            unlockNavigation();
          }, 1000);

          router.push(route);
        } catch (error) {
          console.error("[NavigationGuard] Push navigation failed:", error);
          // Immediately unlock on navigation failure
          unlockNavigation();
        }
      };

      // Use debounced navigation to prevent rapid-fire calls
      debouncedNavigate(performNavigation);
    },
    [router, unlockNavigation, isValidRoute, debouncedNavigate]
  );

  /**
   * Safe dismissTo function for dismissing modals/stacks to a specific route.
   * Prevents multiple rapid calls and provides navigation state feedback.
   * Includes route validation, debouncing, and error recovery.
   *
   * @param route - The route to dismiss to
   */
  const safeDismissTo = useCallback(
    (route: string) => {
      if (lockedRef.current) {
        return;
      }

      // Validate route before proceeding
      if (!isValidRoute(route)) {
        console.warn(
          "[NavigationGuard] Invalid route attempted (dismissTo):",
          route
        );
        return;
      }

      const performNavigation = () => {
        try {
          lockedRef.current = true;
          setIsNavigating(true);

          // Set 1-second timeout fallback
          timeoutRef.current = setTimeout(() => {
            unlockNavigation();
          }, 1000);

          router.dismissTo(route);
        } catch (error) {
          console.error(
            "[NavigationGuard] DismissTo navigation failed:",
            error
          );
          // Immediately unlock on navigation failure
          unlockNavigation();
        }
      };

      // Use debounced navigation to prevent rapid-fire calls
      debouncedNavigate(performNavigation);
    },
    [router, unlockNavigation, isValidRoute, debouncedNavigate]
  );

  return {
    safeNavigate,
    safeReplace,
    safePush,
    safeDismissTo,
    isNavigating,
  };
}
