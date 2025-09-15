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
    </Stack>
  );
}
