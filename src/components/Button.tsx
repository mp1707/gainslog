import React, { useState } from 'react';
import { Pressable, ViewStyle, PressableProps, StyleSheet } from 'react-native';
import { AppText } from './AppText';
import { useTheme } from '../providers/ThemeProvider';

export type ButtonVariant = 'primary' | 'secondary';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  children: string;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  disabled = false,
  children,
  style,
  onPressIn,
  onPressOut,
  ...props
}) => {
  const { colors, theme } = useTheme();
  const [isPressed, setIsPressed] = useState(false);

  const buttonConfig = theme.components.buttons[variant];
  const cornerRadius = theme.components.buttons.cornerRadius;

  // Get state-specific styles
  const getStateStyles = () => {
    if (disabled) {
      return buttonConfig.disabled;
    }
    if (isPressed) {
      return buttonConfig.active;
    }
    return buttonConfig.default;
  };

  const stateStyles = getStateStyles();

  // Size-specific styles
  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case 'small':
        return {
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
          minHeight: 36,
        };
      case 'large':
        return {
          paddingHorizontal: theme.spacing.xl,
          paddingVertical: theme.spacing.md,
          minHeight: 52,
        };
      default: // medium
        return {
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.md - 2,
          minHeight: 44,
        };
    }
  };

  const buttonStyle: ViewStyle = {
    backgroundColor: stateStyles.backgroundColor,
    borderRadius: cornerRadius,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: disabled ? 0.6 : 1,
    ...getSizeStyles(),
    ...('borderWidth' in stateStyles && {
      borderWidth: (stateStyles as any).borderWidth,
      borderColor: (stateStyles as any).borderColor,
    }),
  };

  const handlePressIn = (event: any) => {
    if (!disabled) {
      setIsPressed(true);
    }
    onPressIn?.(event);
  };

  const handlePressOut = (event: any) => {
    setIsPressed(false);
    onPressOut?.(event);
  };

  return (
    <Pressable
      style={[buttonStyle, style]}
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      {...props}
    >
      <AppText 
        role="Button" 
        color={stateStyles.textColor === colors.white ? 'white' : 'accent'}
      >
        {children}
      </AppText>
    </Pressable>
  );
};