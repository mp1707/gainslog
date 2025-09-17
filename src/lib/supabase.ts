import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { showErrorToast } from "./toast";
import { FoodComponent } from "@/types/models";

export interface TextEstimateRequest {
  description: string;
}

export interface RefineRequest {
  foodComponents: string;
}

export interface ImageEstimateRequest {
  imagePath: string;
  title?: string;
  description?: string;
}

export interface ImageRefineRequest {
  imagePath: string;
  title?: string;
  description?: string;
  foodComponents: FoodComponent[];
}

export interface FoodEstimateResponse {
  generatedTitle: string;
  estimationConfidence: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  foodComponents: FoodComponent[];
}
export interface RefinedFoodEstimateResponse {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export const estimateTextBased = async (
  request: TextEstimateRequest
): Promise<FoodEstimateResponse> => {
  console.log("Text estimation request:", request);

  const response = await fetch(`${supabaseUrl}/functions/v1/textEstimationV3`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${supabaseAnonKey}`,
      apikey: supabaseAnonKey,
    },
    body: JSON.stringify(request),
  });

  console.log("Text estimation response status:", response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("AI estimation HTTP error:", response.status, errorText);
    throw new Error("AI_ESTIMATION_FAILED");
  }

  const data = await response.json();
  console.log("Text estimation response data:", data);

  if (data.error) {
    console.error("AI estimation error:", data.error);
    throw new Error("AI_ESTIMATION_FAILED");
  }

  return data as FoodEstimateResponse;
};

export const refineEstimation = async (
  request: RefineRequest
): Promise<RefinedFoodEstimateResponse> => {
  console.log("Refine estimation request:", request);

  const response = await fetch(
    `${supabaseUrl}/functions/v1/refineTextEstimationV3`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseAnonKey}`,
        apikey: supabaseAnonKey,
      },
      body: JSON.stringify(request),
    }
  );

  console.log("Refine estimation response status:", response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("AI estimation HTTP error:", response.status, errorText);
    throw new Error("AI_ESTIMATION_FAILED");
  }

  const data = await response.json();
  console.log("Refine estimation response data:", data);

  if (data.error) {
    console.error("AI estimation error:", data.error);
    throw new Error("AI_ESTIMATION_FAILED");
  }

  return data as RefinedFoodEstimateResponse;
};

export const estimateNutritionImageBased = async (
  request: ImageEstimateRequest
): Promise<FoodEstimateResponse> => {
  console.log("Image estimation request:", request);

  const response = await fetch(
    `${supabaseUrl}/functions/v1/imageEstimationV3`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseAnonKey}`,
        apikey: supabaseAnonKey,
      },
      body: JSON.stringify(request),
    }
  );

  console.log("Image estimation response status:", response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Image estimation HTTP error:", response.status, errorText);
    if (response.status === 429) {
      showErrorToast("Rate limit exceeded", "Please try again later.");
    }
    throw new Error("AI_ESTIMATION_FAILED");
  }

  const data = await response.json();
  console.log("Image estimation response data:", data);

  if (data.error) {
    console.error("Image-based estimation error:", data.error);
    throw new Error("AI_ESTIMATION_FAILED");
  }

  return data as FoodEstimateResponse;
};
