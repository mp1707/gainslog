import React from "react";
import { Pressable, ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
} from "react-native-reanimated";
import { MicrophoneIcon } from "phosphor-react-native";
import { useTheme } from "@/theme";
import { createStyles } from "./AudioTranscriptionButton.styles";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface AudioTranscriptionButtonProps {
  isRecording: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

export const AudioTranscriptionButton: React.FC<
  AudioTranscriptionButtonProps
> = ({ isRecording, onPress, style }) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  // Animation values
  const scaleAnimation = useSharedValue(1);
  const pulseAnimation = useSharedValue(1);

  // Scale animation for press feedback
  const animatedScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnimation.value }],
  }));

  // Pulse animation for recording state
  const animatedPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnimation.value }],
  }));

  // Handle press in/out for feedback
  const handlePressIn = () => {
    scaleAnimation.value = withTiming(0.95, {
      duration: 100,
      easing: Easing.out(Easing.quad),
    });
  };

  const handlePressOut = () => {
    scaleAnimation.value = withTiming(1, {
      duration: 150,
      easing: Easing.out(Easing.quad),
    });
  };

  // Start/stop pulse animation based on recording state
  React.useEffect(() => {
    if (isRecording) {
      pulseAnimation.value = withRepeat(
        withTiming(1.1, {
          duration: 800,
          easing: Easing.inOut(Easing.quad),
        }),
        -1,
        true
      );
    } else {
      pulseAnimation.value = withTiming(1, {
        duration: 200,
        easing: Easing.out(Easing.quad),
      });
    }
  }, [isRecording, pulseAnimation]);

  const recordingStyle = isRecording ? styles.recording : {};

  return (
    <AnimatedPressable
      style={[
        styles.button,
        recordingStyle,
        animatedScaleStyle,
        animatedPulseStyle,
        { right: 8 }, // Fixed right positioning
        style,
      ]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityLabel={
        isRecording ? "Stop voice recording" : "Start voice recording"
      }
      accessibilityHint="Tap to start or stop voice transcription"
    >
      <MicrophoneIcon size={20} color={colors.white} weight="bold" />
    </AnimatedPressable>
  );
};
