import React from 'react';
import { ActivityIndicator } from 'react-native';
import { colors } from '@/theme';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'small', 
  color = colors.text.secondary 
}) => {
  return <ActivityIndicator size={size} color={color} />;
};