import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  interpolate
} from 'react-native-reanimated';
import { styles } from './ImageSkeleton.styles';

interface ImageSkeletonProps {
  width?: number | string;
  height?: number;
  style?: any;
}

export const ImageSkeleton: React.FC<ImageSkeletonProps> = ({ 
  width = '100%', 
  height = 200,
  style 
}) => {
  const shimmerValue = useSharedValue(0);

  useEffect(() => {
    shimmerValue.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmerValue.value,
      [0, 1],
      [-200, 200]
    );

    return {
      transform: [{ translateX }],
    };
  });

  return (
    <View style={[styles.container, { width, height }, style]}>
      <View style={styles.skeleton}>
        <Animated.View style={[styles.shimmer, animatedStyle]} />
      </View>
    </View>
  );
};