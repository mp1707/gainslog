import React, { useEffect, useMemo } from "react";
import {
  View,
  Text,
  Platform,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useTheme } from "@/providers/ThemeProvider";
import { useFoodLogStore } from "@/stores/useFoodLogStore";
import { Button } from "@/shared/ui/atoms/Button";
import { ProteinCalculatorModal } from "@/shared/ui/molecules/ProteinCalculatorModal";
import { CalorieCalculatorModal } from "@/shared/ui/molecules/CalorieCalculatorModal";
import { StepHeader } from "@/shared/ui/molecules/StepHeader";
import { FlowArrow } from "@/shared/ui/atoms/FlowArrow";
import { NutritionCard } from "@/features/settings/ui/molecules/NutritionCard";
import { MacroDistributionCard } from "@/features/settings/ui/molecules/MacroDistributionCard";
import { FatPercentageCard } from "@/features/settings/ui/molecules/FatPercentageCard";
import { AppearanceCard } from "@/features/settings/ui/molecules/AppearanceCard";
import { useNutritionCalculations } from "@/features/settings/hooks/useNutritionCalculations";
import { useStepFlow } from "@/features/settings/hooks/useStepFlow";
import { useSettingsModals } from "@/features/settings/hooks/useSettingsModals";
import {
  calculateFatGramsFromPercentage,
  calculateCarbsFromMacros,
  calculateMaxFatPercentage,
} from "@/utils/nutritionCalculations";
import { createStyles } from "./settings.styles";


