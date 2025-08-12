import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, StyleSheet, LayoutChangeEvent } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  cancelAnimation,
  withDelay,
  Easing,
  useDerivedValue,
  interpolate,
} from "react-native-reanimated";
import { useTheme } from "@/providers/ThemeProvider";

export interface ProgressBarProps {
  value: number; // percent value, can exceed 100
  prevValue?: number; // previous percent value for animation start
  color: string;
  trackColor?: string;
  height?: number;
  borderRadius?: number;
  accessibilityLabel?: string;
  delayMs?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  prevValue,
  color,
  trackColor,
  height = 8,
  borderRadius = 4,
  accessibilityLabel,
  delayMs = 0,
}) => {
  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(height, borderRadius), [height, borderRadius]);

  const [trackWidth, setTrackWidth] = useState(0);
  const clampedVisible = Math.max(0, Math.min(100, value));
  const isOverflowing = value > 100;

  const targetRatio = clampedVisible / 100;
  const startRatio = prevValue !== undefined ? Math.max(0, Math.min(100, prevValue)) / 100 : 0;

  const progress = useSharedValue(startRatio);
  const shimmerX = useSharedValue(-24);
  const pulseOpacity = useSharedValue(0);

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    setTrackWidth(e.nativeEvent.layout.width);
  }, []);

  // Animate progress to target
  useEffect(() => {
    progress.value = withDelay(delayMs, withTiming(targetRatio, {
      duration: 500,
      easing: Easing.bezier(0.25, 1, 0.5, 1),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetRatio, delayMs]);

  // Trigger shimmer when crossing 100% from below
  const crossedToOverflow = prevValue !== undefined && prevValue <= 100 && value > 100;
  useEffect(() => {
    if (crossedToOverflow) {
      shimmerX.value = -24;
      shimmerX.value = withTiming((trackWidth || 0) + 24, {
        duration: 1000,
        easing: Easing.linear,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [crossedToOverflow, trackWidth]);

  // Overflow pulse indicator animation
  useEffect(() => {
    if (isOverflowing) {
      pulseOpacity.value = withRepeat(
        withTiming(0.6, { duration: 800, easing: Easing.inOut(Easing.quad) }),
        -1,
        true
      );
      return () => {
        cancelAnimation(pulseOpacity);
      };
    }
    pulseOpacity.value = 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOverflowing]);

  const fillAnimatedStyle = useAnimatedStyle(() => {
    const minVisibleSliver = 2; // px
    const width = trackWidth * progress.value;
    const ensuredWidth = progress.value > 0 && width < minVisibleSliver ? minVisibleSliver : width;
    return {
      width: ensuredWidth,
      backgroundColor: color,
    };
  }, [trackWidth, color]);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerX.value }],
    opacity: interpolate(shimmerX.value, [-24, (trackWidth || 0) + 24], [0, 1]),
  }));

  const overflowPulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  const effectiveTrackColor = trackColor || theme.getComponentStyles().progressBars.trackColor;

  return (
    <View
      style={[styles.track, { backgroundColor: effectiveTrackColor, borderRadius }]}
      onLayout={handleLayout}
      accessible={true}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.min(100, Math.max(0, Math.round(value))) }}
      accessibilityHint={isOverflowing ? `${Math.round(value)}% over target` : undefined}
    >
      <Animated.View style={[styles.fill, { borderRadius }, fillAnimatedStyle]} />

      {/* Shimmer overlay when crossing goal */}
      <Animated.View pointerEvents="none" style={[styles.shimmer, shimmerStyle]} />

      {/* Overflow thin pulse at the right edge of the bar */}
      {isOverflowing && (
        <Animated.View
          pointerEvents="none"
          style={[styles.pulse, { backgroundColor: color }, overflowPulseStyle]}
        />
      )}
    </View>
  );
};

const createStyles = (height: number, radius: number) =>
  StyleSheet.create({
    track: {
      width: "100%",
      height,
      overflow: "hidden",
      position: "relative",
    },
    fill: {
      height: "100%",
    },
    shimmer: {
      position: "absolute",
      top: 0,
      bottom: 0,
      width: 24,
      backgroundColor: "rgba(255,255,255,0.25)",
    },
    pulse: {
      position: "absolute",
      top: 0,
      bottom: 0,
      width: 2,
      right: 0,
      borderRadius: radius,
    },
  });


