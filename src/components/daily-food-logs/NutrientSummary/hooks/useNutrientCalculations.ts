import { useMemo } from "react";

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
  // Protein completion state
  const isProteinComplete = (percentages.protein || 0) >= 100;

  return {
    isProteinComplete,
  };
};
