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
        name="sex"
        options={{
          title: "Biological Sex",
        }}
      />
      <Stack.Screen
        name="age"
        options={{
          title: "Age",
        }}
      />
      <Stack.Screen
        name="weight"
        options={{
          title: "Weight",
        }}
      />
      <Stack.Screen
        name="height"
        options={{
          title: "Height",
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
          title: "Choose Your Goal",
        }}
      />
    </Stack>
  );
}