import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/theme";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const CLOSE_THRESHOLD = 100; // px to drag down before closing
const CLOSE_VELOCITY_THRESHOLD = 500; // velocity threshold for quick dismiss

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  backdropOpacity?: number;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  open,
  onClose,
  children,
}) => {
  const { colors, theme } = useTheme();
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const contentHeight = useSharedValue(0);

  // Trigger haptic and close
  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  // Animate sheet position based on open state
  useEffect(() => {
    if (open) {
      translateY.value = withSpring(0, {
        damping: 25,
        stiffness: 350,
      });
    } else {
      translateY.value = withSpring(SCREEN_HEIGHT, {
        damping: 30,
        stiffness: 400,
      });
    }
  }, [open]);

  // Pan gesture for drag-to-close
  const panGesture = Gesture.Pan()
    .activeOffsetY([10, 999]) // Only activate on downward drag
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      const shouldClose =
        event.translationY > CLOSE_THRESHOLD ||
        event.velocityY > CLOSE_VELOCITY_THRESHOLD;

      if (shouldClose) {
        translateY.value = withSpring(
          SCREEN_HEIGHT,
          {
            damping: 30,
            stiffness: 400,
          },
          () => {
            runOnJS(handleClose)();
          }
        );
      } else {
        // Spring back to open position
        translateY.value = withSpring(0, {
          damping: 25,
          stiffness: 350,
        });
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handleLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    contentHeight.value = height;
  };

  if (!open) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.container,
            {
              backgroundColor: colors.secondaryBackground,
              borderTopLeftRadius: theme.components.cards.cornerRadius,
              borderTopRightRadius: theme.components.cards.cornerRadius,
            },
            sheetStyle,
          ]}
        >
          {/* Grabber Handle */}
          <View style={styles.grabberContainer}>
            <View
              style={[
                styles.grabber,
                { backgroundColor: colors.secondaryText },
              ]}
            />
          </View>

          {/* Content with Keyboard Avoidance */}
          <KeyboardAvoidingView
            style={styles.content}
            behavior="padding"
            keyboardVerticalOffset={0}
          >
            <View onLayout={handleLayout}>{children}</View>
          </KeyboardAvoidingView>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: SCREEN_HEIGHT * 0.9,
  },
  grabberContainer: {
    alignItems: "center",
    paddingVertical: 12,
  },
  grabber: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  content: {
    flex: 1,
  },
});
