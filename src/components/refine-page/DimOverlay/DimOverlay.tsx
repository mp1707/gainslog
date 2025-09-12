import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/theme';
import { createStyles } from './DimOverlay.styles';

interface DimOverlayProps {
  onPress: () => void;
  style?: ViewStyle | ViewStyle[];
}

export const DimOverlay: React.FC<DimOverlayProps> = ({ onPress, style }) => {
  const { colorScheme } = useTheme();
  const styles = createStyles();
  return (
    <Pressable onPress={onPress} style={[styles.dimOverlay, style]} accessibilityLabel="Dismiss editor overlay" accessibilityRole="button">
      <BlurView intensity={28} tint={colorScheme === 'dark' ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
      <View style={styles.dimColor} />
    </Pressable>
  );
};

