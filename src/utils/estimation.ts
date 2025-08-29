import { FoodLog } from "@/types/models";
import { generateFoodLogId } from "./idGenerator";
import {
  estimateNutritionDescriptionBased,
  estimateNutritionImageBased,
} from "@/lib/supabase";

export type EstimationInput = Omit<FoodLog, "id" | "estimationConfidence" | "isEstimating" | "calories" | "protein" | "carbs" | "fat">;

export type EstimationResult = {
  generatedTitle: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  estimationConfidence: number;
};

export const createEstimationLog = (logData: EstimationInput): FoodLog => {
  return {
    ...logData,
    id: generateFoodLogId(),
    title: logData.title || "",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    estimationConfidence: 0,
    isEstimating: true,
  };
};

export const estimateNutrition = async (
  logData: EstimationInput
): Promise<EstimationResult> => {
  if (!logData.imageUrl || logData.imageUrl === "") {
    return await estimateNutritionDescriptionBased({
      description: logData.description || "",
    });
  }
  
  return await estimateNutritionImageBased({
    imageUrl: logData.imageUrl,
    description: logData.description || "",
  });
};

export const applyEstimationResults = (
  existingLog: FoodLog,
  results: EstimationResult
): FoodLog => {
  return {
    ...existingLog,
    title: results.generatedTitle,
    calories: results.calories,
    protein: results.protein,
    carbs: results.carbs,
    fat: results.fat,
    estimationConfidence: results.estimationConfidence,
    isEstimating: false,
  };
};