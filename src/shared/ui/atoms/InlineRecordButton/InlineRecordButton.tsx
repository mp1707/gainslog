import React from 'react';
import { TouchableOpacity, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { MicrophoneIcon } from 'phosphor-react-native';
import * as Haptics from 'expo-haptics';
import { createStyles } from './InlineRecordButton.styles';
import { useTheme } from '../../../../providers/ThemeProvider';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface InlineRecordButtonProps {
  onPress: () => void;
  isRecording?: boolean;
  style?: ViewStyle;
}

export const InlineRecordButton: React.FC<InlineRecordButtonProps> = ({
  onPress,
  isRecording = false,
  style,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  
  // Animation values
  const scale = useSharedValue(1);
  const pulseAnimation = useSharedValue(1);

  // Pulse animation when recording
  React.useEffect(() => {
    if (isRecording) {
      pulseAnimation.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 600 }),
          withTiming(1, { duration: 600 })
        ),
        -1,
        false
      );
    } else {
      pulseAnimation.value = withTiming(1, { duration: 300 });
    }
  }, [isRecording]);

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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Press animation
    scale.value = withSequence(
      withSpring(0.85, { damping: 15, stiffness: 400 }),
      withSpring(1, { damping: 15, stiffness: 400 })
    );
    
    onPress();
  };

  return (
    <AnimatedTouchableOpacity
      style={[
        styles.container,
        isRecording && styles.recording,
        animatedStyle,
        style
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={isRecording ? "Recording audio" : "Start recording"}
      accessibilityHint={isRecording ? "Audio is being recorded" : "Tap to start recording audio for this field"}
    >
      <MicrophoneIcon 
        size={16} 
        color={isRecording ? 'white' : colors.accent} 
        weight={isRecording ? 'fill' : 'regular'} 
      />
    </AnimatedTouchableOpacity>
  );
};