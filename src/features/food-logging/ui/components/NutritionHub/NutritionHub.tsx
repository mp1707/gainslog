import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { DailyProgress } from "@/types";
import { ActivityRing } from "./ActivityRing";
import { CentralDisplay } from "./CentralDisplay";

interface NutritionHubProps {
  dailyProgress: DailyProgress;
  size?: number;
  showCenterContent?: boolean;
}

export const NutritionHub: React.FC<NutritionHubProps> = React.memo(({
  dailyProgress,
  size = 200,
  showCenterContent = true,
}) => {
  const { colors, theme } = useTheme();

  // Ring configuration from outermost to innermost
  const ringConfig = useMemo(() => {
    const strokeWidth = Math.max(theme.components.progressBars.height, 4);
    const ringSpacing = 4;
    
    // Ensure safe radius calculations
    const baseRadius = Math.max((size - strokeWidth) / 2, strokeWidth + ringSpacing);
    
    return [
      {
        id: 'calories',
        current: Math.max(0, dailyProgress.current.calories || 0),
        target: Math.max(0, dailyProgress.targets.calories || 0),
        percentage: Math.min(100, Math.max(0, dailyProgress.percentages.calories || 0)),
        color: colors.semantic?.calories || colors.accent,
        radius: Math.max(baseRadius - 0 * (strokeWidth + ringSpacing), strokeWidth),
        strokeWidth,
        label: 'Calories',
        unit: 'kcal',
      },
      {
        id: 'protein',
        current: Math.max(0, dailyProgress.current.protein || 0),
        target: Math.max(0, dailyProgress.targets.protein || 0),
        percentage: Math.min(100, Math.max(0, dailyProgress.percentages.protein || 0)),
        color: colors.semantic?.protein || colors.accent,
        radius: Math.max(baseRadius - 1 * (strokeWidth + ringSpacing), strokeWidth),
        strokeWidth,
        label: 'Protein',
        unit: 'g',
      },
      {
        id: 'carbs',
        current: Math.max(0, dailyProgress.current.carbs || 0),
        target: Math.max(0, dailyProgress.targets.carbs || 0),
        percentage: Math.min(100, Math.max(0, dailyProgress.percentages.carbs || 0)),
        color: colors.semantic?.carbs || colors.accent,
        radius: Math.max(baseRadius - 2 * (strokeWidth + ringSpacing), strokeWidth),
        strokeWidth,
        label: 'Carbs',
        unit: 'g',
      },
      {
        id: 'fat',
        current: Math.max(0, dailyProgress.current.fat || 0),
        target: Math.max(0, dailyProgress.targets.fat || 0),
        percentage: Math.min(100, Math.max(0, dailyProgress.percentages.fat || 0)),
        color: colors.semantic?.fat || colors.accent,
        radius: Math.max(baseRadius - 3 * (strokeWidth + ringSpacing), strokeWidth),
        strokeWidth,
        label: 'Fat',
        unit: 'g',
      },
    ];
  }, [dailyProgress, size, colors, theme]);

  const styles = useMemo(() => StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.lg,
    },
    ringsContainer: {
      position: 'relative',
      width: size,
      height: size,
      alignItems: 'center',
      justifyContent: 'center',
    },
    centerContent: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
    },
  }), [size, theme]);

  // Check if any targets are defined
  const hasValidTargets = useMemo(() => {
    return ringConfig.some(ring => ring.target > 0);
  }, [ringConfig]);

  if (!hasValidTargets) {
    return null; // Let the existing sections handle the "no targets" state
  }

  return (
    <View style={styles.container}>
      <View style={styles.ringsContainer}>
        {ringConfig.map((ring, index) => (
          <ActivityRing
            key={ring.id}
            {...ring}
            size={size}
            animationDelay={index * 100} // Staggered animation
          />
        ))}
        
        {showCenterContent && (
          <View style={styles.centerContent}>
            <CentralDisplay
              current={Math.round(dailyProgress.current.calories)}
              target={dailyProgress.targets.calories}
              percentage={dailyProgress.percentages.calories}
            />
          </View>
        )}
      </View>
    </View>
  );
});