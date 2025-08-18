import React, { useEffect } from "react";
import Svg, { Circle } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { useTheme } from "@/providers/ThemeProvider";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ActivityRingProps {
  current: number;
  target: number;
  percentage: number;
  color: string;
  radius: number;
  strokeWidth: number;
  size: number;
  label: string;
  unit: string;
  animationDelay?: number;
}

export const ActivityRing: React.FC<ActivityRingProps> = React.memo(({
  current,
  target,
  percentage,
  color,
  radius,
  strokeWidth,
  size,
  label,
  unit,
  animationDelay = 0,
}) => {
  const { colors } = useTheme();
  const progress = useSharedValue(0);
  
  // Calculate circle properties
  const center = size / 2;
  const circumference = 2 * Math.PI * Math.max(radius, 1); // Prevent division by zero
  
  // Clamp percentage between 0-100 and handle NaN
  const clampedPercentage = Math.min(100, Math.max(0, isNaN(percentage) ? 0 : percentage));
  
  // Only show ring if target is defined and radius is valid
  if (target <= 0 || radius <= 0) {
    return null;
  }

  // Animate progress with delay for staggered effect
  useEffect(() => {
    progress.value = withDelay(
      animationDelay,
      withTiming(clampedPercentage, {
        duration: 500,
        easing: Easing.bezier(0.25, 1, 0.5, 1),
      })
    );
  }, [clampedPercentage, animationDelay]);

  // Animated props for the progress circle
  const animatedProps = useAnimatedProps(() => {
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (circumference * progress.value) / 100;
    
    return {
      strokeDasharray,
      strokeDashoffset,
    };
  });

  return (
    <Svg
      width={size}
      height={size}
      style={{ position: 'absolute' }}
      accessibilityRole="image"
      accessibilityLabel={`${label}: ${Math.round(clampedPercentage)}% of daily goal completed`}
    >
      {/* Background track */}
      <Circle
        cx={center}
        cy={center}
        r={radius}
        stroke={colors.disabledBackground}
        strokeWidth={strokeWidth}
        fill="transparent"
        strokeLinecap="round"
      />

      {/* Progress ring */}
      <AnimatedCircle
        cx={center}
        cy={center}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="transparent"
        strokeLinecap="round"
        animatedProps={animatedProps}
        // Start from top (12 o'clock position)
        transform={`rotate(-90 ${center} ${center})`}
      />
    </Svg>
  );
});