import { Platform } from "react-native";
import { Stack } from "expo-router";
import { useTheme } from "@/theme";

export default function IndexLayout() {
  const { colors, theme } = useTheme();
  const isIOS = Platform.OS === "ios";

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
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="edit/[id]"
        options={{
          headerShown: true,
          headerTintColor: colors.accent,
          headerTransparent: isIOS,
          headerShadowVisible: true,
          headerTitleStyle: {
            color: colors.primaryText,
            fontFamily: theme.typography.Headline.fontFamily,
            fontSize: theme.typography.Headline.fontSize,
            fontWeight: theme.typography.Headline.fontWeight,
          },
          headerTitle: "Edit",
          gestureEnabled: true,
          navigationBarHidden: true,
        }}
      />
    </Stack>
  );
}
