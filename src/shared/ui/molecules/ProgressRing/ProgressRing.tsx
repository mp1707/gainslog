import React from 'react';
import { View, Text } from 'react-native';
import { styles } from './ProgressRing.styles';
import { colors } from '../../../../theme';

interface ProgressRingProps {
  progress: number; // 0-100
  current: number;
  target: number;
  unit: string;
  label: string;
  size?: number;
  color?: string;
}

export function ProgressRing({
  progress,
  current,
  target,
  unit,
  label,
  size = 100,
  color = colors.brand.primary
}: ProgressRingProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress));
  
  // Get color based on progress
  const getProgressColor = (progress: number) => {
    if (progress >= 100) return colors.status.success;
    if (progress >= 75) return colors.brand.primary;
    if (progress >= 50) return colors.status.warning || '#FF9500';
    return colors.status.danger;
  };

  const progressColor = getProgressColor(clampedProgress);

  return (
    <View style={styles.container}>
      <View 
        style={[
          styles.backgroundCircle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: colors.background.secondary,
            borderWidth: 3,
            borderColor: colors.border.light,
            alignItems: 'center',
            justifyContent: 'center',
          }
        ]}
      >
        <View style={styles.content}>
          <Text style={styles.progressText}>{Math.round(clampedProgress)}%</Text>
          <Text style={styles.labelText}>{label}</Text>
          <Text style={styles.valuesText}>
            {Math.round(current)}/{target}{unit}
          </Text>
        </View>
      </View>
    </View>
  );
}