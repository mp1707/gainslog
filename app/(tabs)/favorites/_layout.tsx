import { useCallback } from "react";
import { Platform } from "react-native";
import { Stack } from "expo-router";
import { useTheme } from "@/theme";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import type { SearchBarProps } from "react-native-screens";
import { useAppStore } from "@/store/useAppStore";
import { useTranslation } from "react-i18next";

export default function FavoritesLayout() {
  const { colors, theme, colorScheme } = useTheme();
  const { t } = useTranslation();
  const isIOS = Platform.OS === "ios";
  const hasLiquidGlass = isLiquidGlassAvailable();

  return (
    <Stack
      screenOptions={{
        headerTransparent: isIOS,
        headerBlurEffect: !hasLiquidGlass ? colorScheme : undefined,
        headerShadowVisible: true,
        headerTitleStyle: {
          color: colors.primaryText,
          fontFamily: theme.typography.Title1.fontFamily,
        },
        headerLargeTitleStyle: {
          color: colors.primaryText,
          fontFamily: theme.typography.Title1.fontFamily,
        },
        contentStyle: { backgroundColor: colors.primaryBackground },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: t("favorites.navigation.title"),
          headerLargeTitle: isIOS,
          headerLargeTitleShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="edit/[id]"
        options={{
          headerShown: true,
          headerTintColor: colors.accent,
          headerTransparent: hasLiquidGlass && isIOS,
          headerShadowVisible: true,
          headerTitleStyle: {
            color: colors.primaryText,
            fontFamily: theme.typography.Headline.fontFamily,
            fontSize: theme.typography.Headline.fontSize,
            fontWeight: theme.typography.Headline.fontWeight,
          },
          headerStyle: !hasLiquidGlass && {
            backgroundColor: colors.primaryBackground,
          },
          headerTitle: t("favorites.navigation.editTitle"),
          gestureEnabled: true,
          navigationBarHidden: true,
        }}
      />
    </Stack>
  );
}
