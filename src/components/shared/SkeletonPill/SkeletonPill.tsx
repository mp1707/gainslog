import React, { useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useTheme } from "@/theme";
import { createStyles } from "./SkeletonPill.styles";

interface SkeletonPillProps {
  width?: number | string;
  height?: number;
  style?: any;
}

export const SkeletonPill: React.FC<SkeletonPillProps> = ({
  width = "80%",
  height = 20,
  style,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  
  const pulseOpacity = useSharedValue(0.3);

  useEffect(() => {
    pulseOpacity.value = withRepeat(
      withTiming(0.6, {
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, [pulseOpacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.pill,
        { width, height },
        animatedStyle,
        style,
      ]}
    />
  );
};