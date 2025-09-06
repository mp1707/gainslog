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
import { ToastShowParams } from "toastify-react-native/utils/interfaces";
import {
  SafeAreaFrameContext,
  SafeAreaInsetsContext,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

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
      <Stack.Screen
        name="calendar"
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
  const insets = useSafeAreaInsets();
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

  // Custom toast configuration
  const toastConfig = {
    success: (props: ToastShowParams) => (
      <View
        style={{
          backgroundColor: "#4CAF50",
          padding: 16,
          borderRadius: 10,
          marginTop: insets.top,
        }}
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>
          {props.text1}
        </Text>
        {props.text2 && <Text style={{ color: "white" }}>{props.text2}</Text>}
      </View>
    ),
    // Override other toast types as needed
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <ThemeProvider>
          <ThemedStack />
          <ToastManager config={toastConfig} />
        </ThemeProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
