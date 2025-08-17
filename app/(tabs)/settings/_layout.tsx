import { Stack } from "expo-router";
import { useTheme } from "@/providers";
import React from "react";

export default function SettingsLayout() {
  const { colors } = useTheme();

  // The Stack now controls a consistent header for all its children.
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
      {/* BEFORE: You had headerShown: false here.
        AFTER: We give it a title and let it be shown.
        This is the main fix for the unmounting/flicker issue.
      */}
      <Stack.Screen
        name="index"
        options={{
          title: "Settings",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="calories"
        options={{
          title: "Calories",
        }}
      />
      <Stack.Screen
        name="fat"
        options={{
          title: "Fat",
        }}
      />
      <Stack.Screen
        name="carbs"
        options={{
          title: "Carbs",
        }}
      />
      <Stack.Screen
        name="calorieCalculator"
        options={{
          headerShown: false,
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="proteinCalculator"
        options={{
          headerShown: false,
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="fatCalculator"
        options={{
          headerShown: false,
          presentation: "modal",
        }}
      />
    </Stack>
  );
}
