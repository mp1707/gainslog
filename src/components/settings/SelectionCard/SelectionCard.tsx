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
import type { LucideIcon } from "lucide-react-native";

import { useTheme } from "@/theme";
import { createStyles } from "./SelectionCard.styles";

export interface SelectionCardProps {
  // Core functionality
  isSelected: boolean;
  onSelect: () => void;
  title: string;
  description: string;

  // Icon (required)
  icon: LucideIcon;
  iconColor: string;

  // Optional content section
  dailyTarget?: {
    value: number;
    unit: string;
    label: string;
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
  dailyTarget,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const { colors, colorScheme } = useTheme();
  const styles = createStyles(colors, colorScheme);

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
          styles.card,
          isSelected && styles.selectedCard,
          pressAnimatedStyle,
        ]}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <IconComponent size={24} color={finalIconColor} />
            </View>
            <View style={styles.textContainer}>
              <Text
                style={[
                  styles.title,
                  isSelected && styles.selectedTitle,
                ]}
              >
                {title}
              </Text>
              <Text style={styles.description}>{description}</Text>
            </View>
          </View>

          {dailyTarget && (
            <View style={styles.targetSection}>
              <Text style={styles.targetLabel}>{dailyTarget.label}:</Text>
              <Text
                style={[
                  styles.targetValue,
                  isSelected && styles.selectedTargetValue,
                ]}
              >
                {dailyTarget.value} {dailyTarget.unit}
              </Text>
            </View>
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
};
