import { Stack } from "expo-router";
import { ThemeProvider, useTheme } from "@/theme";
import React, { useEffect } from "react";
import { useFonts } from "../src/hooks/useFonts";
import { useAppStore } from "@/store/useAppStore";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { HudNotification } from "@/components/shared/HudNotification";
import * as SplashScreen from "expo-splash-screen";
import {
  NavigationTransitionProvider,
  useNavigationTransition,
} from "@/context/NavigationTransitionContext";
import { useRevenueCatBindings } from "@/hooks/useRevenueCatBindings";

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
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          headerShown: false,
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="edit/[id]"
        options={{
          headerShown: false,
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="editComponent"
        options={{
          presentation: "modal",
          headerShown: false,
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="calendar"
        options={{
          presentation: "modal",
          headerShown: false,
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="camera"
        options={{
          presentation: "modal",
          headerShown: false,
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="onboarding"
        options={{
          presentation: "modal",
          headerShown: false,
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="explainer-macros"
        options={{
          presentation: "modal",
          headerShown: false,
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="explainer-ai-estimation"
        options={{
          presentation: "modal",
          headerShown: false,
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="paywall"
        options={{
          presentation: "modal",
          headerShown: false,
          gestureEnabled: true,
        }}
      />
    </Stack>
  );
}

function RootLayoutContent() {
  const { colors } = useTheme();
  const cleanupIncompleteEstimations = useAppStore(
    (state) => state.cleanupIncompleteEstimations
  );

  useRevenueCatBindings();

  useEffect(() => {
    cleanupIncompleteEstimations();
  }, [cleanupIncompleteEstimations]);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.primaryBackground }}>
      <KeyboardProvider>
        <NavigationTransitionProvider>
          <ThemedStack />
        </NavigationTransitionProvider>
        <HudNotification />
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutContent />
    </ThemeProvider>
  );
}
