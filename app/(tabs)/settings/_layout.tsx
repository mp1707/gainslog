import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { useTheme } from '@/theme';

export default function SettingsLayout() {
  const { colors, theme } = useTheme();
  const isIOS = Platform.OS === 'ios';

  return (
    <Stack
      screenOptions={{
        headerTintColor: colors.accent,
        headerTransparent: isIOS,
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
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Settings',
          headerLargeTitle: isIOS,
          headerLargeTitleShadowVisible: false,
        }}
      />
    </Stack>
  );
}
