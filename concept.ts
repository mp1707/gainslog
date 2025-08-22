type FoodLog = {
  id: string;
  createdAt: string;
  date: string;
  userTitle: string;
  generatedTitle: string;
  userDescription: string;
  generatedDescription: string;
  userCalories: string;
  generatedCalories: string;
  userProtein: string;
  generatedProtein: string;
  userCarbs: string;
  generatedCarbs: string;
  userFat: string;
  generatedFat: string;
  estimationConfidence: string;
};

type FavoriteEntry = {
  id: string;
  createdAt: string;
  date: string;
  title: string;
  description: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  estimationConfidence: string;
};

type UserSettings = {
  sex: "male" | "female";
  age: number;
  weight: number;
  height: number;
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "veryactive";
  calorieGoalType: "lose" | "maintain" | "gain";
  proteinCalculationFactor: number;
  fatCalculationPercentage: number;
};

type DailyTargets = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

type WeigthLog = {
  id: string;
  createdAt: string;
  date: string;
  weight: number;
};
