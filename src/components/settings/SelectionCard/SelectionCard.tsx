import React, { useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from "react-native-reanimated";
import type { LucideIcon } from "lucide-react-native";

import { useTheme, theme } from "@/theme";
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
  const selectedProgress = useSharedValue(isSelected ? 1 : 0);

  // Update selected progress when isSelected changes
  useEffect(() => {
    selectedProgress.value = withSpring(isSelected ? 1 : 0, {
      damping: 20,
      stiffness: 300,
    });
  }, [isSelected, selectedProgress]);

  // Press animation styles
  const pressAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  // Icon container animation style
  const iconContainerAnimatedStyle = useAnimatedStyle(() => {
    const backgroundColor =
      colorScheme === "dark"
        ? `${colors.accent}${Math.round(selectedProgress.value * 26)
            .toString(16)
            .padStart(2, "0")}` // 0-26 (0x00-0x1A, ~10%)
        : `${colors.accent}${Math.round(selectedProgress.value * 20)
            .toString(16)
            .padStart(2, "0")}`; // 0-20 (0x00-0x14, ~8%)

    return {
      backgroundColor:
        selectedProgress.value > 0 ? backgroundColor : colors.primaryBackground,
    };
  });

  // Icon configuration
  const finalIconColor = isSelected ? colors.accent : iconColor;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect();
  };

  const handlePressIn = () => {
    pressScale.value = withTiming(theme.interactions.press.scale, {
      duration: theme.interactions.press.timing.duration,
      easing: theme.interactions.press.timing.easing,
    });
  };

  const handlePressOut = () => {
    pressScale.value = withSpring(1.0, {
      damping: theme.interactions.press.spring.damping,
      stiffness: theme.interactions.press.spring.stiffness,
    });
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
            <Animated.View
              style={[styles.iconContainer, iconContainerAnimatedStyle]}
            >
              <IconComponent size={24} color={finalIconColor} />
            </Animated.View>
            <View style={styles.textContainer}>
              <Text style={[styles.title, isSelected && styles.selectedTitle]}>
                {title}
              </Text>
              {description && (
                <Text style={styles.description}>{description}</Text>
              )}
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
