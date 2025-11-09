import { useCallback } from "react";
import { Platform } from "react-native";
import { Stack } from "expo-router";
import { useTheme } from "@/theme";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import type { SearchBarProps } from "react-native-screens";
import { useAppStore } from "@/store/useAppStore";
import { useTranslation } from "react-i18next";

export default function FavoritesLayout() {
  const { colors, theme } = useTheme();
  const { t } = useTranslation();
  const isIOS = Platform.OS === "ios";
  const hasLiquidGlass = isLiquidGlassAvailable();
  const setFavoritesSearchQuery = useAppStore(
    (state) => state.setFavoritesSearchQuery
  );

  const handleSearchChange = useCallback<
    NonNullable<SearchBarProps["onChangeText"]>
  >(
    (event) => {
      setFavoritesSearchQuery(event.nativeEvent.text ?? "");
    },
    [setFavoritesSearchQuery]
  );

  return (
    <Stack
      initialRouteName="index"
      screenOptions={{
        contentStyle: { backgroundColor: colors.primaryBackground },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          headerTitle: t("favorites.navigation.title"),
          headerTintColor: colors.accent,
          headerLargeTitle: isIOS,
          headerTransparent: hasLiquidGlass && isIOS,
          headerStyle: !hasLiquidGlass && {
            backgroundColor: colors.primaryBackground,
          },
          headerTitleStyle: {
            color: colors.primaryText,
            fontFamily: theme.typography.Title1.fontFamily,
          },
          headerLargeTitleStyle: {
            color: colors.primaryText,
            fontFamily: theme.typography.Title1.fontFamily,
          },
          headerSearchBarOptions: {
            placement: "automatic",
            placeholder: t("favorites.navigation.searchPlaceholder"),
            onChangeText: handleSearchChange,
            inputType: "text",
            autoCapitalize: "none",
          },
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
