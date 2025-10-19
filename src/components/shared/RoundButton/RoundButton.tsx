import React, { useCallback } from "react";
import { Pressable, PressableProps, PixelRatio } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { LucideIcon } from "lucide-react-native";
import { useTheme } from "@/theme";
import { createStyles } from "./RoundButton.styles";

export type RoundButtonVariant = "primary" | "secondary" | "tertiary" | "red";

export interface RoundButtonProps extends Omit<PressableProps, "children"> {
  Icon: LucideIcon;
  variant: RoundButtonVariant;
  iconSize?: number;
  disabled?: boolean;
  iconColor?: string;
  backgroundColor?: string;
  iconStrokeWidth?: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const RoundButton = React.memo<RoundButtonProps>(
  ({
    Icon,
    variant,
    iconSize = 20,
    disabled = false,
    onPress,
    onPressIn,
    onPressOut,
    style,
    iconColor,
    backgroundColor,
    iconStrokeWidth,
    ...pressableProps
  }) => {
    const { colors, colorScheme, theme } = useTheme();
    const styles = createStyles(colors, theme, colorScheme);

    const scale = useSharedValue(1);
    const brightness = useSharedValue(0);
    const fontScale = PixelRatio.getFontScale();

    const adjustedIconSize = iconSize * fontScale;
    const basePadding = theme.spacing.sm + theme.spacing.xs;
    const padding = Math.max(basePadding * fontScale, basePadding);
    const containerSize = adjustedIconSize + padding * 2;

    // Get icon color based on variant
    const getIconColor = () => {
      if (iconColor) return iconColor;
      if (disabled) return colors.disabledText;

      switch (variant) {
        case "primary":
          return colors.black;
        case "secondary":
          return colors.primaryText;
        case "tertiary":
          return colors.primaryText;
        case "red":
          return colors.white;
        default:
          return colors.primaryText;
      }
    };

    // Get background color with press state
    const getBackgroundColor = (pressed: boolean) => {
      if (disabled) return colors.disabledBackground;
      if (backgroundColor) return backgroundColor;

      const baseColor = (() => {
        switch (variant) {
          case "primary":
            return colors.accent;
          case "secondary":
            return colors.secondaryBackground;
          case "tertiary":
            return colors.subtleBackground;
          case "red":
            return colors.recording;
          default:
            return colors.accent;
        }
      })();

      if (pressed) {
        // Slightly darken the color when pressed
        return baseColor + "CC";
      }

      return baseColor;
    };

    const handlePressIn = useCallback(
      (event: any) => {
        if (!disabled) {
          scale.value = withSpring(1.4, {
            stiffness: 600,
            damping: 22,
          });

          brightness.value = withTiming(0.3);

          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPressIn?.(event);
      },
      [disabled, onPressIn, scale, brightness]
    );

    const handlePressOut = useCallback(
      (event: any) => {
        if (!disabled) {
          scale.value = withSpring(1, {
            stiffness: 800,
            damping: 60,
          });

           brightness.value = withTiming(0);
        }
        onPressOut?.(event);
      },
      [disabled, onPressOut, scale, brightness]
    );

    const handlePress = useCallback(
      (event: any) => {
        if (!disabled) {
          onPress?.(event);
        }
      },
      [disabled, onPress]
    );

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const brightnessStyle = useAnimatedStyle(() => ({
      opacity: brightness.value,
    }));

    return (
      <AnimatedPressable
        style={[
          styles.container,
          {
            width: containerSize,
            height: containerSize,
          },
          animatedStyle,
          style,
        ]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={disabled}
        accessible={true}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        {...pressableProps}
      >
        {({ pressed }) => (
          <Animated.View
            style={[
              styles.container,
              {
                width: containerSize,
                height: containerSize,
                backgroundColor: getBackgroundColor(pressed),
              },
            ]}
          >
            <Animated.View
              style={[
                {
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor:
                    variant === "primary" ? "transparent" : "#fff",
                  borderRadius: containerSize / 2,
                },
                brightnessStyle,
              ]}
              pointerEvents="none"
            />
            <Icon
              size={adjustedIconSize}
              color={getIconColor()}
              strokeWidth={iconStrokeWidth ?? (variant === "primary" ? 2 : 1.5)}
              fill={variant === "red" ? "white" : "transparent"}
            />
          </Animated.View>
        )}
      </AnimatedPressable>
    );
  }
);
