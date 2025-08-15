import { Stack } from "expo-router";
import { useTheme } from "@/providers";
import React from "react";

export default function CalculatorLayout() {
  const { colors } = useTheme();

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
      }}
    >
      <Stack.Screen
        name="step1-personal-info"
        options={{
          title: "Personal Information",
        }}
      />
      <Stack.Screen
        name="step2-activity-level"
        options={{
          title: "Activity Level",
        }}
      />
      <Stack.Screen
        name="step3-goals"
        options={{
          title: "Choose Your Goal",
        }}
      />
    </Stack>
  );
}