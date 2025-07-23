import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { ButtonProps } from '@/types';
import { styles } from './Button.styles';

export const Button: React.FC<ButtonProps> = ({
  onPress,
  disabled = false,
  variant = 'primary',
  size = 'medium',
  children,
}) => {
  const isLoading = children && React.isValidElement(children) && children.type === ActivityIndicator;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[variant],
        styles[size],
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      {isLoading ? (
        children
      ) : (
        <Text style={[styles.text, styles[`${variant}Text`], styles[`${size}Text`]]}>
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
};