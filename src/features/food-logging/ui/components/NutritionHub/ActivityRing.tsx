import React, { useEffect, useMemo } from "react";
import Svg, { Circle, G } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withSpring,
  withDelay,
} from "react-native-reanimated";
import { useTheme } from "@/providers/ThemeProvider";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ActivityRingProps {
  percentage: number;
  color: string;
  radius: number;
  strokeWidth: number;
  size: number;
  label: string;
  target: number;
  animationDelay?: number;
}

export const ActivityRing: React.FC<ActivityRingProps> = React.memo(
  ({
    percentage,
    color,
    radius,
    strokeWidth,
    size,
    label,
    target,
    animationDelay = 0,
  }) => {
    const { colors } = useTheme();
    const progress = useSharedValue(0);

    // Memoize expensive calculations
    const geometryValues = useMemo(() => {
      const center = size / 2;
      const safeRadius = Math.max(radius, 1);
      const circumference = 2 * Math.PI * safeRadius;
      const clampedPercentage = Math.min(
        100,
        Math.max(0, isNaN(percentage) ? 0 : percentage)
      );

      return {
        center,
        circumference,
        clampedPercentage,
        safeRadius,
      };
    }, [size, radius, percentage]);

    const { center, circumference, clampedPercentage, safeRadius } =
      geometryValues;

    useEffect(() => {
      if (progress.value !== clampedPercentage) {
        progress.value = withDelay(
          animationDelay,
          withSpring(clampedPercentage, {
            damping: 15,
            stiffness: 100,
            mass: 1,
          })
        );
      }
    }, [clampedPercentage, animationDelay]);

    const animatedProps = useAnimatedProps(() => {
      const progressLength = (circumference * progress.value) / 100;
      return {
        strokeDasharray: `${progressLength} ${circumference}`,
      };
    }, [circumference]);

    if (target <= 0 || safeRadius <= 1) {
      return null;
    }

    return (
      <G
        accessibilityRole="image"
        accessibilityLabel={`${label}: ${Math.round(
          clampedPercentage
        )}% of daily goal completed`}
      >
        {/* Background track */}
        <Circle
          cx={center}
          cy={center}
          r={safeRadius}
          stroke={colors.disabledBackground}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          opacity={0.5}
        />

        {/* Progress ring */}
        <AnimatedCircle
          cx={center}
          cy={center}
          r={safeRadius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          animatedProps={animatedProps}
          // Start from top (12 o'clock position)
          rotation="-90"
          origin={`${center}, ${center}`}
        />
      </G>
    );
  }
);
