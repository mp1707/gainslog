import { Stack } from "expo-router";
import { useNavigationGuard } from "@/shared/hooks/useNavigationGuard";
import { useTheme } from "@/providers";
import { CancelButton } from "@/shared/ui/atoms/CancelButton";
import React from "react";

export default function CalculatorLayout() {
  const { colors } = useTheme();
  const { safeDismissTo } = useNavigationGuard();

  const handleCancel = () => {
    safeDismissTo("/settings");
  };

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
        headerRight: () => <CancelButton onPress={handleCancel} />,
      }}
    >
      <Stack.Screen
        name="sex"
        options={{
          title: "",
        }}
      />
      <Stack.Screen
        name="age"
        options={{
          title: "",
        }}
      />
      <Stack.Screen
        name="weight"
        options={{
          title: "",
        }}
      />
      <Stack.Screen
        name="height"
        options={{
          title: "",
        }}
      />
      <Stack.Screen
        name="activitylevel"
        options={{
          title: "Activity Level",
        }}
      />
      <Stack.Screen
        name="goals"
        options={{
          title: "",
        }}
      />
      <Stack.Screen
        name="manualInput"
        options={{
          title: "",
        }}
      />
      <Stack.Screen
        name="editCalories"
        options={{
          title: "",
          // presentation: "modal",
        }}
      />
    </Stack>
  );
}
