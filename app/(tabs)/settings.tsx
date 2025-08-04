import React, { useEffect, useMemo } from "react";
import { View, Text, ScrollView } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/providers/ThemeProvider";
import { useFoodLogStore } from "@/stores/useFoodLogStore";
import { Button } from "@/shared/ui/atoms/Button";
import { ProteinCalculatorModal } from "@/shared/ui/molecules/ProteinCalculatorModal";
import { CalorieCalculatorModal } from "@/shared/ui/molecules/CalorieCalculatorModal";
import { StepHeader } from "@/shared/ui/molecules/StepHeader";
import { FlowArrow } from "@/shared/ui/atoms/FlowArrow";
import { NutritionCard } from "@/features/settings/ui/molecules/NutritionCard";
import { MacroSplitCard } from "@/features/settings/ui/molecules/MacroSplitCard";
import { AppearanceCard } from "@/features/settings/ui/molecules/AppearanceCard";
import { useNutritionCalculations } from "@/features/settings/hooks/useNutritionCalculations";
import { useStepFlow } from "@/features/settings/hooks/useStepFlow";
import { useSettingsModals } from "@/features/settings/hooks/useSettingsModals";
import {
  calculateFatGramsFromPercentage,
  calculateCarbsFromMacros,
  calculateMaxFatPercentage,
} from "@/utils/nutritionCalculations";
import { StyleSheet } from "react-native";

export default function SettingsTab() {
  const { loadDailyTargets, isLoadingTargets } = useFoodLogStore();
  const { colors, theme: themeObj } = useTheme();

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

  const { stepInfo, isCaloriesFieldEnabled, isProteinFieldEnabled } =
    useStepFlow(isCaloriesSet, isProteinSet);

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

  const styles = useMemo(
    () => createStyles(colors, themeObj),
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
    const fatGrams = calculateFatGramsFromPercentage(
      dailyTargets.calories,
      fatPercentage
    );
    const carbsGrams = calculateCarbsFromMacros(
      dailyTargets.calories,
      dailyTargets.protein,
      fatGrams
    );
    const maxFatPercentage = calculateMaxFatPercentage(
      dailyTargets.calories,
      dailyTargets.protein
    );

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
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
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
          {stepInfo.step1.completed && (
            <>
              <StepHeader
                stepNumber={2}
                title={stepInfo.step2.title}
                description={stepInfo.step2.description}
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
            </>
          )}

          {/* Step 3: Fat & Carb Distribution */}
          {stepInfo.step2.completed && (
            <>
              <StepHeader
                stepNumber={3}
                title={stepInfo.step3.title}
                description={stepInfo.step3.description}
                completed={stepInfo.step3.completed}
              />
              <MacroSplitCard
                calories={dailyTargets.calories}
                protein={dailyTargets.protein}
                fatGrams={fatGrams}
                carbsGrams={carbsGrams}
                fatPercentage={fatPercentage}
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
        </ScrollView>
      </KeyboardAvoidingView>

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

type Colors = ReturnType<typeof useTheme>["colors"];
type Theme = ReturnType<typeof useTheme>["theme"];

const createStyles = (
  colors: Colors,
  themeObj: Theme,
  bottomPadding?: number
) => {

  const { typography, spacing } = themeObj;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.primaryBackground,
    },
    centered: {
      justifyContent: "center",
      alignItems: "center",
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: themeObj.spacing.pageMargins.horizontal,
      paddingTop: spacing.lg,
      paddingBottom: bottomPadding || spacing.xl,
    },
    section: {
      marginBottom: spacing.xl,
    },
    sectionTitle: {
      fontSize: typography.Title2.fontSize,
      fontFamily: typography.Title2.fontFamily,
      fontWeight: typography.Title2.fontWeight,
      color: colors.primaryText,
      marginBottom: spacing.xs,
    },
    sectionSubtitle: {
      fontSize: typography.Body.fontSize,
      fontFamily: typography.Body.fontFamily,
      color: colors.secondaryText,
      lineHeight: 22,
      marginBottom: spacing.lg,
    },
    loadingText: {
      fontSize: typography.Body.fontSize,
      fontFamily: typography.Body.fontFamily,
      color: colors.secondaryText,
    },
    resetButtonContainer: {
      marginTop: spacing.lg,
      alignItems: "center",
    },
    resetButton: {
      minWidth: 200,
    },
    resetButtonText: {
      fontSize: typography.Body.fontSize,
      fontFamily: typography.Body.fontFamily,
      fontWeight: "600",
    },
  });
};
