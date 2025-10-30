import React, { useEffect, useMemo } from "react";
import { Pressable, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { AppText } from "@/components";
import { useTheme } from "@/theme";
import { createStyles } from "./StickyRecalculateBar.styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface StickyRecalculateBarProps {
  visible: boolean;
  changesCount: number;
  onPress: () => void;
  disabled?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const StickyRecalculateBar: React.FC<StickyRecalculateBarProps> = ({
  visible,
  changesCount,
  onPress,
  disabled = false,
}) => {
  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);
  const insets = useSafeAreaInsets();

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const scale = useSharedValue(1);

  // Animate appearance/disappearance
  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      });
      translateY.value = withTiming(0, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      opacity.value = withTiming(0, {
        duration: 200,
        easing: Easing.in(Easing.cubic),
      });
      translateY.value = withTiming(20, {
        duration: 200,
        easing: Easing.in(Easing.cubic),
      });
    }
  }, [visible, opacity, translateY]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

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

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { paddingBottom: Math.max(insets.bottom, theme.spacing.lg) },
        animatedContainerStyle,
      ]}
      pointerEvents={visible ? "auto" : "none"}
    >
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
    </Animated.View>
  );
};
