import React, { ReactNode, useMemo, useEffect, useRef } from "react";
import { View, Alert, Dimensions, Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
  LinearTransition,
  Easing,
} from "react-native-reanimated";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { lockNav, isNavLocked } from "@/utils/navigationLock";
import { theme } from "@/theme";
import { useIsFocused } from "@react-navigation/native";

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
const ACTION_BUTTON_WIDTH = 90;

// Threshold for determining if gesture is horizontal vs vertical
const DIRECTION_THRESHOLD = 50; // Increased to be more selective

export const SwipeToFunctions: React.FC<SwipeToFunctionsProps> = ({
  children,
  onDelete,
  confirmDelete = true,
  onFavorite,
  confirmFavorite = false,
  onTap,
}) => {
  // Screen focus awareness to prevent tap-through when regaining focus
  const isFocused = useIsFocused();
  const focusAtTsRef = useRef<number>(0);
  const focusAtMs = useSharedValue(0);
  const tapStartMs = useSharedValue(0);
  const TAP_AFTER_FOCUS_GRACE_MS = 600; // taps must start after this grace window
  // Treat presses shorter than the long-press threshold as taps.
  // LogCard uses delayLongPress ~500ms, so give a small buffer to avoid a dead zone.
  const TAP_MAX_PRESS_DURATION_MS = 600; // anything <600ms counts as tap; >=600ms not a tap

  useEffect(() => {
    if (isFocused) {
      const now = Date.now();
      focusAtTsRef.current = now;
      focusAtMs.value = now;
    }
  }, [isFocused, focusAtMs]);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);
  const height = useSharedValue(1);
  const isDeleting = useSharedValue(false);
  const gestureDirection = useSharedValue<
    "unknown" | "horizontal" | "vertical"
  >("unknown");

  // Persistent swipe state tracking
  const isLeftSwiped = useSharedValue(false); // Track left swipe state (delete)
  const isRightSwiped = useSharedValue(false); // Track right swipe state (favorite)

  // Press animation shared values
  const scale = useSharedValue(1);
  const pressFlashOpacity = useSharedValue(0);

  // Track if gesture started as a press (for tap vs swipe differentiation)
  const isPressing = useSharedValue(false);

  const colors = theme.getColors();

  // Helper functions for JS thread actions - defined early for worklet access
  const triggerTap = () => {
    if (!onTap) return;
    // Skip tap if navigation is currently locked (e.g., a long-press menu opened)
    if (isNavLocked()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Lock interactions briefly to prevent immediate long-press menu
    lockNav(400);
    onTap();
  };

  const executeDelete = () => {
    if (!onDelete) return;

    isDeleting.value = true;
    // Reset swipe state when deleting
    isLeftSwiped.value = false;
    isRightSwiped.value = false;

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

    // Reset swipe state when executing favorite
    isLeftSwiped.value = false;
    isRightSwiped.value = false;

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
              // Reset position and swipe state
              isLeftSwiped.value = false;
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
            // Reset position and swipe state
            isRightSwiped.value = false;
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
        .activeOffsetX([-10, 10]) // Only become active for horizontal movement
        .failOffsetY([-30, 30]) // Fail if vertical movement is too large
        .onBegin(() => {
          // Mark as potential press but don't animate yet
          // Avoid triggering shrink during swipe; animate only on confirmed tap
          if (!isDeleting.value) {
            isPressing.value = true;
            // Record tap start time for validation against focus moment
            tapStartMs.value = Date.now();
          }
        })
        .onStart(() => {
          gestureDirection.value = "unknown";
          // Don't reset translateX if we're in a persistent swipe state
        })
        .onUpdate((event) => {
          // Don't allow gestures during delete animation
          if (isDeleting.value) return;

          const { translationX, translationY } = event;

          // Determine gesture direction on first significant movement
          if (gestureDirection.value === "unknown") {
            const absX = Math.abs(translationX);
            const absY = Math.abs(translationY);

            // Only determine direction after significant movement
            if (absX > DIRECTION_THRESHOLD || absY > DIRECTION_THRESHOLD) {
              // Require much more pronounced horizontal movement to capture the gesture
              if (absX > absY * 2.5 && absX > DIRECTION_THRESHOLD) {
                // Much more strict horizontal requirement
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
              } else {
                // Any other movement pattern should be treated as vertical/other
                gestureDirection.value = "vertical";
                // Cancel press animation for vertical scrolling
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

              // Check if we should dismiss right swipe state when swiping left
              if (isRightSwiped.value && translationX < -10) {
                isRightSwiped.value = false;
              }
            } else if (translationX > 0 && onFavorite) {
              // Swiping right for favorite
              translateX.value = translationX;

              // Check if we should dismiss left swipe state when swiping right
              if (isLeftSwiped.value && translationX > 10) {
                isLeftSwiped.value = false;
              }
            } else if (isLeftSwiped.value || isRightSwiped.value) {
              // Handle swipe back to center when in persistent swipe state
              if (
                isLeftSwiped.value &&
                translationX > -ACTION_BUTTON_WIDTH / 2
              ) {
                // Swiping back from left swipe position
                translateX.value = translationX;
              } else if (
                isRightSwiped.value &&
                translationX < ACTION_BUTTON_WIDTH / 2
              ) {
                // Swiping back from right swipe position
                translateX.value = translationX;
              }
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
                // Show delete button and set persistent state
                if (!isLeftSwiped.value) {
                  runOnJS(Haptics.impactAsync)(
                    Haptics.ImpactFeedbackStyle.Medium
                  );
                  isLeftSwiped.value = true;
                }
                translateX.value = withSpring(-ACTION_BUTTON_WIDTH);
              } else if (
                isLeftSwiped.value &&
                translationX > -ACTION_BUTTON_WIDTH / 2
              ) {
                // Dismiss left swipe state when swiping back to center
                isLeftSwiped.value = false;
                translateX.value = withSpring(0);
              } else if (!isLeftSwiped.value) {
                // Snap back to original position if not in persistent state
                translateX.value = withSpring(0);
              } else {
                // Stay in swiped position
                translateX.value = withSpring(-ACTION_BUTTON_WIDTH);
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
                // Show favorite button and set persistent state
                if (!isRightSwiped.value) {
                  runOnJS(Haptics.impactAsync)(
                    Haptics.ImpactFeedbackStyle.Medium
                  );
                  isRightSwiped.value = true;
                }
                translateX.value = withSpring(ACTION_BUTTON_WIDTH);
              } else if (
                isRightSwiped.value &&
                translationX < ACTION_BUTTON_WIDTH / 2
              ) {
                // Dismiss right swipe state when swiping back to center
                isRightSwiped.value = false;
                translateX.value = withSpring(0);
              } else if (!isRightSwiped.value) {
                // Snap back to original position if not in persistent state
                translateX.value = withSpring(0);
              } else {
                // Stay in swiped position
                translateX.value = withSpring(ACTION_BUTTON_WIDTH);
              }
            } else if (isLeftSwiped.value || isRightSwiped.value) {
              // Handle swipe back to center from persistent state
              if (
                isLeftSwiped.value &&
                translationX > -ACTION_BUTTON_WIDTH / 2
              ) {
                isLeftSwiped.value = false;
                translateX.value = withSpring(0);
              } else if (
                isRightSwiped.value &&
                translationX < ACTION_BUTTON_WIDTH / 2
              ) {
                isRightSwiped.value = false;
                translateX.value = withSpring(0);
              } else {
                // Stay in current swiped position
                translateX.value = withSpring(
                  isLeftSwiped.value
                    ? -ACTION_BUTTON_WIDTH
                    : ACTION_BUTTON_WIDTH
                );
              }
            } else {
              // Snap back to original position
              translateX.value = withSpring(0);
            }
          } else {
            // For non-horizontal gestures, maintain current position if in persistent state
            if (isLeftSwiped.value) {
              translateX.value = withSpring(-ACTION_BUTTON_WIDTH);
            } else if (isRightSwiped.value) {
              translateX.value = withSpring(ACTION_BUTTON_WIDTH);
            } else {
              translateX.value = withSpring(0);
            }
          }

          // Reset direction for next gesture
          gestureDirection.value = "unknown";
        })
        .onTouchesUp(() => {
          // Handle press release animation and tap detection
          const wasJustTapping =
            isPressing.value && gestureDirection.value === "unknown";

          const tapStartedAfterFocusGrace =
            tapStartMs.value - focusAtMs.value >= TAP_AFTER_FOCUS_GRACE_MS;

          const pressDuration = Date.now() - tapStartMs.value;

          if (
            wasJustTapping &&
            tapStartedAfterFocusGrace &&
            pressDuration < TAP_MAX_PRESS_DURATION_MS &&
            !isDeleting.value &&
            onTap
          ) {
            // Confirmed tap: play quick press feedback then trigger tap
            isPressing.value = false;
            pressFlashOpacity.value = withTiming(0.08, {
              duration: 100,
              easing: Easing.out(Easing.quad),
            });
            scale.value = withTiming(
              0.97,
              { duration: 120, easing: Easing.out(Easing.quad) },
              () => {
                // Return to normal and trigger tap at the end
                scale.value = withTiming(
                  1.0,
                  { duration: 120, easing: Easing.out(Easing.quad) },
                  () => {
                    pressFlashOpacity.value = withTiming(0, {
                      duration: 150,
                      easing: Easing.out(Easing.quad),
                    });
                    runOnJS(triggerTap)();
                  }
                );
              }
            );
          } else {
            // Not a tap: ensure any pending press visuals are cleared
            if (isPressing.value) {
              isPressing.value = false;
              scale.value = withSpring(1.0, { damping: 25, stiffness: 350 });
              pressFlashOpacity.value = withTiming(0, {
                duration: 300,
                easing: Easing.out(Easing.quad),
              });
            }
          }
        })
        .onFinalize(() => {
          // Only reset position if not deleting and not in persistent swipe state
          if (
            !isDeleting.value &&
            !isLeftSwiped.value &&
            !isRightSwiped.value
          ) {
            translateX.value = withSpring(0);
          } else if (!isDeleting.value) {
            // Maintain swiped position if in persistent state
            translateX.value = withSpring(
              isLeftSwiped.value
                ? -ACTION_BUTTON_WIDTH
                : isRightSwiped.value
                ? ACTION_BUTTON_WIDTH
                : 0
            );
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
      Extrapolation.CLAMP
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
      Extrapolation.CLAMP
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
      Extrapolation.CLAMP
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
      Extrapolation.CLAMP
    );

    return {
      transform: [{ scale }],
    };
  });

  return (
    <Animated.View>
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
              <Pressable onPress={() => executeDelete()} style={{ padding: 5 }}>
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
