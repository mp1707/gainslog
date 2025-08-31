import { Tabs } from "expo-router";
import React, { useEffect } from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { useTheme } from "@/theme";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import {
  NotebookPen,
  LayoutGrid,
  Plus,
  Settings,
  Sparkles,
  Rocket,
  CalendarDays,
} from "lucide-react-native";

// --- Custom Animated Tab Bar Icon with "Pill" ---
// This component handles the visual state for our default tabs.
const TabBarIcon = ({ Icon, focused, color, size }: { Icon: React.ElementType; focused: boolean; color: string; size: number; }) => {
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(focused ? 1 : 0, { damping: 15, stiffness: 200 });
  }, [focused, scale]);

  const animatedPillStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: scale.value,
    };
  });

  return (
    <View style={styles.iconContainer}>
      <Animated.View style={[styles.pill, { backgroundColor: color + '1A' }, animatedPillStyle]} />
      <Icon color={color} size={size} strokeWidth={focused ? 2.5 : 2} />
    </View>
  );
};

export default function TabLayout() {
  const { safePush } = useNavigationGuard();
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.secondaryText,
        tabBarShowLabel: false, // Hiding labels for a cleaner, icon-centric look
        tabBarStyle: {
          backgroundColor: colors.primaryBackground,
          borderTopColor: colors.border,
          height: 84, // Increased height for a more modern feel and safe area padding
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused, size }) => (
            <TabBarIcon Icon={NotebookPen} color={color} size={size ?? 26} focused={focused} />
          ),
          tabBarAccessibilityLabel: "Food Log",
        }}
      />
      <Tabs.Screen
        name="overview"
        options={{
          tabBarIcon: ({ color, focused, size }) => (
            <TabBarIcon Icon={CalendarDays} color={color} size={size ?? 26} focused={focused} />
          ),
          tabBarAccessibilityLabel: "Overview",
        }}
      />
      {/* --- Custom Primary Action Button --- */}
      <Tabs.Screen
        name="new"
        options={{
          tabBarIcon: ({ size }) => (
            <Plus color={colors.primaryBackground} size={size ?? 30} strokeWidth={2.5} />
          ),
          tabBarButton: (props) => (
            <TouchableOpacity
              onPress={() => safePush("/create")}
              style={styles.newButtonWrapper}
              activeOpacity={0.8}
            >
              <Animated.View style={[styles.newButton, { backgroundColor: colors.accent }]}>
                {props.children}
              </Animated.View>
            </TouchableOpacity>
          ),
          tabBarAccessibilityLabel: "Log New Meal",
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ color, focused, size }) => (
            <TabBarIcon Icon={Settings} color={color} size={size ?? 26} focused={focused} />
          ),
          tabBarAccessibilityLabel: "Settings",
        }}
      />
      <Tabs.Screen
        name="pro"
        options={{
          tabBarIcon: ({ color, focused, size }) => (
            <TabBarIcon Icon={Rocket} color={color} size={size ?? 26} focused={focused} />
          ),
          tabBarAccessibilityLabel: "Pro Features",
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  // Styles for the default pill icon
  iconContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    position: 'absolute',
    width: 60,
    height: 34,
    borderRadius: 17,
  },
  // Styles for the central "New" button
  newButtonWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  newButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'blue', // This will be replaced by theme color
    justifyContent: 'center',
    alignItems: 'center',
    // Raise the button
    transform: [{ translateY: -18 }],
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    // Shadow for Android
    elevation: 8,
  },
});