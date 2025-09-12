import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { Easing, interpolateColor, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { AppText } from '@/components';
import { useTheme } from '@/theme';
import { createStyles } from './ConfidenceCard.styles';
import { LinearGradient } from 'expo-linear-gradient';

interface ConfidenceCardProps {
  value: number; // 0-100
  // When true, show shimmering scan to indicate processing
  processing?: boolean;
  // When true, apply a subtle bounce/pulse on settle
  reveal?: boolean;
}

const getConfidenceLabel = (value: number) => {
  if (value >= 90) return 'High Accuracy';
  if (value >= 50) return 'Medium Accuracy';
  if (value > 0) return 'Low Accuracy';
  return 'Uncertain';
};

export const ConfidenceCard: React.FC<ConfidenceCardProps> = ({ value, processing = false, reveal = false }) => {
  const { colors, theme } = useTheme();
  const styles = createStyles(colors, theme);

  const confidenceWidth = useSharedValue(Math.max(0, Math.min(100, value || 0)));
  const pulse = useSharedValue(0);
  const revealFlash = useSharedValue(0);
  const shimmerX = useSharedValue(-100);

  useEffect(() => {
    confidenceWidth.value = withTiming(Math.max(0, Math.min(100, value || 0)), { duration: 350 });
  }, [value, confidenceWidth]);

  // Start/stop shimmer during processing
  useEffect(() => {
    if (processing) {
      shimmerX.value = withRepeat(withTiming(300, { duration: 1200, easing: Easing.linear }), -1, false);
    } else {
      shimmerX.value = -100;
    }
  }, [processing, shimmerX]);

  // Pulse on reveal
  useEffect(() => {
    if (reveal) {
      pulse.value = 1;
      pulse.value = withTiming(0, { duration: 600 });
      revealFlash.value = 1;
      revealFlash.value = withTiming(0, { duration: 400 });
    }
  }, [reveal, pulse, revealFlash]);

  const confidenceBarStyle = useAnimatedStyle(() => {
    const clamped = Math.max(0, Math.min(100, confidenceWidth.value));
    const bg = interpolateColor(
      clamped,
      [0, 50, 90, 100],
      [colors.error, colors.error, colors.warning, colors.success]
    );
    // visible pulse on reveal by scaling height briefly
    const scaleY = 1 + pulse.value * 0.25;
    return {
      width: `${clamped}%`,
      backgroundColor: bg as string,
      transform: [{ scaleY }],
    };
  });

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerX.value }],
    opacity: processing ? 0.7 : 0,
  }));

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
        {/* Quick flash on reveal */}
        <Animated.View style={[styles.revealFlash, { opacity: revealFlash }]} />
        {/* Shimmer scan overlay while processing */}
        {processing && (
          <Animated.View style={[styles.shimmerOverlay, shimmerStyle]}> 
            <LinearGradient
              colors={[`${colors.white}00`, `${colors.white}55`, `${colors.white}00`]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.shimmerGradient}
            />
          </Animated.View>
        )}
      </View>
    </View>
  );
};
