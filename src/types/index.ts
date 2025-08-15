// Food log interface - moved from lib/storage.ts for global access
export interface FoodLog {
  id: string;
  userTitle?: string;
  userDescription?: string;
  generatedTitle: string;
  estimationConfidence: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  userCalories?: number;
  userProtein?: number;
  userCarbs?: number;
  userFat?: number;
  imageUrl?: string;
  localImageUri?: string; // Local image URI before upload
  isUploading?: boolean; // Track upload state
  isTranscribing?: boolean; // Track transcription state for audio logs
  createdAt: string;
  date: string; // ISO date string (YYYY-MM-DD)
  needsAiEstimation?: boolean;
}

export interface DailyProgress {
  current: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  targets: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  percentages: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
}

// Domain enums and shared calculation/input types
export type Sex = "male" | "female";
export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "veryactive";

export interface CalorieIntakeParams {
  sex?: Sex;
  age: number;
  weight: number; // kilograms
  height: number; // centimeters
}

export interface CalorieGoals {
  loseWeight: number;
  maintainWeight: number;
  gainWeight: number;
}

// Goals and calculation method descriptors
export type GoalType = "lose" | "maintain" | "gain";

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

// Modal modes for food log modal
export type ModalMode = "edit" | "create";

// Nutrition data merging result
export interface NutritionMergeResult {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  userCalories?: number;
  userProtein?: number;
  userCarbs?: number;
  userFat?: number;
  needsAiEstimation: boolean;
  validationErrors: string[];
  isValid: boolean;
}

// API request/response types (from lib/supabase.ts)
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

// Component prop types
export interface ButtonProps {
  onPress: () => void;
  disabled?: boolean;
  shape?: "round" | "square";
  variant?: "primary" | "secondary" | "tertiary" | "destructive";
  size?: "small" | "medium" | "large";
  children: React.ReactNode;
  style?: any; // ViewStyle but avoiding import
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export interface TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: "default" | "numeric";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoFocus?: boolean;
  error?: boolean;
  disabled?: boolean;
  style?: any; // ViewStyle but avoiding import
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

// Daily nutrition targets interface
export interface DailyTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

// Favorite entry template stored on device
export interface FavoriteEntry {
  title: string;
  description?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}
