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
          gestureEnabled: true,
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
          gestureEnabled: true,
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
          gestureEnabled: true,
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
          gestureEnabled: true,
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
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="onboarding"
        options={{
          presentation: "modal",
          headerShown: false,
          contentStyle: {
            borderRadius: "10%",
            overflow: "hidden",
          },
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="explainer-calories"
        options={{
          presentation: "modal",
          headerShown: false,
          contentStyle: {
            borderRadius: "10%",
            overflow: "hidden",
          },
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="explainer-protein"
        options={{
          presentation: "modal",
          headerShown: false,
          contentStyle: {
            borderRadius: "10%",
            overflow: "hidden",
          },
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="explainer-fat"
        options={{
          presentation: "modal",
          headerShown: false,
          contentStyle: {
            borderRadius: "10%",
            overflow: "hidden",
          },
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="explainer-carbs"
        options={{
          presentation: "modal",
          headerShown: false,
          contentStyle: {
            borderRadius: "10%",
            overflow: "hidden",
          },
          gestureEnabled: true,
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
          </NavigationTransitionProvider>
          <HudNotification />
        </ThemeProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
