import type { FoodComponent } from "@/types/models";

/**
 * Checks if any food components have ambiguous units that are harder to estimate accurately.
 * Ambiguous units are "piece" and "serving" as they lack standardized measurements.
 * 
 * @param foodComponents - Array of food components to check
 * @returns true if any component has "piece" or "serving" as unit, false otherwise
 */
export const hasAmbiguousUnit = (foodComponents: FoodComponent[]): boolean => {
  return foodComponents.some(
    (component) => component.unit === "piece" || component.unit === "serving"
  );
};