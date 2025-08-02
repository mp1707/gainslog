import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Card } from '../../../../../components/Card';
import { AppText } from '../../../../../components/AppText';
import { RadialProgressBar } from '../../../../../shared/ui/atoms/RadialProgressBar';
import { useTheme } from '../../../../../providers/ThemeProvider';
import { createStyles } from './NutritionProgressCard.styles';

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

interface NutritionProgressCardProps {
  dailyProgress: DailyProgress;
}

export const NutritionProgressCard: React.FC<NutritionProgressCardProps> = ({
  dailyProgress,
}) => {
  const { theme, colors } = useTheme();
  const styles = createStyles(colors, theme);
  
  // Prepare nutrition data
  const caloriesData = {
    current: Math.round(dailyProgress.current.calories),
    target: dailyProgress.targets.calories,
    unit: "",
    label: "Calories",
  };

  const proteinData = {
    current: Math.round(dailyProgress.current.protein),
    target: dailyProgress.targets.protein,
    unit: "g",
    label: "Protein",
  };

  const fatData = {
    current: Math.round(dailyProgress.current.fat),
    target: dailyProgress.targets.fat,
    unit: "g",
    label: "Fat",
  };

  const carbsData = {
    current: Math.round(dailyProgress.current.carbs),
    target: dailyProgress.targets.carbs,
    unit: "g",
    label: "Carbs",
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

  return (
    <Card style={{ padding: theme.spacing.lg }}>
      <View style={styles.container}>
        {/* Calories Section */}
        <View style={styles.caloriesSection}>
          <AppText role="Title2" style={styles.caloriesTitle}>
            {caloriesData.label}
          </AppText>
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
        </View>

        {/* Subtle Separator */}
        <View style={styles.separator} />

        {/* Macros Section */}
        <View style={styles.macrosSection}>
          <AppText role="Headline" style={styles.macrosTitle}>
            Macronutrients
          </AppText>
          <View style={styles.macrosGrid}>
            <View style={styles.macroItem}>
              <RadialProgressBar
                current={proteinData.current}
                target={proteinData.target}
                unit={proteinData.unit}
                label={proteinData.label}
                size={88}
              />
            </View>
            <View style={styles.macroItem}>
              <RadialProgressBar
                current={fatData.current}
                target={fatData.target}
                unit={fatData.unit}
                label={fatData.label}
                size={88}
              />
            </View>
            <View style={styles.macroItem}>
              <RadialProgressBar
                current={carbsData.current}
                target={carbsData.target}
                unit={carbsData.unit}
                label={carbsData.label}
                size={88}
              />
            </View>
          </View>
        </View>
      </View>
    </Card>
  );
};