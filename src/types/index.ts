// NEW ARCHITECTURE TYPES
// Simple, clean types for the new Zustand-based architecture
import type React from "react";

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
  date: string; 
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

// UI and Flow Types (migrated from legacy to unify under src/types)

// Basic domain enums/aliases
export type Sex = "male" | "female";
export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "veryactive";

export type GoalType = "lose" | "maintain" | "gain";

// Calculator inputs/outputs
export interface CalorieIntakeParams {
  sex?: Sex;
  age: number;
  weight: number; // kg
  height: number; // cm
}

export interface CalorieGoals {
  loseWeight: number;
  maintainWeight: number;
  gainWeight: number;
}

export interface ProteinCalculationMethod {
  id:
    | "optimal_growth"
    | "dedicated_athlete"
    | "anabolic_insurance"
    | "max_preservation";
  title: string;
  description: string;
  multiplier: number;
}

export interface CalorieCalculationMethod {
  id: ActivityLevel;
  title: string;
  description: string;
  label: string;
}

// Food log modal mode
export type ModalMode = "edit" | "create";

// Shared component prop types
export interface ButtonProps {
  onPress: () => void;
  disabled?: boolean;
  shape?: "round" | "square";
  variant?: "primary" | "secondary" | "tertiary" | "destructive";
  size?: "small" | "medium" | "large";
  children: React.ReactNode;
  style?: any;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export interface TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: "default" | "numeric" | "number-pad" | "decimal-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoFocus?: boolean;
  error?: boolean;
  disabled?: boolean;
  style?: any;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  onFocus?: (e: any) => void;
  onBlur?: (e: any) => void;
}

export interface ConfidenceBadgeProps {
  confidence: number;
  isLoading?: boolean;
}

export interface SemanticBadgeProps {
  variant: "semantic";
  semanticType: "calories" | "protein" | "carbs" | "fat";
  label: string;
  isLoading?: boolean;
}

export interface IconBadgeProps {
  variant: "icon";
  iconType: "image" | "audio" | "text";
  isLoading?: boolean;
}

export type BadgeProps =
  | (ConfidenceBadgeProps & { variant?: "confidence" })
  | SemanticBadgeProps
  | IconBadgeProps;
