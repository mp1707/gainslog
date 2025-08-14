import React, { useEffect, ReactNode } from "react";
import {
  Modal,
  View,
  Pressable,
  StyleSheet,
  Dimensions,
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
  Easing,
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

  // Dynamic animation configuration based on screen dimensions
  const screenHeight = Dimensions.get('window').height;
  const INITIAL_OFFSET = Math.min(400, screenHeight * 0.4); // Responsive to screen size
  const DISMISS_OFFSET = screenHeight + 100; // Fully off-screen with buffer
  
  const translateY = useSharedValue(INITIAL_OFFSET);
  const backdropOpacity = useSharedValue(0);
  const gestureDirection = useSharedValue<"unknown" | "vertical" | "horizontal">("unknown");

  // Optimized animation configurations for different scenarios
  const smoothSpringConfig = { damping: 28, stiffness: 200, mass: 0.9 };
  const fastSpringConfig = { damping: 32, stiffness: 280, mass: 0.8 };
  
  // Smooth dismissal with timing for predictable motion
  const dismissTimingConfig = {
    duration: 300,
    easing: Easing.out(Easing.cubic),
  };
  
  const closeThreshold = 100;
  const fastVelocity = 600;

  const animateIn = () => {
    // Start from initial offset and animate in with spring
    translateY.value = INITIAL_OFFSET;
    backdropOpacity.value = withSpring(1, smoothSpringConfig);
    translateY.value = withSpring(0, smoothSpringConfig);
  };

  const animateOutThenClose = () => {
    // Smooth dismissal using timing animation for predictable motion
    backdropOpacity.value = withTiming(0, dismissTimingConfig);
    translateY.value = withTiming(DISMISS_OFFSET, dismissTimingConfig, () => {
      runOnJS(onClose)();
    });
  };

  useEffect(() => {
    if (visible) {
      // Reset values for clean start before animating in
      translateY.value = INITIAL_OFFSET;
      backdropOpacity.value = 0;
      animateIn();
    } else {
      // Reset values when modal becomes invisible for clean next render
      translateY.value = INITIAL_OFFSET;
      backdropOpacity.value = 0;
    }
    // No reset on visible = false to prevent flash during dismissal animation
  }, [visible]);

  const handleBackdropPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
        // More sensitive gesture detection for better responsiveness
        if (Math.abs(translationY) > 8 || Math.abs(translationX) > 8) {
          if (Math.abs(translationY) > Math.abs(translationX)) {
            gestureDirection.value = "vertical";
            runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
          } else {
            gestureDirection.value = "horizontal";
          }
        }
      }
      if (gestureDirection.value === "vertical") {
        // Only allow dragging downwards with smooth following
        if (translationY >= 0) {
          translateY.value = translationY;
          // Provide visual feedback by adjusting backdrop opacity during swipe
          const progress = Math.min(1, translationY / (screenHeight * 0.3));
          const newOpacity = 1 - (progress * 0.4); // Fade backdrop as user swipes
          backdropOpacity.value = Math.max(0.2, newOpacity);
        }
      }
    },
    onEnd: (event) => {
      const { translationY, velocityY } = event;
      if (translationY > closeThreshold || velocityY > fastVelocity) {
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
        
        // Calculate optimal dismissal target based on current position and velocity
        const currentPosition = translationY;
        const momentum = velocityY * 0.1; // Factor in velocity for natural feel
        const dismissTarget = Math.max(DISMISS_OFFSET, currentPosition + momentum);
        
        // Smooth continuation of swipe gesture with timing animation
        const adjustedDuration = Math.max(200, Math.min(400, (dismissTarget - currentPosition) / 2));
        
        backdropOpacity.value = withTiming(0, { 
          duration: adjustedDuration,
          easing: Easing.out(Easing.quad) 
        });
        translateY.value = withTiming(dismissTarget, {
          duration: adjustedDuration,
          easing: Easing.out(Easing.quad)
        }, () => {
          runOnJS(onClose)();
        });
      } else {
        // Smooth spring back to position with backdrop restoration
        translateY.value = withSpring(0, smoothSpringConfig);
        backdropOpacity.value = withSpring(1, smoothSpringConfig);
      }
      gestureDirection.value = "unknown";
    },
    onFail: () => {
      gestureDirection.value = "unknown";
      translateY.value = withSpring(0, smoothSpringConfig);
      backdropOpacity.value = withSpring(1, smoothSpringConfig);
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