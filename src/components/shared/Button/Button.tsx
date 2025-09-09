import React, { useCallback } from "react";
import {
  Pressable,
  PressableProps,
  Text,
  View,
  PixelRatio,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { LucideIcon } from "lucide-react-native";
import { useTheme } from "@/theme";
import { createStyles } from "./Button.styles";

export type ButtonVariant = "primary" | "secondary" | "tertiary";

export interface ButtonProps extends Omit<PressableProps, "children"> {
  label: string;
  variant: ButtonVariant;
  Icon?: LucideIcon;
  iconSize?: number;
  disabled?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const Button = React.memo<ButtonProps>(
  ({
    label,
    variant,
    Icon,
    iconSize = 18,
    disabled = false,
    onPress,
    onPressIn,
    onPressOut,
    style,
    ...pressableProps
  }) => {
    const { colors, theme, colorScheme } = useTheme();
    const fontScale = PixelRatio.getFontScale();
    const styles = createStyles(colors, theme, fontScale);

    const scale = useSharedValue(1);
    const adjustedIconSize = iconSize * fontScale;

    // Get text color based on variant
    const getTextColor = () => {
      if (disabled) return colors.disabledText;

      switch (variant) {
        case "primary":
          return colors.black;
        case "secondary":
          return colors.primaryText;
        case "tertiary":
          return colors.primaryText;
        default:
          return colors.primaryText;
      }
    };

    // Get background color with press state
    const getBackgroundColor = (pressed: boolean) => {
      if (disabled) return colors.disabledBackground;

      const baseColor = (() => {
        switch (variant) {
          case "primary":
            return colors.accent;
          case "secondary":
            return colors.secondaryBackground;
          case "tertiary":
            return colors.subtleBackground;
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
          scale.value = withSpring(0.98, {
            stiffness: 400,
            damping: 30,
          });

          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPressIn?.(event);
      },
      [disabled, onPressIn, scale]
    );

    const handlePressOut = useCallback(
      (event: any) => {
        if (!disabled) {
          scale.value = withSpring(1, {
            stiffness: 400,
            damping: 30,
          });
        }
        onPressOut?.(event);
      },
      [disabled, onPressOut, scale]
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

    const renderIcon = () => {
      if (!Icon) return null;

      return (
        <View style={styles.iconContainer}>
          <Icon size={adjustedIconSize} color={getTextColor()} />
        </View>
      );
    };

    const renderContent = () => {
      const textElement = (
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={[
            styles.label,
            disabled
              ? styles.labelDisabled
              : variant === "primary"
              ? styles.labelPrimary
              : variant === "secondary"
              ? styles.labelSecondary
              : styles.labelTertiary,
          ]}
        >
          {label}
        </Text>
      );

      if (!Icon) return textElement;

      return (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 1,
            minWidth: 0,
            gap: 8,
          }}
        >
          {renderIcon()}
          <View style={{ flexShrink: 1, minWidth: 0 }}>
            {textElement}
          </View>
        </View>
      );
    };

    return (
      <AnimatedPressable
        style={[animatedStyle, style]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={disabled}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled }}
        {...pressableProps}
      >
        {({ pressed }) => (
          <Animated.View
            style={[
              styles.container,
              {
                backgroundColor: getBackgroundColor(pressed),
              },
            ]}
          >
            {renderContent()}
          </Animated.View>
        )}
      </AnimatedPressable>
    );
  }
);
