import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Slot } from 'expo-router';
import { KeyboardProvider } from 'react-native-keyboard-controller';

export default function App() {
  return (
    <KeyboardProvider
      statusBarTranslucent={true}
      navigationBarTranslucent={false}
    >
      <StatusBar style="dark" />
      <Slot />
    </KeyboardProvider>
  );
}