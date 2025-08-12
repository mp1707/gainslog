import React, { useMemo } from "react";
import { View, Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from "react-native-reanimated";
import { DailyTargets } from "@/types";
import { useTheme } from "@/providers/ThemeProvider";
import { createStyles } from "./DailySummaryCard.styles";
import { Card } from "@/components/Card";
import { AppText } from "@/components/AppText";
import { useMacroPercentages } from "./useMacroPercentages";
import { DailyMacroBars } from "./DailyMacroBars";

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

  const { percentages } = useMacroPercentages({ totals, targets });

  // Format date like "12. Aug"
  const formatDate = (dateString: string): string => {
    const d = new Date(dateString + "T00:00:00");
    const month = d.toLocaleDateString("en-US", { month: "short" });
    return `${d.getDate()}. ${month}`;
  };

  // Press animation shared values
  const pressScale = useSharedValue(1);
  const pressBackgroundOpacity = useSharedValue(0);

  // Press animation handlers
  const handlePressIn = () => {
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
          <View style={styles.row}>
            <View style={styles.dateColumn}>
              <AppText role="Headline">{formatDate(date)}</AppText>
            </View>
            <DailyMacroBars
              caloriesPercent={percentages.calories}
              proteinPercent={percentages.protein}
              carbsPercent={percentages.carbs}
              fatPercent={percentages.fat}
            />
          </View>
        </Card>

        <Animated.View
          style={[styles.pressOverlay, backgroundAnimatedStyle]}
          pointerEvents="none"
        />
      </Animated.View>
    </Pressable>
  );
}
