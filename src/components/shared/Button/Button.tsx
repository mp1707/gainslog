import React, { useState } from "react";
import {
  Pressable,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from "react-native";
import { ButtonProps } from "@/types";
import { styles } from "./Button.styles";

export const Button: React.FC<ButtonProps> = ({
  onPress,
  disabled = false,
  shape = "round",
  variant = "primary",
  size = "medium",
  children,
  style,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const isLoading =
    children &&
    React.isValidElement(children) &&
    children.type === ActivityIndicator;

  // Combine shape and size for style key
  const shapeSize = `${shape}${size.charAt(0).toUpperCase() + size.slice(1)}`;

  // Get base styles
  const baseStyles: ViewStyle[] = [
    styles.base,
    styles[variant as keyof typeof styles] as ViewStyle,
    styles[shapeSize as keyof typeof styles] as ViewStyle,
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
  if (variant === "tertiary") {
    textStyles.push(styles.tertiaryText);
  }

  // Add disabled text styles
  if (disabled) {
    textStyles.push(styles.disabledText);
  }

  // Add size-specific text styles
  const textStyleKey = `${shapeSize}Text` as keyof typeof styles;
  if (styles[textStyleKey]) {
    textStyles.push(styles[textStyleKey]);
  }

  return (
    <Pressable
      style={baseStyles}
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={
        accessibilityLabel ||
        (typeof children === "string" ? children : undefined)
      }
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
    >
      {isLoading ? (
        // If children is ActivityIndicator, render it directly
        // Otherwise, wrap any text content in Text component
        React.isValidElement(children) &&
        children.type === ActivityIndicator ? (
          children
        ) : (
          <Text style={textStyles}>{children}</Text>
        )
      ) : (
        <Text style={textStyles}>{children}</Text>
      )}
    </Pressable>
  );
};
