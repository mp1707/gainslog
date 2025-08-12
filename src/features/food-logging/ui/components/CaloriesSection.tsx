import React, { useEffect, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { Card } from "../../../../components/Card";
import { AppText } from "../../../../components/AppText";
import { useTheme } from "../../../../providers/ThemeProvider";

interface DailyProgress {
  current: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
  targets: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
  percentages: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
}

interface CaloriesSectionProps {
  dailyProgress: DailyProgress;
}

export const CaloriesSection: React.FC<CaloriesSectionProps> = React.memo(({
  dailyProgress,
}) => {
  const { theme, colors, colorScheme } = useTheme();

  const caloriesData = {
    current: Math.round(dailyProgress.current.calories),
    target: dailyProgress.targets.calories,
  };

  // Animated style for calories progress bar with design system timing
  const caloriesProgress = useSharedValue(0);

  // Update progress with motivational moment animation
  useEffect(() => {
    caloriesProgress.value = withTiming(
      Math.min(100, dailyProgress.percentages.calories),
      {
        duration: 500,
        easing: Easing.bezier(0.25, 1, 0.5, 1),
      }
    );
  }, [dailyProgress.percentages.calories]);

  const caloriesAnimatedStyle = useAnimatedStyle(() => ({
    width: `${caloriesProgress.value}%`,
  }));

  const styles = useMemo(() => StyleSheet.create({
    container: {
      padding: theme.spacing.lg,
    },
    notDefinedContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    },
    header: {
      color: colors.primaryText,
      marginBottom: theme.spacing.md,
    },
    caloriesContent: {
      gap: theme.spacing.sm,
    },
    caloriesText: {
      color: colors.primaryText,
    },
    progressBarContainer: {
      height: theme.components.progressBars.height,
      backgroundColor:
        theme.getComponentStyles(colorScheme).progressBars.trackColor,
      borderRadius: theme.components.progressBars.cornerRadius,
      overflow: "hidden",
    },
    progressBarFill: {
      height: "100%",
      backgroundColor: colors.semantic?.calories || colors.accent,
      borderRadius: theme.components.progressBars.cornerRadius,
    },
    headerStyle: {
      color: colors.primaryText,
      marginBottom: theme.spacing.md,
    },
  }), [theme, colors, colorScheme]);

  return (
    <View>
      <AppText role="Headline" style={styles.headerStyle}>
        Calories
      </AppText>
      {caloriesData.target === 0 ? (
        <Card style={styles.notDefinedContainer}>
          <AppText role="Caption">
            Define your daily target on the settings tab
          </AppText>
        </Card>
      ) : (
        <Card style={styles.container}>
          <View style={styles.caloriesContent}>
            <AppText role="Headline" style={styles.caloriesText}>
              {caloriesData.current} / {caloriesData.target} kcal
            </AppText>
            <View style={styles.progressBarContainer}>
              <Animated.View
                style={[styles.progressBarFill, caloriesAnimatedStyle]}
              />
            </View>
          </View>
        </Card>
      )}
    </View>
  );
});
