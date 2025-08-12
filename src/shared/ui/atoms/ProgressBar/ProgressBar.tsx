import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import Animated, { useAnimatedStyle, SharedValue } from "react-native-reanimated";
import { useTheme } from "@/providers/ThemeProvider";

export interface ProgressBarProps {
  value: number; // percent value, can exceed 100
  color: string;
  trackColor?: string;
  height?: number;
  borderRadius?: number;
  accessibilityLabel?: string;
  animatedProgress?: SharedValue<number>; // 0 to 1 for animation
}

export const ProgressBar: React.FC<ProgressBarProps> = React.memo(
  ({
    value,
    color,
    trackColor,
    height = 8,
    borderRadius = 4,
    accessibilityLabel,
    animatedProgress,
  }) => {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(height), [height]);

    // Clamp values and calculate ratios
    const clampedVisible = Math.max(0, Math.min(100, value));
    const isOverflowing = value > 100;
    const targetRatio = clampedVisible / 100;

    const effectiveTrackColor = useMemo(() => {
      return trackColor || theme.getComponentStyles().progressBars.trackColor;
    }, [trackColor, theme]);

    // Animated style for the fill bar
    const animatedFillStyle = useAnimatedStyle(() => {
      if (animatedProgress) {
        return {
          transform: [{ scaleX: animatedProgress.value * targetRatio }],
        };
      }
      return {};
    }, [animatedProgress, targetRatio]);

    return (
      <View
        style={[
          styles.track,
          { backgroundColor: effectiveTrackColor, borderRadius },
        ]}
        accessible={true}
        accessibilityRole="progressbar"
        accessibilityLabel={accessibilityLabel}
        accessibilityValue={{
          min: 0,
          max: 100,
          now: Math.min(100, Math.max(0, Math.round(value))),
        }}
        accessibilityHint={
          isOverflowing ? `${Math.round(value)}% over target` : undefined
        }
      >
        <Animated.View
          style={[
            styles.fill,
            {
              width: animatedProgress ? "100%" : `${targetRatio * 100}%`,
              backgroundColor: color,
              borderRadius,
              transformOrigin: "left",
            },
            animatedFillStyle,
          ]}
        />
      </View>
    );
  }
);

const createStyles = (height: number) =>
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
  });
