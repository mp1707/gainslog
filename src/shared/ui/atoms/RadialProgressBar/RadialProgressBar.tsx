import React, { useEffect } from "react";
import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useTheme } from "../../../../providers/ThemeProvider";
import { AppText } from "src/components";
import { theme } from "src/theme";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface RadialProgressBarProps {
  current: number;
  target: number;
  unit: string;
  label: string;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

export const RadialProgressBar: React.FC<RadialProgressBarProps> = ({
  current,
  target,
  unit,
  label,
  size = 100,
  strokeWidth = theme.components.progressBars.height,
  color,
}) => {
  const { colors } = useTheme();
  const progress = useSharedValue(0);

  // Calculate percentage and clamp between 0-100
  const percentage = Math.min(100, Math.max(0, (current / target) * 100));

  // Circle calculations for partial arc (270 degrees)
  const radius = (size - strokeWidth) / 2;
  const arcAngle = 270; // degrees
  const arcLength = (arcAngle / 360) * (2 * Math.PI * radius);
  const fullCircumference = 2 * Math.PI * radius;
  const center = size / 2;

  // Animate progress when percentage changes
  useEffect(() => {
    progress.value = withTiming(percentage, {
      duration: 500,
      easing: Easing.bezier(0.25, 1, 0.5, 1),
    });
  }, [percentage]);

  // Animated props for the progress circle
  const animatedProps = useAnimatedProps(() => {
    // Calculate dynamic arc length based on progress percentage
    const progressArcLength = (progress.value / 100) * arcLength;
    return {
      strokeDasharray: `${progressArcLength} ${fullCircumference}`,
    };
  });

  const progressColor = color || colors.accent;

  return (
    <View style={{ alignItems: "center" }}>
      <View style={{ position: "relative", paddingBottom: 10 }}>
        <Svg width={size} height={size}>
          {/* Background arc */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={colors.disabledBackground}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={`${arcLength} ${fullCircumference - arcLength}`}
            strokeLinecap="round"
            rotation="135"
            origin={`${center}, ${center}`}
          />

          {/* Progress arc */}
          <AnimatedCircle
            cx={center}
            cy={center}
            r={radius}
            stroke={progressColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="round"
            animatedProps={animatedProps}
            rotation="135"
            origin={`${center}, ${center}`}
          />
        </Svg>

        <View
          style={{
            position: "absolute",
            top: -10,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <AppText
            role="Caption"
            style={{
              color: colors.secondaryText,
              textAlign: "center",
            }}
          >
            {label}
          </AppText>
        </View>

        <View
          style={{
            position: "absolute",
            right: 0,
            left: 0,
            bottom: 0,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <AppText
            role="Caption"
            style={{
              color: colors.primaryText,
              textAlign: "center",
            }}
          >
            {Math.round(current)}/{target}
            {unit}
          </AppText>
        </View>
      </View>
    </View>
  );
};
