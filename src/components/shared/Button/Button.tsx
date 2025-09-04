import React, { useState } from "react";
import {
  Pressable,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from "react-native-reanimated";
import { createStyles } from "./Button.styles";
import { useTheme } from "../../../theme";

interface ButtonProps {
  onPress: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "tertiary" | "destructive";
  size?: "small" | "medium" | "large";
  children?: React.ReactNode;
  icon?: React.ReactElement<{ style?: any }>;
  iconPosition?: "left" | "right";
  style?: any;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  numberOfLines?: number;
  grow?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  onPress,
  disabled = false,
  variant = "primary",
  size = "medium",
  children,
  icon,
  iconPosition = "left",
  style,
  accessibilityLabel,
  accessibilityHint,
  numberOfLines,
  grow = true,
}) => {
  const { colors, colorScheme } = useTheme();
  const styles = createStyles(colors, colorScheme);
  const [isPressed, setIsPressed] = useState(false);

  // Animation state
  const pressProgress = useSharedValue(0);

  // Animated style for scaling
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withSpring(interpolate(pressProgress.value, [0, 1], [1, 0.95]), {
          damping: 15,
          stiffness: 400,
        }),
      },
    ],
  }));

  const isLoading =
    children &&
    React.isValidElement(children) &&
    children.type === ActivityIndicator;

  // Use size for style key
  const sizeKey = size;

  // Get base styles
  const baseStyles: ViewStyle[] = [
    styles.base,
    styles[variant as keyof typeof styles] as ViewStyle,
    styles[sizeKey as keyof typeof styles] as ViewStyle,
  ];

  // Add pressed state styles
  if (isPressed && !disabled) {
    const pressedStyleKey = `${variant}Pressed` as keyof typeof styles;
    if (styles[pressedStyleKey]) {
      baseStyles.push(styles[pressedStyleKey] as ViewStyle);
    }
  }

  // Add disabled styles
  if (disabled) {
    baseStyles.push(styles.disabled);
  }

  // Add custom styles
  if (style) {
    baseStyles.push(style as ViewStyle);
  }

  // Get text styles
  const textStyles: TextStyle[] = [styles.text];

  // Add variant-specific text styles
  if (variant === "secondary") {
    textStyles.push(styles.secondaryText);
  } else if (variant === "tertiary") {
    textStyles.push(styles.tertiaryText);
  }

  // Add disabled text styles
  if (disabled) {
    textStyles.push(styles.disabledText);
  }

  // Add size-specific text styles
  const textStyleKey = `${size}Text` as keyof typeof styles;
  if (styles[textStyleKey]) {
    textStyles.push(styles[textStyleKey]);
  }

  // Calculate icon size based on font size
  const currentFontSize = textStyles.reduce((fontSize, style) => {
    return style && typeof style === "object" && "fontSize" in style
      ? (style as any).fontSize || fontSize
      : fontSize;
  }, 16); // fallback to 16

  const iconSize = Math.max(16, currentFontSize * 1.2); // Icon is 20% larger than text

  // Determine content layout
  const hasIcon = !!icon;
  const hasText = !!children;
  const isIconOnly = hasIcon && !hasText;
  const isTextOnly = hasText && !hasIcon;
  const hasIconAndText = hasIcon && hasText;

  const renderContent = () => {
    if (isLoading) {
      // If children is ActivityIndicator, render it directly
      if (
        React.isValidElement(children) &&
        children.type === ActivityIndicator
      ) {
        return children;
      }
      return <Text style={textStyles}>{children}</Text>;
    }

    if (isIconOnly) {
      return React.cloneElement(icon!, {
        style: [
          icon!.props.style,
          styles.iconOnly,
          { fontSize: iconSize, width: iconSize, height: iconSize },
        ],
      });
    }

    if (isTextOnly) {
      return (
        <Text style={textStyles} numberOfLines={numberOfLines}>
          {children}
        </Text>
      );
    }

    if (hasIconAndText) {
      const iconWithStyle = React.cloneElement(icon!, {
        style: [
          icon!.props.style,
          styles[iconPosition === "left" ? "iconLeft" : "iconRight"],
          { fontSize: iconSize, width: iconSize, height: iconSize },
        ],
      });

      const textElement = (
        <Text
          style={[textStyles, { flexShrink: 1 }]}
          numberOfLines={numberOfLines}
        >
          {children}
        </Text>
      );

      return (
        <React.Fragment>
          {iconPosition === "left" ? iconWithStyle : textElement}
          {iconPosition === "left" ? textElement : iconWithStyle}
        </React.Fragment>
      );
    }

    return null;
  };

  return (
    <Animated.View style={[grow && styles.fullWidth, animatedStyle]}>
      <Pressable
        style={[
          ...baseStyles,
          grow ? styles.fullWidth : styles.compact,
          animatedStyle,
          (hasIconAndText || isIconOnly) && styles.iconContainer,
        ]}
        onPress={onPress}
        onPressIn={() => {
          setIsPressed(true);
          pressProgress.value = 1;
        }}
        onPressOut={() => {
          setIsPressed(false);
          pressProgress.value = 0;
        }}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={
          accessibilityLabel ||
          (typeof children === "string" ? children : undefined)
        }
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled }}
      >
        {renderContent()}
      </Pressable>
    </Animated.View>
  );
};
