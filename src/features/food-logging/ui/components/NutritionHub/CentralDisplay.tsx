import React, { useEffect, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withTiming,
  Easing,
  interpolate,
} from "react-native-reanimated";
import { AppText } from "@/components/AppText";
import { useTheme } from "@/providers/ThemeProvider";

interface CentralDisplayProps {
  current: number;
  target: number;
  percentage: number;
}

export const CentralDisplay: React.FC<CentralDisplayProps> = React.memo(({
  current,
  target,
  percentage,
}) => {
  const { colors, theme } = useTheme();
  const animatedValue = useSharedValue(0);
  const previousValue = useSharedValue(0);

  // Ensure all values are valid numbers
  const safeCurrentValue = isNaN(current) ? 0 : Math.max(0, current);
  const safeTargetValue = isNaN(target) ? 0 : Math.max(0, target);
  const safePercentage = isNaN(percentage) ? 0 : Math.min(100, Math.max(0, percentage));

  // Animate the numerical value changes
  useEffect(() => {
    previousValue.value = animatedValue.value;
    animatedValue.value = withTiming(safeCurrentValue, {
      duration: 500,
      easing: Easing.bezier(0.25, 1, 0.5, 1),
    });
  }, [safeCurrentValue]);

  // Animated style for opacity and scale entrance effect
  const containerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(1, { duration: 300 }),
      transform: [
        {
          scale: withTiming(1, {
            duration: 300,
            easing: Easing.out(Easing.quad),
          }),
        },
      ],
    };
  });

  const styles = useMemo(() => StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      width: 80,
      height: 80,
    },
    currentValue: {
      color: colors.primaryText,
      textAlign: 'center',
      lineHeight: 28,
    },
    targetInfo: {
      color: colors.secondaryText,
      textAlign: 'center',
      marginTop: 2,
    },
    percentageText: {
      color: colors.semantic?.calories || colors.accent,
      textAlign: 'center',
      fontWeight: '600',
    },
  }), [colors, theme]);

  // Show different content based on whether targets are set
  if (safeTargetValue <= 0) {
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
        {Math.round(safeCurrentValue)}
      </AppText>
      <AppText role="Caption" style={styles.targetInfo}>
        of {safeTargetValue} kcal
      </AppText>
      {safePercentage > 0 && (
        <AppText role="Caption" style={styles.percentageText}>
          {Math.round(safePercentage)}%
        </AppText>
      )}
    </Animated.View>
  );
});