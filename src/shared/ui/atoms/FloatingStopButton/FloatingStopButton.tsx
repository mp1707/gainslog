import React from 'react';
import { TouchableOpacity, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { StopIcon } from 'phosphor-react-native';
import * as Haptics from 'expo-haptics';
import { createStyles } from './FloatingStopButton.styles';
import { useTheme } from '../../../../providers/ThemeProvider';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface FloatingStopButtonProps {
  onPress: () => void;
  style?: ViewStyle;
}

export const FloatingStopButton: React.FC<FloatingStopButtonProps> = ({
  onPress,
  style,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  
  // Animation values
  const scale = useSharedValue(1);
  const pulseAnimation = useSharedValue(1);

  // Start pulse animation on mount
  React.useEffect(() => {
    pulseAnimation.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1,
      false
    );
  }, []);

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value * pulseAnimation.value }
      ],
    };
  });

  const handlePress = () => {
    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Press animation
    scale.value = withSequence(
      withSpring(0.9, { damping: 15, stiffness: 400 }),
      withSpring(1, { damping: 15, stiffness: 400 })
    );
    
    onPress();
  };

  return (
    <AnimatedTouchableOpacity
      style={[styles.container, animatedStyle, style]}
      onPress={handlePress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel="Stop recording"
      accessibilityHint="Stops the current audio recording"
    >
      <StopIcon size={20} color="white" weight="fill" />
    </AnimatedTouchableOpacity>
  );
};