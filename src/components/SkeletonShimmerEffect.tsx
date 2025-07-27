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

interface SkeletonShimmerEffectProps {
  children: React.ReactNode;
  isActive: boolean;
  style?: ViewStyle;
}

export const SkeletonShimmerEffect: React.FC<SkeletonShimmerEffectProps> = ({
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
        -1, // Repeat infinitely during loading
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
              backgroundColor: colors.border, // Neutral color instead of accent
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