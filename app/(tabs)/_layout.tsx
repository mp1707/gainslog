import { Tabs } from "expo-router";
import {
  ChartBarIcon,
  ForkKnifeIcon,
  GearSixIcon,
  StarIcon,
} from "phosphor-react-native";
import { useTheme } from "@/providers";
import React from "react";

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.secondaryText,
        tabBarStyle: {
          backgroundColor: colors.primaryBackground,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Food Log",
          tabBarIcon: ({ color, focused, size }) => (
            <ForkKnifeIcon
              color={color}
              size={size ?? 24}
              weight={focused ? "fill" : "regular"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="overview"
        options={{
          title: "Overview",
          tabBarIcon: ({ color, focused, size }) => (
            <ChartBarIcon
              color={color}
              size={size ?? 24}
              weight={focused ? "fill" : "regular"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Favorites",
          tabBarIcon: ({ color, focused, size }) => (
            <StarIcon
              color={color}
              size={size ?? 24}
              weight={focused ? "fill" : "regular"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, focused, size }) => (
            <GearSixIcon
              color={color}
              size={size ?? 24}
              weight={focused ? "fill" : "regular"}
            />
          ),
        }}
      />
    </Tabs>
  );
}
