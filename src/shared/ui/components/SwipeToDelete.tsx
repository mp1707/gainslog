import React, { ReactNode } from "react";
import { View, Text, Alert, Dimensions, Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import { PanGestureHandler } from "react-native-gesture-handler";
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";

interface SwipeToDeleteProps {
  children: ReactNode;
  onDelete: () => void;
  itemId: string;
  confirmDelete?: boolean;
}

const SCREEN_WIDTH = Dimensions.get("window").width;
const DELETE_THRESHOLD = SCREEN_WIDTH * 0.3; // 30% of screen width
const DELETE_COMPLETE_THRESHOLD = SCREEN_WIDTH * 0.7; // 70% of screen width
const DELETE_BUTTON_WIDTH = 80;

export const SwipeToDelete: React.FC<SwipeToDeleteProps> = ({
  children,
  onDelete,
  itemId,
  confirmDelete = true,
}) => {
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);
  const height = useSharedValue(1);

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
              // Animate out with height collapse and then delete
              opacity.value = withSpring(0, { damping: 20, stiffness: 200 });
              height.value = withSpring(
                0,
                { damping: 20, stiffness: 200 },
                () => {
                  runOnJS(onDelete)();
                }
              );
            },
          },
        ]
      );
    } else {
      // Direct delete without confirmation
      opacity.value = withSpring(0, { damping: 20, stiffness: 200 });
      height.value = withSpring(0, { damping: 20, stiffness: 200 }, () => {
        runOnJS(onDelete)();
      });
    }
  };

  const gestureHandler = useAnimatedGestureHandler({
    onStart: () => {
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
    },
    onActive: (event) => {
      // Only allow swiping to the left (negative values)
      if (event.translationX < 0) {
        translateX.value = event.translationX;
      }
    },
    onEnd: (event) => {
      const { translationX, velocityX } = event;

      // If swiped far enough or with enough velocity, trigger delete
      if (
        Math.abs(translationX) > DELETE_COMPLETE_THRESHOLD ||
        (Math.abs(translationX) > DELETE_THRESHOLD && Math.abs(velocityX) > 500)
      ) {
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Heavy);
        runOnJS(handleDelete)();
      } else if (Math.abs(translationX) > DELETE_THRESHOLD) {
        // Show delete button but don't auto-delete
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
        translateX.value = withSpring(-DELETE_BUTTON_WIDTH);
      } else {
        // Snap back to original position
        translateX.value = withSpring(0);
      }
    },
  });

  const containerStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scaleY: height.value }],
      overflow: "hidden",
    };
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const deleteButtonContainerStyle = useAnimatedStyle(() => {
    const buttonOpacity = interpolate(
      Math.abs(translateX.value),
      [0, DELETE_THRESHOLD / 3, DELETE_THRESHOLD / 2],
      [0, 0.8, 1],
      Extrapolate.CLAMP
    );

    // Dynamic width that grows as user swipes
    const width = interpolate(
      Math.abs(translateX.value),
      [
        0,
        20,
        DELETE_THRESHOLD / 2,
        DELETE_THRESHOLD,
        DELETE_COMPLETE_THRESHOLD,
      ],
      [0, 40, 70, DELETE_BUTTON_WIDTH, DELETE_BUTTON_WIDTH + 30],
      Extrapolate.CLAMP
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
      style={[
        {
          marginBottom: 12,
          borderRadius: 16,
          overflow: "hidden",
        },
        containerStyle,
      ]}
    >
      <View style={{ position: "relative" }}>
        <View
          style={{
            position: "absolute",
            left: "20%",
            top: 0,
            bottom: 0,
            right: "10%",
            backgroundColor: "#FF3B30",
          }}
        />
        {/* Delete Button Background */}
        <Animated.View
          style={[
            {
              position: "absolute",
              right: 0,
              top: 0,
              bottom: 0,
              backgroundColor: "#FF3B30", // iOS red
              justifyContent: "center",
              alignItems: "center",
            },
            deleteButtonContainerStyle,
          ]}
        >
          <Pressable onPress={handleDelete} style={{ padding: 10 }}>
            <Animated.View style={deleteButtonStyle}>
              <Text
                style={{
                  color: "white",
                  fontSize: 28,
                  fontWeight: "bold",
                }}
              >
                🗑️
              </Text>
            </Animated.View>
          </Pressable>
        </Animated.View>

        {/* Swipeable Content */}
        <PanGestureHandler onGestureEvent={gestureHandler}>
          <Animated.View style={animatedStyle}>{children}</Animated.View>
        </PanGestureHandler>
      </View>
    </Animated.View>
  );
};
