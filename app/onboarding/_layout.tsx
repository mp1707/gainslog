import { Stack } from "expo-router";
import { useTheme } from "@/theme";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { View } from "react-native";
import { ChevronLeft, X } from "lucide-react-native";
import { RoundButton } from "@/components/shared/RoundButton";
import { useRouter } from "expo-router";
import React from "react";

export default function OnboardingLayout() {
  const { colors, theme } = useTheme();
  const { safeReplace } = useNavigationGuard();
  const { setUserSkippedOnboarding } = useOnboardingStore();
  const router = useRouter();

  const handleSkip = () => {
    setUserSkippedOnboarding(true);
    safeReplace("/");
  };

  const handleBack = () => {
    router.back();
  };

  const FloatingNavigation = () => (
    <>
      <View style={{
        position: "absolute",
        top: theme.spacing.md,
        left: theme.spacing.md,
        zIndex: 10,
      }}>
        <RoundButton
          onPress={handleBack}
          Icon={ChevronLeft}
          variant="tertiary"
          accessibilityLabel="Go back"
          accessibilityHint="Navigate to previous step"
        />
      </View>
      <View style={{
        position: "absolute",
        top: theme.spacing.md,
        right: theme.spacing.md,
        zIndex: 10,
      }}>
        <RoundButton
          onPress={handleSkip}
          Icon={X}
          variant="tertiary"
          accessibilityLabel="Skip onboarding"
          accessibilityHint="Skip the onboarding process"
        />
      </View>
    </>
  );

  return (
    <View style={{ flex: 1 }}>
      <FloatingNavigation />
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