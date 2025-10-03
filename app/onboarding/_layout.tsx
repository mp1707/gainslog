import { Stack, usePathname } from "expo-router";
import { useTheme } from "@/theme";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { View } from "react-native";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { OnboardingHeader } from "../../src/components/onboarding/OnboardingHeader";

const STEP_MAP: Record<string, number> = {
  "/onboarding/age": 0,
  "/onboarding/sex": 1,
  "/onboarding/height": 2,
  "/onboarding/weight": 3,
  "/onboarding/activity-level": 4,
  "/onboarding/calorie-goal": 5,
  "/onboarding/protein-goal": 6,
  "/onboarding/summary": 7,
};

const TOTAL_STEPS = 7;

export default function OnboardingLayout() {
  const { colors } = useTheme();
  const { safeDismissTo } = useNavigationGuard();
  const { setUserSkippedOnboarding } = useOnboardingStore();
  const router = useRouter();
  const pathname = usePathname();

  const currentStep = useMemo(() => STEP_MAP[pathname] ?? -1, [pathname]);
  const showProgressBar = currentStep >= 0;

  const handleSkip = () => {
    setUserSkippedOnboarding(true);
    safeDismissTo("/");
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.primaryBackground }}>
      <OnboardingHeader
        onBack={handleBack}
        onSkip={handleSkip}
        currentStep={currentStep}
        totalSteps={TOTAL_STEPS}
        showProgressBar={showProgressBar}
      />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          contentStyle: { backgroundColor: colors.primaryBackground },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="age" />
        <Stack.Screen name="sex" />
        <Stack.Screen name="height" />
        <Stack.Screen name="weight" />
        <Stack.Screen name="activity-level" />
        <Stack.Screen name="calorie-goal" />
        <Stack.Screen name="protein-goal" />
        <Stack.Screen name="summary" />
      </Stack>
    </View>
  );
}
