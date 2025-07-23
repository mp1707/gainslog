import React from 'react';
import { View } from 'react-native';
import { styles } from './Skeleton.styles';

interface SkeletonProps {
  width?: string | number;
  height?: number;
  style?: any;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  width = '100%', 
  height = 20, 
  style 
}) => {
  return (
    <View 
      style={[
        styles.base, 
        { width, height }, 
        style
      ]} 
    />
  );
};