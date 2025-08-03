interface StepInfo {
  completed: boolean;
  title: string;
  description: string;
  helpText: string;
}

interface UseStepFlowReturn {
  stepInfo: {
    step1: StepInfo;
    step2: StepInfo;
    step3: StepInfo;
  };
  isCaloriesFieldEnabled: boolean;
  isProteinFieldEnabled: boolean;
}

export const useStepFlow = (
  isCaloriesSet: boolean,
  isProteinSet: boolean
): UseStepFlowReturn => {
  // Determine field enablement based on flow state
  const isCaloriesFieldEnabled = true; // Always enabled
  const isProteinFieldEnabled = isCaloriesSet;

  // Determine instructional text
  const getStepInfo = () => {
    return {
      step1: {
        completed: isCaloriesSet,
        title: "Step 1: Set Your Daily Calories",
        description: "Your total energy intake target for the day",
        helpText:
          "This forms the foundation for all other nutritional calculations",
      },
      step2: {
        completed: isProteinSet,
        title: "Step 2: Set Your Protein Target",
        description: "Essential macronutrient for muscle growth and recovery",
        helpText: "Protein needs are based on body weight and activity level",
      },
      step3: {
        completed: isCaloriesSet && isProteinSet,
        title: "Step 3: Distribute Remaining Calories",
        description: "Balance fat and carbohydrates for optimal nutrition",
        helpText:
          "For advanced strength athletes, 25-35% of total calories from fat is recommended",
      },
    };
  };

  const stepInfo = getStepInfo();

  return {
    stepInfo,
    isCaloriesFieldEnabled,
    isProteinFieldEnabled,
  };
};