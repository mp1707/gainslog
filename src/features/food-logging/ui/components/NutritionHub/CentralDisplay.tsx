import React, { useEffect, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
// Make sure to adjust these import paths to match your project structure
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

  // Ensure all values are valid numbers before use
  const safeCurrentValue = isNaN(current) ? 0 : Math.max(0, current);
  const safeTargetValue = isNaN(target) ? 0 : Math.max(0, target);
  const safePercentage = isNaN(percentage) ? 0 : Math.min(100, Math.max(0, percentage));

  const containerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(1, { duration: 300 }),
      transform: [{ scale: withTiming(1, { duration: 300, easing: Easing.out(Easing.quad) }) }],
    };
  });

  const styles = useMemo(() => StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      width: 150, // Increased size for better readability
      height: 150,
    },
    currentValue: {
      color: colors.primaryText,
      textAlign: 'center',
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
      marginTop: 4,
    },
  }), [colors, theme]);

  if (safeTargetValue <= 0) {
    return (
      <Animated.View style={[styles.container, containerAnimatedStyle]}>
        <AppText role="Caption" style={styles.targetInfo}>
          No target set
        </AppText>
      </Animated.View>
    );
  }

  // NOTE: For animating the number text itself, you would typically use
  // a more complex setup with an Animated.TextInput, but for simplicity
  // and performance, showing the final value is often sufficient.
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