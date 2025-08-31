import { Tabs, usePathname } from "expo-router"; // CHANGE 1: Import usePathname
import React from "react";
import { Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from "react-native-reanimated";
import { useTheme, useThemedStyles } from "@/theme";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import * as Haptics from "expo-haptics";
import {
  NotebookPen,
  LayoutGrid,
  Plus,
  Settings,
  Sparkles,
  Calendar,
  Crown,
  Rocket,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { transform } from "@babel/core";

// --- Visual Component & FAB (No changes needed in these) ---
const AnimatedIconAndLabel = ({
  Icon,
  label,
  isFocused,
  activeColor,
  inactiveColor,
}: any) => {
  const animatedFocusStyle = useAnimatedStyle(
    () => ({
      transform: [
        {
          translateY: withSpring(isFocused ? -2 : 0, {
            damping: 15,
            stiffness: 200,
          }),
        },
      ],
    }),
    [isFocused]
  );
  const animatedLabelStyle = useAnimatedStyle(
    () => ({
      // opacity: withSpring(isFocused ? 1 : 0, { damping: 15, stiffness: 200 }),
      transform: [
        {
          translateY: withSpring(isFocused ? 0 : 1, {
            damping: 15,
            stiffness: 200,
          }),
        },
      ],
    }),
    [isFocused]
  );
  return (
    <Animated.View style={[styles.iconLabelWrapper, animatedFocusStyle]}>
      <Icon
        color={isFocused ? activeColor : inactiveColor}
        size={26}
        strokeWidth={isFocused ? 2.5 : 2}
      />
      <Animated.Text
        style={[
          styles.label,
          { color: isFocused ? activeColor : inactiveColor },
          animatedLabelStyle,
        ]}
      >
        {label}
      </Animated.Text>
    </Animated.View>
  );
};
const AnimatedFAB = ({ onPress, children, backgroundColor }: any) => {
  const pressProgress = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withSpring(interpolate(pressProgress.value, [0, 1], [1, 0.9]), {
          damping: 15,
          stiffness: 400,
        }),
      },
    ],
  }));
  return (
    <Pressable
      onPressIn={() => (pressProgress.value = 1)}
      onPressOut={() => (pressProgress.value = 0)}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress();
      }}
      style={styles.newButtonWrapper}
    >
      <Animated.View
        style={[styles.newButton, { backgroundColor }, animatedStyle]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
};

// --- MAIN LAYOUT ---
export default function TabLayout() {
  const { safePush } = useNavigationGuard();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const tabBarHeight =
    useTheme().theme.spacing.xl + useTheme().theme.spacing.lg; // 32 + 24 = 56 (close to original 55)

  const themedStyles = useThemedStyles((colors, theme) => ({
    tabItemContainer: {
      flex: 1,
      alignItems: "center" as const,
      justifyContent: "center" as const,
      transform: [{ translateY: 4 }],
    },
  }));

  const createTabBarButton =
    (
      screenName: "index" | "overview" | "settings" | "pro",
      Icon: React.ElementType,
      label: string
    ) =>
    (props: BottomTabBarButtonProps) => {
      const { onPress } = props;

      // CHANGE 2: Use usePathname for a direct URL check
      const pathname = usePathname();

      // CHANGE 3: Define the target path for this button
      // For the index tab, the path is '/', for others it is '/[screenName]'
      const targetPath = screenName === "index" ? "/" : `/${screenName}`;
      const isFocused = pathname === targetPath;

      const pressProgress = useSharedValue(0);
      const animatedPressStyle = useAnimatedStyle(() => ({
        transform: [
          {
            scale: withSpring(
              isFocused
                ? 1
                : interpolate(pressProgress.value, [0, 1], [1, 0.9]),
              {
                damping: 15,
                stiffness: 400,
              }
            ),
          },
        ],
      }));

      return (
        <Pressable
          onPressIn={() => (pressProgress.value = 1)}
          onPressOut={() => (pressProgress.value = 0)}
          onPress={(e) => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onPress?.(e);
          }}
          style={themedStyles.tabItemContainer}
          accessibilityLabel={label}
        >
          <Animated.View style={animatedPressStyle}>
            <AnimatedIconAndLabel
              Icon={Icon}
              label={label}
              isFocused={isFocused}
              activeColor={colors.accent}
              inactiveColor={colors.secondaryText}
            />
          </Animated.View>
        </Pressable>
      );
    };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: colors.primaryBackground,
          borderTopColor: colors.border,
          height: tabBarHeight + insets.bottom,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarButton: createTabBarButton("index", NotebookPen, "Log"),
        }}
      />
      <Tabs.Screen
        name="overview"
        options={{
          tabBarButton: createTabBarButton("overview", Calendar, "Overview"),
        }}
      />
      <Tabs.Screen
        name="new"
        options={{
          tabBarButton: () => (
            <AnimatedFAB
              onPress={() => safePush("/create")}
              backgroundColor={colors.accent}
            >
              <Plus
                color={colors.primaryBackground}
                size={30}
                strokeWidth={2.5}
              />
            </AnimatedFAB>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarButton: createTabBarButton("settings", Settings, "Settings"),
        }}
      />
      <Tabs.Screen
        name="pro"
        options={{ tabBarButton: createTabBarButton("pro", Rocket, "Pro") }}
      />
    </Tabs>
  );
}

// --- THEMED STYLES ---
const createStyles = (colors: any, theme: any) => ({
  iconLabelWrapper: {
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  label: {
    fontSize: theme.typography.Caption.fontSize,
    fontWeight: theme.typography.Caption.fontWeight,
    marginTop: theme.spacing.xs / 2,
  },
  newButtonWrapper: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    transform: [{ translateY: -theme.spacing.unit }],
  },
  newButton: {
    width: theme.spacing.unit * 7.5,
    height: theme.spacing.unit * 7.5,
    borderRadius: theme.spacing.unit * 3.75,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 8,
  },
});

// Create a fallback styles object for the components defined before TabLayout
const fallbackTheme = {
  typography: { Caption: { fontSize: 13, fontWeight: "400" } },
  spacing: { unit: 8, xs: 4 },
};
const fallbackColors = { primaryText: "#000" };
const styles = createStyles(fallbackColors, fallbackTheme);
