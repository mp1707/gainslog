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
import {
  HouseIcon,
  PersonIcon,
  BicycleIcon,
  FlameIcon,
  LightningIcon,
} from "phosphor-react-native";
import { useTheme } from "../../../../providers/ThemeProvider";
import { createStyles } from "./CalorieCalculationCard.styles";
import { ActivityLevel, CalorieGoals } from "../../../../utils/calculateCalories";

export interface CalorieCalculationMethod {
  id: ActivityLevel;
  title: string;
  description: string;
  label: string;
}

interface CalorieCalculationCardProps {
  method: CalorieCalculationMethod;
  calorieGoals?: CalorieGoals;
  isSelected: boolean;
  onSelect: (method: CalorieCalculationMethod) => void;
  showCalorieGoals?: boolean;
}

const CALCULATION_METHODS: Record<ActivityLevel, CalorieCalculationMethod> = {
  sedentary: {
    id: "sedentary",
    title: "Sedentary",
    description:
      "Little to no exercise. Desk job with minimal physical activity throughout the day.",
    label: "Sedentary Lifestyle",
  },
  light: {
    id: "light",
    title: "Light Activity",
    description:
      "Light exercise 1-3 days per week. Some walking or light recreational activities.",
    label: "Lightly Active",
  },
  moderate: {
    id: "moderate",
    title: "Moderate Activity",
    description:
      "Moderate exercise 3-5 days per week. Regular gym sessions or sports activities.",
    label: "Moderately Active",
  },
  active: {
    id: "active",
    title: "Active",
    description:
      "Moderate exercise 6-7 days per week. Or intense training 3 to 4 times/week.",
    label: "Active",
  },
  veryactive: {
    id: "veryactive",
    title: "Very Active",
    description:
      "Very heavy physical work or 6 to 7 times/week intense exercise. Professional athlete level activity.",
    label: "Very Active",
  },
};

const getIconForMethod = (methodId: ActivityLevel, color: string, size: number) => {
  switch (methodId) {
    case "sedentary":
      return <HouseIcon size={size} color={color} weight="regular" />;
    case "light":
      return <PersonIcon size={size} color={color} weight="regular" />;
    case "moderate":
      return <BicycleIcon size={size} color={color} weight="regular" />;
    case "active":
      return <FlameIcon size={size} color={color} weight="regular" />;
    case "veryactive":
      return <LightningIcon size={size} color={color} weight="regular" />;
    default:
      return <PersonIcon size={size} color={color} weight="regular" />;
  }
};

export const CalorieCalculationCard: React.FC<CalorieCalculationCardProps> = ({
  method,
  calorieGoals,
  isSelected,
  onSelect,
  showCalorieGoals = true,
}) => {
  const { colors, colorScheme } = useTheme();
  const styles = createStyles(colors, colorScheme);

  const iconColor = isSelected ? colors.accent : colors.primaryText;
  const iconWeight = isSelected ? "fill" : "regular";

  // Press animation shared values
  const pressScale = useSharedValue(1);

  // Press animation styles
  const pressAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(method);
  };

  const handlePressIn = () => {
    // Press down animation - scale down
    pressScale.value = withTiming(0.97, { duration: 150, easing: Easing.out(Easing.quad) });
  };

  const handlePressOut = () => {
    // Release animation - spring back
    pressScale.value = withSpring(1.0, { damping: 25, stiffness: 350 });
  };

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityLabel={`${method.title} activity level`}
      accessibilityHint={`Calculate calories for ${method.description.toLowerCase()}`}
      accessibilityState={{ selected: isSelected }}
    >
      <Animated.View style={[styles.container, isSelected && styles.selectedContainer, pressAnimatedStyle]}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              {React.cloneElement(getIconForMethod(method.id, iconColor, 24), {
                weight: iconWeight,
              })}
            </View>
            <View style={styles.titleContainer}>
              <Text style={[styles.title, isSelected && styles.selectedTitle]}>
                {method.title}
              </Text>
              <Text style={styles.description}>{method.description}</Text>
            </View>
          </View>

          {showCalorieGoals && calorieGoals && (
            <View style={styles.calorieContainer}>
              <View style={styles.calorieRow}>
                <Text style={styles.calorieLabel}>Lose:</Text>
                <Text
                  style={[
                    styles.calorieValue,
                    isSelected && styles.selectedCalorieValue,
                  ]}
                >
                  {calorieGoals.loseWeight} kcal
                </Text>
              </View>
              <View style={styles.calorieRow}>
                <Text style={styles.calorieLabel}>Maintain:</Text>
                <Text
                  style={[
                    styles.calorieValue,
                    isSelected && styles.selectedCalorieValue,
                  ]}
                >
                  {calorieGoals.maintainWeight} kcal
                </Text>
              </View>
              <View style={styles.calorieRow}>
                <Text style={styles.calorieLabel}>Gain:</Text>
                <Text
                  style={[
                    styles.calorieValue,
                    isSelected && styles.selectedCalorieValue,
                  ]}
                >
                  {calorieGoals.gainWeight} kcal
                </Text>
              </View>
            </View>
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
};

export { CALCULATION_METHODS };