import { Stack } from 'expo-router';
import { useFoodLogStore } from '../src/stores/useFoodLogStore';
import { ThemeProvider } from '../src/providers/ThemeProvider';
import React, { useEffect } from 'react';
import ToastManager from 'toastify-react-native';

export default function RootLayout() {
  const { loadFoodLogs, loadDailyTargets } = useFoodLogStore();

  useEffect(() => {
    loadFoodLogs();
    loadDailyTargets();
  }, [loadFoodLogs, loadDailyTargets]);

  return (
    <ThemeProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="(tabs)" />
      </Stack>
      <ToastManager />
    </ThemeProvider>
  );
}