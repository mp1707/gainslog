import { Stack } from "expo-router";
import { ThemeProvider, useTheme } from "@/theme";
import React, { useEffect } from "react";
import { useFonts } from "../src/hooks/useFonts";
import { View, Text, ActivityIndicator, Platform } from "react-native";
import { theme } from "../src/theme";
import { useAppStore } from "@/store/useAppStore";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ThemedToastManager } from "@/components/shared/Toasts";
import Purchases, { LOG_LEVEL } from "react-native-purchases";

function ThemedStack() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.primaryBackground },
      }}
    >
      <Stack.Screen
        name="create"
        options={{
          presentation: "modal",
          headerShown: false,
          contentStyle: {
            borderRadius: "10%",
            overflow: "hidden",
          },
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          presentation: "modal",
          headerShown: false,
          contentStyle: {
            borderRadius: "10%",
            overflow: "hidden",
          },
        }}
      />
      <Stack.Screen
        name="edit/[id]"
        options={{
          presentation: "modal",
          headerShown: false,
          contentStyle: {
            borderRadius: "10%",
            overflow: "hidden",
          },
        }}
      />
      <Stack.Screen
        name="calendar"
        options={{
          presentation: "modal",
          headerShown: false,
          contentStyle: {
            borderRadius: "10%",
            overflow: "hidden",
          },
        }}
      />
      <Stack.Screen
        name="camera"
        options={{
          presentation: "modal",
          headerShown: false,
          contentStyle: {
            borderRadius: "10%",
            overflow: "hidden",
          },
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

  // useEffect(() => {
  //   Purchases.setLogLevel(LOG_LEVEL.VERBOSE);

  //   if (Platform.OS === "ios") {
  //     Purchases.configure({ apiKey: process.env.EXPO_PUBLIC_REVENUECAT_DEV_API_KEY });
  //   } else if (Platform.OS === "android") {
  //     // Purchases.configure({ apiKey: "<revenuecat_project_google_api_key>" });
  //   }
  // }, []);

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
          <ThemedToastManager />
        </ThemeProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
