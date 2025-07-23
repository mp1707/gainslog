import { Stack } from 'expo-router';
import { GlobalFoodLogActionsProvider } from '../src/features/food-logging';
import React from 'react';

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