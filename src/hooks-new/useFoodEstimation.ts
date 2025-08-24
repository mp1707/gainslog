import { useState } from "react";
import { useAppStore } from "@/store";
import {
  estimateNutritionTextBased,
  estimateNutritionImageBased,
} from "@/lib/supabase";
import { generateFoodLogId } from "@/utils/idGenerator";
import { FoodLog } from "@/types";

interface EstimationResult {
  foodLog: FoodLog;
}

export const useFoodEstimation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addFoodLog, selectedDate } = useAppStore();

  const estimateFromText = async (
    title: string,
    description?: string
  ): Promise<EstimationResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const estimation = await estimateNutritionTextBased({
        title,
        description,
      });

      const newLog: FoodLog = {
        id: generateFoodLogId(),
        createdAt: new Date().toISOString(),
        date: selectedDate,
        userTitle: title,
        userDescription: description,
        generatedTitle: estimation.generatedTitle,
        generatedCalories: estimation.calories,
        generatedProtein: estimation.protein,
        generatedCarbs: estimation.carbs,
        generatedFat: estimation.fat,
        estimationConfidence: estimation.estimationConfidence,
      };

      addFoodLog(newLog);
      return { foodLog: newLog };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to estimate nutrition";
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const estimateFromImage = async (
    imageUrl: string,
    title?: string,
    description?: string
  ): Promise<EstimationResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const estimation = await estimateNutritionImageBased({
        imageUrl,
        title,
        description,
      });

      const newLog: FoodLog = {
        id: generateFoodLogId(),
        createdAt: new Date().toISOString(),
        date: selectedDate,
        userTitle: title,
        userDescription: description,
        generatedTitle: estimation.generatedTitle,
        generatedCalories: estimation.calories,
        generatedProtein: estimation.protein,
        generatedCarbs: estimation.carbs,
        generatedFat: estimation.fat,
        estimationConfidence: estimation.estimationConfidence,
        imageUrl: imageUrl,
      };

      addFoodLog(newLog);
      return { foodLog: newLog };
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to estimate nutrition from image";
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const createManualLog = (
    title: string,
    description: string,
    calories: string,
    protein: string,
    carbs: string,
    fat: string
  ): FoodLog => {
    const newLog: FoodLog = {
      id: generateFoodLogId(),
      createdAt: new Date().toISOString(),
      date: selectedDate,
      userTitle: title,
      userDescription: description,
      userCalories: parseFloat(calories) || 0,
      userProtein: parseFloat(protein) || 0,
      userCarbs: parseFloat(carbs) || 0,
      userFat: parseFloat(fat) || 0,
      estimationConfidence: 100, // Manual entry has 100% confidence
    };

    addFoodLog(newLog);
    return newLog;
  };

  const clearError = () => setError(null);

  return {
    estimateFromText,
    estimateFromImage,
    createManualLog,
    isLoading,
    error,
    clearError,
  };
};
