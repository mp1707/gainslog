import { FoodLog } from "../types/models";

export const testFoodLogs: Omit<FoodLog, "id" | "logDate" | "createdAt">[] = [
  // Breakfast items
  {
    title: "🍓 Greek Yogurt",
    description: "Plain Greek yogurt topped with mixed berries and honey",
    foodComponents: [
      { amount: 200, name: "Greek yogurt", needsRefinement: false, unit: "g" },
      { amount: 80, name: "Mixed berries", needsRefinement: true, unit: "g" },
      { amount: 1, name: "Honey", needsRefinement: true, unit: "tbsp" }
    ],
    calories: 180,
    protein: 15,
    carbs: 22,
    fat: 4,
    estimationConfidence: 0.85,
    isEstimating: false,
  },
  {
    title: "🥑 Avocado Toast",
    description: "Whole grain bread with mashed avocado and sea salt",
    foodComponents: [
      { amount: 2, name: "Whole grain bread", needsRefinement: false, unit: "piece" },
      { amount: 100, name: "Avocado", needsRefinement: false, unit: "g" },
      { amount: 1, name: "Sea salt", needsRefinement: true, unit: "tsp" }
    ],
    calories: 280,
    protein: 6,
    carbs: 28,
    fat: 18,
    estimationConfidence: 0.9,
    isEstimating: false,
  },

  // Lunch items
  {
    title: "🥪 Turkey Sandwich",
    description: "Sliced turkey breast on whole wheat with lettuce and tomato",
    foodComponents: [
      { amount: 2, name: "Whole wheat bread", needsRefinement: false, unit: "piece" },
      { amount: 120, name: "Turkey breast", needsRefinement: false, unit: "g" },
      { amount: 50, name: "Lettuce", needsRefinement: false, unit: "g" },
      { amount: 80, name: "Tomato", needsRefinement: false, unit: "g" },
      { amount: 1, name: "Mayonnaise", needsRefinement: true, unit: "tbsp" }
    ],
    calories: 420,
    protein: 28,
    carbs: 45,
    fat: 14,
    estimationConfidence: 0.8,
    isEstimating: false,
  },
  {
    title: "🌯 Tuna Wrap",
    description: "Tuna salad with mixed vegetables in a whole wheat tortilla",
    foodComponents: [
      { amount: 1, name: "Whole wheat tortilla", needsRefinement: false, unit: "piece" },
      { amount: 100, name: "Tuna", needsRefinement: false, unit: "g" },
      { amount: 60, name: "Mixed vegetables", needsRefinement: true, unit: "g" },
      { amount: 1, name: "Mayonnaise", needsRefinement: true, unit: "tbsp" }
    ],
    calories: 380,
    protein: 24,
    carbs: 32,
    fat: 16,
    estimationConfidence: 0.8,
    isEstimating: false,
  },

  // Dinner items
  {
    title: "🥩 Beef Stir Fry",
    description: "Lean beef strips with mixed vegetables and brown rice",
    foodComponents: [
      { amount: 150, name: "Lean beef", needsRefinement: false, unit: "g" },
      { amount: 200, name: "Mixed vegetables", needsRefinement: true, unit: "g" },
      { amount: 150, name: "Brown rice", needsRefinement: false, unit: "g" },
      { amount: 1, name: "Cooking oil", needsRefinement: true, unit: "tbsp" }
    ],
    calories: 480,
    protein: 32,
    carbs: 38,
    fat: 20,
    estimationConfidence: 0.75,
    isEstimating: false,
  },
  {
    title: "🍛 Vegetarian Curry",
    description: "Chickpea and vegetable curry with basmati rice",
    foodComponents: [
      { amount: 200, name: "Chickpeas", needsRefinement: false, unit: "g" },
      { amount: 150, name: "Mixed vegetables", needsRefinement: true, unit: "g" },
      { amount: 150, name: "Basmati rice", needsRefinement: false, unit: "g" },
      { amount: 100, name: "Coconut milk", needsRefinement: false, unit: "ml" }
    ],
    calories: 450,
    protein: 16,
    carbs: 68,
    fat: 14,
    estimationConfidence: 0.7,
    isEstimating: false,
  },

  // Snacks
  {
    title: "🥜 Trail Mix",
    description: "Mixed nuts, dried fruit, and dark chocolate chips",
    foodComponents: [
      { amount: 30, name: "Mixed nuts", needsRefinement: true, unit: "g" },
      { amount: 20, name: "Dried fruit", needsRefinement: true, unit: "g" },
      { amount: 10, name: "Dark chocolate chips", needsRefinement: false, unit: "g" }
    ],
    calories: 220,
    protein: 6,
    carbs: 18,
    fat: 16,
    estimationConfidence: 0.8,
    isEstimating: false,
  },
  {
    title: "🧀 Cottage Cheese",
    description: "Low-fat cottage cheese with fresh peach slices",
    foodComponents: [
      { amount: 200, name: "Low-fat cottage cheese", needsRefinement: false, unit: "g" },
      { amount: 150, name: "Fresh peach", needsRefinement: false, unit: "g" }
    ],
    calories: 160,
    protein: 14,
    carbs: 18,
    fat: 4,
    estimationConfidence: 0.85,
    isEstimating: false,
  },

  // Additional variety
  {
    title: "🍕 Pizza Slice",
    description: "Thin crust margherita pizza slice",
    foodComponents: [
      { amount: 1, name: "Pizza slice", needsRefinement: false, unit: "piece" },
      { amount: 30, name: "Mozzarella cheese", needsRefinement: false, unit: "g" },
      { amount: 50, name: "Tomato sauce", needsRefinement: true, unit: "g" }
    ],
    calories: 290,
    protein: 12,
    carbs: 35,
    fat: 12,
    estimationConfidence: 0.7,
    isEstimating: false,
  },
  {
    title: "🌮 Fish Tacos",
    description: "Grilled white fish with cabbage slaw in corn tortillas",
    foodComponents: [
      { amount: 2, name: "Corn tortillas", needsRefinement: false, unit: "piece" },
      { amount: 120, name: "White fish", needsRefinement: false, unit: "g" },
      { amount: 80, name: "Cabbage slaw", needsRefinement: true, unit: "g" },
      { amount: 2, name: "Lime juice", needsRefinement: false, unit: "tbsp" }
    ],
    calories: 380,
    protein: 26,
    carbs: 38,
    fat: 14,
    estimationConfidence: 0.8,
    isEstimating: false,
  },
  {
    title: "🧀 Grilled Cheese",
    description: "Classic grilled cheese on sourdough bread",
    foodComponents: [
      { amount: 2, name: "Sourdough bread", needsRefinement: false, unit: "piece" },
      { amount: 80, name: "Cheddar cheese", needsRefinement: false, unit: "g" },
      { amount: 1, name: "Butter", needsRefinement: false, unit: "tbsp" }
    ],
    calories: 410,
    protein: 16,
    carbs: 32,
    fat: 26,
    estimationConfidence: 0.85,
    isEstimating: false,
  },
  {
    title: "🥙 Meatball Sub",
    description: "Turkey meatballs in marinara sauce on whole grain roll",
    foodComponents: [
      { amount: 1, name: "Whole grain roll", needsRefinement: false, unit: "piece" },
      { amount: 150, name: "Turkey meatballs", needsRefinement: false, unit: "g" },
      { amount: 80, name: "Marinara sauce", needsRefinement: true, unit: "g" },
      { amount: 30, name: "Mozzarella cheese", needsRefinement: false, unit: "g" }
    ],
    calories: 520,
    protein: 28,
    carbs: 48,
    fat: 24,
    estimationConfidence: 0.75,
    isEstimating: false,
  },
  {
    title: "🥣 Overnight Oats",
    description: "Oats soaked in almond milk with chia seeds and berries",
    foodComponents: [
      { amount: 50, name: "Rolled oats", needsRefinement: false, unit: "g" },
      { amount: 200, name: "Almond milk", needsRefinement: false, unit: "ml" },
      { amount: 1, name: "Chia seeds", needsRefinement: false, unit: "tbsp" },
      { amount: 80, name: "Mixed berries", needsRefinement: true, unit: "g" }
    ],
    calories: 280,
    protein: 10,
    carbs: 42,
    fat: 8,
    estimationConfidence: 0.9,
    isEstimating: false,
  },
  {
    title: "🌮 Beef Tacos",
    description: "Ground beef tacos with lettuce, tomato, and cheese",
    foodComponents: [
      { amount: 3, name: "Corn tortillas", needsRefinement: false, unit: "piece" },
      { amount: 120, name: "Ground beef", needsRefinement: false, unit: "g" },
      { amount: 50, name: "Lettuce", needsRefinement: false, unit: "g" },
      { amount: 60, name: "Tomato", needsRefinement: false, unit: "g" },
      { amount: 40, name: "Cheddar cheese", needsRefinement: false, unit: "g" }
    ],
    calories: 450,
    protein: 24,
    carbs: 32,
    fat: 24,
    estimationConfidence: 0.8,
    isEstimating: false,
  },
  {
    title: "🍌 Banana Bread",
    description: "Homemade banana bread slice",
    foodComponents: [
      { amount: 1, name: "Banana bread slice", needsRefinement: false, unit: "piece" },
      { amount: 80, name: "Banana", needsRefinement: false, unit: "g" }
    ],
    calories: 240,
    protein: 4,
    carbs: 42,
    fat: 8,
    estimationConfidence: 0.8,
    isEstimating: false,
  },
  {
    title: "🥤 Protein Shake",
    description: "Chocolate whey protein with banana and milk",
    foodComponents: [
      { amount: 1, name: "Chocolate protein powder", needsRefinement: false, unit: "scoop" },
      { amount: 200, name: "Milk", needsRefinement: false, unit: "ml" },
      { amount: 1, name: "Banana", needsRefinement: false, unit: "piece" }
    ],
    calories: 280,
    protein: 30,
    carbs: 24,
    fat: 6,
    estimationConfidence: 0.9,
    isEstimating: false,
  },
  {
    title: "🍮 Chia Pudding",
    description: "Chia seeds soaked in coconut milk with vanilla and berries",
    foodComponents: [
      { amount: 3, name: "Chia seeds", needsRefinement: false, unit: "tbsp" },
      { amount: 200, name: "Coconut milk", needsRefinement: false, unit: "ml" },
      { amount: 80, name: "Mixed berries", needsRefinement: true, unit: "g" },
      { amount: 1, name: "Vanilla extract", needsRefinement: true, unit: "tsp" }
    ],
    calories: 220,
    protein: 8,
    carbs: 18,
    fat: 14,
    estimationConfidence: 0.85,
    isEstimating: false,
  },
  {
    title: "🍤 Shrimp Scampi",
    description: "Sautéed shrimp in garlic butter over whole wheat pasta",
    foodComponents: [
      { amount: 150, name: "Shrimp", needsRefinement: false, unit: "g" },
      { amount: 100, name: "Whole wheat pasta", needsRefinement: false, unit: "g" },
      { amount: 2, name: "Garlic", needsRefinement: true, unit: "tbsp" },
      { amount: 1, name: "Butter", needsRefinement: true, unit: "tbsp" }
    ],
    calories: 480,
    protein: 28,
    carbs: 48,
    fat: 18,
    estimationConfidence: 0.8,
    isEstimating: false,
  },
  {
    title: "🥥 Rice Bowl",
    description: "Coconut rice with grilled vegetables and tofu",
    foodComponents: [
      { amount: 150, name: "Coconut rice", needsRefinement: false, unit: "g" },
      { amount: 120, name: "Grilled vegetables", needsRefinement: true, unit: "g" },
      { amount: 100, name: "Tofu", needsRefinement: false, unit: "g" }
    ],
    calories: 420,
    protein: 14,
    carbs: 58,
    fat: 16,
    estimationConfidence: 0.7,
    isEstimating: false,
  },
  {
    title: "🌯 Breakfast Burrito",
    description: "Scrambled eggs, black beans, cheese in whole wheat tortilla",
    foodComponents: [
      { amount: 1, name: "Whole wheat tortilla", needsRefinement: false, unit: "piece" },
      { amount: 2, name: "Eggs", needsRefinement: false, unit: "piece" },
      { amount: 80, name: "Black beans", needsRefinement: false, unit: "g" },
      { amount: 40, name: "Cheese", needsRefinement: false, unit: "g" }
    ],
    calories: 480,
    protein: 22,
    carbs: 42,
    fat: 24,
    estimationConfidence: 0.75,
    isEstimating: false,
  },
  {
    title: "🥜 PB Toast",
    description: "Whole grain toast with natural peanut butter and banana",
    foodComponents: [
      { amount: 2, name: "Whole grain bread", needsRefinement: false, unit: "piece" },
      { amount: 2, name: "Peanut butter", needsRefinement: false, unit: "tbsp" },
      { amount: 1, name: "Banana", needsRefinement: false, unit: "piece" }
    ],
    calories: 320,
    protein: 12,
    carbs: 32,
    fat: 18,
    estimationConfidence: 0.9,
    isEstimating: false,
  },
  {
    title: "🍓 Fruit Salad",
    description: "Mixed seasonal fruit salad",
    foodComponents: [
      { amount: 100, name: "Apple", needsRefinement: false, unit: "g" },
      { amount: 100, name: "Orange", needsRefinement: false, unit: "g" },
      { amount: 80, name: "Berries", needsRefinement: false, unit: "g" },
      { amount: 70, name: "Grapes", needsRefinement: false, unit: "g" }
    ],
    calories: 120,
    protein: 2,
    carbs: 30,
    fat: 1,
    estimationConfidence: 0.9,
    isEstimating: false,
  },
];
