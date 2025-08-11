import React, { useMemo } from "react";
import { View, Text, Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from "react-native-reanimated";
import { DailyTargets } from "../../../../types";
import { useTheme } from "../../../../providers/ThemeProvider";
import { createStyles } from "./DailySummaryCard.styles";
import { Badge } from "@/shared/ui";
import { Card } from "../../../../components/Card";
import { AppText } from "src/components";

interface DailySummaryCardProps {
  date: string;
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  targets: DailyTargets;
  onPress: () => void;
}

export function DailySummaryCard({
  date,
  totals,
  targets,
  onPress,
}: DailySummaryCardProps) {
  const { colors, theme, colorScheme } = useTheme();
  const styles = useMemo(
    () => createStyles(colors, theme, colorScheme),
    [colors, theme, colorScheme]
  );

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString + "T00:00:00");
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const dateStr = date.toDateString();
    const todayStr = today.toDateString();
    const yesterdayStr = yesterday.toDateString();

    if (dateStr === todayStr) {
      return `${date.getDate()}. ${date.toLocaleDateString("en-US", {
        month: "short",
      })} ${date.getFullYear()}`;
    } else if (dateStr === yesterdayStr) {
      return `${date.getDate()}. ${date.toLocaleDateString("en-US", {
        month: "short",
      })} ${date.getFullYear()}`;
    } else {
      return `${date.getDate()}. ${date.toLocaleDateString("en-US", {
        month: "short",
      })} ${date.getFullYear()}`;
    }
  };

  // Check if target is met for each nutrient
  const isCaloriesMet = totals.calories >= targets.calories;
  const isProteinMet = totals.protein >= targets.protein;
  const isCarbsMet = totals.carbs >= targets.carbs;
  const isFatMet = totals.fat >= targets.fat;

  // Press animation shared values
  const pressScale = useSharedValue(1);
  const pressBackgroundOpacity = useSharedValue(0);

  // Press animation handlers
  const handlePressIn = () => {
    // Press down animation - scale down and show background tint
    pressScale.value = withTiming(0.96, {
      duration: 150,
      easing: Easing.out(Easing.quad),
    });
    pressBackgroundOpacity.value = withTiming(0.04, {
      duration: 150,
      easing: Easing.out(Easing.quad),
    });
  };

  const handlePressOut = () => {
    // Release animation - spring back and fade background
    pressScale.value = withSpring(1.0, { damping: 22, stiffness: 300 });
    pressBackgroundOpacity.value = withTiming(0, {
      duration: 350,
      easing: Easing.bezier(0.25, 1, 0.5, 1),
    });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  // Animated styles
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  const backgroundAnimatedStyle = useAnimatedStyle(() => ({
    opacity: pressBackgroundOpacity.value,
    backgroundColor: colors.primaryText,
  }));

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityLabel={`Daily summary for ${formatDate(date)}`}
      accessibilityHint="Tap to view detailed nutrition information for this day"
    >
      <Animated.View style={[styles.cardContainer, containerAnimatedStyle]}>
        <Card style={styles.card}>
          <AppText role="Headline">{formatDate(date)}</AppText>
          <View style={styles.badgesRow}>
            <Badge
              variant="semantic"
              semanticType="calories"
              label={`${Math.round((totals.calories / targets.calories) * 100)}%`}
            />
            <Badge
              variant="semantic"
              semanticType="protein"
              label={`${Math.round((totals.protein / targets.protein) * 100)}%`}
            />
            <Badge
              variant="semantic"
              semanticType="carbs"
              label={`${Math.round((totals.carbs / targets.carbs) * 100)}%`}
            />
            <Badge
              variant="semantic"
              semanticType="fat"
              label={`${Math.round((totals.fat / targets.fat) * 100)}%`}
            />
          </View>
        </Card>

        {/* Press background overlay for animation feedback */}
        <Animated.View
          style={[styles.pressOverlay, backgroundAnimatedStyle]}
          pointerEvents="none"
        />
      </Animated.View>
    </Pressable>
  );
}
