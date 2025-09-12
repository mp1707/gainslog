import React from "react";
import { Pressable, StyleSheet, View, ViewStyle, StyleProp } from "react-native";
import Animated from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { useTheme } from "@/theme";
import { createStyles } from "./DimOverlay.styles";

interface DimOverlayProps {
  onPress: () => void;
  // Accept animated styles from Reanimated callers
  style?: StyleProp<ViewStyle>;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const DimOverlay: React.FC<DimOverlayProps> = ({ onPress, style }) => {
  const { colorScheme } = useTheme();
  const styles = createStyles();
  return (
    <AnimatedPressable
      onPress={onPress}
      style={[styles.dimOverlay, style]}
      accessibilityLabel="Dismiss editor overlay"
      accessibilityRole="button"
    >
      <BlurView
        intensity={28}
        tint={colorScheme === "dark" ? "dark" : "light"}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.dimColor} />
    </AnimatedPressable>
  );
};
