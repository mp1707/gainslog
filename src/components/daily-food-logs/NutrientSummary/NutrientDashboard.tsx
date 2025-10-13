import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { Flame, BicepsFlexed, Droplet, Zap } from "lucide-react-native";
import { Theme, useTheme } from "@/theme";
import { SetGoalsCTA } from "./SetGoalsCTA";
import { NutrientCard } from "./components/NutrientCard";
import { useNutrientCalculations } from "./hooks/useNutrientCalculations";
import { useNutrientAnimations } from "./hooks/useNutrientAnimations";
import { useNutrientNavigation } from "./hooks/useNutrientNavigation";
import { ANIMATION_DELAYS } from "./utils/constants";
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
 * Dashboard displaying nutrient intake progress with unified card architecture
 *
 * Features:
 * - 4 self-contained cards in 2x2 grid
 * - Top 2 cards (calories/protein) contain progress rings
 * - Bottom 2 cards (fat/carbs) show icon only
 * - Consistent vertical layout: ring → icon → label → values
 * - Each card is a perfect tap target
 * - Clear visual hierarchy following Apple HIG
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
      {/* Row 1: Calories & Protein Cards (with rings) */}
      <View style={styles.row}>
        {/* Calories Card */}
        <NutrientCard
          nutrientKey="calories"
          showRing={true}
          ringPercentage={percentages.calories || 0}
          ringColor={semanticColors.calories}
          ringTrackColor={surfaceColors.calories}
          ringDeltaValue={animations.animatedCaloriesDelta}
          ringDeltaLabel={calculations.caloriesDeltaLabel}
          ringChevronIcon={getChevronIcon(percentages.calories || 0)}
          ringAnimationDelay={0}
          ringSkipAnimation={animations.dateChanged}
          Icon={Flame}
          iconColor={semanticColors.calories}
          iconFill={semanticColors.calories}
          iconStrokeWidth={0}
          iconScale={animations.proteinIconScale}
          label="Calories"
          currentValue={animations.animatedCaloriesTotal}
          targetValue={Math.round(targets.calories || 0)}
          unit="kcal"
          hasTarget={true}
          onPress={() => handleOpenExplainer("calories")}
        />

        {/* Protein Card */}
        <NutrientCard
          nutrientKey="protein"
          showRing={true}
          ringPercentage={percentages.protein || 0}
          ringColor={semanticColors.protein}
          ringTrackColor={surfaceColors.protein}
          ringDeltaValue={animations.animatedProteinDelta}
          ringDeltaLabel={calculations.proteinDeltaLabel}
          ringChevronIcon={getChevronIcon(percentages.protein || 0)}
          ringAnimationDelay={ANIMATION_DELAYS.RING_STAGGER}
          ringSkipAnimation={animations.dateChanged}
          Icon={
            calculations.isProteinComplete
              ? getNutrientIcon(BicepsFlexed, true, "protein")
              : BicepsFlexed
          }
          iconColor={semanticColors.protein}
          iconFill={
            calculations.isProteinComplete
              ? surfaceColors.protein
              : semanticColors.protein
          }
          iconStrokeWidth={calculations.isProteinComplete ? 2 : 0}
          iconScale={animations.proteinIconScale}
          label="Protein"
          currentValue={animations.animatedProteinTotal}
          targetValue={Math.round(targets.protein || 0)}
          unit="g"
          hasTarget={true}
          onPress={() => handleOpenExplainer("protein")}
        />
      </View>

      {/* Row 2: Fat & Carbs Cards (icon only) */}
      <View style={styles.row}>
        {/* Fat Card */}
        <NutrientCard
          nutrientKey="fat"
          showRing={false}
          Icon={
            calculations.fatIconState === "complete"
              ? getNutrientIcon(Droplet, true, "fat")
              : Droplet
          }
          iconColor={semanticColors.fat}
          iconFill={
            calculations.fatIconState === "complete"
              ? surfaceColors.fat
              : semanticColors.fat
          }
          iconStrokeWidth={calculations.fatIconState === "complete" ? 2 : 0}
          iconScale={animations.fatIconScale}
          label="Fat"
          currentValue={animations.animatedFatTotal}
          targetValue={Math.round(targets.fat || 0)}
          unit="g"
          hasTarget={true}
          onPress={() => handleOpenExplainer("fat")}
        />

        {/* Carbs Card */}
        <NutrientCard
          nutrientKey="carbs"
          showRing={false}
          Icon={Zap}
          iconColor={semanticColors.carbs}
          iconFill={semanticColors.carbs}
          iconStrokeWidth={0}
          iconScale={animations.fatIconScale}
          label="Carbs"
          currentValue={animations.animatedCarbsTotal}
          targetValue={Math.round(targets.carbs || 0)}
          unit="g"
          hasTarget={false}
          onPress={() => handleOpenExplainer("carbs")}
        />
      </View>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: theme.spacing.md,
      gap: theme.spacing.md,
      marginTop: theme.spacing.xs,
      // marginBottom: theme.spacing.md,
    },
    row: {
      flexDirection: "row",
      gap: theme.spacing.md,
    },
  });
