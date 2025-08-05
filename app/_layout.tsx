import { Stack } from "expo-router";
import { useFoodLogStore } from "../src/stores/useFoodLogStore";
import { ThemeProvider } from "../src/providers/ThemeProvider";
import React, { useEffect } from "react";
import ToastManager from "toastify-react-native";
import { useFonts } from "../src/hooks/useFonts";
import { View, Text, ActivityIndicator } from "react-native";

export default function RootLayout() {
  const { loadFoodLogs, loadDailyTargets } = useFoodLogStore();
  const { fontsLoaded, error } = useFonts();

  useEffect(() => {
    loadFoodLogs();
    loadDailyTargets();
  }, [loadFoodLogs, loadDailyTargets]);

  // Show loading screen while fonts are loading
  if (!fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F9F9F9",
        }}
      >
        <ActivityIndicator size="large" color="#FF7A5A" />
        <Text style={{ marginTop: 16, fontSize: 16, color: "#8A8A8E" }}>
          Loading...
        </Text>
        {error && (
          <Text
            style={{
              marginTop: 8,
              fontSize: 14,
              color: "#FF6B6B",
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
      </Stack>
      <ToastManager />
    </ThemeProvider>
  );
}
