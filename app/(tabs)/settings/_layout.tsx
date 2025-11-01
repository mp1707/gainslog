import { Platform } from "react-native";
import { Stack } from "expo-router";
import { useTheme } from "@/theme";
import { isLiquidGlassAvailable } from "expo-glass-effect";

export default function SettingsLayout() {
  const { colors, theme } = useTheme();
  const isIOS = Platform.OS === "ios";
  const hasLiquidGlass = isLiquidGlassAvailable();

  return (
    <Stack
      screenOptions={{
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
        headerLargeTitleStyle: {
          color: colors.primaryText,
          fontFamily: theme.typography.Title1.fontFamily,
          fontSize: theme.typography.Title1.fontSize,
          fontWeight: theme.typography.Title1.fontWeight,
        },
        contentStyle: { backgroundColor: colors.primaryBackground },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Settings",
          headerLargeTitle: isIOS,
          headerLargeTitleShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="dark-mode"
        options={{
          title: "Dark mode",
          headerLargeTitle: isIOS,
          headerLargeTitleShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="design"
        options={{
          title: "Design",
          headerLargeTitle: isIOS,
          headerLargeTitleShadowVisible: false,
        }}
      />
    </Stack>
  );
}
