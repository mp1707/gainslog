import { useRouter } from "expo-router";
import { useRef, useState, useCallback, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { InteractionManager } from "react-native";
import { useNavigationTransition } from "@/context/NavigationTransitionContext";

/**
 * Navigation guard hook to prevent multiple rapid navigation calls
 * using Expo Router only.
 */
export function useNavigationGuard() {
  const router = useRouter();
  const lockedRef = useRef(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastFocusAtRef = useRef<number>(Date.now());
  const { isTransitioning } = useNavigationTransition();
  const isTransitioningRef = useRef(isTransitioning);

  useEffect(() => {
    isTransitioningRef.current = isTransitioning;
  }, [isTransitioning]);

  // Track when the screen becomes focused to delay navigation slightly
  useFocusEffect(
    useCallback(() => {
      lastFocusAtRef.current = Date.now();
      return undefined;
    }, [])
  );

  // When transitions finish, bump focus time reference
  useEffect(() => {
    if (!isTransitioning) {
      lastFocusAtRef.current = Date.now();
    }
  }, [isTransitioning]);

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
      }, 300);

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

  const maybeSchedule = useCallback(
    (navigationFn: () => void) => {
      const minDelay = 50; // wait a beat after focus/transition
      const MAX_WAIT = 600; // ms; prevent guarding forever
      const CHECK_INTERVAL = 80;
      const startTs = Date.now();

      const waitAndNavigate = () => {
        const stillTransitioning = isTransitioningRef.current;
        const exceededWait = Date.now() - startTs > MAX_WAIT;

        if (stillTransitioning && !exceededWait) {
          InteractionManager.runAfterInteractions(() => {
            setTimeout(waitAndNavigate, CHECK_INTERVAL);
          });
          return;
        }

        const elapsed = Date.now() - lastFocusAtRef.current;
        const delay = elapsed < minDelay ? minDelay - elapsed + 50 : 0;

        InteractionManager.runAfterInteractions(() => {
          setTimeout(() => executeNavigation(navigationFn), delay);
        });
      };

      waitAndNavigate();
    },
    [executeNavigation]
  );

  const safeNavigate = useCallback(
    (route: string) => maybeSchedule(() => router.navigate(route)),
    [router, maybeSchedule]
  );

  const safeReplace = useCallback(
    (route: string) => maybeSchedule(() => router.replace(route)),
    [router, maybeSchedule]
  );

  const safePush = useCallback(
    (route: string) => maybeSchedule(() => router.push(route)),
    [router, maybeSchedule]
  );

  const safeDismissTo = useCallback(
    (route: string) => maybeSchedule(() => router.dismissTo(route)),
    [router, maybeSchedule]
  );

  const safeDismiss = useCallback(
    () => maybeSchedule(() => router.dismiss()),
    [router, maybeSchedule]
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
    safeDismiss,
    isNavigating,
    unlockNavigation,
  };
}