export default function SettingsTab() {
  const { loadDailyTargets, isLoadingTargets } = useFoodLogStore();
  const { colors, theme: themeObj, colorScheme } = useTheme();
  const insets = useSafeAreaInsets();

  // Use extracted hooks
  const nutritionCalculations = useNutritionCalculations();
  const {
    dailyTargets,
    fatPercentage,
    isCaloriesSet,
    isProteinSet,
    handleTargetChange,
    handleFatPercentageChange,
  } = nutritionCalculations;

  const { stepInfo, isCaloriesFieldEnabled, isProteinFieldEnabled } = useStepFlow(
    isCaloriesSet,
    isProteinSet
  );

  const {
    isProteinCalculatorVisible,
    setIsProteinCalculatorVisible,
    isCalorieCalculatorVisible,
    setIsCalorieCalculatorVisible,
    proteinCalculation,
    calorieCalculation,
    handleProteinCalculationSelect,
    handleCalorieGoalSelect,
    handleResetTargets,
  } = useSettingsModals(handleTargetChange);

  // Calculate platform-specific tab bar height for Expo Router
  const getTabBarHeight = () => {
    if (Platform.OS === "ios") {
      // iOS tab bar: 49px standard height + bottom safe area
      return 49 + insets.bottom;
    } else {
      // Android tab bar: 56px standard height
      return 56;
    }
  };

  const styles = useMemo(
    () => createStyles(colors, themeObj, colorScheme),
    [colors, themeObj]
  );

  useEffect(() => {
    loadDailyTargets();
  }, [loadDailyTargets]);

  // Nutrition configuration data
  const nutritionConfigs = [
    {
      key: "calories" as const,
      label: "Calories",
      unit: "kcal",
      min: 1000,
      max: 5000,
      step: 50,
    },
    {
      key: "protein" as const,
      label: "Protein",
      unit: "g",
      min: 50,
      max: 500,
      step: 5,
    },
  ];


  // Helper function to calculate values for card components
  const calculateMacroValues = () => {
    const fatGrams = calculateFatGramsFromPercentage(dailyTargets.calories, fatPercentage);
    const carbsGrams = calculateCarbsFromMacros(dailyTargets.calories, dailyTargets.protein, fatGrams);
    const maxFatPercentage = calculateMaxFatPercentage(dailyTargets.calories, dailyTargets.protein);
    
    return { fatGrams, carbsGrams, maxFatPercentage };
  };

  if (isLoadingTargets) {
    return (
      <SafeAreaView
        style={[styles.container, styles.centered]}
        edges={["top", "left", "right"]}
      >
        <Text style={styles.loadingText}>Loading settings...</Text>
      </SafeAreaView>
    );
  }

  const { fatGrams, carbsGrams, maxFatPercentage } = calculateMacroValues();

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <KeyboardAwareScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bottomOffset={20}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <Text style={styles.sectionSubtitle}>
            Customize the visual appearance of your app
          </Text>
          <AppearanceCard />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nutrition Tracking</Text>
          <Text style={styles.sectionSubtitle}>
            Follow these steps to set up your personalized nutrition targets
          </Text>
          
          {/* Step 1: Calories */}
          <StepHeader
            stepNumber={1}
            title={stepInfo.step1.title}
            description={stepInfo.step1.description}
            helpText={stepInfo.step1.helpText}
            completed={stepInfo.step1.completed}
          />
          <NutritionCard
            config={nutritionConfigs[0]}
            value={dailyTargets.calories}
            isFieldDisabled={!isCaloriesFieldEnabled}
            onValueChange={handleTargetChange}
            onCalculatorPress={() => setIsCalorieCalculatorVisible(true)}
            calorieCalculation={calorieCalculation}
          />
          <FlowArrow visible={stepInfo.step1.completed} />

          {/* Step 2: Protein */}
          <StepHeader
            stepNumber={2}
            title={stepInfo.step2.title}
            description={stepInfo.step2.description}
            helpText={stepInfo.step2.helpText}
            completed={stepInfo.step2.completed}
          />
          <NutritionCard
            config={nutritionConfigs[1]}
            value={dailyTargets.protein}
            isFieldDisabled={!isProteinFieldEnabled}
            onValueChange={handleTargetChange}
            onCalculatorPress={() => setIsProteinCalculatorVisible(true)}
            proteinCalculation={proteinCalculation}
          />
          <FlowArrow visible={stepInfo.step2.completed} />

          {/* Step 3: Fat & Carb Distribution */}
          {stepInfo.step1.completed && stepInfo.step2.completed && (
            <>
              <StepHeader
                stepNumber={3}
                title={stepInfo.step3.title}
                description={stepInfo.step3.description}
                helpText={stepInfo.step3.helpText}
                completed={stepInfo.step3.completed}
              />
              <MacroDistributionCard
                calories={dailyTargets.calories}
                protein={dailyTargets.protein}
                fatGrams={fatGrams}
                carbsGrams={carbsGrams}
                fatPercentage={fatPercentage}
              />
              <FatPercentageCard
                calories={dailyTargets.calories}
                fatPercentage={fatPercentage}
                fatGrams={fatGrams}
                maxFatPercentage={maxFatPercentage}
                onFatPercentageChange={handleFatPercentageChange}
              />
            </>
          )}
          
          <View style={styles.resetButtonContainer}>
            <Button
              onPress={handleResetTargets}
              variant="destructive"
              size="medium"
              shape="round"
              accessibilityLabel="Reset daily targets"
              accessibilityHint="Resets all nutrition targets to zero and clears saved calculations"
              style={styles.resetButton}
            >
              <Text style={styles.resetButtonText}>Reset Daily Targets</Text>
            </Button>
          </View>
        </View>
      </KeyboardAwareScrollView>

      <ProteinCalculatorModal
        visible={isProteinCalculatorVisible}
        onClose={() => setIsProteinCalculatorVisible(false)}
        onSelectMethod={handleProteinCalculationSelect}
        initialBodyWeight={proteinCalculation?.bodyWeight || 70}
      />

      <CalorieCalculatorModal
        visible={isCalorieCalculatorVisible}
        onClose={() => setIsCalorieCalculatorVisible(false)}
        onSelectGoal={handleCalorieGoalSelect}
      />
    </SafeAreaView>
  );
}

