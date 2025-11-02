import { Platform } from "react-native";
import { Stack } from "expo-router";
import { useTheme } from "@/theme";
import { isLiquidGlassAvailable } from "expo-glass-effect";

export default function SettingsLayout() {
  const { colors, theme, colorScheme } = useTheme();
  const isIOS = Platform.OS === "ios";
  const hasLiquidGlass = isLiquidGlassAvailable();

  return (
    <Stack
      screenOptions={{
        headerTintColor: colors.accent,
        headerTransparent: isIOS,
        headerBlurEffect: !hasLiquidGlass ? colorScheme : undefined,
        headerShadowVisible: true,
        headerTitleStyle: {
          color: colors.primaryText,
          fontFamily: theme.typography.Title1.fontFamily,
        },
        headerStyle: !hasLiquidGlass && {
          backgroundColor: "transparent",
        },
        headerLargeTitleStyle: {
          color: colors.primaryText,
          fontFamily: theme.typography.Title1.fontFamily,
        },
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
