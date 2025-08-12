import React, { ReactNode } from "react";
import { View, Text, Alert, Dimensions, Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolate,
  FadeOutLeft,
  Layout,
} from "react-native-reanimated";
import FontAwesome from "@expo/vector-icons/FontAwesome";

interface SwipeToDeleteProps {
  children: ReactNode;
  onDelete: () => void;
  confirmDelete?: boolean;
}

const SCREEN_WIDTH = Dimensions.get("window").width;
const DELETE_THRESHOLD = SCREEN_WIDTH * 0.3; // 30% of screen width
const DELETE_COMPLETE_THRESHOLD = SCREEN_WIDTH * 0.7; // 70% of screen width
const DELETE_BUTTON_WIDTH = 60;

// Threshold for determining if gesture is horizontal vs vertical
const DIRECTION_THRESHOLD = 30;

export const SwipeToDelete: React.FC<SwipeToDeleteProps> = ({
  children,
  onDelete,
  confirmDelete = true,
}) => {
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);
  const height = useSharedValue(1);
  const isDeleting = useSharedValue(false);
  const gestureDirection = useSharedValue<
    "unknown" | "horizontal" | "vertical"
  >("unknown");

  const executeDelete = () => {
    isDeleting.value = true;

    // First slide out to the left with a natural easing
    translateX.value = withTiming(
      -SCREEN_WIDTH * 1.2, // Slide slightly further for full exit effect
      {
        duration: 250, // Faster slide for more responsive feel
      },
      () => {
        // Then collapse height and fade out quickly
        opacity.value = withTiming(0, { duration: 150 });
        height.value = withTiming(
          0,
          { duration: 200 }, // Quick collapse
          () => {
            runOnJS(onDelete)();
          }
        );
      }
    );
  };

  const handleDelete = () => {
    if (confirmDelete) {
      Alert.alert(
        "Delete Food Log",
        "Are you sure you want to delete this food log?",
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => {
              // Reset position
              translateX.value = withSpring(0);
            },
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => {
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Warning
              );
              executeDelete();
            },
          },
        ]
      );
    } else {
      // Direct delete without confirmation
      executeDelete();
    }
  };

  const gestureHandler = useAnimatedGestureHandler({
    onStart: () => {
      gestureDirection.value = "unknown";
    },
    onActive: (event) => {
      // Don't allow gestures during delete animation
      if (isDeleting.value) return;

      const { translationX, translationY } = event;

      // Determine gesture direction on first significant movement
      if (gestureDirection.value === "unknown") {
        const absX = Math.abs(translationX);
        const absY = Math.abs(translationY);

        if (absX > DIRECTION_THRESHOLD || absY > DIRECTION_THRESHOLD) {
          if (absX > absY) {
            gestureDirection.value = "horizontal";
            runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
          } else {
            gestureDirection.value = "vertical";
          }
        }
      }

      // Only handle horizontal swipes for deletion
      if (gestureDirection.value === "horizontal") {
        // Only allow swiping to the left (negative values)
        if (translationX < 0) {
          translateX.value = translationX;
        }
      }
    },
    onEnd: (event) => {
      // Don't process gestures during delete animation
      if (isDeleting.value) return;

      // Only process end event for horizontal gestures
      if (gestureDirection.value !== "horizontal") {
        return;
      }

      const { translationX, velocityX } = event;

      // If swiped far enough or with enough velocity, trigger delete
      if (
        translationX < -DELETE_COMPLETE_THRESHOLD ||
        (translationX < -DELETE_THRESHOLD && velocityX < -500)
      ) {
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Heavy);
        runOnJS(executeDelete)();
      } else if (translationX < -DELETE_THRESHOLD) {
        // Show delete button but don't auto-delete
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
        translateX.value = withSpring(-DELETE_BUTTON_WIDTH);
      } else {
        // Snap back to original position
        translateX.value = withSpring(0);
      }

      // Reset direction for next gesture
      gestureDirection.value = "unknown";
    },
    onFail: () => {
      // Reset direction and position on gesture failure
      gestureDirection.value = "unknown";
      translateX.value = withSpring(0);
    },
  });

  const containerStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scaleY: height.value }],
      // overflow: "hidden",
    };
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const deleteButtonContainerStyle = useAnimatedStyle(() => {
    // Hide delete button immediately when delete animation starts
    if (isDeleting.value) {
      return {
        opacity: 0,
        width: 0,
      };
    }

    const buttonOpacity = interpolate(
      Math.abs(translateX.value),
      [0, DELETE_THRESHOLD / 3, DELETE_THRESHOLD / 2],
      [0, 0.8, 1],
      Extrapolate.CLAMP
    );

    const width = Math.max(
      Math.abs(translateX.value * 1.1),
      DELETE_BUTTON_WIDTH + 20
    );

    return {
      opacity: buttonOpacity,
      width,
    };
  });

  const deleteButtonStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      Math.abs(translateX.value),
      [0, DELETE_THRESHOLD, DELETE_COMPLETE_THRESHOLD],
      [0.8, 1, 1.1],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ scale }],
    };
  });

  return (
    <Animated.View
      layout={Layout.springify().damping(18).stiffness(150).mass(1)}
      exiting={FadeOutLeft.duration(250)}
    >
      <Animated.View
        style={[
          {
            borderRadius: 16,
            // overflow: "hidden",
          },
          containerStyle,
        ]}
      >
        <View style={{ position: "relative" }}>
          {/* Delete Button Background */}
          <Animated.View
            style={[
              {
                position: "absolute",
                right: 0,
                top: 0,
                borderTopRightRadius: 16,
                borderBottomRightRadius: 16,
                bottom: 0,
                backgroundColor: "#FF3B30", // iOS red
                justifyContent: "center",
                alignItems: "center",
              },
              deleteButtonContainerStyle,
            ]}
          >
            <Pressable onPress={handleDelete} style={{ padding: 5 }}>
              <Animated.View style={deleteButtonStyle}>
                <FontAwesome
                  name="trash"
                  size={24}
                  color="white"
                  accessibilityLabel="Delete"
                  accessibilityHint="Deletes this item"
                  accessible
                />
              </Animated.View>
            </Pressable>
          </Animated.View>

          {/* Swipeable Content */}
          <PanGestureHandler
            onGestureEvent={gestureHandler}
            activeOffsetX={[-10, 10]}
            failOffsetY={[-5, 5]}
          >
            <Animated.View style={animatedStyle}>{children}</Animated.View>
          </PanGestureHandler>
        </View>
      </Animated.View>
    </Animated.View>
  );
};
