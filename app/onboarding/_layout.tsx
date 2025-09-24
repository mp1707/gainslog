import { Stack } from "expo-router";
import { useTheme } from "@/theme";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { TouchableOpacity, Text } from "react-native";
import React from "react";

export default function OnboardingLayout() {
  const { colors, theme } = useTheme();
  const { safeReplace } = useNavigationGuard();
  const { setUserSkippedOnboarding } = useOnboardingStore();

  const handleSkip = () => {
    setUserSkippedOnboarding(true);
    safeReplace("/");
  };

  const SkipButton = () => (
    <TouchableOpacity onPress={handleSkip} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
      <Text
        style={{
          color: colors.secondaryText,
          fontSize: theme.typography.Body.fontSize,
          fontFamily: theme.typography.Body.fontFamily,
        }}
      >
        Skip
      </Text>
    </TouchableOpacity>
  );

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primaryBackground,
        },
        headerTintColor: colors.primaryText,
        headerTitleStyle: {
          color: colors.primaryText,
        },
        headerShadowVisible: false,
        animation: "slide_from_right",
        headerShown: true,
        headerTitle: "",
        headerRight: () => <SkipButton />,
      }}
    >
      <Stack.Screen
        name="age"
        options={{
          title: "Age",
        }}
      />
      <Stack.Screen
        name="sex"
        options={{
          title: "Sex",
        }}
      />
      <Stack.Screen
        name="height"
        options={{
          title: "Height",
        }}
      />
      <Stack.Screen
        name="weight"
        options={{
          title: "Weight",
        }}
      />
      <Stack.Screen
        name="activity-level"
        options={{
          title: "Activity Level",
        }}
      />
      <Stack.Screen
        name="calorie-goal"
        options={{
          title: "Calorie Goal",
        }}
      />
      <Stack.Screen
        name="protein-goal"
        options={{
          title: "Protein Goal",
        }}
      />
      <Stack.Screen
        name="summary"
        options={{
          title: "Summary",
        }}
      />
    </Stack>
  );
}