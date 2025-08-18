import React, { useEffect } from "react";
import Svg, { Circle } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withSpring,
  withDelay,
  runOnJS,
  interpolate,
  useAnimatedStyle,
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
  const scale = useSharedValue(1);
  
  // Calculate circle properties
  const center = size / 2;
  const circumference = 2 * Math.PI * Math.max(radius, 1); // Prevent division by zero
  
  // Clamp percentage between 0-100 and handle NaN
  const clampedPercentage = Math.min(100, Math.max(0, isNaN(percentage) ? 0 : percentage));
  
  
  // Only show ring if target is defined and radius is valid
  if (target <= 0 || radius <= 0) {
    return null;
  }

  // Animate progress with satisfying spring animation
  useEffect(() => {
    progress.value = withDelay(
      animationDelay,
      withSpring(clampedPercentage, {
        damping: 12,
        stiffness: 120,
        mass: 0.8,
      })
    );

    // Add scale animation for extra satisfaction at milestones
    const triggerScaleAnimation = () => {
      if (clampedPercentage >= 25) {
        scale.value = withSpring(1.05, {
          damping: 8,
          stiffness: 150,
        }, () => {
          scale.value = withSpring(1, {
            damping: 10,
            stiffness: 120,
          });
        });
      }
    };

    if (clampedPercentage > 0) {
      // Delay scale animation to happen after progress starts
      setTimeout(triggerScaleAnimation, animationDelay + 300);
    }
  }, [clampedPercentage, animationDelay]);

  // Animated props for the progress circle
  const animatedProps = useAnimatedProps(() => {
    const progressLength = (circumference * progress.value) / 100;
    const gapLength = circumference - progressLength;
    
    return {
      strokeDasharray: `${progressLength} ${gapLength}`,
      strokeDashoffset: 0,
    };
  });

  // Animated style for scale animation
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <Animated.View style={animatedStyle}>
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
        transform={`rotate(-90 ${center} ${center})`}
        opacity={1}
      />
      
    </Svg>
    </Animated.View>
  );
});