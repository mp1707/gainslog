import React from "react";
import { TouchableOpacity, Text, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { CalculatorIcon } from "phosphor-react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { createStyles } from "./AnimatedCalculatorButton.styles";

interface AnimatedCalculatorButtonProps {
  isCalorieCard: boolean;
  onPress: () => void;
}

export const AnimatedCalculatorButton: React.FC<
  AnimatedCalculatorButtonProps
> = ({ isCalorieCard, onPress }) => {
  const { colors, theme } = useTheme();
  const styles = createStyles(colors, theme);

  // Use design system animation specifications
  const { animations } = theme;
  const animationConfig = {
    duration: animations.defaultTransition.duration, // 300ms
    easing: Easing.out(Easing.quad), // easeOut from design system
  };

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.95, animationConfig);
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, animationConfig);
  };

  const handlePress = () => {
    // Brief press animation
    scale.value = withTiming(0.9, { duration: 100 }, () => {
      scale.value = withTiming(1, animationConfig);
    });
    onPress();
  };

  const semanticColor = isCalorieCard
    ? colors.semantic.calories
    : colors.semantic.protein;

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={[
          styles.primaryButton,
          {
            backgroundColor: semanticColor + "15",
            borderColor: semanticColor,
          },
        ]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={"Calculate Target"}
        accessibilityHint={`Calculate ${
          isCalorieCard ? "calorie" : "protein"
        } needs based on your personal information`}
      >
        <View style={styles.primaryButtonContent}>
          <CalculatorIcon
            size={theme.components.aiActionTargets.iconSize}
            color={semanticColor}
            weight="regular"
          />
          <Text style={[styles.primaryButtonText, { color: semanticColor }]}>
            Calculate Target
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};
