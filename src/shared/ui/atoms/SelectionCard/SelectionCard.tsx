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
  TrendDownIcon,
  EqualsIcon,
  TrendUpIcon,
  HouseIcon,
  PersonIcon,
  BicycleIcon,
  FlameIcon,
  LightningIcon,
} from "phosphor-react-native";
import type { Icon, IconWeight } from "phosphor-react-native";

import { useTheme } from "@/providers/ThemeProvider";
import { createStyles } from "./SelectionCard.styles";
import type { CalorieGoals, ActivityLevel, GoalType } from "@/types";

interface IconConfig {
  component: Icon;
  color: string;
  weight: IconWeight;
}

export interface SelectionCardProps {
  // Core functionality
  isSelected: boolean;
  onSelect: () => void;
  title: string;
  description: string;

  // Icon options (either custom or predefined)
  icon?: Icon;
  iconColor?: string;
  iconType?:
    | "goal-lose"
    | "goal-maintain"
    | "goal-gain"
    | "activity-sedentary"
    | "activity-light"
    | "activity-moderate"
    | "activity-active"
    | "activity-veryactive";

  // Optional content section
  content?: {
    type: "single-calorie" | "multiple-calories";
    calories?: number;
    calorieGoals?: CalorieGoals;
    showAllGoals?: boolean;
  };

  // Accessibility
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

// Predefined icon configurations
const getPredefinedIcon = (
  iconType: string,
  isSelected: boolean,
  accentColor: string
): IconConfig => {
  const weight: IconWeight = isSelected ? "fill" : "regular";

  switch (iconType) {
    case "goal-lose":
      return {
        component: TrendDownIcon,
        color: isSelected ? accentColor : "#FF6B6B",
        weight,
      };
    case "goal-maintain":
      return {
        component: EqualsIcon,
        color: isSelected ? accentColor : "#4ECDC4",
        weight,
      };
    case "goal-gain":
      return {
        component: TrendUpIcon,
        color: isSelected ? accentColor : "#45B7D1",
        weight,
      };
    case "activity-sedentary":
      return {
        component: HouseIcon,
        color: isSelected ? accentColor : "#8A8A8E",
        weight,
      };
    case "activity-light":
      return {
        component: PersonIcon,
        color: isSelected ? accentColor : "#8A8A8E",
        weight,
      };
    case "activity-moderate":
      return {
        component: BicycleIcon,
        color: isSelected ? accentColor : "#8A8A8E",
        weight,
      };
    case "activity-active":
      return {
        component: FlameIcon,
        color: isSelected ? accentColor : "#8A8A8E",
        weight,
      };
    case "activity-veryactive":
      return {
        component: LightningIcon,
        color: isSelected ? accentColor : "#8A8A8E",
        weight,
      };
    default:
      return {
        component: PersonIcon,
        color: isSelected ? accentColor : "#8A8A8E",
        weight,
      };
  }
};

export const SelectionCard: React.FC<SelectionCardProps> = ({
  isSelected,
  onSelect,
  title,
  description,
  icon: CustomIcon,
  iconColor,
  iconType,
  content,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const { colors, colorScheme } = useTheme();
  const styles = createStyles(colors, colorScheme);

  // Determine if this is a simple or complex layout
  const isSimpleLayout = !content && CustomIcon;
  const isComplexLayout = !isSimpleLayout;

  // Press animation shared values
  const pressScale = useSharedValue(1);

  // Press animation styles
  const pressAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  // Determine icon configuration
  let iconConfig: IconConfig;
  if (CustomIcon && iconColor) {
    // Custom icon provided
    iconConfig = {
      component: CustomIcon,
      color: isSelected ? colors.accent : iconColor,
      weight: "bold",
    };
  } else if (iconType) {
    // Predefined icon type
    iconConfig = getPredefinedIcon(iconType, isSelected, colors.accent);
  } else {
    // Fallback
    iconConfig = {
      component: PersonIcon,
      color: isSelected ? colors.accent : colors.secondaryText,
      weight: "regular",
    };
  }

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect();
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

  const IconComponent = iconConfig.component;

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint || description}
      accessibilityState={{ selected: isSelected }}
    >
      <Animated.View
        style={[
          isSimpleLayout ? styles.simpleCard : styles.complexCard,
          isSelected && styles.selectedCard,
          pressAnimatedStyle,
        ]}
      >
        {isSimpleLayout ? (
          // Simple layout: icon container + text
          <>
            <View style={styles.simpleIconContainer}>
              <IconComponent
                size={32}
                color={iconConfig.color}
                weight={iconConfig.weight}
              />
            </View>
            <View style={styles.simpleTextContainer}>
              <Text
                style={[styles.simpleTitle, isSelected && styles.selectedTitle]}
              >
                {title}
              </Text>
              <Text
                style={[
                  styles.simpleDescription,
                  isSelected && styles.selectedDescription,
                ]}
              >
                {description}
              </Text>
            </View>
          </>
        ) : (
          // Complex layout: header + optional content
          <View style={styles.complexContent}>
            <View style={styles.complexHeader}>
              <View style={styles.complexIconContainer}>
                <IconComponent
                  size={24}
                  color={iconConfig.color}
                  weight={iconConfig.weight}
                />
              </View>
              <View style={styles.complexTextContainer}>
                <Text
                  style={[
                    styles.complexTitle,
                    isSelected && styles.selectedTitle,
                  ]}
                >
                  {title}
                </Text>
                <Text style={styles.complexDescription}>{description}</Text>
              </View>
            </View>

            {content && (
              <View style={styles.contentSection}>
                {content.type === "single-calorie" && content.calories && (
                  <View style={styles.singleCalorieContainer}>
                    <Text style={styles.calorieLabel}>Daily Target:</Text>
                    <Text
                      style={[
                        styles.calorieValue,
                        isSelected && styles.selectedCalorieValue,
                      ]}
                    >
                      {content.calories} kcal
                    </Text>
                  </View>
                )}

                {content.type === "multiple-calories" &&
                  content.calorieGoals &&
                  content.showAllGoals && (
                    <View style={styles.multipleCaloriesContainer}>
                      <View style={styles.calorieRow}>
                        <Text style={styles.calorieLabel}>Lose:</Text>
                        <Text
                          style={[
                            styles.calorieValue,
                            isSelected && styles.selectedCalorieValue,
                          ]}
                        >
                          {content.calorieGoals.loseWeight} kcal
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
                          {content.calorieGoals.maintainWeight} kcal
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
                          {content.calorieGoals.gainWeight} kcal
                        </Text>
                      </View>
                    </View>
                  )}
              </View>
            )}
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
};
