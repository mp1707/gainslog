import { useCallback, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useHudStore } from "@/store/useHudStore";
import { EstimationInput, createEstimationLog } from "@/utils/estimation";
import type { FoodComponent, FoodLog } from "@/types/models";
import { useLocalization } from "@/context/LocalizationContext";
import {
  estimateNutritionImageBased,
  estimateTextBased,
  refineEstimation,
  type RefinedFoodEstimateResponse,
  type FoodEstimateResponse,
} from "../lib";

// Helpers
const hasImage = (log: { supabaseImagePath?: string | null }): boolean =>
  !!log.supabaseImagePath && log.supabaseImagePath !== "";

const makeCompletedFromInitial = (
  base: FoodLog,
  results: FoodEstimateResponse
): FoodLog => ({
  ...base,
  title: results.generatedTitle,
  calories: results.calories,
  protein: results.protein,
  carbs: results.carbs,
  fat: results.fat,
  foodComponents: results.foodComponents,
  macrosPerReferencePortion: results.macrosPerReferencePortion,
  isEstimating: false,
});

type EditableEntry = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  foodComponents: FoodComponent[];
  macrosPerReferencePortion?: FoodLog["macrosPerReferencePortion"];
};

const makeCompletedFromRefinement = <T extends EditableEntry>(
  base: T,
  results: RefinedFoodEstimateResponse
): T =>
  ({
    ...base,
    // Title remains unchanged, even if empty
    calories: results.calories,
    protein: results.protein,
    carbs: results.carbs,
    fat: results.fat,
    ...("isEstimating" in base ? { isEstimating: false } : {}),
  } as T);

const showProRequiredHud = (subtitle: string) => {
  useHudStore.getState().show({
    type: "info",
    title: "MacroLoop Pro required",
    subtitle,
  });
};

export const useEstimation = () => {
  const { addFoodLog, updateFoodLog, deleteFoodLog } = useAppStore();
  const isPro = useAppStore((state) => state.isPro);
  const [isEditEstimating, setIsEditEstimating] = useState(false);
  const { currentLanguage } = useLocalization();
  const language = currentLanguage || "en";

  // Create page flow: add incomplete log, run initial estimation, update store
  const runCreateEstimation = useCallback(
    async (logData: EstimationInput) => {
      if (!isPro) {
        showProRequiredHud("Unlock MacroLoop Pro to use AI estimations.");
        return;
      }

      const incompleteLog = createEstimationLog(logData);
      addFoodLog(incompleteLog);

      const isImageEstimation = hasImage(logData);
      const estimationFunction = async () => {
        if (__DEV__) {
          console.log(
            isImageEstimation
              ? "🖼️ Image initial estimation"
              : "📝 Text initial estimation"
          );
        }
        return isImageEstimation
          ? estimateNutritionImageBased({
              imagePath: logData.supabaseImagePath || "",
              description: logData.description || "",
              language,
            })
          : estimateTextBased({
              description: logData.description || "",
              language,
            });
      };

      try {
        const estimationResults = await estimationFunction();
        const completedLog = makeCompletedFromInitial(
          incompleteLog,
          estimationResults
        );
        updateFoodLog(incompleteLog.id, completedLog);
      } catch (error) {
        deleteFoodLog(incompleteLog.id);
      }
    },
    [addFoodLog, updateFoodLog, deleteFoodLog, isPro, language]
  );

  // Edit page flow: refinement based solely on provided components
  const runEditEstimation = useCallback(
    async <T extends EditableEntry>(
      editedEntry: T,
      onComplete: (entry: T) => void
    ) => {
      if (!isPro) {
        showProRequiredHud("MacroLoop Pro unlocks AI refinements.");
        return;
      }

      const hasComponents = (editedEntry.foodComponents?.length || 0) > 0;
      if (!hasComponents) {
        // Caller should prevent this; no-op for safety
        return;
      }
      if (__DEV__) {
        console.log("🛠️ Components refinement");
      }

      // Convert food components to string format: "Name Amount Unit, Name Amount Unit, ..."
      const foodComponentsString = (editedEntry.foodComponents || [])
        .map(
          (component) =>
            `${component.name} ${component.amount} ${component.unit}`
        )
        .join(", ");

      setIsEditEstimating(true);
      try {
        const refined: RefinedFoodEstimateResponse = await refineEstimation({
          foodComponents: foodComponentsString,
          macrosPerReferencePortion: editedEntry.macrosPerReferencePortion,
          language,
        });
        const completedEntry = makeCompletedFromRefinement(
          editedEntry,
          refined
        );
        onComplete(completedEntry);
        return completedEntry;
      } finally {
        setIsEditEstimating(false);
      }
    },
    [isPro, language]
  );

  return { runCreateEstimation, runEditEstimation, isEditEstimating };
};
