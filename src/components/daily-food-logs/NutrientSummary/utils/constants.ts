import {
  Droplet,
  Flame,
  BicepsFlexed,
  Zap,
} from "lucide-react-native";

/**
 * Animation delay constants for staggered animations
 */
export const ANIMATION_DELAYS = {
  /** Delay between ring animations (400ms per ring) */
  RING_STAGGER: 400,
  /** Delay for fat stat animation (after both rings) */
  FAT_STAT: 800,
  /** Delay for carbs stat animation (same as fat for simultaneous animation) */
  CARBS_STAT: 800,
} as const;

/**
 * Snappier spring config for icon check animations
 * Used when nutrients reach their target values
 */
export const ICON_SPRING_CONFIG = {
  mass: 0.8,
  damping: 15,
  stiffness: 400,
} as const;

/**
 * Fat macro calculation constants
 * Based on percentage of total calorie intake
 */
export const FAT_CALCULATION = {
  /** Minimum fat percentage (20% of calories) */
  MIN_PERCENTAGE: 0.20,
  /** Maximum fat percentage (35% of calories) */
  MAX_PERCENTAGE: 0.35,
  /** Calories per gram of fat */
  CALORIES_PER_GRAM: 9,
} as const;

/**
 * Configuration for ring nutrients (calories and protein)
 * These are displayed as circular progress rings
 */
export const RING_CONFIG = [
  {
    key: "calories" as const,
    label: "Calories",
    unit: "kcal",
    Icon: Flame,
    hasTarget: true,
  },
  {
    key: "protein" as const,
    label: "Protein",
    unit: "g",
    Icon: BicepsFlexed,
    hasTarget: true,
  },
] as const;

/**
 * Configuration for secondary stats (fat and carbs)
 * These are displayed as horizontal progress bars
 */
export const SECONDARY_STATS = [
  {
    key: "fat" as const,
    label: "Fat",
    unit: "g",
    Icon: Droplet,
    hasTarget: true,
  },
  {
    key: "carbs" as const,
    label: "Carbs",
    unit: "g",
    Icon: Zap,
    hasTarget: false,
  },
] as const;

/**
 * Type for nutrient keys
 */
export type NutrientKey = "calories" | "protein" | "carbs" | "fat";
