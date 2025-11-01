import React, { useEffect, useMemo } from "react";
import { Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { AppText } from "@/components";
import { useTheme } from "@/theme";
import { createStyles } from "./RecalculateButton.styles";

interface RecalculateButtonProps {
  changesCount: number;
  onPress: () => void;
  disabled?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const RecalculateButton: React.FC<RecalculateButtonProps> = ({
  changesCount,
  onPress,
  disabled = false,
}) => {
  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);

  const scale = useSharedValue(1);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.97, {
      duration: 120,
      easing: Easing.out(Easing.quad),
    });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, {
      duration: 120,
      easing: Easing.out(Easing.quad),
    });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const changeWord = changesCount === 1 ? "change" : "changes";
  const label = `Recalculate · ${changesCount} ${changeWord}`;

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[styles.button, animatedButtonStyle]}
      accessibilityRole="button"
      accessibilityLabel={`Recalculate macros. ${changesCount} ${changeWord} pending.`}
    >
      <AppText style={styles.buttonText}>{label}</AppText>
    </AnimatedPressable>
  );
};
