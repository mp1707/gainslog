import { useRouter } from "expo-router";
import { useRef, useState, useCallback, useEffect } from "react";

/**
 * Navigation guard hook to prevent multiple rapid navigation calls
 * using Expo Router only.
 */
export function useNavigationGuard() {
  const router = useRouter();
  const lockedRef = useRef(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const unlockNavigation = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    lockedRef.current = false;
    setIsNavigating(false);
  }, []);

  const executeNavigation = useCallback(
    (navigationFn: () => void) => {
      if (lockedRef.current) {
        console.warn("[NavigationGuard] Navigation already in progress");
        return;
      }

      // Clear any existing timeout first
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      lockedRef.current = true;
      setIsNavigating(true);

      // fallback unlock
      timeoutRef.current = setTimeout(() => {
        console.warn("[NavigationGuard] Timeout reached, unlocking");
        unlockNavigation();
      }, 1000);

      try {
        navigationFn();
        // Clear timeout after successful navigation
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        unlockNavigation();
      } catch (err) {
        console.error("[NavigationGuard] Navigation failed:", err);
        unlockNavigation();
      }
    },
    [unlockNavigation]
  );

  const safeNavigate = useCallback(
    (route: string) => executeNavigation(() => router.navigate(route)),
    [router, executeNavigation]
  );

  const safeReplace = useCallback(
    (route: string) => executeNavigation(() => router.replace(route)),
    [router, executeNavigation]
  );

  const safePush = useCallback(
    (route: string) => executeNavigation(() => router.push(route)),
    [router, executeNavigation]
  );

  const safeDismissTo = useCallback(
    (route: string) => executeNavigation(() => router.dismissTo(route)),
    [router, executeNavigation]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  return {
    safeNavigate,
    safeReplace,
    safePush,
    safeDismissTo,
    isNavigating,
    unlockNavigation,
  };
}
