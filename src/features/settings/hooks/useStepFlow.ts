interface StepInfo {
  completed: boolean;
  title: string;
  description: string;
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
        description: "Foundation for all other nutritional calculations.",
      },
      step2: {
        completed: isProteinSet,
        title: "Step 2: Set Your Protein Target",
        description:
          "Protein needs are based on body weight and activity level.",
      },
      step3: {
        completed: isCaloriesSet && isProteinSet,
        title: "Step 3: Distribute Remaining Calories",
        description:
          "Select a percentage of your calories from fat. The rest will be automatically allocated to carbohydrates.",
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
