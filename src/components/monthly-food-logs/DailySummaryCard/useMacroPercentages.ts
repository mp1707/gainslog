import { useMemo } from "react";

interface Totals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface Targets extends Totals {}

export const useMacroPercentages = ({
  totals,
  targets,
}: {
  totals: Totals;
  targets: Targets;
}) => {
  const percentages = useMemo(() => {
    const safePercent = (value: number, target: number) => {
      if (!target || target <= 0) return 0;
      return Math.min(1000, (value / target) * 100); // allow showing >100 in badge logic if needed later
    };

    return {
      calories: safePercent(totals.calories, targets.calories),
      protein: safePercent(totals.protein, targets.protein),
      carbs: safePercent(totals.carbs, targets.carbs),
      fat: safePercent(totals.fat, targets.fat),
    };
  }, [totals, targets]);

  return { percentages } as const;
};
