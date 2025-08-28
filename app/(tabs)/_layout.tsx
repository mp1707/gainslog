import { router, Tabs } from "expo-router";
import { ForkKnifeIcon, GearSixIcon, PlusIcon } from "phosphor-react-native";
import { useTheme } from "@/theme";
import React from "react";
import { TouchableOpacity } from "react-native";

export default function TabLayout() {
  const { colors } = useTheme();
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
          name="new"
          options={{
            title: "New",
            headerShown: false,
            tabBarIcon: ({ color, focused, size }) => (
              <PlusIcon
                color={color}
                size={size ?? 24}
                weight={focused ? "fill" : "regular"}
              />
            ),
            tabBarButton: ({ children, onPress, ...props }) => (
              <TouchableOpacity
                {...nullToUndefined(props)}
                onPress={() => {
                  router.push("/create");
                }}
              >
                {children}
              </TouchableOpacity>
            ),
          }}
        />
      </Tabs>
    </>
  );
}

// Utility to convert null values to undefined for TouchableOpacity compatibility
const nullToUndefined = (obj: Record<string, any>) => {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = value === null ? undefined : value;
  }
  return result;
};
