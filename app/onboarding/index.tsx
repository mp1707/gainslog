import { useEffect } from "react";
import { useRouter } from "expo-router";
import { useOnboardingStore } from "@/store/useOnboardingStore";

export default function OnboardingIndex() {
  const router = useRouter();
  const { reset } = useOnboardingStore();

  useEffect(() => {
    // Reset onboarding store to ensure clean state
    reset();
    // Redirect to first step
    router.replace("/onboarding/age");
  }, []);

  return null;
}
