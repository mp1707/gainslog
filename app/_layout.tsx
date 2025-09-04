import { Stack } from "expo-router";
import { ThemeProvider, useTheme } from "@/theme";
import React, { useEffect } from "react";
import ToastManager from "toastify-react-native";
import { useFonts } from "../src/hooks/useFonts";
import { View, Text, ActivityIndicator } from "react-native";
import { theme } from "../src/theme";
import { useAppStore } from "@/store/useAppStore";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { GestureHandlerRootView } from "react-native-gesture-handler";

function ThemedStack() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.primaryBackground },
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="create"
        options={{
          presentation: "modal",
          headerShown: false,
          contentStyle: { backgroundColor: colors.primaryBackground },
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          presentation: "modal",
          headerShown: false,
          contentStyle: { backgroundColor: colors.primaryBackground },
        }}
      />
      <Stack.Screen
        name="edit/[id]"
        options={{
          presentation: "modal",
          headerShown: false,
          contentStyle: { backgroundColor: colors.primaryBackground },
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const { fontsLoaded, error } = useFonts();
  const cleanupIncompleteEstimations = useAppStore(
    (state) => state.cleanupIncompleteEstimations
  );

  useEffect(() => {
    if (fontsLoaded) {
      cleanupIncompleteEstimations();
    }
  }, [fontsLoaded, cleanupIncompleteEstimations]);

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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <ThemeProvider>
          <ThemedStack />
          <ToastManager />
        </ThemeProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
