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
  size = 300,
  showCenterContent = true,
}) => {
  const { colors, theme } = useTheme();


  // Ring configuration from outermost to innermost
  const ringConfig = useMemo(() => {
    const strokeWidth = 18; // Wider rings that fit nicely around center content
    const ringSpacing = 6; // Balanced spacing for visual hierarchy
    
    // Calculate radii to center rings around the 120px center content area
    // Start from the outermost ring and work inward
    const centerContentRadius = 60; // Half of 120px center content
    const baseRadius = (size / 2) - strokeWidth / 2; // Start from edge, account for stroke width
    
    return [
      {
        id: 'calories',
        current: Math.max(0, dailyProgress.current.calories || 0),
        target: Math.max(0, dailyProgress.targets.calories || 2000), // Fallback target for testing
        percentage: dailyProgress.targets.calories > 0 
          ? Math.min(100, Math.max(0, dailyProgress.percentages.calories || 0))
          : 75, // Test value
        color: colors.semantic?.calories || colors.accent,
        radius: baseRadius, // Outermost ring
        strokeWidth,
        label: 'Calories',
        unit: 'kcal',
      },
      {
        id: 'protein',
        current: Math.max(0, dailyProgress.current.protein || 0),
        target: Math.max(0, dailyProgress.targets.protein || 150), // Fallback target for testing
        percentage: dailyProgress.targets.protein > 0 
          ? Math.min(100, Math.max(0, dailyProgress.percentages.protein || 0))
          : 60, // Test value
        color: colors.semantic?.protein || colors.accent,
        radius: baseRadius - (strokeWidth + ringSpacing), // Second ring
        strokeWidth,
        label: 'Protein',
        unit: 'g',
      },
      {
        id: 'carbs',
        current: Math.max(0, dailyProgress.current.carbs || 0),
        target: Math.max(0, dailyProgress.targets.carbs || 250), // Fallback target for testing
        percentage: dailyProgress.targets.carbs > 0 
          ? Math.min(100, Math.max(0, dailyProgress.percentages.carbs || 0))
          : 45, // Test value
        color: colors.semantic?.carbs || colors.accent,
        radius: baseRadius - 2 * (strokeWidth + ringSpacing), // Third ring
        strokeWidth,
        label: 'Carbs',
        unit: 'g',
      },
      {
        id: 'fat',
        current: Math.max(0, dailyProgress.current.fat || 0),
        target: Math.max(0, dailyProgress.targets.fat || 67), // Fallback target for testing
        percentage: dailyProgress.targets.fat > 0 
          ? Math.min(100, Math.max(0, dailyProgress.percentages.fat || 0))
          : 30, // Test value
        color: colors.semantic?.fat || colors.accent,
        radius: Math.max(baseRadius - 3 * (strokeWidth + ringSpacing), centerContentRadius + 10), // Innermost ring, ensure it's outside center content
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