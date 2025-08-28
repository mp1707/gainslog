import { Stack } from "expo-router";
import { ThemeProvider } from "@/theme";
import React, { useEffect } from "react";
import ToastManager from "toastify-react-native";
import { useFonts } from "../src/hooks/useFonts";
import { View, Text, ActivityIndicator } from "react-native";
import { theme } from "../src/theme";

export default function RootLayout() {
  const { fontsLoaded, error } = useFonts();

  // No explicit load needed; zustand persist rehydrates

  // Show loading screen while fonts are loading
  if (!fontsLoaded) {
    const colors = theme.getColors();
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.primaryBackground,
        }}
      >
        <ActivityIndicator size="large" color={colors.accent} />
        <Text
          style={{ marginTop: 16, fontSize: 16, color: colors.secondaryText }}
        >
          Loading...
        </Text>
        {error && (
          <Text
            style={{
              marginTop: 8,
              fontSize: 14,
              color: colors.error,
              textAlign: "center",
            }}
          >
            Font loading error: {error}
          </Text>
        )}
      </View>
    );
  }

  return (
    <ThemeProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="create"
          options={{
            presentation: "modal",
            headerShown: false,
          }}
        />
      </Stack>
      <ToastManager />
    </ThemeProvider>
  );
}
