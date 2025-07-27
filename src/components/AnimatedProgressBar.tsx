import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  Easing,
  runOnJS
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { AppText } from './AppText';
import { useTheme } from '../providers/ThemeProvider';

interface AnimatedProgressBarProps {
  progress: number; // 0-100
  current: number;
  target: number;
  unit: string;
  label: string;
  previousProgress?: number;
}

export const AnimatedProgressBar: React.FC<AnimatedProgressBarProps> = ({
  progress,
  current,
  target,
  unit,
  label,
  previousProgress = 0,
}) => {
  const { theme, colors } = useTheme();
  const progressWidth = useSharedValue(previousProgress);

  const triggerHaptics = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  useEffect(() => {
    const clampedProgress = Math.max(0, Math.min(100, progress));
    
    progressWidth.value = withTiming(
      clampedProgress,
      {
        duration: theme.animations.motivationalMoments.logSuccess.duration,
        easing: Easing.bezier(0.25, 1, 0.5, 1),
      },
      (finished) => {
        if (finished && progress > previousProgress) {
          runOnJS(triggerHaptics)();
        }
      }
    );
  }, [progress, previousProgress, theme.animations.motivationalMoments.logSuccess.duration]);

  const animatedFillStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
    backgroundColor: colors.accent,
    height: theme.components.progressBars.height,
    borderRadius: theme.components.progressBars.cornerRadius,
  }));

  const trackStyle = {
    width: '100%' as const,
    height: theme.components.progressBars.height,
    backgroundColor: colors.disabledBackground,
    borderRadius: theme.components.progressBars.cornerRadius,
    overflow: 'hidden' as const,
  };

  const containerStyle = {
    marginVertical: theme.spacing.xs,
  };

  const headerStyle = {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: theme.spacing.xs,
  };

  return (
    <View style={containerStyle}>
      <View style={headerStyle}>
        <AppText role="Subhead">{label}</AppText>
        <AppText role="Caption" color="secondary">
          {Math.round(current)}/{target}{unit}
        </AppText>
      </View>
      
      <View style={trackStyle}>
        <Animated.View style={animatedFillStyle} />
      </View>
      
      <AppText role="Caption" color="secondary" style={{ textAlign: 'center', marginTop: theme.spacing.xs }}>
        {Math.round(Math.max(0, Math.min(100, progress)))}%
      </AppText>
    </View>
  );
};