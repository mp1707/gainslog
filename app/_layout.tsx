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
import * as SplashScreen from "expo-splash-screen";
import {
  NavigationTransitionProvider,
  useNavigationTransition,
} from "@/context/NavigationTransitionContext";

function ThemedStack() {
  const { colors, isThemeLoaded } = useTheme();
  const { fontsLoaded } = useFonts();
  const { setTransitioning } = useNavigationTransition();

  useEffect(() => {
    if (fontsLoaded && isThemeLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isThemeLoaded]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.primaryBackground },
      }}
      screenListeners={{
        transitionStart: () => setTransitioning(true),
        transitionEnd: () => setTransitioning(false),
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
          // fixes gesture conflict in modals that leads to crashes
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="Goals"
        options={{
          presentation: "modal",
          headerShown: false,
          contentStyle: {
            borderRadius: "10%",
            overflow: "hidden",
          },
          // fixes gesture conflict in modals that leads to crashes
          gestureEnabled: false,
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
          // fixes gesture conflict in modals that leads to crashes
          gestureEnabled: false,
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
          // fixes gesture conflict in modals that leads to crashes
          gestureEnabled: false,
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
          // fixes gesture conflict in modals that leads to crashes
          gestureEnabled: false,
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const cleanupIncompleteEstimations = useAppStore(
    (state) => state.cleanupIncompleteEstimations
  );

  useEffect(() => {
    cleanupIncompleteEstimations();
  }, [cleanupIncompleteEstimations]);

  // useEffect(() => {
  //   Purchases.setLogLevel(LOG_LEVEL.VERBOSE);

  //   if (Platform.OS === "ios") {
  //     Purchases.configure({ apiKey: process.env.EXPO_PUBLIC_REVENUECAT_DEV_API_KEY });
  //   } else if (Platform.OS === "android") {
  //     // Purchases.configure({ apiKey: "<revenuecat_project_google_api_key>" });
  //   }
  // }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <ThemeProvider>
          <NavigationTransitionProvider>
            <ThemedStack />
            <ThemedToastManager />
          </NavigationTransitionProvider>
        </ThemeProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
