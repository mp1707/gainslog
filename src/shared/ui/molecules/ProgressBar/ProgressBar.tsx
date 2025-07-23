import React from 'react';
import { View, Text } from 'react-native';
import { styles } from './ProgressBar.styles';
import { colors } from '../../../../theme';

interface ProgressBarProps {
  progress: number; // 0-100
  current: number;
  target: number;
  unit: string;
  label: string;
  color?: string;
  backgroundColor?: string;
}

export function ProgressBar({
  progress,
  current,
  target,
  unit,
  label,
  color = colors.brand.primary,
  backgroundColor = colors.border.light
}: ProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.values}>
          {Math.round(current)}/{target}{unit}
        </Text>
      </View>
      
      <View style={[styles.track, { backgroundColor }]}>
        <View 
          style={[
            styles.fill,
            {
              width: `${clampedProgress}%`,
              backgroundColor: color,
            }
          ]}
        />
      </View>
      
      <Text style={styles.percentage}>{Math.round(clampedProgress)}%</Text>
    </View>
  );
}