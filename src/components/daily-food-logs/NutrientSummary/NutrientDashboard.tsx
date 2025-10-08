import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { Theme, useTheme } from "@/theme";
import { SetGoalsCTA } from "./SetGoalsCTA";
import { RingStatItem } from "./components/RingStatItem";
import { SecondaryStatItem } from "./components/SecondaryStatItem";
import { useNutrientCalculations } from "./hooks/useNutrientCalculations";
import { useNutrientAnimations } from "./hooks/useNutrientAnimations";
import { useNutrientNavigation } from "./hooks/useNutrientNavigation";
import {
  RING_CONFIG,
  SECONDARY_STATS,
  ANIMATION_DELAYS,
} from "./utils/constants";
import { getChevronIcon, getNutrientIcon } from "./utils/nutrientFormatters";

interface NutrientValues {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

interface NutrientDashboardProps {
  percentages: NutrientValues;
  targets: NutrientValues;
  totals: NutrientValues;
}

/**
 * Dashboard displaying nutrient intake progress with ring and bar visualizations
 *
 * Features:
 * - Ring displays for calories and protein (primary metrics)
 * - Bar displays for fat and carbs (secondary metrics)
 * - Animated number reveals and progress indicators
 * - Press feedback and navigation to explainer pages
 * - Smart icon states (completion checkmarks, warning indicators)
 */
export const NutrientDashboard: React.FC<NutrientDashboardProps> = ({
  percentages,
  targets,
  totals,
}) => {
  // Check if there are no goals BEFORE any hooks
  const hasNoGoals =
    (targets.calories || 0) === 0 &&
    (targets.protein || 0) === 0 &&
    (targets.carbs || 0) === 0 &&
    (targets.fat || 0) === 0;

  // Early return before hooks if no goals are set
  if (hasNoGoals) {
    return <SetGoalsCTA />;
  }

  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Semantic colors
  const semanticColors = useMemo(
    () => ({
      calories: colors.semantic.calories,
      protein: colors.semantic.protein,
      carbs: colors.semantic.carbs,
      fat: colors.semantic.fat,
    }),
    [colors]
  );

  const surfaceColors = useMemo(
    () => ({
      calories: colors.semanticSurfaces.calories,
      protein: colors.semanticSurfaces.protein,
      carbs: colors.semanticSurfaces.carbs,
      fat: colors.semanticSurfaces.fat,
    }),
    [colors]
  );

  // Custom hooks for separated concerns
  const calculations = useNutrientCalculations({ totals, targets, percentages });

  const animations = useNutrientAnimations({
    totals,
    targets,
    percentages,
    caloriesDelta: calculations.caloriesDelta,
    proteinDelta: calculations.proteinDelta,
    fatPercentage: calculations.fatPercentage,
    carbsPercentage: calculations.carbsPercentage,
    isProteinComplete: calculations.isProteinComplete,
    fatIconState: calculations.fatIconState,
  });

  const { handleOpenExplainer } = useNutrientNavigation({
    totals,
    targets,
    percentages,
  });

  return (
    <View style={styles.container}>
      {/* Ring Stats (Calories & Protein) */}
      <View style={styles.ringsRow}>
        {RING_CONFIG.map((config, index) => {
          const percentage = percentages[config.key] || 0;
          const currentValue =
            config.key === "calories"
              ? animations.animatedCaloriesTotal
              : animations.animatedProteinTotal;
          const targetValue = Math.round(targets[config.key] || 0);
          const deltaValue =
            config.key === "calories"
              ? animations.animatedCaloriesDelta
              : animations.animatedProteinDelta;
          const deltaLabel =
            config.key === "calories"
              ? calculations.caloriesDeltaLabel
              : calculations.proteinDeltaLabel;

          const ChevronIcon = getChevronIcon(percentage);
          const isComplete = calculations.isProteinComplete && config.key === "protein";
          const LabelIcon = getNutrientIcon(config.Icon, isComplete, config.key);

          const iconScale =
            config.key === "protein"
              ? animations.proteinIconScale
              : animations.proteinIconScale; // Use same for now

          return (
            <RingStatItem
              key={config.key}
              nutrientKey={config.key}
              label={config.label}
              percentage={percentage}
              currentValue={currentValue}
              targetValue={targetValue}
              deltaValue={deltaValue}
              deltaLabel={deltaLabel}
              ringColor={semanticColors[config.key]}
              trackColor={surfaceColors[config.key]}
              textColor={colors.primaryText}
              ChevronIcon={ChevronIcon}
              LabelIcon={LabelIcon}
              iconColor={semanticColors[config.key]}
              iconFill={
                isComplete
                  ? surfaceColors[config.key]
                  : semanticColors[config.key]
              }
              iconStrokeWidth={isComplete ? 2 : 0}
              iconScale={iconScale}
              animationDelay={index * ANIMATION_DELAYS.RING_STAGGER}
              skipAnimation={animations.dateChanged}
              onPress={() => handleOpenExplainer(config.key)}
            />
          );
        })}
      </View>

      {/* Secondary Stats (Fat & Carbs) */}
      <View style={styles.statsContainer}>
        {SECONDARY_STATS.map((config) => {
          const currentValue =
            config.key === "fat"
              ? animations.animatedFatTotal
              : animations.animatedCarbsTotal;
          const targetValue = Math.round(targets[config.key] || 0);
          const progressValue =
            config.key === "fat" ? animations.fatProgress : animations.carbsProgress;

          const iconScale =
            config.key === "fat"
              ? animations.fatIconScale
              : animations.fatIconScale; // Carbs doesn't animate

          const fatRangeLabel =
            config.key === "fat" ? calculations.fatRangeLabel : null;
          const fatIconState =
            config.key === "fat" ? calculations.fatIconState : undefined;

          return (
            <SecondaryStatItem
              key={config.key}
              nutrientKey={config.key}
              Icon={config.Icon}
              label={config.label}
              currentValue={currentValue}
              targetValue={targetValue}
              hasTarget={config.hasTarget}
              iconColor={semanticColors[config.key]}
              iconFill={semanticColors[config.key]}
              iconScale={iconScale}
              progressValue={progressValue}
              progressFillColor={semanticColors[config.key]}
              progressTrackColor={surfaceColors[config.key]}
              fatRangeLabel={fatRangeLabel}
              fatIconState={fatIconState}
              warningColor={colors.warning}
              warningBackgroundColor={colors.warningBackground}
              onPress={() => handleOpenExplainer(config.key)}
            />
          );
        })}
      </View>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: theme.spacing.md,
      gap: theme.spacing.lg,
      marginTop: theme.spacing.xs,
    },
    ringsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: theme.spacing.lg,
    },
    statsContainer: {
      gap: theme.spacing.md,
      marginBottom: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
    },
  });
