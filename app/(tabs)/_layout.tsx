import { Tabs } from "expo-router";
import {
  ChartBarIcon,
  ForkKnifeIcon,
  GearSixIcon,
  PlusIcon,
  StarIcon,
} from "phosphor-react-native";
import { useTheme } from "@/theme";
import React from "react";
import { TouchableOpacity } from "react-native";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";

export default function TabLayout() {
  const { safePush } = useNavigationGuard();
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
          name="overview"
          options={{
            title: "Overview",
            headerShown: false, // Let the stack handle the header
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
                  safePush("/create");
                }}
              >
                {children}
              </TouchableOpacity>
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
          name="pro"
          options={{
            title: "Pro",
            headerShown: false, // Let the stack handle the header
            tabBarIcon: ({ color, focused, size }) => (
              <StarIcon
                color={color}
                size={size ?? 24}
                weight={focused ? "fill" : "regular"}
              />
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
