import React, { useMemo } from "react";
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
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

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

  const label = t("recalculateButton.label", { count: changesCount });
  const accessibilityLabel = t("recalculateButton.accessibility", {
    count: changesCount,
  });

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[styles.button, animatedButtonStyle]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <AppText style={styles.buttonText}>{label}</AppText>
    </AnimatedPressable>
  );
};
