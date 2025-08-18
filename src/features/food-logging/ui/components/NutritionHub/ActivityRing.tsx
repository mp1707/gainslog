import React, { useEffect } from "react";
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

export const ActivityRing: React.FC<ActivityRingProps> = React.memo(({
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
  
  const center = size / 2;
  const circumference = 2 * Math.PI * Math.max(radius, 1);
  
  const clampedPercentage = Math.min(100, Math.max(0, isNaN(percentage) ? 0 : percentage));
  
  useEffect(() => {
    progress.value = withDelay(
      animationDelay,
      withSpring(clampedPercentage, {
        damping: 15,
        stiffness: 100,
        mass: 1,
      })
    );
  }, [clampedPercentage, animationDelay]);

  const animatedProps = useAnimatedProps(() => {
    const progressLength = (circumference * progress.value) / 100;
    return {
      strokeDasharray: `${progressLength} ${circumference}`,
    };
  });
  
  if (target <= 0 || radius <= 0) {
    return null;
  }

  return (
    <G 
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
        opacity={0.5}
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
        rotation="-90"
        origin={`${center}, ${center}`}
      />
    </G>
  );
});