import { Droplet, Flame, BicepsFlexed, Zap } from "lucide-react-native";

/**
 * Animation delay constants for staggered animations
 */
export const ANIMATION_DELAYS = {
  /** Base delay before dashboard animations start (allows LogCard animations to complete) */
  BASE_DELAY: 350,
  /** Delay between ring animations (400ms per ring) */
  RING_STAGGER: 400,
  /** Delay for fat total animation (after both rings) */
  FAT_STAT: 800,
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
 * Display configuration shared across all nutrient labels
 */
export const NUTRIENT_LABELS = {
  calories: {
    label: "Calories",
    unit: "kcal",
    Icon: Flame,
    hasTarget: true,
  },
  protein: {
    label: "Protein",
    unit: "grams",
    Icon: BicepsFlexed,
    hasTarget: true,
  },
  fat: {
    label: "Fat",
    unit: "g",
    Icon: Droplet,
    hasTarget: true,
  },
  carbs: {
    label: "Carbs",
    unit: "g",
    Icon: Zap,
    hasTarget: false,
  },
} as const;

/**
 * Configuration for ring nutrients (calories and protein)
 * These are displayed as circular progress rings
 */
export const RING_CONFIG = [
  {
    key: "calories" as const,
    ...NUTRIENT_LABELS.calories,
  },
  {
    key: "protein" as const,
    ...NUTRIENT_LABELS.protein,
  },
] as const;

/**
 * Type for nutrient keys
 */
export type NutrientKey = keyof typeof NUTRIENT_LABELS;
