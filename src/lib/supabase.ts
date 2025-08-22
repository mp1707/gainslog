import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import {
  FoodEstimateRequest,
  ImageEstimateRequest,
  FoodEstimateResponse,
} from "../types/indexLegacy";
import { env } from "./env";

const supabaseUrl = env.SUPABASE_URL;
const supabaseAnonKey = env.SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export const estimateNutritionTextBased = async (
  request: FoodEstimateRequest
): Promise<FoodEstimateResponse> => {
  const response = await fetch(`${supabaseUrl}/functions/v1/text-estimation`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${supabaseAnonKey}`,
      apikey: supabaseAnonKey,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("AI estimation HTTP error:", response.status, errorText);
    throw new Error("AI_ESTIMATION_FAILED");
  }

  const data = await response.json();

  if (data.error) {
    console.error("AI estimation error:", data.error);
    throw new Error("AI_ESTIMATION_FAILED");
  }

  return data as FoodEstimateResponse;
};

export const estimateNutritionImageBased = async (
  request: ImageEstimateRequest
): Promise<FoodEstimateResponse> => {
  const response = await fetch(`${supabaseUrl}/functions/v1/image-estimation`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${supabaseAnonKey}`,
      apikey: supabaseAnonKey,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(
      "Image-based estimation HTTP error:",
      response.status,
      errorText
    );
    throw new Error("AI_ESTIMATION_FAILED");
  }

  const data = await response.json();

  if (data.error) {
    console.error("Image-based estimation error:", data.error);
    throw new Error("AI_ESTIMATION_FAILED");
  }

  return data as FoodEstimateResponse;
};
