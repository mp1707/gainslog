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
import type { Icon } from "phosphor-react-native";

import { useTheme } from "@/providers/ThemeProvider";
import { createStyles } from "./SelectionCard.styles";
import type { CalorieGoals } from "@/types";

export interface SelectionCardProps {
  // Core functionality
  isSelected: boolean;
  onSelect: () => void;
  title: string;
  description: string;

  // Icon (required)
  icon: Icon;
  iconColor: string;

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


export const SelectionCard: React.FC<SelectionCardProps> = ({
  isSelected,
  onSelect,
  title,
  description,
  icon,
  iconColor,
  content,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const { colors, colorScheme } = useTheme();
  const styles = createStyles(colors, colorScheme);

  // Determine if this is a simple or complex layout
  const isSimpleLayout = !content && icon;

  // Press animation shared values
  const pressScale = useSharedValue(1);

  // Press animation styles
  const pressAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  // Icon configuration
  const finalIconColor = isSelected ? colors.accent : iconColor;

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

  const IconComponent = icon;

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
              <IconComponent size={32} color={finalIconColor} />
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
                <IconComponent size={24} color={finalIconColor} />
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
