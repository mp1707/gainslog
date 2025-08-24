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

  // Route validation helper
  const isValidRoute = useCallback((route: string): boolean => {
    try {
      // Basic route validation - check if route follows expected patterns
      const validPatterns = [
        /^\/$/, // Root route
        /^\/\w+$/, // Single level routes
        /^\/\w+\/[\w\-_]+$/, // Two level routes with dynamic parameters
        /^\/\w+\/\w+\/[\w\-_]+$/, // Three level routes with dynamic parameters
        /^\/food-log-detail\/[\w\-_]+$/, // Food log detail routes with complex IDs
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
    // Always clear the lock and navigation state to prevent stuck states
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
   * Execute navigation with proper locking and timeout fallback
   */
  const executeNavigation = useCallback(
    (navigationFn: () => void) => {
      // Double-check lock state before proceeding
      if (lockedRef.current) {
        console.warn("[NavigationGuard] Navigation already in progress, ignoring duplicate call");
        return;
      }

      try {
        lockedRef.current = true;
        setIsNavigating(true);

        // Set fallback timeout to prevent permanent locks
        timeoutRef.current = setTimeout(() => {
          console.warn("[NavigationGuard] Navigation timeout reached, unlocking");
          unlockNavigation();
        }, 1000);

        navigationFn();
      } catch (error) {
        console.error("[NavigationGuard] Navigation failed:", error);
        // Immediately unlock on navigation failure
        unlockNavigation();
      }
    },
    [unlockNavigation]
  );

  /**
   * Safe navigation function that prevents multiple rapid calls.
   * Uses router.navigate (idempotent navigation).
   * Includes route validation and error recovery.
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

      executeNavigation(() => router.navigate(route));
    },
    [router, isValidRoute, executeNavigation]
  );

  /**
   * Safe replace function that prevents multiple rapid calls.
   * Uses router.replace to replace the current screen.
   * Includes route validation and error recovery.
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

      executeNavigation(() => router.replace(route));
    },
    [router, isValidRoute, executeNavigation]
  );

  /**
   * Safe push function for cases where you specifically need push behavior.
   * Note: This can still create duplicate screens if called rapidly,
   * but will prevent multiple rapid calls.
   * Includes route validation and error recovery.
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

      executeNavigation(() => router.push(route));
    },
    [router, isValidRoute, executeNavigation]
  );

  /**
   * Safe dismissTo function for dismissing modals/stacks to a specific route.
   * Prevents multiple rapid calls and provides navigation state feedback.
   * Includes route validation and error recovery.
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

      executeNavigation(() => router.dismissTo(route));
    },
    [router, isValidRoute, executeNavigation]
  );

  return {
    safeNavigate,
    safeReplace,
    safePush,
    safeDismissTo,
    isNavigating,
  };
}
