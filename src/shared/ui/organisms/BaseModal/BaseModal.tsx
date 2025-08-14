import React, { useEffect, ReactNode } from "react";
import {
  Modal,
  View,
  Pressable,
  StyleSheet,
} from "react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/providers/ThemeProvider";
import {
  PanGestureHandler,
  GestureHandlerRootView,
  PanGestureHandlerGestureEvent,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { createStyles } from "./BaseModal.styles";

export interface BaseModalProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  onRequestClose?: () => void;
  testID?: string;
}

export const BaseModal: React.FC<BaseModalProps> = ({
  visible,
  onClose,
  children,
  onRequestClose,
  testID,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  // Animation configuration - improved for snappier feel
  const START_OFFSET = 280;
  const translateY = useSharedValue(START_OFFSET);
  const backdropOpacity = useSharedValue(0);
  const gestureDirection = useSharedValue<"unknown" | "vertical" | "horizontal">("unknown");

  // Smooth spring configuration consistent with original FilterMenuModal
  const springConfig = { damping: 24, stiffness: 180, mass: 1 };
  const closeThreshold = 120;
  const fastVelocity = 800;

  const animateIn = () => {
    translateY.value = START_OFFSET;
    backdropOpacity.value = withTiming(1, { duration: 160 });
    translateY.value = withSpring(0, springConfig);
  };

  const animateOutThenClose = () => {
    backdropOpacity.value = withTiming(0, { duration: 120 });
    translateY.value = withTiming(START_OFFSET, { duration: 180 }, () =>
      runOnJS(onClose)()
    );
  };

  useEffect(() => {
    if (visible) {
      animateIn();
    }
  }, [visible]);

  const handleBackdropPress = () => {
    Haptics.selectionAsync();
    animateOutThenClose();
  };

  const handleRequestClose = () => {
    if (onRequestClose) {
      onRequestClose();
    } else {
      animateOutThenClose();
    }
  };

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
    onStart: () => {
      gestureDirection.value = "unknown";
    },
    onActive: (event) => {
      const { translationX, translationY } = event;
      if (gestureDirection.value === "unknown") {
        if (Math.abs(translationY) > 12 || Math.abs(translationX) > 12) {
          if (Math.abs(translationY) > Math.abs(translationX)) {
            gestureDirection.value = "vertical";
            runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
          } else {
            gestureDirection.value = "horizontal";
          }
        }
      }
      if (gestureDirection.value === "vertical") {
        // Only allow dragging downwards
        if (translationY >= 0) {
          translateY.value = translationY;
        }
      }
    },
    onEnd: (event) => {
      const { translationY, velocityY } = event;
      if (translationY > closeThreshold || velocityY > fastVelocity) {
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
        backdropOpacity.value = withTiming(0, { duration: 120 });
        translateY.value = withTiming(START_OFFSET, { duration: 180 }, () =>
          runOnJS(onClose)()
        );
      } else {
        translateY.value = withSpring(0, springConfig);
      }
      gestureDirection.value = "unknown";
    },
    onFail: () => {
      gestureDirection.value = "unknown";
      translateY.value = withSpring(0, springConfig);
    },
  });

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleRequestClose}
      testID={testID}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.overlay}>
          <Animated.View
            style={[
              StyleSheet.absoluteFillObject,
              styles.backdrop,
              animatedBackdropStyle,
            ]}
          >
            <Pressable
              style={styles.backdropTouchable}
              onPress={handleBackdropPress}
              accessibilityRole="button"
              accessibilityLabel="Close modal"
            />
          </Animated.View>

          {/* Bottom underlay to prevent visual gap during bounce overshoot */}
          <View pointerEvents="none" style={styles.bottomUnderlay} />

          <PanGestureHandler onGestureEvent={gestureHandler}>
            <Animated.View style={[styles.sheet, sheetStyle]}>
              {children}
            </Animated.View>
          </PanGestureHandler>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
};