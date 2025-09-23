import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { BlurView } from "expo-blur";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Star, StarOff, AlertCircle } from "lucide-react-native";
import { useTheme } from "@/theme";
import { useHudStore } from "@/store/useHudStore";
import * as Haptics from "expo-haptics";

const { width: screenWidth } = Dimensions.get("window");

const SPRING_CONFIG = {
  damping: 30,
  stiffness: 400,
  mass: 1,
};

const SWIPE_THRESHOLD = 50;
const VELOCITY_THRESHOLD = 500;

export const HudNotification: React.FC = () => {
  const { colors, colorScheme } = useTheme();
  const { isVisible, type, title, subtitle, hide } = useHudStore();
  const isMountedRef = useRef(true);

  // Animation values
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const translateY = useSharedValue(0);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Entry animation
  useEffect(() => {
    if (isVisible) {
      opacity.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.ease) });
      scale.value = withSpring(1, SPRING_CONFIG);
      translateY.value = 0;
    } else {
      // Exit animation
      opacity.value = withTiming(0, { duration: 150 });
      scale.value = withTiming(0.9, { duration: 150 });
    }
  }, [isVisible]);

  // Create JS thread functions
  const handleHapticFeedback = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Haptics not available, continue silently
    }
  };

  const handleDismiss = () => {
    if (isMountedRef.current) {
      hide();
    }
  };

  const handleDismissWithDelay = () => {
    setTimeout(() => {
      if (isMountedRef.current) {
        hide();
        // Reset animation values for next show
        opacity.value = 0;
        scale.value = 0.8;
        translateY.value = 0;
      }
    }, 200);
  };

  // Tap gesture to dismiss
  const tapGesture = Gesture.Tap()
    .onStart(() => {
      runOnJS(handleHapticFeedback)();
      runOnJS(handleDismiss)();
    });

  // Pan gesture for swipe to dismiss
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      const shouldDismiss =
        Math.abs(event.translationY) > SWIPE_THRESHOLD ||
        Math.abs(event.velocityY) > VELOCITY_THRESHOLD;

      if (shouldDismiss) {
        // Animate off screen
        const direction = event.translationY > 0 ? 1 : -1;
        translateY.value = withTiming(direction * 200, { duration: 200 });
        opacity.value = withTiming(0, { duration: 200 });

        // Dismiss after animation
        runOnJS(handleDismissWithDelay)();
      } else {
        // Spring back to center
        translateY.value = withSpring(0, SPRING_CONFIG);
      }
    });

  // Combined gesture - use Race instead of Simultaneous to prevent conflicts
  const combinedGesture = Gesture.Race(tapGesture, panGesture);

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
  }));

  // Get icon and colors based on type
  const getIconConfig = () => {
    const iconSize = 28;

    switch (type) {
      case "success":
        return {
          icon: <Star size={iconSize} color={colors.semantic.fat} fill={colors.semantic.fat} />,
          iconColor: colors.semantic.fat,
        };
      case "info":
        return {
          icon: <StarOff size={iconSize} color={colors.secondaryText} />,
          iconColor: colors.secondaryText,
        };
      case "error":
        return {
          icon: <AlertCircle size={iconSize} color={colors.error} />,
          iconColor: colors.error,
        };
      default:
        return {
          icon: <AlertCircle size={iconSize} color={colors.secondaryText} />,
          iconColor: colors.secondaryText,
        };
    }
  };

  if (!isVisible) {
    return null;
  }

  const { icon } = getIconConfig();

  const styles = createStyles(colors, colorScheme);

  return (
    <View style={styles.overlay}>
      <GestureDetector gesture={combinedGesture}>
        <Animated.View style={[styles.container, animatedStyle]}>
          <BlurView intensity={100} tint="dark" style={styles.blurContainer}>
            <View style={styles.content}>
              <View style={styles.iconContainer}>
                {icon}
              </View>

              <Text style={styles.titleText} numberOfLines={1}>
                {title}
              </Text>

              {subtitle && (
                <Text style={styles.subtitleText} numberOfLines={type === "error" ? 4 : 2}>
                  {subtitle}
                </Text>
              )}
            </View>
          </BlurView>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const createStyles = (colors: any, colorScheme: string) =>
  StyleSheet.create({
    overlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 999999,
      pointerEvents: "box-none",
    },
    container: {
      width: 160,
      height: 160,
      borderRadius: 24,
      overflow: "hidden",
    },
    blurContainer: {
      width: 160,
      height: 160,
      borderRadius: 24,
    },
    content: {
      width: 160,
      height: 160,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 24,
    },
    iconContainer: {
      marginBottom: 12,
    },
    titleText: {
      color: colors.white,
      fontFamily: "Nunito-SemiBold",
      fontSize: 17,
      fontWeight: "600",
      textAlign: "center",
      marginBottom: 4,
    },
    subtitleText: {
      color: colors.white,
      fontFamily: "Nunito-Regular",
      fontSize: 13,
      fontWeight: "400",
      textAlign: "center",
      opacity: 0.8,
      lineHeight: 16,
    },
  });