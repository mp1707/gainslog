import { Stack } from "expo-router";
import { useTheme } from "@/providers";
import React from "react";

export default function SettingsLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primaryBackground,
        },
        headerTintColor: colors.primaryText,
        headerTitleStyle: {
          color: colors.primaryText,
        },
        headerShadowVisible: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          title: "Settings",
          headerShown: true,
        }} 
      />
      <Stack.Screen 
        name="calories" 
        options={{ 
          title: "Calories",
          headerShown: true,
        }} 
      />
      <Stack.Screen 
        name="protein" 
        options={{ 
          title: "Protein",
          headerShown: true,
        }} 
      />
      <Stack.Screen 
        name="fat" 
        options={{ 
          title: "Fat",
          headerShown: true,
        }} 
      />
      <Stack.Screen 
        name="carbs" 
        options={{ 
          title: "Carbs",
          headerShown: true,
        }} 
      />
    </Stack>
  );
}