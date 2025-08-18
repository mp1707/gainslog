import React, { useEffect, useMemo } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { AppText } from "@/components/AppText";
import { useTheme } from "@/providers/ThemeProvider";
import { createStyles } from "./CentralDisplay.styles";

interface CentralDisplayProps {
  current: number;
  target: number;
  percentage: number;
}

export const CentralDisplay: React.FC<CentralDisplayProps> = React.memo(
  ({ current, target, percentage }) => {
    const { colors, theme } = useTheme();

    // Shared values for opacity and scale, initialized to 0 for the animation.
    const opacity = useSharedValue(0);
    const scale = useSharedValue(0.95);

    // Trigger the animation on component mount.
    useEffect(() => {
      opacity.value = withTiming(1, { duration: 300 });
      scale.value = withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.quad),
      });
    }, []); // Empty dependency array ensures this runs only once on mount.

    // The animated style now correctly animates from the initial shared values.
    const containerAnimatedStyle = useAnimatedStyle(() => {
      return {
        opacity: opacity.value,
        transform: [{ scale: scale.value }],
      };
    }, []);

    // No changes below this line, the existing memoization is effective.
    const safeValues = useMemo(() => {
      const safeCurrentValue = isNaN(current) ? 0 : Math.max(0, current);
      const safeTargetValue = isNaN(target) ? 0 : Math.max(0, target);
      const safePercentage = isNaN(percentage)
        ? 0
        : Math.min(100, Math.max(0, percentage));

      return {
        current: safeCurrentValue,
        target: safeTargetValue,
        percentage: safePercentage,
      };
    }, [current, target, percentage]);

    const percentageColor = useMemo(
      () => colors.semantic?.calories || colors.accent,
      [colors.semantic, colors.accent]
    );

    const styles = useMemo(
      () => createStyles(colors, theme, percentageColor),
      [colors, theme, percentageColor]
    );

    if (safeValues.target <= 0) {
      return (
        <Animated.View style={[styles.container, containerAnimatedStyle]}>
          <AppText role="Caption" style={styles.targetInfo}>
            No target set
          </AppText>
        </Animated.View>
      );
    }

    return (
      <Animated.View style={[styles.container, containerAnimatedStyle]}>
        <AppText role="Title2" style={styles.currentValue}>
          {Math.round(safeValues.current)}
        </AppText>
        <AppText role="Caption" style={styles.targetInfo}>
          of {safeValues.target} kcal
        </AppText>
        {safeValues.percentage > 0 && (
          <AppText role="Caption" style={styles.percentageText}>
            {Math.round(safeValues.percentage)}%
          </AppText>
        )}
      </Animated.View>
    );
  }
);
