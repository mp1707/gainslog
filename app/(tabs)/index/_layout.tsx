import { Platform, View } from "react-native";
import { Stack } from "expo-router";
import { useTheme } from "@/theme";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { useAppStore } from "@/store/useAppStore";
import { formatDate } from "@/utils/formatDate";
import { Plus } from "lucide-react-native";

export default function IndexLayout() {
  const { colors, theme, colorScheme } = useTheme();
  const isIOS = Platform.OS === "ios";
  const hasLiquidGlass = isLiquidGlassAvailable();
  const selectedDate = useAppStore((state) => state.selectedDate);

  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: colors.primaryBackground },
      }}
      initialRouteName="index"
    >
      <Stack.Screen
        name="index"
        options={{
          headerTintColor: colors.accent,
          headerTitle: formatDate(selectedDate),
          headerTransparent: isIOS,
          headerBlurEffect: !hasLiquidGlass ? colorScheme : undefined,
          headerShadowVisible: true,
          headerLargeTitle: true,
          headerTitleStyle: {
            color: colors.primaryText,
            fontFamily: theme.typography.Title1.fontFamily,
          },
          headerLargeTitleStyle: {
            color: colors.primaryText,
            fontFamily: theme.typography.Title1.fontFamily,
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
          headerTitle: "Edit",
          gestureEnabled: true,
          navigationBarHidden: true,
        }}
      />
    </Stack>
  );
}
