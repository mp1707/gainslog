import React from 'react';
import { View, Text } from 'react-native';
import { styles } from './ProgressRing.styles';
import { useTheme } from '../../../../providers/ThemeProvider';

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
  color
}: ProgressRingProps) {
  const { colors } = useTheme();
  const clampedProgress = Math.max(0, Math.min(100, progress));
  
  // Get color based on progress (simplified to use accent color)
  const getProgressColor = (progress: number) => {
    // Using consistent accent color as per new design system
    return colors.accent;
  };

  const progressColor = color || getProgressColor(clampedProgress);

  return (
    <View style={styles.container}>
      <View 
        style={[
          styles.backgroundCircle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: colors.secondaryBackground,
            borderWidth: 3,
            borderColor: colors.border,
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