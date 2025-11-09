import { Platform } from "react-native";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/theme";
import { isLiquidGlassAvailable } from "expo-glass-effect";

export default function FavoritesLayout() {
  const { t } = useTranslation();
  const { colors, theme } = useTheme();
  const isIOS = Platform.OS === "ios";
  const hasLiquidGlass = isLiquidGlassAvailable();

  return (
    <Stack
      screenOptions={{
        headerTransparent: isIOS && hasLiquidGlass,
        headerStyle: !hasLiquidGlass && {
          backgroundColor: colors.primaryBackground,
        },
        headerShadowVisible: true,
        headerTitleStyle: {
          color: colors.primaryText,
          fontFamily: theme.typography.Headline.fontFamily,
          fontSize: theme.typography.Headline.fontSize,
          fontWeight: theme.typography.Headline.fontWeight,
        },
        headerLargeTitleStyle: {
          color: colors.primaryText,
          fontFamily: theme.typography.Title1.fontFamily,
          fontSize: theme.typography.Title1.fontSize,
          fontWeight: theme.typography.Title1.fontWeight,
        },
        contentStyle: { backgroundColor: colors.primaryBackground },
        presentation: "modal",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: t("calendar.title"),
          headerLargeTitle: isIOS,
          headerLargeTitleShadowVisible: false,
          presentation: "modal",
        }}
      />
    </Stack>
  );
}
