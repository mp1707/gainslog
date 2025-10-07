import { useCallback } from "react";
import {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { theme } from "@/theme";

interface UsePressAnimationOptions {
  /**
   * Haptic feedback intensity
   * @default "light"
   */
  hapticIntensity?: "light" | "medium" | "heavy";

  /**
   * Disable haptic feedback
   * @default false
   */
  disableHaptics?: boolean;

  /**
   * Disable the animation
   * @default false
   */
  disabled?: boolean;
}

/**
 * Reusable hook for consistent press animations and haptic feedback
 *
 * @example
 * ```tsx
 * const { handlePressIn, handlePressOut, pressAnimatedStyle } = usePressAnimation();
 *
 * return (
 *   <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut}>
 *     <Animated.View style={pressAnimatedStyle}>
 *       {children}
 *     </Animated.View>
 *   </Pressable>
 * );
 * ```
 */
export const usePressAnimation = (options: UsePressAnimationOptions = {}) => {
  const {
    hapticIntensity = "light",
    disableHaptics = false,
    disabled = false,
  } = options;

  const scale = useSharedValue(1);

  const handlePressIn = useCallback(() => {
    if (disabled) return;

    // Scale down with timing
    scale.value = withTiming(theme.interactions.press.scale, {
      duration: theme.interactions.press.timing.duration,
      easing: theme.interactions.press.timing.easing,
    });

    // Trigger haptic feedback
    if (!disableHaptics) {
      const hapticStyle = theme.interactions.haptics[hapticIntensity];
      Haptics.impactAsync(hapticStyle).catch(() => undefined);
    }
  }, [disabled, disableHaptics, hapticIntensity]);

  const handlePressOut = useCallback(() => {
    if (disabled) return;

    // Scale back with spring
    scale.value = withSpring(1.0, {
      damping: theme.interactions.press.spring.damping,
      stiffness: theme.interactions.press.spring.stiffness,
    });
  }, [disabled]);

  const pressAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return {
    handlePressIn,
    handlePressOut,
    pressAnimatedStyle,
  };
};
