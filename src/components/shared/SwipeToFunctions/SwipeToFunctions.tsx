import React, { ReactNode, useMemo } from "react";
import { View, Text, Alert, Dimensions, Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolate,
  FadeOutLeft,
  Layout,
  Easing,
} from "react-native-reanimated";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { theme } from "@/theme";

interface SwipeToFunctionsProps {
  children: ReactNode;
  onDelete?: () => void;
  confirmDelete?: boolean;
  onFavorite?: () => void;
  confirmFavorite?: boolean;
  onTap?: () => void; // Navigation handler for tap gestures
}

const SCREEN_WIDTH = Dimensions.get("window").width;
const ACTION_THRESHOLD = SCREEN_WIDTH * 0.3; // 30% of screen width
const ACTION_COMPLETE_THRESHOLD = SCREEN_WIDTH * 0.7; // 70% of screen width
const ACTION_BUTTON_WIDTH = 60;

// Threshold for determining if gesture is horizontal vs vertical
const DIRECTION_THRESHOLD = 30;

export const SwipeToFunctions: React.FC<SwipeToFunctionsProps> = ({
  children,
  onDelete,
  confirmDelete = true,
  onFavorite,
  confirmFavorite = false,
  onTap,
}) => {
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);
  const height = useSharedValue(1);
  const isDeleting = useSharedValue(false);
  const gestureDirection = useSharedValue<
    "unknown" | "horizontal" | "vertical"
  >("unknown");

  // Press animation shared values
  const scale = useSharedValue(1);
  const pressFlashOpacity = useSharedValue(0);

  // Track if gesture started as a press (for tap vs swipe differentiation)
  const isPressing = useSharedValue(false);

  const colors = theme.getColors();

  // Helper functions for JS thread actions - defined early for worklet access
  const triggerTap = () => {
    if (onTap) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onTap();
    }
  };

  const executeDelete = () => {
    if (!onDelete) return;

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

  const executeFavorite = () => {
    if (!onFavorite) return;

    // Execute favorite action and animate back to center
    runOnJS(onFavorite)();
    translateX.value = withSpring(0, {
      damping: 20,
      stiffness: 300,
    });
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

  const handleFavorite = () => {
    if (confirmFavorite) {
      Alert.alert("Add to Favorites", "Add this food log to your favorites?", [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => {
            // Reset position
            translateX.value = withSpring(0);
          },
        },
        {
          text: "Add to Favorites",
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            executeFavorite();
          },
        },
      ]);
    } else {
      // Direct favorite without confirmation
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      executeFavorite();
    }
  };

  // Enhanced pan gesture that handles both press animations and swipe actions
  const enhancedGesture = useMemo(
    () =>
      Gesture.Pan()
        .onBegin(() => {
          // Start press animation immediately on touch begin
          if (!isDeleting.value) {
            isPressing.value = true;
            scale.value = withTiming(0.97, {
              duration: 150,
              easing: Easing.out(Easing.quad),
            });
            pressFlashOpacity.value = withTiming(0.08, {
              duration: 150,
              easing: Easing.out(Easing.quad),
            });
          }
        })
        .onStart(() => {
          gestureDirection.value = "unknown";
        })
        .onUpdate((event) => {
          // Don't allow gestures during delete animation
          if (isDeleting.value) return;

          const { translationX, translationY } = event;

          // Determine gesture direction on first significant movement
          if (gestureDirection.value === "unknown") {
            const absX = Math.abs(translationX);
            const absY = Math.abs(translationY);

            // Determine gesture direction based on movement
            if (absX > DIRECTION_THRESHOLD || absY > DIRECTION_THRESHOLD) {
              if (absX > absY * 1.5) {
                // Require more horizontal movement
                gestureDirection.value = "horizontal";
                runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
                // Cancel press animation when starting to swipe
                if (isPressing.value) {
                  isPressing.value = false;
                  scale.value = withSpring(1.0, {
                    damping: 25,
                    stiffness: 350,
                  });
                  pressFlashOpacity.value = withTiming(0, {
                    duration: 300,
                    easing: Easing.out(Easing.quad),
                  });
                }
              } else if (absY > absX * 1.5) {
                // Require more vertical movement
                gestureDirection.value = "vertical";
                // Cancel press animation for vertical scrolling too
                if (isPressing.value) {
                  isPressing.value = false;
                  scale.value = withSpring(1.0, {
                    damping: 25,
                    stiffness: 350,
                  });
                  pressFlashOpacity.value = withTiming(0, {
                    duration: 300,
                    easing: Easing.out(Easing.quad),
                  });
                }
              }
            }
          }

          // Only handle horizontal swipes for actions
          if (gestureDirection.value === "horizontal") {
            // Allow swiping in both directions based on available actions
            if (translationX < 0 && onDelete) {
              // Swiping left for delete
              translateX.value = translationX;
            } else if (translationX > 0 && onFavorite) {
              // Swiping right for favorite
              translateX.value = translationX;
            }
          }
        })
        .onEnd((event) => {
          // Don't process gestures during delete animation
          if (isDeleting.value) return;

          const { translationX, velocityX } = event;

          // Only process swipe actions for horizontal gestures
          if (gestureDirection.value === "horizontal") {
            if (translationX < 0 && onDelete) {
              // Left swipe - Delete action
              if (
                translationX < -ACTION_COMPLETE_THRESHOLD ||
                (translationX < -ACTION_THRESHOLD && velocityX < -500)
              ) {
                runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Heavy);
                runOnJS(executeDelete)();
              } else if (translationX < -ACTION_THRESHOLD) {
                // Show delete button but don't auto-delete
                runOnJS(Haptics.impactAsync)(
                  Haptics.ImpactFeedbackStyle.Medium
                );
                translateX.value = withSpring(-ACTION_BUTTON_WIDTH);
              } else {
                // Snap back to original position
                translateX.value = withSpring(0);
              }
            } else if (translationX > 0 && onFavorite) {
              // Right swipe - Favorite action
              if (
                translationX > ACTION_COMPLETE_THRESHOLD ||
                (translationX > ACTION_THRESHOLD && velocityX > 500)
              ) {
                runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Heavy);
                runOnJS(executeFavorite)();
              } else if (translationX > ACTION_THRESHOLD) {
                // Show favorite button but don't auto-favorite
                runOnJS(Haptics.impactAsync)(
                  Haptics.ImpactFeedbackStyle.Medium
                );
                translateX.value = withSpring(ACTION_BUTTON_WIDTH);
              } else {
                // Snap back to original position
                translateX.value = withSpring(0);
              }
            } else {
              // Snap back to original position
              translateX.value = withSpring(0);
            }
          } else {
            // For non-horizontal gestures, just snap back
            translateX.value = withSpring(0);
          }

          // Reset direction for next gesture
          gestureDirection.value = "unknown";
        })
        .onTouchesUp(() => {
          // Handle press release animation and tap detection
          const wasJustTapping =
            isPressing.value && gestureDirection.value === "unknown";

          // Reset press animation
          if (isPressing.value) {
            isPressing.value = false;
            scale.value = withSpring(1.0, { damping: 25, stiffness: 350 });
            pressFlashOpacity.value = withTiming(0, {
              duration: 300,
              easing: Easing.out(Easing.quad),
            });
          }

          // Trigger tap if we were just tapping (no swipe direction determined)
          if (wasJustTapping && !isDeleting.value && onTap) {
            runOnJS(triggerTap)();
          }
        })
        .onFinalize(() => {
          // Only reset position if not deleting or in an active action
          if (!isDeleting.value) {
            translateX.value = withSpring(0);
          }

          // Reset press state if still active
          if (isPressing.value) {
            isPressing.value = false;
            scale.value = withSpring(1.0, { damping: 25, stiffness: 350 });
            pressFlashOpacity.value = withTiming(0, {
              duration: 300,
              easing: Easing.out(Easing.quad),
            });
          }

          gestureDirection.value = "unknown";
        }),
    [onDelete, onFavorite, onTap]
  );

  const containerStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scaleY: height.value }],
    };
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }, { scale: scale.value }],
    };
  });

  const pressFlashAnimatedStyle = useAnimatedStyle(() => ({
    opacity: pressFlashOpacity.value,
    backgroundColor: colors.primaryText,
  }));

  const deleteButtonContainerStyle = useAnimatedStyle(() => {
    // Hide delete button immediately when delete animation starts or if no delete action
    if (isDeleting.value || !onDelete) {
      return {
        opacity: 0,
        width: 0,
      };
    }

    // Only show for negative translation (left swipe)
    const translationValue = Math.min(translateX.value, 0);

    const buttonOpacity = interpolate(
      Math.abs(translationValue),
      [0, ACTION_THRESHOLD / 3, ACTION_THRESHOLD / 2],
      [0, 0.8, 1],
      Extrapolate.CLAMP
    );

    const width = Math.max(
      Math.abs(translationValue * 1.1),
      ACTION_BUTTON_WIDTH + 20
    );

    return {
      opacity: buttonOpacity,
      width,
    };
  });

  const favoriteButtonContainerStyle = useAnimatedStyle(() => {
    // Hide favorite button if no favorite action or during delete animation
    if (!onFavorite || isDeleting.value) {
      return {
        opacity: 0,
        width: 0,
      };
    }

    // Only show for positive translation (right swipe)
    const translationValue = Math.max(translateX.value, 0);

    const buttonOpacity = interpolate(
      translationValue,
      [0, ACTION_THRESHOLD / 3, ACTION_THRESHOLD / 2],
      [0, 0.8, 1],
      Extrapolate.CLAMP
    );

    const width = Math.max(translationValue * 1.1, ACTION_BUTTON_WIDTH + 20);

    return {
      opacity: buttonOpacity,
      width,
    };
  });

  const deleteButtonStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      Math.abs(Math.min(translateX.value, 0)),
      [0, ACTION_THRESHOLD, ACTION_COMPLETE_THRESHOLD],
      [0.8, 1, 1.1],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ scale }],
    };
  });

  const favoriteButtonStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      Math.max(translateX.value, 0),
      [0, ACTION_THRESHOLD, ACTION_COMPLETE_THRESHOLD],
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
          },
          containerStyle,
        ]}
      >
        <View style={{ position: "relative" }}>
          {/* Favorite Button Background */}
          {onFavorite && (
            <Animated.View
              style={[
                {
                  position: "absolute",
                  left: 0,
                  top: 0,
                  borderTopLeftRadius: 16,
                  borderBottomLeftRadius: 16,
                  bottom: 0,
                  backgroundColor: colors.semantic.fat, // Using semantic FAT color
                  justifyContent: "center",
                  alignItems: "center",
                },
                favoriteButtonContainerStyle,
              ]}
            >
              <Pressable onPress={handleFavorite} style={{ padding: 5 }}>
                <Animated.View style={favoriteButtonStyle}>
                  <FontAwesome
                    name="star"
                    size={24}
                    color="white"
                    accessibilityLabel="Add to Favorites"
                    accessibilityHint="Adds this item to favorites"
                    accessible
                  />
                </Animated.View>
              </Pressable>
            </Animated.View>
          )}

          {/* Delete Button Background */}
          {onDelete && (
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
          )}

          {/* Swipeable Content */}
          <GestureDetector gesture={enhancedGesture}>
            <Animated.View style={animatedStyle}>
              {children}
              {/* Press flash overlay for press feedback */}
              <Animated.View
                style={[
                  {
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: 16,
                  },
                  pressFlashAnimatedStyle,
                ]}
                pointerEvents="none"
              />
            </Animated.View>
          </GestureDetector>
        </View>
      </Animated.View>
    </Animated.View>
  );
};
