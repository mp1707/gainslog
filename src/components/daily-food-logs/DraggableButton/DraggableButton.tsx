import React from "react";
import { View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  runOnJS,
  SharedValue,
} from "react-native-reanimated";
import { Plus } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/theme";
import { createStyles } from "./DraggableButton.styles";
import { BlurView } from "expo-blur";

interface DraggableButtonProps {
  onPress: () => void;
  onDragEnd: (targetZone: "camera" | "microphone" | null) => void;
  // Accept the shared values as props
  gestureX: SharedValue<number>;
  gestureY: SharedValue<number>;
  isGestureActive: SharedValue<boolean>;
}

export const DraggableButton: React.FC<DraggableButtonProps> = ({
  onPress,
  onDragEnd,
  gestureX,
  gestureY,
  isGestureActive,
}) => {
  const { colors, theme } = useTheme();
  const styles = createStyles(colors, theme);

  const pressProgress = useSharedValue(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);


  const panGesture = Gesture.Pan()
    .onStart(() => {
      isGestureActive.value = true;
      scale.value = withSpring(1.1);
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
    })
    .onUpdate((event) => {
      // Update the shared values with the absolute coordinates of the gesture
      gestureX.value = event.absoluteX;
      gestureY.value = event.absoluteY;

      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd(() => {
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      scale.value = withSpring(1);
      isGestureActive.value = false;
      runOnJS(onDragEnd)(null);
    });

  const tapGesture = Gesture.Tap().onEnd(() => {
    // Only fire tap if not dragging
    if (!isGestureActive.value) {
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
      runOnJS(onPress)();
    }
  });

  // Use .Exclusive to prevent tap and pan from firing at the same time
  const composedGesture = Gesture.Exclusive(panGesture, tapGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      {
        scale: withSpring(
          interpolate(
            pressProgress.value,
            [0, 1],
            [scale.value, scale.value * 0.9]
          ),
          { damping: 15, stiffness: 400 }
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
