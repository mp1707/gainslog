import React, { useState } from "react";
import {
  Pressable,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from "react-native";
import { createStyles } from "./Button.styles";
import { useTheme } from "../../../theme";

interface ButtonProps {
  onPress: () => void;
  disabled?: boolean;
  shape?: "round" | "square";
  variant?: "primary" | "secondary" | "tertiary" | "destructive";
  size?: "small" | "medium" | "large";
  children?: React.ReactNode;
  icon?: React.ReactElement<{ style?: any }>;
  iconPosition?: "left" | "right";
  style?: any;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export const Button: React.FC<ButtonProps> = ({
  onPress,
  disabled = false,
  shape = "round",
  variant = "primary",
  size = "medium",
  children,
  icon,
  iconPosition = "left",
  style,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const { colors, colorScheme } = useTheme();
  const styles = createStyles(colors, colorScheme);
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
  const textStyleKey = `${shapeSize}Text` as keyof typeof styles;
  if (styles[textStyleKey]) {
    textStyles.push(styles[textStyleKey]);
  }

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
        style: [icon!.props.style, styles.iconOnly],
      });
    }

    if (isTextOnly) {
      return <Text style={textStyles}>{children}</Text>;
    }

    if (hasIconAndText) {
      const iconWithStyle = React.cloneElement(icon!, {
        style: [
          icon!.props.style,
          styles[iconPosition === "left" ? "iconLeft" : "iconRight"],
        ],
      });

      const textElement = <Text style={textStyles}>{children}</Text>;

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
    <Pressable
      style={[
        ...baseStyles,
        (hasIconAndText || isIconOnly) && styles.iconContainer,
      ]}
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
      {renderContent()}
    </Pressable>
  );
};
