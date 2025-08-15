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
          fontWeight: "600",
        },
        headerShadowVisible: false,
        animation: "slide_from_right",
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="sex"
        options={{
          title: "Select Sex",
          headerLeft: () => null,
        }}
      />
      <Stack.Screen
        name="age"
        options={{
          title: "Select Age",
        }}
      />
      <Stack.Screen
        name="weight"
        options={{
          title: "Select Weight",
        }}
      />
      <Stack.Screen
        name="height"
        options={{
          title: "Select Height",
        }}
      />
      <Stack.Screen
        name="activity-level"
        options={{
          title: "Activity Level",
        }}
      />
      <Stack.Screen
        name="goals"
        options={{
          title: "Select Goals",
        }}
      />
    </Stack>
  );
}