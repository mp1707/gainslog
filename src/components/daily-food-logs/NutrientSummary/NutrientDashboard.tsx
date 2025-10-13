import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { Theme, useTheme } from "@/theme";
import { SetGoalsCTA } from "./SetGoalsCTA";
import { RingStatItem } from "./components/RingStatItem";
import { NutrientLabelItem } from "./components/NutrientLabelItem";
import { useNutrientCalculations } from "./hooks/useNutrientCalculations";
import { useNutrientAnimations } from "./hooks/useNutrientAnimations";
import { useNutrientNavigation } from "./hooks/useNutrientNavigation";
import {
  RING_CONFIG,
  NUTRIENT_LABELS,
  ANIMATION_DELAYS,
  type NutrientKey,
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

const COLUMNS: Array<{
  ringKey: "calories" | "protein";
  labels: NutrientKey[];
}> = [
  {
    ringKey: "calories",
    labels: ["calories", "fat"],
  },
  {
    ringKey: "protein",
    labels: ["protein", "carbs"],
  },
];

/**
 * Dashboard displaying nutrient intake progress with ring and label visualizations.
 */
export const NutrientDashboard: React.FC<NutrientDashboardProps> = ({
  percentages,
  targets,
  totals,
}) => {
  const hasNoGoals =
    (targets.calories || 0) === 0 &&
    (targets.protein || 0) === 0 &&
    (targets.carbs || 0) === 0 &&
    (targets.fat || 0) === 0;

  if (hasNoGoals) {
    return <SetGoalsCTA />;
  }

  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

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

  const calculations = useNutrientCalculations({ totals, targets, percentages });

  const animations = useNutrientAnimations({
    totals,
    percentages,
    caloriesDelta: calculations.caloriesDelta,
    proteinDelta: calculations.proteinDelta,
    isProteinComplete: calculations.isProteinComplete,
  });

  const { handleOpenExplainer } = useNutrientNavigation({
    totals,
    targets,
    percentages,
  });

  const animatedTotals: Record<NutrientKey, number> = {
    calories: animations.animatedCaloriesTotal,
    protein: animations.animatedProteinTotal,
    fat: animations.animatedFatTotal,
    carbs: animations.animatedCarbsTotal,
  };

  const labelTargets: Partial<Record<NutrientKey, number>> = {
    calories: Math.round(targets.calories || 0),
    protein: Math.round(targets.protein || 0),
    fat: Math.round(targets.fat || 0),
  };

  return (
    <View style={styles.container}>
      <View style={styles.columns}>
        {COLUMNS.map((column) => {
          const ringConfig = RING_CONFIG.find((item) => item.key === column.ringKey)!;
          const ringPercentage = percentages[column.ringKey] || 0;
          const deltaValue =
            column.ringKey === "calories"
              ? animations.animatedCaloriesDelta
              : animations.animatedProteinDelta;
          const deltaLabel =
            column.ringKey === "calories"
              ? calculations.caloriesDeltaLabel
              : calculations.proteinDeltaLabel;
          const chevronIcon = getChevronIcon(ringPercentage);
          const isProteinComplete =
            column.ringKey === "protein" && calculations.isProteinComplete;

          return (
            <View key={column.ringKey} style={styles.column}>
              <View style={styles.ringWrapper}>
                <RingStatItem
                  label={ringConfig.label}
                  percentage={ringPercentage}
                  deltaValue={deltaValue}
                  deltaLabel={deltaLabel}
                  ringColor={semanticColors[column.ringKey]}
                  trackColor={surfaceColors[column.ringKey]}
                  textColor={colors.primaryText}
                  ChevronIcon={chevronIcon}
                  animationDelay={
                    column.ringKey === "calories" ? 0 : ANIMATION_DELAYS.RING_STAGGER
                  }
                  skipAnimation={animations.dateChanged}
                  onPress={() => handleOpenExplainer(column.ringKey)}
                />
              </View>

              {column.labels.map((labelKey) => {
                const config = NUTRIENT_LABELS[labelKey];
                const IconComponent =
                  labelKey === "protein"
                    ? getNutrientIcon(config.Icon, calculations.isProteinComplete, "protein")
                    : config.Icon;
                const targetValue = config.hasTarget ? labelTargets[labelKey] ?? 0 : null;
                const iconFill =
                  labelKey === "protein" && calculations.isProteinComplete
                    ? surfaceColors.protein
                    : semanticColors[labelKey];
                const iconStrokeWidth =
                  labelKey === "protein" && calculations.isProteinComplete ? 2 : 0;

                return (
                  <NutrientLabelItem
                    key={labelKey}
                    Icon={IconComponent}
                    iconScale={labelKey === "protein" ? animations.proteinIconScale : undefined}
                    iconColor={semanticColors[labelKey]}
                    iconFill={iconFill}
                    iconStrokeWidth={iconStrokeWidth}
                    label={config.label}
                    currentValue={animatedTotals[labelKey]}
                    targetValue={config.hasTarget ? targetValue : null}
                    unit={config.unit}
                    onPress={() => handleOpenExplainer(labelKey)}
                  />
                );
              })}
            </View>
          );
        })}
      </View>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      padding: theme.spacing.md,
      paddingTop: theme.spacing.xs,
    },
    columns: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: theme.spacing.lg,
    },
    column: {
      flex: 1,
      gap: theme.spacing.lg,
    },
    ringWrapper: {
      alignItems: "center",
    },
  });
