import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { ButtonProps } from '@/types';
import { styles } from './Button.styles';

export const Button: React.FC<ButtonProps> = ({
  onPress,
  disabled = false,
  shape = 'round',
  color = 'primary',
  size = 'medium',
  children,
}) => {
  const isLoading = children && React.isValidElement(children) && children.type === ActivityIndicator;

  // Combine shape and size for style key
  const shapeSize = `${shape}${size.charAt(0).toUpperCase() + size.slice(1)}`;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[shape as keyof typeof styles],
        styles[color as keyof typeof styles],
        styles[shapeSize as keyof typeof styles],
        disabled ? styles.disabled : undefined,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      {isLoading ? (
        children
      ) : (
        <Text style={[
          styles.text, 
          styles[`${shapeSize}Text` as keyof typeof styles]
        ]}>
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
};