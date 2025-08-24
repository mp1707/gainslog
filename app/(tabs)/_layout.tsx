import { Tabs } from "expo-router";
import {
  ChartBarIcon,
  ForkKnifeIcon,
  GearSixIcon,
  StarIcon,
  PlusIcon,
  XIcon,
} from "phosphor-react-native";
import { useTheme } from "@/providers";
import { NewLogButton } from "@/components/daily-food-logs/NewLogButton";
import React, { useState, useCallback } from "react";

export default function TabLayout() {
  const { colors } = useTheme();
  const [isSheetVisible, setSheetVisible] = useState(false);

  const openSheet = useCallback(() => {
    setSheetVisible(true);
  }, []);

  const closeSheet = useCallback(() => {
    setSheetVisible(false);
  }, []);

  return (
    <>
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
            headerShown: false, // Let the stack handle the header
            tabBarIcon: ({ color, focused, size }) => (
              <GearSixIcon
                color={color}
                size={size ?? 24}
                weight={focused ? "fill" : "regular"}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="new-log"
          options={{
            title: "New",
            tabBarIcon: ({ color, size }) =>
              isSheetVisible ? (
                <XIcon color={color} size={size ?? 24} weight="bold" />
              ) : (
                <PlusIcon color={color} size={size ?? 24} weight="bold" />
              ),
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault(); // Prevent navigation
              if (isSheetVisible) {
                closeSheet();
              } else {
                openSheet();
              }
            },
          }}
        />
      </Tabs>

      <NewLogButton visible={isSheetVisible} onClose={closeSheet} />
    </>
  );
}
