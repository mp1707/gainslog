import type { FoodComponent } from "@/types/models";

/**
 * Checks if any food components need refinement.
 *
 * @param foodComponents - Array of food components to check
 * @returns true if any component has needsRefinement set to true, false otherwise
 */
export const needsRefinement = (foodComponents: FoodComponent[]): boolean => {
  return foodComponents.some((component) => component.needsRefinement);
};