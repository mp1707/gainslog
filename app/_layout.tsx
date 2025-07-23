import { Stack } from 'expo-router';
import { useFoodLogStore } from '../src/stores/useFoodLogStore';
import React, { useEffect } from 'react';

export default function RootLayout() {
  const { loadFoodLogs, loadDailyTargets } = useFoodLogStore();

  // Initialize the store on app startup
  useEffect(() => {
    loadFoodLogs();
    loadDailyTargets();
  }, [loadFoodLogs, loadDailyTargets]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}