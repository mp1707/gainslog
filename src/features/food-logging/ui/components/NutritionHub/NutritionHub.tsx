import React, { useMemo } from "react";
import { View } from "react-native";
// Make sure to adjust these import paths to match your project structure
import { useTheme } from "@/providers/ThemeProvider"; 
import { DailyProgress } from "@/types";
import { ActivityRing } from "./ActivityRing";
import { CentralDisplay } from "./CentralDisplay";
import { createStyles } from "./NutritionHub.styles";
import Svg from "react-native-svg";

interface NutritionHubProps {
  dailyProgress: DailyProgress;
  size?: number;
  showCenterContent?: boolean;
}

export const NutritionHub: React.FC<NutritionHubProps> = React.memo(({
  dailyProgress,
  size = 300,
  showCenterContent = true,
}) => {
  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(colors, theme, size), [colors, theme, size]);

  // Memoize color calculations to avoid repeated object access
  const ringColors = useMemo(() => ({
    calories: colors.semantic?.calories || colors.accent,
    protein: colors.semantic?.protein || colors.accent,
    carbs: colors.semantic?.carbs || colors.accent,
    fat: colors.semantic?.fat || colors.accent,
  }), [colors.semantic, colors.accent]);

  // Ring configuration from outermost to innermost
  const ringConfig = useMemo(() => {
    const strokeWidth = 18;
    const ringSpacing = 6;
    const baseRadius = (size / 2) - strokeWidth / 2;

    return [
      {
        id: 'calories',
        current: dailyProgress.current.calories || 0,
        target: dailyProgress.targets.calories || 2000,
        percentage: dailyProgress.percentages.calories || 0,
        color: ringColors.calories,
        radius: baseRadius,
        strokeWidth,
        label: 'Calories',
        unit: 'kcal',
      },
      {
        id: 'protein',
        current: dailyProgress.current.protein || 0,
        target: dailyProgress.targets.protein || 150,
        percentage: dailyProgress.percentages.protein || 0,
        color: ringColors.protein,
        radius: baseRadius - (strokeWidth + ringSpacing),
        strokeWidth,
        label: 'Protein',
        unit: 'g',
      },
      {
        id: 'carbs',
        current: dailyProgress.current.carbs || 0,
        target: dailyProgress.targets.carbs || 250,
        percentage: dailyProgress.percentages.carbs || 0,
        color: ringColors.carbs,
        radius: baseRadius - 2 * (strokeWidth + ringSpacing),
        strokeWidth,
        label: 'Carbs',
        unit: 'g',
      },
      {
        id: 'fat',
        current: dailyProgress.current.fat || 0,
        target: dailyProgress.targets.fat || 67,
        percentage: dailyProgress.percentages.fat || 0,
        color: ringColors.fat,
        radius: baseRadius - 3 * (strokeWidth + ringSpacing),
        strokeWidth,
        label: 'Fat',
        unit: 'g',
      },
    ];
  }, [dailyProgress, size, ringColors]);


  const hasValidTargets = useMemo(() => {
    return ringConfig.some(ring => ring.target > 0);
  }, [ringConfig]);

  if (!hasValidTargets) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.ringsContainer}>
        <Svg width={size} height={size}>
          {ringConfig.map((ring, index) => (
            <ActivityRing
              key={ring.id}
              {...ring}
              size={size}
              animationDelay={index * 100}
            />
          ))}
        </Svg>
        
        {showCenterContent && (
          <View style={styles.centerContent}>
            <CentralDisplay
              current={dailyProgress.current.calories}
              target={dailyProgress.targets.calories}
              percentage={dailyProgress.percentages.calories}
            />
          </View>
        )}
      </View>
    </View>
  );
});