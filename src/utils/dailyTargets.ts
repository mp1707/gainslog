import { DailyTargets } from "@/types/models";

/**
 * Checks if daily nutrition targets have been set with at least one value > 0
 * @param targets - The daily targets object to check
 * @returns true if any macro (calories, protein, carbs, or fat) is set to a value > 0
 */
export const hasDailyTargetsSet = (targets?: DailyTargets | null): boolean => {
  if (!targets) return false;

  return (
    (targets.calories ?? 0) > 0 ||
    (targets.protein ?? 0) > 0 ||
    (targets.carbs ?? 0) > 0 ||
    (targets.fat ?? 0) > 0
  );
};

/**
 * Checks if daily nutrition targets have not been set (inverse of hasDailyTargetsSet)
 * @param targets - The daily targets object to check
 * @returns true if no macros are set to a value > 0
 */
export const hasNoDailyTargets = (targets?: DailyTargets | null): boolean => {
  return !hasDailyTargetsSet(targets);
};
