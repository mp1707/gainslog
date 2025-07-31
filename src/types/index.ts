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
  createdAt: string;
  date: string; // ISO date string (YYYY-MM-DD)
  needsAiEstimation?: boolean;
}

// Modal modes for food log modal
export type ModalMode = 'edit' | 'create';

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
  shape?: 'round' | 'square';
  variant?: 'primary' | 'secondary' | 'tertiary' | 'destructive';
  size?: 'small' | 'medium' | 'large';
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
  keyboardType?: 'default' | 'numeric';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
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

// Daily nutrition targets interface
export interface DailyTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

// Daily progress data interface
export interface DailyProgress {
  current: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  targets: DailyTargets;
  percentages: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}