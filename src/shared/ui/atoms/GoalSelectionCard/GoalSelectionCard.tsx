import React from "react";
import { View, Text, Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from "react-native-reanimated";
import { TrendDownIcon, EqualsIcon, TrendUpIcon } from "phosphor-react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { createStyles } from "./GoalSelectionCard.styles";
import type { GoalType } from "@/types/indexLegacy";

export interface GoalSelectionCardProps {
  goalType: GoalType;
  calories: number;
  isSelected: boolean;
  onSelect: (goalType: GoalType) => void;
}

const getGoalInfo = (goalType: GoalType) => {
  switch (goalType) {
    case "lose":
      return {
        title: "Lose Weight",
        description: "Create a calorie deficit to lose weight gradually",
        icon: TrendDownIcon,
        color: "#FF6B6B",
      };
    case "maintain":
      return {
        title: "Maintain Weight",
        description: "Eat at maintenance calories to stay at current weight",
        icon: EqualsIcon,
        color: "#4ECDC4",
      };
    case "gain":
      return {
        title: "Gain Weight",
        description: "Create a calorie surplus to gain weight gradually",
        icon: TrendUpIcon,
        color: "#45B7D1",
      };
  }
};

export const GoalSelectionCard: React.FC<GoalSelectionCardProps> = ({
  goalType,
  calories,
  isSelected,
  onSelect,
}) => {
  const { colors, colorScheme } = useTheme();
  const styles = createStyles(colors, colorScheme);

  const goalInfo = getGoalInfo(goalType);
  const IconComponent = goalInfo.icon;

  const iconColor = isSelected ? colors.accent : goalInfo.color;
  const iconWeight = isSelected ? "fill" : "regular";

  // Press animation shared values
  const pressScale = useSharedValue(1);

  // Press animation styles
  const pressAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(goalType);
  };

  const handlePressIn = () => {
    pressScale.value = withTiming(0.97, {
      duration: 150,
      easing: Easing.out(Easing.quad),
    });
  };

  const handlePressOut = () => {
    pressScale.value = withSpring(1.0, { damping: 25, stiffness: 350 });
  };

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityLabel={`${goalInfo.title} goal`}
      accessibilityHint={`Set ${calories} calories as your daily goal to ${goalInfo.description.toLowerCase()}`}
      accessibilityState={{ selected: isSelected }}
    >
      <Animated.View
        style={[
          styles.container,
          isSelected && styles.selectedContainer,
          pressAnimatedStyle,
        ]}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <IconComponent size={24} color={iconColor} weight={iconWeight} />
            </View>
            <View style={styles.titleContainer}>
              <Text style={[styles.title, isSelected && styles.selectedTitle]}>
                {goalInfo.title}
              </Text>
              <Text style={styles.description}>{goalInfo.description}</Text>
            </View>
          </View>

          <View style={styles.calorieContainer}>
            <View style={styles.calorieRow}>
              <Text style={styles.calorieLabel}>Daily Target:</Text>
              <Text
                style={[
                  styles.calorieValue,
                  isSelected && styles.selectedCalorieValue,
                ]}
              >
                {calories} kcal
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
};
