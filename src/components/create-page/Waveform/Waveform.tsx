import React, { useEffect, useRef } from "react";
import { View, StyleProp, ViewStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

interface WaveformProps {
  volumeLevel: number;
  isActive: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  barStyle?: StyleProp<ViewStyle>;
}

const BAR_COUNT = 32;
const MIN_BAR_HEIGHT = 3;
const MAX_BAR_HEIGHT = 100;

export const Waveform: React.FC<WaveformProps> = ({
  volumeLevel,
  isActive,
  containerStyle,
  barStyle,
}) => {
  const bars = useRef(
    Array.from({ length: BAR_COUNT }, () => useSharedValue(MIN_BAR_HEIGHT))
  ).current;
  const smoothedVolume = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      smoothedVolume.value = withTiming(volumeLevel, {
        duration: 50,
        easing: Easing.out(Easing.quad),
      });
    } else {
      smoothedVolume.value = withTiming(0, { duration: 400 });
      bars.forEach((bar) => {
        bar.value = withDelay(
          100,
          withTiming(MIN_BAR_HEIGHT, {
            duration: 400,
            easing: Easing.out(Easing.cubic),
          })
        );
      });
    }
  }, [volumeLevel, isActive, smoothedVolume, bars]);

  useAnimatedReaction(
    () => smoothedVolume.value,
    (currentVolume) => {
      if (!isActive) return;

      const center = Math.floor(BAR_COUNT / 2);
      const enhancedVolume = Math.pow(currentVolume / 100, 0.75) * 100;

      bars.forEach((bar, idx) => {
        const distance = Math.abs(idx - center);
        const falloff = Math.pow(1 - distance / center, 2);

        const targetHeight = Math.max(
          MIN_BAR_HEIGHT,
          Math.min(
            MAX_BAR_HEIGHT,
            (enhancedVolume / 100) * MAX_BAR_HEIGHT * falloff * 1.5
          )
        );

        if (targetHeight > bar.value) {
          bar.value = withTiming(targetHeight, {
            duration: 120,
            easing: Easing.out(Easing.quad),
          });
        } else {
          bar.value = withTiming(targetHeight, {
            duration: 500,
            easing: Easing.out(Easing.cubic),
          });
        }
      });
    },
    [isActive]
  );

  return (
    <View style={containerStyle}>
      {bars.map((bar, index) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const animatedStyle = useAnimatedStyle(() => ({ height: bar.value }));
        return <Animated.View key={index} style={[barStyle, animatedStyle]} />;
      })}
    </View>
  );
};
