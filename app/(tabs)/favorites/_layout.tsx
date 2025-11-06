import { Platform } from "react-native";
import { Stack } from "expo-router";
import { useTheme } from "@/theme";
import { isLiquidGlassAvailable } from "expo-glass-effect";

export default function FavoritesLayout() {
  const { colors, theme } = useTheme();
  const isIOS = Platform.OS === "ios";
  const hasLiquidGlass = isLiquidGlassAvailable();

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
          headerTitle: "Favorites",
          headerTintColor: colors.accent,
          headerLargeTitle: isIOS,
          headerLargeTitleShadowVisible: false,
          headerTransparent: hasLiquidGlass && isIOS,
          headerStyle: !hasLiquidGlass && {
            backgroundColor: colors.primaryBackground,
          },
          headerTitleStyle: {
            color: colors.primaryText,
            fontFamily: theme.typography.Headline.fontFamily,
            fontSize: theme.typography.Headline.fontSize,
            fontWeight: theme.typography.Headline.fontWeight,
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
          headerTitle: "Edit Favorite",
          gestureEnabled: true,
          navigationBarHidden: true,
        }}
      />
    </Stack>
  );
}
