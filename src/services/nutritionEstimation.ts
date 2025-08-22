/**
 * Service wrapper for nutrition estimation API calls
 * This provides a clean interface to the edge functions
 */

import {
  estimateNutritionTextBased,
  estimateNutritionImageBased,
} from "@/lib/supabase";

export interface NutritionEstimate {
  title: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence: number;
}

export interface TextEstimationRequest {
  title: string;
  description?: string;
}

export interface ImageEstimationRequest {
  imageUrl: string;
  title?: string;
  description?: string;
}

export class NutritionEstimationService {
  /**
   * Estimates nutrition from text description
   */
  static async estimateFromText(
    request: TextEstimationRequest
  ): Promise<NutritionEstimate> {
    try {
      const response = await estimateNutritionTextBased({
        title: request.title,
        description: request.description,
      });

      return {
        title: response.generatedTitle,
        calories: response.calories,
        protein: response.protein,
        carbs: response.carbs,
        fat: response.fat,
        confidence: response.estimationConfidence,
      };
    } catch (error) {
      console.error("Text estimation error:", error);
      throw new Error("Failed to estimate nutrition from text");
    }
  }

  /**
   * Estimates nutrition from image
   */
  static async estimateFromImage(
    request: ImageEstimationRequest
  ): Promise<NutritionEstimate> {
    try {
      const response = await estimateNutritionImageBased({
        imageUrl: request.imageUrl,
        title: request.title,
        description: request.description,
      });

      return {
        title: response.generatedTitle,
        calories: response.calories,
        protein: response.protein,
        carbs: response.carbs,
        fat: response.fat,
        confidence: response.estimationConfidence,
      };
    } catch (error) {
      console.error("Image estimation error:", error);
      throw new Error("Failed to estimate nutrition from image");
    }
  }

  /**
   * Validates if the estimation confidence is acceptable
   */
  static isConfidenceAcceptable(
    confidence: number,
    threshold: number = 0.7
  ): boolean {
    return confidence >= threshold;
  }

  /**
   * Formats confidence level for display
   */
  static formatConfidence(confidence: number): string {
    const percentage = Math.round(confidence * 100);

    if (percentage >= 90) return `High confidence (${percentage}%)`;
    if (percentage >= 70) return `Medium confidence (${percentage}%)`;
    if (percentage >= 50) return `Low confidence (${percentage}%)`;
    return `Very low confidence (${percentage}%)`;
  }
}

// Export convenience functions
export const estimateNutritionFromText =
  NutritionEstimationService.estimateFromText;
export const estimateNutritionFromImage =
  NutritionEstimationService.estimateFromImage;
