import { useCallback } from "react";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import type { NutrientKey } from "../utils/constants";

interface NutrientValues {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

interface UseNutrientNavigationParams {
  totals: NutrientValues;
  targets: NutrientValues;
  percentages: NutrientValues;
}

/**
 * Hook that handles navigation to nutrient explainer pages
 * Includes haptic feedback and query parameter formatting
 */
export const useNutrientNavigation = ({
  totals,
  targets,
  percentages,
}: UseNutrientNavigationParams) => {
  const router = useRouter();

  const handleOpenExplainer = useCallback(
    (nutrient: NutrientKey) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const total = Math.round(totals[nutrient] || 0);
      const target = Math.round(targets[nutrient] || 0);
      const percentage = Math.round(percentages[nutrient] || 0);

      // Navigate to the macro explainer modal (opens at overview page)
      // The overview page allows navigation to individual nutrient pages
      router.push(
        `/explainer-macros?total=${total}&target=${target}&percentage=${percentage}` as any
      );
    },
    [totals, targets, percentages, router]
  );

  return { handleOpenExplainer };
};
