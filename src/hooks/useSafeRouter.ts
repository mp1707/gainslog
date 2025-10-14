import { useMemo } from "react";
import { useRouter } from "expo-router";

import { useNavigationGuard } from "@/hooks/useNavigationGuard";

export function useSafeRouter() {
  const router = useRouter();
  const {
    safeNavigate,
    safeReplace,
    safePush,
    safeDismissTo,
    safeDismiss,
    safeBack,
    isNavigating,
    unlockNavigation,
  } = useNavigationGuard();

  return useMemo(
    () => ({
      ...router,
      navigate: safeNavigate,
      replace: safeReplace,
      push: safePush,
      dismissTo: safeDismissTo,
      dismiss: safeDismiss,
      back: safeBack,
      isNavigating,
      unlockNavigation,
    }),
    [
      router,
      safeNavigate,
      safeReplace,
      safePush,
      safeDismissTo,
      safeDismiss,
      safeBack,
      isNavigating,
      unlockNavigation,
    ]
  );
}

