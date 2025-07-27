import React, { useEffect } from 'react';
import { View, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../providers/ThemeProvider';

interface ShimmerEffectProps {
  children: React.ReactNode;
  isActive: boolean;
  style?: ViewStyle;
}

export const ShimmerEffect: React.FC<ShimmerEffectProps> = ({
  children,
  isActive,
  style,
}) => {
  const { theme, colors } = useTheme();
  const shimmerOpacity = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      shimmerOpacity.value = withRepeat(
        withSequence(
          withTiming(0.4, {
            duration: theme.animations.motivationalMoments.goalCompletion.shimmer.duration / 2,
            easing: Easing.inOut(Easing.quad),
          }),
          withTiming(0, {
            duration: theme.animations.motivationalMoments.goalCompletion.shimmer.duration / 2,
            easing: Easing.inOut(Easing.quad),
          })
        ),
        3, // Repeat 3 times
        false
      );
    } else {
      shimmerOpacity.value = 0;
    }
  }, [isActive, theme.animations.motivationalMoments.goalCompletion.shimmer.duration]);

  const shimmerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: shimmerOpacity.value,
    };
  });

  return (
    <View style={[{ position: 'relative' }, style]}>
      {children}
      {isActive && (
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: colors.accent,
              borderRadius: 8,
            },
            shimmerAnimatedStyle,
          ]}
          pointerEvents="none"
        />
      )}
    </View>
  );
};