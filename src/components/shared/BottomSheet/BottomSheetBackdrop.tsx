import React, { useEffect } from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

interface BottomSheetBackdropProps {
  open: boolean;
  onPress: () => void;
  opacity?: number;
}

export const BottomSheetBackdrop: React.FC<BottomSheetBackdropProps> = ({
  open,
  onPress,
  opacity = 0.35,
}) => {
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    backdropOpacity.value = withTiming(open ? opacity : 0, {
      duration: 250,
    });
  }, [open, opacity]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  if (!open) return null;

  return (
    <Pressable style={StyleSheet.absoluteFill} onPress={onPress}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: "black" },
          backdropStyle,
        ]}
      />
    </Pressable>
  );
};
