import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { AppText } from '@/components';
import { useTheme } from '@/theme';
import { createStyles } from './ConfidenceCard.styles';

interface ConfidenceCardProps {
  value: number; // 0-100
}

const getConfidenceLabel = (value: number) => {
  if (value >= 90) return 'High Accuracy';
  if (value >= 50) return 'Medium Accuracy';
  if (value > 0) return 'Low Accuracy';
  return 'Uncertain';
};

export const ConfidenceCard: React.FC<ConfidenceCardProps> = ({ value }) => {
  const { colors, theme } = useTheme();
  const styles = createStyles(colors, theme);

  const confidenceWidth = useSharedValue(Math.max(0, Math.min(100, value || 0)));

  useEffect(() => {
    confidenceWidth.value = withTiming(Math.max(0, Math.min(100, value || 0)), { duration: 350 });
  }, [value, confidenceWidth]);

  const confidenceBarStyle = useAnimatedStyle(() => {
    const clamped = Math.max(0, Math.min(100, confidenceWidth.value));
    const bg = interpolateColor(
      clamped,
      [0, 50, 90, 100],
      [colors.error, colors.error, colors.warning, colors.success]
    );
    return {
      width: `${clamped}%`,
      backgroundColor: bg as string,
    };
  });

  return (
    <View style={styles.card}>
      <View style={styles.confidenceHeader}>
        <AppText role="Headline">Estimation Accuracy</AppText>
        <AppText role="Subhead" color="secondary">
          {value ?? 0}% • {getConfidenceLabel(value ?? 0)}
        </AppText>
      </View>
      <View style={styles.meterTrack}>
        <Animated.View style={[styles.meterFill, confidenceBarStyle]} />
      </View>
    </View>
  );
};

