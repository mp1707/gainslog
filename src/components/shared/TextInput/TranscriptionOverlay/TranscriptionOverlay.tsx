import React from "react";
import { Pressable, Text, View, Modal } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSpring,
  Easing,
  FadeIn,
  FadeOut,
} from "react-native-reanimated";
import { StopIcon } from "phosphor-react-native";
import { useTheme } from "@/theme";
import { createStyles } from "./TranscriptionOverlay.styles";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface TranscriptionOverlayProps {
  visible: boolean;
  liveTranscription: string;
  onStop: () => void;
}

export const TranscriptionOverlay: React.FC<TranscriptionOverlayProps> = ({
  visible,
  liveTranscription,
  onStop,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  // Animation values
  const scaleAnimation = useSharedValue(1);
  const pulseAnimation = useSharedValue(1);
  const containerHeight = useSharedValue(80); // Initial minimum height
  const containerScale = useSharedValue(1);

  // Button press animations
  const animatedScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnimation.value }],
  }));

  // Pulse animation for the stop button
  const animatedPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnimation.value }],
  }));

  // Animated styles for transcription container
  const animatedContainerStyle = useAnimatedStyle(() => ({
    height: containerHeight.value,
    transform: [{ scale: containerScale.value }],
  }));

  // Start pulse animation when visible
  React.useEffect(() => {
    if (visible) {
      pulseAnimation.value = withRepeat(
        withTiming(1.05, {
          duration: 1000,
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
  }, [visible, pulseAnimation]);

  // Animate container size based on transcription text
  React.useEffect(() => {
    if (!visible) return;

    // Calculate dynamic height based on text content
    const baseHeight = 80;
    const textLength = liveTranscription.length;
    const estimatedLines = Math.ceil(textLength / 40); // Rough estimate of characters per line
    const dynamicHeight = Math.max(baseHeight, baseHeight + (estimatedLines - 1) * 24);

    // Animate height with spring physics
    containerHeight.value = withSpring(dynamicHeight, {
      damping: 15,
      stiffness: 200,
      overshootClamping: false,
    });

    // Add subtle scale animation when text changes
    if (liveTranscription) {
      containerScale.value = withSpring(1.02, {
        damping: 10,
        stiffness: 300,
      });
      
      // Return to normal scale
      setTimeout(() => {
        containerScale.value = withSpring(1, {
          damping: 12,
          stiffness: 250,
        });
      }, 150);
    }
  }, [liveTranscription, visible, containerHeight, containerScale]);

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
    onStop();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <Animated.View 
        style={styles.overlay}
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
      >
        <View style={styles.contentContainer}>
          {/* Transcription Display */}
          <Animated.View 
            style={[styles.transcriptionContainer, animatedContainerStyle]}
            entering={FadeIn.delay(100).duration(300)}
          >
            <Text style={[
              styles.transcriptionText,
              !liveTranscription && styles.placeholderText
            ]}>
              {liveTranscription || "Listening... Speak clearly into your device"}
            </Text>
          </Animated.View>

          {/* Stop Button */}
          <AnimatedPressable
            style={[
              styles.stopButton,
              animatedScaleStyle,
              animatedPulseStyle,
            ]}
            onPress={onStop}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            accessibilityRole="button"
            accessibilityLabel="Stop recording"
            accessibilityHint="Tap to stop voice transcription and apply the text"
            entering={FadeIn.delay(200).duration(300)}
          >
            <StopIcon 
              size={32} 
              color={colors.white}
              weight="fill"
            />
          </AnimatedPressable>
        </View>
      </Animated.View>
    </Modal>
  );
};