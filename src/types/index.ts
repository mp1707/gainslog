// NEW ARCHITECTURE TYPES
// Simple, clean types for the new Zustand-based architecture

export interface FoodLog {
  id: string;
  createdAt: string;
  date: string; // ISO date string (YYYY-MM-DD)

  // User-entered values (always take precedence)
  userTitle?: string;
  userDescription?: string;
  userCalories?: number;
  userProtein?: number;
  userCarbs?: number;
  userFat?: number;

  // AI-generated values (fallback when user values not set)
  generatedTitle?: string;
  generatedDescription?: string;
  generatedCalories?: number;
  generatedProtein?: number;
  generatedCarbs?: number;
  generatedFat?: number;

  // Additional properties
  imageUrl?: string;
  estimationConfidence?: number; // 0-100

  // Transient UI/creation state (not required, not always persisted)
  localImageUri?: string; // Local image URI before upload
  isUploading?: boolean; // Track upload state for images
  isTranscribing?: boolean; // Track transcription state for audio logs
}

export interface FavoriteEntry {
  id: string;
  createdAt: string;
  date: string; // Date when favorite was created
  title?: string;
  description?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  estimationConfidence?: number;
}

export interface UserSettings {
  sex: "male" | "female";
  age: number;
  weight: number; // kg
  height: number; // cm
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "veryactive";
  calorieGoalType: "lose" | "maintain" | "gain";
  proteinCalculationFactor: number; // grams per kg of body weight
  fatCalculationPercentage: number; // percentage of total calories
}

export interface DailyTargets {
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
}

export interface WeightLog {
  id: string;
  createdAt: string;
  date: string; // ISO date string (YYYY-MM-DD)
  weight: number; // kg
}

// API types for edge function communication
export interface FoodEstimateRequest {
  title?: string;
  description?: string;
}

export interface ImageEstimateRequest {
  imageUrl: string;
  title?: string;
  description?: string;
}

export interface FoodEstimateResponse {
  generatedTitle: string;
  estimationConfidence: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}
