export type FoodLog = {
  id: string;
  logDate: string; // YYYY-MM-DD
  createdAt: string; // ISO timestamp
  title: string;
  description?: string;
  supabaseImagePath?: string;
  localImagePath?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  estimationConfidence?: number;
  isEstimating?: boolean;
};

export type Favorite = {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type DailyTargets = {
  calories?: number;
  protein?: number; // g
  carbs?: number; // g
  fat?: number; // g
};

export type UserSettings = {
  sex: "male" | "female";
  age: number;
  weight: number; // kg
  height: number; // cm
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "veryactive";
  calorieGoalType?: "lose" | "maintain" | "gain";
  proteinGoalType?:
    | "optimal_growth"
    | "dedicated_athlete"
    | "anabolic_insurance"
    | "max_preservation"; // g per kg BW
  fatCalculationPercentage: number; // % of total calories
};
