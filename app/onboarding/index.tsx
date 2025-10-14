import { useEffect } from "react";

import { useSafeRouter } from "@/hooks/useSafeRouter";
import { useOnboardingStore } from "@/store/useOnboardingStore";

export default function OnboardingIndex() {
  const { replace } = useSafeRouter();
  const { reset } = useOnboardingStore();

  useEffect(() => {
    // Reset onboarding store to ensure clean state
    reset();
    // Redirect to first step
    replace("/onboarding/target-method");
  }, [reset, replace]);

  return null;
}
