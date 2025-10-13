import { useMemo } from "react";
import { formatDeltaLabel } from "../utils/nutrientFormatters";

interface NutrientValues {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

interface UseNutrientCalculationsParams {
  totals: NutrientValues;
  targets: NutrientValues;
  percentages: NutrientValues;
}

/**
 * Hook that consolidates all nutrient calculation logic
 */
export const useNutrientCalculations = ({
  totals,
  targets,
  percentages,
}: UseNutrientCalculationsParams) => {
  // Delta calculations (remaining or over)
  const caloriesDelta = useMemo(
    () => (targets.calories || 0) - (totals.calories || 0),
    [targets.calories, totals.calories]
  );

  const proteinDelta = useMemo(
    () => (targets.protein || 0) - (totals.protein || 0),
    [targets.protein, totals.protein]
  );

  // Formatted values
  const formattedCaloriesDelta = Math.abs(caloriesDelta);
  const formattedProteinDelta = Math.abs(proteinDelta);

  // Labels for delta display
  const caloriesDeltaLabel = formatDeltaLabel(
    Math.round(totals.calories || 0) >= Math.round(targets.calories || 0)
  );
  const proteinDeltaLabel = formatDeltaLabel(
    Math.round(totals.protein || 0) >= Math.round(targets.protein || 0)
  );

  // Protein completion state
  const isProteinComplete = (percentages.protein || 0) >= 100;

  return {
    // Delta values
    caloriesDelta: formattedCaloriesDelta,
    proteinDelta: formattedProteinDelta,
    caloriesDeltaLabel,
    proteinDeltaLabel,

    // Completion states
    isProteinComplete,
  };
};
