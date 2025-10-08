import { useEffect, useRef } from "react";
import {
  useSharedValue,
  withDelay,
  withSpring,
} from "react-native-reanimated";
import { useNumberReveal, SPRING_CONFIG } from "@/hooks/useAnimationConfig";
import { useAppStore } from "@/store/useAppStore";
import { ANIMATION_DELAYS, ICON_SPRING_CONFIG } from "../utils/constants";

interface NutrientValues {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

interface UseNutrientAnimationsParams {
  totals: NutrientValues;
  targets: NutrientValues;
  percentages: NutrientValues;
  caloriesDelta: number;
  proteinDelta: number;
  fatPercentage: number;
  carbsPercentage: number;
  isProteinComplete: boolean;
  fatIconState: "complete" | "warning" | "default";
}

/**
 * Hook that consolidates all nutrient animation logic
 * Handles number reveals, progress bars, and icon animations
 */
export const useNutrientAnimations = ({
  totals,
  targets,
  caloriesDelta,
  proteinDelta,
  fatPercentage,
  carbsPercentage,
  isProteinComplete,
  fatIconState,
  percentages,
}: UseNutrientAnimationsParams) => {
  const { selectedDate } = useAppStore();
  const prevSelectedDate = useRef(selectedDate);

  // Check if date changed for skipAnimation prop
  const dateChanged = prevSelectedDate.current !== selectedDate;

  // Animated scales for icon transitions
  const proteinIconScale = useSharedValue(1);
  const fatIconScale = useSharedValue(1);

  // Animated values for delta amounts (remaining or over)
  const animatedCaloriesDelta = useNumberReveal(Math.abs(caloriesDelta));
  const animatedProteinDelta = useNumberReveal(Math.abs(proteinDelta));

  // Animated values for secondary stats totals
  const animatedFatTotal = useNumberReveal(Math.round(totals.fat || 0));
  const animatedCarbsTotal = useNumberReveal(Math.round(totals.carbs || 0));

  // Animated values for ring label totals
  const animatedCaloriesTotal = useNumberReveal(Math.round(totals.calories || 0));
  const animatedProteinTotal = useNumberReveal(Math.round(totals.protein || 0));

  // Animated progress bars for secondary stats
  const fatProgress = useSharedValue(0);
  const carbsProgress = useSharedValue(0);

  // Trigger count-up animations when delta values change
  useEffect(() => {
    if (dateChanged) {
      animatedCaloriesDelta.setValue(Math.abs(caloriesDelta));
      animatedProteinDelta.setValue(Math.abs(proteinDelta));
    } else {
      animatedCaloriesDelta.animateTo(Math.abs(caloriesDelta));
      animatedProteinDelta.animateTo(Math.abs(proteinDelta));
    }
  }, [caloriesDelta, proteinDelta, selectedDate, dateChanged]);

  // Trigger count-up animations when secondary stats totals change
  useEffect(() => {
    if (dateChanged) {
      animatedFatTotal.setValue(Math.round(totals.fat || 0));
      animatedCarbsTotal.setValue(Math.round(totals.carbs || 0));
    } else {
      animatedFatTotal.animateTo(Math.round(totals.fat || 0), ANIMATION_DELAYS.FAT_STAT);
      animatedCarbsTotal.animateTo(Math.round(totals.carbs || 0));
    }
  }, [totals.fat, totals.carbs, selectedDate, dateChanged]);

  // Trigger count-up animations when ring label totals change
  useEffect(() => {
    if (dateChanged) {
      animatedCaloriesTotal.setValue(Math.round(totals.calories || 0));
      animatedProteinTotal.setValue(Math.round(totals.protein || 0));
    } else {
      animatedCaloriesTotal.animateTo(Math.round(totals.calories || 0), 0);
      animatedProteinTotal.animateTo(Math.round(totals.protein || 0), ANIMATION_DELAYS.RING_STAGGER);
    }
  }, [totals.calories, totals.protein, selectedDate, dateChanged]);

  // Trigger progress bar animations with spring matching rings
  useEffect(() => {
    if (dateChanged) {
      fatProgress.value = fatPercentage;
      carbsProgress.value = carbsPercentage;
    } else {
      fatProgress.value = withDelay(
        ANIMATION_DELAYS.FAT_STAT,
        withSpring(fatPercentage, SPRING_CONFIG)
      );

      carbsProgress.value = withDelay(
        ANIMATION_DELAYS.CARBS_STAT,
        withSpring(carbsPercentage, SPRING_CONFIG)
      );
    }
  }, [fatPercentage, carbsPercentage, selectedDate, dateChanged]);

  // Trigger icon scale animations when protein reaches 100%
  useEffect(() => {
    if (dateChanged) {
      proteinIconScale.value = 1;
    } else {
      if (isProteinComplete) {
        proteinIconScale.value = 0.5;
        proteinIconScale.value = withSpring(1, ICON_SPRING_CONFIG);
      } else {
        proteinIconScale.value = 1;
      }
    }
  }, [percentages.protein, proteinIconScale, selectedDate, dateChanged, isProteinComplete]);

  // Trigger icon scale animations when fat reaches optimal range
  useEffect(() => {
    const shouldAnimate = fatIconState === "complete" || fatIconState === "warning";

    if (dateChanged) {
      fatIconScale.value = 1;
    } else {
      if (shouldAnimate) {
        fatIconScale.value = 0.5;
        fatIconScale.value = withSpring(1, ICON_SPRING_CONFIG);
      } else {
        fatIconScale.value = 1;
      }
    }
  }, [totals.fat, targets.fat, targets.calories, fatIconScale, selectedDate, dateChanged, fatIconState]);

  // Update ref after all animation logic has run
  useEffect(() => {
    prevSelectedDate.current = selectedDate;
  }, [selectedDate]);

  return {
    // Date change detection
    dateChanged,

    // Icon scales
    proteinIconScale,
    fatIconScale,

    // Animated number displays
    animatedCaloriesDelta: animatedCaloriesDelta.display,
    animatedProteinDelta: animatedProteinDelta.display,
    animatedFatTotal: animatedFatTotal.display,
    animatedCarbsTotal: animatedCarbsTotal.display,
    animatedCaloriesTotal: animatedCaloriesTotal.display,
    animatedProteinTotal: animatedProteinTotal.display,

    // Progress bars
    fatProgress,
    carbsProgress,
  };
};
