import React from "react";
import { View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  runOnJS,
  withTiming,
} from "react-native-reanimated";
import { Plus } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/theme";
import { createStyles } from "./DraggableButton.styles";
import { BlurView } from "expo-blur";

interface DraggableButtonProps {
  onPress: () => void;
  onLongPressStart: () => void;
  onDragEnd: (
    targetZone: "camera" | "microphone" | null,
    x: number,
    y: number
  ) => void;
  isQuickActionsActive: boolean;
}

const DRAG_START_THRESHOLD = 10; // Pixels to start quick actions mode

export const DraggableButton: React.FC<DraggableButtonProps> = ({
  onPress,
  onLongPressStart,
  onDragEnd,
  isQuickActionsActive,
}) => {
  const { colors, theme } = useTheme();
  const styles = createStyles(colors, theme);

  const pressProgress = useSharedValue(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const isDragging = useSharedValue(false);

  const resetPosition = () => {
    "worklet";
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
    scale.value = withSpring(1);
  };

  const panGesture = Gesture.Pan()
    .onStart(() => {
      isDragging.value = true;
      scale.value = withSpring(1.1);
    })
    .onUpdate((event) => {
      if (isDragging.value) {
        // Start quick actions mode after minimal movement
        const dragDistance = Math.sqrt(
          event.translationX ** 2 + event.translationY ** 2
        );
        if (dragDistance > DRAG_START_THRESHOLD && !isQuickActionsActive) {
          runOnJS(onLongPressStart)();
          runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
        }

        // Allow free 2D movement
        translateX.value = event.translationX;
        translateY.value = event.translationY;

        // Scale feedback while dragging
        if (dragDistance > DRAG_START_THRESHOLD) {
          scale.value = withSpring(1.1);
        } else {
          scale.value = withSpring(1);
        }
      }
    })
    .onEnd(() => {
      if (isDragging.value) {
        // Pass current position to parent for hit detection
        const currentX = translateX.value;
        const currentY = translateY.value;

        // Animate back to center
        resetPosition();

        // Reset states
        isDragging.value = false;

        // Parent will handle hit detection and haptics
        runOnJS(onDragEnd)(null, currentX, currentY);
      }
    });

  const tapGesture = Gesture.Tap().onEnd(() => {
    if (!isDragging.value && !isQuickActionsActive) {
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
      runOnJS(onPress)();
    }
  });

  const composedGesture = Gesture.Simultaneous(panGesture, tapGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: translateX.value,
      },
      {
        translateY: translateY.value,
      },
      {
        scale: withSpring(
          interpolate(
            pressProgress.value,
            [0, 1],
            [scale.value, scale.value * 0.9]
          ),
          {
            damping: 15,
            stiffness: 400,
          }
        ),
      },
    ],
  }));

  return (
    <GestureDetector gesture={composedGesture}>
      <View style={styles.container}>
        <Animated.View style={animatedStyle}>
          <BlurView intensity={10} style={styles.background}>
            <View style={styles.button}>
              <Plus color={colors.primaryBackground} strokeWidth={2.5} />
            </View>
          </BlurView>
        </Animated.View>
      </View>
    </GestureDetector>
  );
};