import { FoodComponent } from "@/types/models";
import { hasAmbiguousUnit as hasAmbiguousUnitCheck } from "@/utils/hasAmbiguousUnit";
import { needsRefinement as needsRefinementCheck } from "@/utils/needsRefinement";

export const getRefinementInfo = (
  foodComponents: FoodComponent[]
): string | undefined => {
  const needsRefinement =
    foodComponents && needsRefinementCheck(foodComponents);

  if (!needsRefinement) return undefined;

  const hasAmbiguousUnit =
    foodComponents && hasAmbiguousUnitCheck(foodComponents);

  if (hasAmbiguousUnit) return "Use precise units";

  return "Confirm amounts";
};

export const getRefinementInfoDetailed = (
  foodComponents: FoodComponent[]
): string | undefined => {
  const hasAmbiguousUnit =
    foodComponents && hasAmbiguousUnitCheck(foodComponents);

  if (hasAmbiguousUnit)
    return "Use precise units to increase estimation accuracy";

  return "Confirm amounts to increase estimation accuracy";
};
