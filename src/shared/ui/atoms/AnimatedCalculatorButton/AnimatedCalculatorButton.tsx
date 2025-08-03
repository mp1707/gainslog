import React from "react";
import { TouchableOpacity } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { CalculatorIcon } from "phosphor-react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { createStyles } from "./AnimatedCalculatorButton.styles";

interface AnimatedCalculatorButtonProps {
  isCalorieCard: boolean;
  onPress: () => void;
}

export const AnimatedCalculatorButton: React.FC<AnimatedCalculatorButtonProps> = ({
  isCalorieCard,
  onPress,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 400 });
    rotation.value = withTiming(-5, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    rotation.value = withTiming(0, { duration: 100 });
  };

  const handlePress = () => {
    rotation.value = withTiming(15, { duration: 100 }, () => {
      rotation.value = withTiming(0, { duration: 100 });
    });
    onPress();
  };

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: isCalorieCard
              ? colors.semantic.calories + "15"
              : colors.semantic.protein + "15",
            borderColor: isCalorieCard
              ? colors.semantic.calories
              : colors.semantic.protein,
          },
        ]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={`Open ${
          isCalorieCard ? "calorie" : "protein"
        } calculator`}
        accessibilityHint={`Calculate ${
          isCalorieCard ? "calorie" : "protein"
        } needs based on personal info`}
      >
        <CalculatorIcon
          size={18}
          color={
            isCalorieCard ? colors.semantic.calories : colors.semantic.protein
          }
          weight="regular"
        />
      </TouchableOpacity>
    </Animated.View>
  );
};