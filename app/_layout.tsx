import { Stack } from 'expo-router';
import { GlobalFoodLogActionsProvider } from '../src/features/food-logging';

export default function RootLayout() {
  return (
    <GlobalFoodLogActionsProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="(tabs)" />
      </Stack>
    </GlobalFoodLogActionsProvider>
  );
}