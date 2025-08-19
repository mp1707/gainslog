import React, { useEffect, useMemo } from "react";
import {
  Circle,
  Group,
  Path,
  Skia,
} from "@shopify/react-native-skia";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { useTheme } from "@/providers/ThemeProvider";

const AnimatedPath = Animated.createAnimatedComponent(Path);

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

    const { center, clampedPercentage, safeRadius, circlePath } =
      useMemo(() => {
        const center = size / 2;
        const safeRadius = Math.max(radius, 1);
        const clampedPercentage = Math.min(
          100,
          Math.max(0, isNaN(percentage) ? 0 : percentage)
        );
        
        // Create a circle path for Skia
        const circlePath = Skia.Path.Make();
        circlePath.addCircle(center, center, safeRadius);
        
        return { center, clampedPercentage, safeRadius, circlePath };
      }, [size, radius, percentage]);

    useEffect(() => {
      if (progress.value !== clampedPercentage) {
        progress.value = withDelay(
          animationDelay,
          withTiming(clampedPercentage, {
            duration: 500,
            easing: Easing.bezier(0.25, 1, 0.5, 1),
          })
        );
      }
    }, [clampedPercentage, animationDelay]);

    const animatedProps = useAnimatedProps(() => {
      const progressRatio = progress.value / 100;
      return { 
        start: 0,
        end: progressRatio
      };
    });

    if (target <= 0 || safeRadius <= 1) return null;

    return (
      <Group
        transform={[{ rotate: -Math.PI / 2 }]}
        origin={{ x: center, y: center }}
      >
        {/* Background circle */}
        <Circle
          cx={center}
          cy={center}
          r={safeRadius}
          color={colors.disabledBackground}
          style="stroke"
          strokeWidth={strokeWidth}
          strokeCap="round"
          opacity={0.5}
        />
        
        {/* Progress arc */}
        <AnimatedPath
          path={circlePath}
          color={color}
          style="stroke"
          strokeWidth={strokeWidth}
          strokeCap="round"
          animatedProps={animatedProps}
        />
      </Group>
    );
  }
);
