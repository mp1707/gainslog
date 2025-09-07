import { Stack } from "expo-router";
import { useTheme } from "@/theme";
import React from "react";
import { CancelButton } from "@/components/shared/CancelButton";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";

export default function SettingsLayout() {
  const { safeDismissTo } = useNavigationGuard();
  const { colors } = useTheme();
  const handleCancel = () => {
    safeDismissTo("/settings");
  };
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
        headerRight: () => <CancelButton onPress={handleCancel} />,
      }}
    >
      {/* Settings main page */}
      <Stack.Screen
        name="index"
        options={{
          title: "Settings",
          headerShown: false,
        }}
      />

      {/* Calorie Calculator Routes */}
      <Stack.Screen
        name="calorie-sex"
        options={{
          title: "",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="calorie-age"
        options={{
          title: "",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="calorie-weight"
        options={{
          title: "",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="calorie-height"
        options={{
          title: "",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="calorie-activitylevel"
        options={{
          title: "Activity Level",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="calorie-goals"
        options={{
          title: "",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="calorie-manualInput"
        options={{
          title: "",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="calorie-editCalories"
        options={{
          title: "",
          headerShown: false,
        }}
      />

      {/* Protein Calculator Routes */}
      <Stack.Screen
        name="protein-weight"
        options={{
          title: "",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="protein-goals"
        options={{
          title: "",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="protein-manualInput"
        options={{
          title: "",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="protein-editProtein"
        options={{
          title: "",
          headerShown: false,
        }}
      />

      {/* Fat Calculator Routes */}
      <Stack.Screen
        name="fat-editFat"
        options={{
          title: "",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="fat-manualInput"
        options={{
          title: "",
          headerShown: false,
        }}
      />

      {/* Carb Calculator Routes */}
      <Stack.Screen
        name="carbs"
        options={{
          title: "",
          headerShown: false,
        }}
      />
    </Stack>
  );
}
