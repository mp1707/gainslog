import React, { useEffect, useMemo, useState } from "react";
import { View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/providers/ThemeProvider";
import { useFoodLogStore } from "@/stores/useFoodLogStore";
import { Button } from "@/shared/ui/atoms/Button";
import { StatusIcon } from "@/shared/ui/atoms/StatusIcon";
import { ProteinCalculatorModal } from "@/shared/ui/molecules/ProteinCalculatorModal";
import { CalorieCalculatorModal } from "@/shared/ui/molecules/CalorieCalculatorModal";
import { AppearanceCard } from "@/features/settings/ui/molecules/AppearanceCard";
import { AccordionItem } from "@/features/settings/ui/components/AccordionItem";
import { useNutritionCalculations } from "@/features/settings/hooks/useNutritionCalculations";
import { useSettingsModals } from "@/features/settings/hooks/useSettingsModals";
import { useKeyboardOffset } from "@/features/settings/hooks/useKeyboardOffset";
import {
  calculateFatGramsFromPercentage,
  calculateCarbsFromMacros,
  calculateMaxFatPercentage,
} from "@/utils/nutritionCalculations";
import { StyleSheet } from "react-native";
import { Card, AppText } from "src/components";
import { CalculationInfoCard } from "@/shared/ui/molecules/CalculationInfoCard";
import { SettingsSection } from "@/shared/ui/molecules/SettingsSection";
import { NutritionAccordionContent } from "@/features/settings/ui/molecules/NutritionAccordionContent";

export default function SettingsTab() {
  const { loadDailyTargets, isLoadingTargets } = useFoodLogStore();
  const { colors, theme: themeObj } = useTheme();
  const keyboardOffset = useKeyboardOffset(true); // true because we have a tab bar

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
  } = useSettingsModals(
    handleTargetChange,
    () => setExpandedStep("protein"), // onCalorieCalculatorComplete
    () => setExpandedStep("fat")      // onProteinCalculatorComplete
  );

  const styles = useMemo(
    () => createStyles(colors, themeObj, keyboardOffset),
    [colors, themeObj, keyboardOffset]
  );

  useEffect(() => {
    loadDailyTargets();
  }, [loadDailyTargets]);

  type StepKey = "calories" | "protein" | "fat" | "carbs";
  const [expandedStep, setExpandedStep] = useState<StepKey | null>("calories");

  const caloriesEnabled = true;
  const proteinEnabled = isCaloriesSet;
  const fatEnabled = isCaloriesSet && isProteinSet;
  const carbsEnabled = isCaloriesSet && isProteinSet;


  // Ensure the currently expanded step is always enabled; if not, fallback to the earliest enabled step
  useEffect(() => {
    if (
      (expandedStep === "fat" && !fatEnabled) ||
      (expandedStep === "carbs" && !carbsEnabled)
    ) {
      setExpandedStep(proteinEnabled ? "protein" : "calories");
    } else if (expandedStep === "protein" && !proteinEnabled) {
      setExpandedStep("calories");
    }
  }, [expandedStep, proteinEnabled, fatEnabled, carbsEnabled]);

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
        <AppText role="Body" color="secondary">
          Loading settings...
        </AppText>
      </SafeAreaView>
    );
  }

  const { fatGrams, carbsGrams, maxFatPercentage } = calculateMacroValues();

  // Determine next step for guidance icon
  const nextStep: StepKey | null = !isCaloriesSet
    ? "calories"
    : !isProteinSet
    ? "protein"
    : null;

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <SettingsSection
          title="Appearance"
          subtitle="Customize the visual appearance of your app"
        >
          <AppearanceCard />
        </SettingsSection>

        <SettingsSection
          title="Nutrition Tracking"
          subtitle="Set up your daily targets"
        >

          <Card>
            <AccordionItem
              title="Calories"
              subtitle={
                isCaloriesSet
                  ? `Target: ${dailyTargets.calories} kcal`
                  : "Set target"
              }
              accessibilityLabel="Calories"
              rightAccessory={
                <StatusIcon
                  type={isCaloriesSet ? "completed" : "next"}
                  accessibilityLabel={
                    isCaloriesSet
                      ? "Calorie target completed"
                      : "Next step: set calories"
                  }
                />
              }
              disabled={!caloriesEnabled}
              expanded={expandedStep === "calories"}
              onToggle={() =>
                setExpandedStep((prev) =>
                  prev === "calories" ? null : "calories"
                )
              }
              isFirst
            >
              <NutritionAccordionContent
                calculatorType="calories"
                calculatorDescription="Get a personalized calories target based on your body and goals. (Recommended)"
                onCalculatorPress={() => setIsCalorieCalculatorVisible(true)}
                calculationInfo={
                  calorieCalculation
                    ? {
                        type: "calories",
                        headerTitle:
                          calorieCalculation.goalType === "lose"
                            ? "Lose Weight"
                            : calorieCalculation.goalType === "maintain"
                            ? "Maintain Weight"
                            : "Gain Weight",
                        headerSubtitle: `${
                          calorieCalculation.params.sex === "male"
                            ? "Male"
                            : "Female"
                        }, ${calorieCalculation.params.age} years, ${
                          calorieCalculation.params.weight
                        }kg, ${calorieCalculation.params.height}cm`,
                        highlightText: `Activity Level: ${calorieCalculation.method.label}`,
                        description: calorieCalculation.method.description,
                      }
                    : null
                }
                stepperLabel="Or set your own target below."
                stepperValue={dailyTargets.calories}
                stepperMin={nutritionConfigs[0].min}
                stepperMax={nutritionConfigs[0].max}
                stepperStep={nutritionConfigs[0].step}
                onStepperChange={(newValue) =>
                  handleTargetChange("calories", newValue)
                }
                stepperType="calories"
                stepperDisabled={false}
              />
            </AccordionItem>

            <AccordionItem
              title="Protein"
              subtitle={
                proteinEnabled
                  ? isProteinSet
                    ? `Target: ${dailyTargets.protein} g`
                    : "Set target"
                  : "Set calories first"
              }
              accessibilityLabel="Protein target"
              rightAccessory={
                isProteinSet ? (
                  <StatusIcon
                    type="completed"
                    accessibilityLabel="Protein target completed"
                  />
                ) : nextStep === "protein" ? (
                  <StatusIcon
                    type="next"
                    accessibilityLabel="Next step: set protein"
                  />
                ) : null
              }
              disabled={!proteinEnabled}
              expanded={expandedStep === "protein"}
              onToggle={() =>
                setExpandedStep((prev) =>
                  prev === "protein" ? null : "protein"
                )
              }
            >
              <NutritionAccordionContent
                calculatorType="protein"
                calculatorDescription="Get a personalized protein target based on your body weight."
                onCalculatorPress={() => setIsProteinCalculatorVisible(true)}
                calculationInfo={
                  proteinCalculation
                    ? {
                        type: "protein",
                        headerTitle: proteinCalculation.method.title,
                        headerSubtitle: `${proteinCalculation.bodyWeight}kg body weight`,
                        highlightText: `Recommended: ${proteinCalculation.calculatedProtein}g daily`,
                        description: proteinCalculation.method.description,
                      }
                    : null
                }
                stepperLabel="Set your own target below."
                stepperValue={dailyTargets.protein}
                stepperMin={nutritionConfigs[1].min}
                stepperMax={nutritionConfigs[1].max}
                stepperStep={nutritionConfigs[1].step}
                onStepperChange={(newValue) =>
                  handleTargetChange("protein", newValue)
                }
                stepperType="protein"
                stepperDisabled={!proteinEnabled}
              />
            </AccordionItem>

            <AccordionItem
              title="Fat"
              subtitle={
                fatEnabled
                  ? `Target: ${Math.round(
                      fatGrams
                    )} g (${fatPercentage}% of total calories)`
                  : "Set protein first"
              }
              accessibilityLabel="Fat target"
              rightAccessory={
                fatEnabled ? (
                  <StatusIcon
                    type="completed"
                    accessibilityLabel="Fat target ready"
                  />
                ) : null
              }
              disabled={!fatEnabled}
              expanded={expandedStep === "fat"}
              onToggle={() =>
                setExpandedStep((prev) => (prev === "fat" ? null : "fat"))
              }
            >
              <NutritionAccordionContent
                calculationInfo={
                  fatEnabled
                    ? {
                        type: "fat",
                        highlightText: `Current: ${Math.round(
                          fatGrams
                        )} g • ${fatPercentage}%`,
                        description: `Maximum allowed based on your protein and calories: ${Math.round(
                          maxFatPercentage
                        )}%`,
                      }
                    : null
                }
                stepperLabel="Adjust the percentage of total calories that come from fat."
                stepperValue={fatPercentage}
                stepperMin={10}
                stepperMax={Math.round(maxFatPercentage)}
                stepperStep={1}
                onStepperChange={handleFatPercentageChange}
                stepperType="fat"
                stepperDisabled={!fatEnabled}
              />
            </AccordionItem>

            <AccordionItem
              title="Carbs"
              subtitle={
                carbsEnabled
                  ? `Target: ${Math.round(carbsGrams)} g`
                  : "Set protein first"
              }
              accessibilityLabel="Carb target"
              rightAccessory={
                carbsEnabled ? (
                  <StatusIcon
                    type="completed"
                    accessibilityLabel="Carb target ready"
                  />
                ) : null
              }
              disabled={!carbsEnabled}
              expanded={expandedStep === "carbs"}
              onToggle={() =>
                setExpandedStep((prev) => (prev === "carbs" ? null : "carbs"))
              }
            >
              {carbsEnabled && (
                <CalculationInfoCard
                  type="carbs"
                  highlightText={`Target: ${Math.round(carbsGrams)} g`}
                  description={`${Math.round(
                    ((carbsGrams * 4) / Math.max(dailyTargets.calories, 1)) *
                      100
                  )}% of calories. Remaining calories go to carbohydrates.`}
                />
              )}
            </AccordionItem>
          </Card>

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
              <AppText role="Button" color="white">
                Reset daily targets
              </AppText>
            </Button>
          </View>
        </SettingsSection>
      </ScrollView>

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
  const { spacing } = themeObj;

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
    resetButtonContainer: {
      marginTop: spacing.lg,
      alignItems: "center",
    },
    resetButton: {
      minWidth: 200,
    },
    settingInfo: {
      flex: 1,
      marginRight: spacing.lg,
    },
  });
};
