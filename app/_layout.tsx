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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Star, StarOff, AlertCircle } from "lucide-react-native";

// Custom toast components using theme
const CustomToastComponents = () => {
  const { colors, theme: themeObj, colorScheme } = useTheme();

  const FavoriteAddedToast = ({ text1, text2 }: ToastShowParams) => (
    <View
      style={{
        marginHorizontal: themeObj.spacing.md,
        padding: themeObj.spacing.md,
        borderRadius: themeObj.components.cards.cornerRadius,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        flexShrink: 0,
        borderColor: colors.success + "20",
        ...themeObj.components.cards[
          colorScheme === "dark" ? "darkMode" : "lightMode"
        ],
      }}
    >
      <View
        style={{
          backgroundColor: colors.success + "20",
          borderRadius: 20,
          padding: themeObj.spacing.sm,
          marginRight: themeObj.spacing.md,
        }}
      >
        <Star size={20} color={colors.success} fill={colors.success} />
      </View>
      <View>
        <Text
          style={{
            fontFamily: "Nunito-SemiBold",
            fontSize: 15,
            fontWeight: "600",
            color: colors.success,
            gap: 2,
          }}
        >
          {text1}
        </Text>
        {text2 && (
          <Text
            style={{
              fontFamily: "Nunito-Regular",
              fontSize: 13,
              fontWeight: "400",
              color: colors.secondaryText,
            }}
          >
            {text2}
          </Text>
        )}
      </View>
    </View>
  );

  const FavoriteRemovedToast = ({ text1, text2 }: ToastShowParams) => (
    <View
      style={{
        marginHorizontal: themeObj.spacing.md,
        padding: themeObj.spacing.md,
        borderRadius: themeObj.components.cards.cornerRadius,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: colors.border,
        ...themeObj.components.cards[
          colorScheme === "dark" ? "darkMode" : "lightMode"
        ],
      }}
    >
      <View
        style={{
          backgroundColor: colors.subtleBackground,
          borderRadius: 20,
          padding: themeObj.spacing.sm,
          marginRight: themeObj.spacing.md,
        }}
      >
        <StarOff size={20} color={colors.secondaryText} />
      </View>
      <View>
        <Text
          style={{
            fontFamily: "Nunito-SemiBold",
            fontSize: 15,
            fontWeight: "600",
            color: colors.primaryText,
            marginBottom: text2 ? 2 : 0,
          }}
        >
          {text1}
        </Text>
        {text2 && (
          <Text
            style={{
              fontFamily: "Nunito-Regular",
              fontSize: 13,
              fontWeight: "400",
              color: colors.secondaryText,
            }}
          >
            {text2}
          </Text>
        )}
      </View>
    </View>
  );

  const ErrorToast = ({ text1, text2 }: ToastShowParams) => (
    <View
      style={{
        marginHorizontal: themeObj.spacing.md,
        padding: themeObj.spacing.md,
        borderRadius: themeObj.components.cards.cornerRadius,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: colors.error + "20",
        minHeight: 60,
        ...themeObj.components.cards[
          colorScheme === "dark" ? "darkMode" : "lightMode"
        ],
      }}
    >
      <View
        style={{
          backgroundColor: colors.error + "20",
          borderRadius: 20,
          padding: themeObj.spacing.sm,
          marginRight: themeObj.spacing.md,
        }}
      >
        <AlertCircle size={20} color={colors.error} />
      </View>
      <View>
        <Text
          style={{
            fontFamily: "Nunito-SemiBold",
            fontSize: 15,
            fontWeight: "600",
            color: colors.error,
            marginBottom: text2 ? 2 : 0,
          }}
        >
          {text1}
        </Text>
        {text2 && (
          <Text
            style={{
              fontFamily: "Nunito-Regular",
              fontSize: 13,
              fontWeight: "400",
              color: colors.secondaryText,
            }}
          >
            {text2}
          </Text>
        )}
      </View>
    </View>
  );

  return {
    favoriteAdded: FavoriteAddedToast,
    favoriteRemoved: FavoriteRemovedToast,
    error: ErrorToast,
  };
};

// Themed Toast Manager that uses the custom components
const ThemedToastManager = () => {
  const insets = useSafeAreaInsets();
  const toastComponents = CustomToastComponents();

  const toastConfig = {
    favoriteAdded: (props: ToastShowParams) => (
      <View style={{ marginTop: insets.top + 8 }}>
        {toastComponents.favoriteAdded(props)}
      </View>
    ),
    favoriteRemoved: (props: ToastShowParams) => (
      <View style={{ marginTop: insets.top + 8 }}>
        {toastComponents.favoriteRemoved(props)}
      </View>
    ),
    error: (props: ToastShowParams) => (
      <View style={{ marginTop: insets.top + 8 }}>
        {toastComponents.error(props)}
      </View>
    ),
  };

  return <ToastManager config={toastConfig} useModal={false} />;
};

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
          <ThemedToastManager />
        </ThemeProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
