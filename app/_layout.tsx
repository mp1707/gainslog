import { Stack } from "expo-router";
import { ThemeProvider, useTheme } from "@/theme";
import React, { useEffect } from "react";
import { useFonts } from "../src/hooks/useFonts";
import { useAppStore } from "@/store/useAppStore";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { HudNotification } from "@/components/shared/HudNotification";
import * as SplashScreen from "expo-splash-screen";
import Purchases, { LOG_LEVEL } from "react-native-purchases";
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
        name="explainer-macros"
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
        name="explainer-ai-estimation"
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

  useEffect(() => {
    Purchases.setLogLevel(LOG_LEVEL.VERBOSE);

    Purchases.configure({
      apiKey: process.env.EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY,
    });

    getCustomerInfo();
    getOfferings();
  }, []);

  async function getCustomerInfo() {
    const customerInfo = await Purchases.getCustomerInfo();
    console.log(customerInfo);
  }

  async function getOfferings() {
    const offerings = await Purchases.getOfferings();
    if (
      offerings.current !== null &&
      offerings.current.availablePackages.length !== 0
    ) {
      console.log("offerings ", JSON.stringify(offerings, null, 2));
    }
  }

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
