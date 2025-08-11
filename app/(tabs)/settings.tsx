import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/providers/ThemeProvider";
import { useFoodLogStore } from "@/stores/useFoodLogStore";
import { Button } from "@/shared/ui/atoms/Button";
import { StatusIcon } from "@/shared/ui/atoms/StatusIcon";
import { ProteinCalculatorModal } from "@/shared/ui/molecules/ProteinCalculatorModal";
import { CalorieCalculatorModal } from "@/shared/ui/molecules/CalorieCalculatorModal";
import { Stepper } from "@/shared/ui/atoms/Stepper";
import { AnimatedCalculatorButton } from "@/shared/ui/atoms/AnimatedCalculatorButton";
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
import { NutritionSlider } from "@/shared/ui/atoms/NutritionSlider";

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
  } = useSettingsModals(handleTargetChange);

  const styles = useMemo(
    () => createStyles(colors, themeObj, keyboardOffset),
    [colors, themeObj, keyboardOffset]
  );

  useEffect(() => {
    loadDailyTargets();
  }, [loadDailyTargets]);

  type StepKey = "calories" | "protein" | "fat" | "carbs";
  const [expandedStep, setExpandedStep] = useState<StepKey | null>("calories");
  const prevIsCaloriesSet = useRef(isCaloriesSet);
  const prevIsProteinSet = useRef(isProteinSet);

  const caloriesEnabled = true;
  const proteinEnabled = isCaloriesSet;
  const fatEnabled = isCaloriesSet && isProteinSet;
  const carbsEnabled = isCaloriesSet && isProteinSet;

  // Auto-advance when a step transitions to completed
  useEffect(() => {
    if (!prevIsCaloriesSet.current && isCaloriesSet) {
      setExpandedStep("protein");
    }
    if (!prevIsProteinSet.current && isProteinSet) {
      setExpandedStep("fat");
    }
    prevIsCaloriesSet.current = isCaloriesSet;
    prevIsProteinSet.current = isProteinSet;
  }, [isCaloriesSet, isProteinSet]);

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
        <View style={styles.section}>
          <AppText role="Title2" style={styles.sectionTitle}>
            Appearance
          </AppText>
          <AppText role="Body" color="secondary" style={styles.sectionSubtitle}>
            Customize the visual appearance of your app
          </AppText>
          <AppearanceCard />
        </View>

        <View style={styles.section}>
          <AppText role="Title2" style={styles.sectionTitle}>
            Nutrition Tracking
          </AppText>
          <AppText role="Body" color="secondary" style={styles.sectionSubtitle}>
            Set up your daily targets
          </AppText>

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
              {/** Recommended section with primary calculator CTA */}
              <View style={styles.recommendedSection}>
                <AppText role="Caption" style={{ marginBottom: 4 }}>
                  Recommended
                </AppText>
                <AppText
                  role="Body"
                  color="secondary"
                  style={{ marginBottom: 16 }}
                >
                  Get a personalized calories target based on your body and
                  goals.
                </AppText>
                <AnimatedCalculatorButton
                  isCalorieCard
                  onPress={() => setIsCalorieCalculatorVisible(true)}
                  variant="primary"
                  hasCalculation={!!calorieCalculation}
                />
              </View>

              {/** Selected calculation details */}
              {!!calorieCalculation && (
                <View style={styles.calculationInfoCalories}>
                  <View style={styles.calculationHeader}>
                    <AppText role="Headline" style={{ marginBottom: 2 }}>
                      {calorieCalculation.goalType === "lose"
                        ? "Lose Weight"
                        : calorieCalculation.goalType === "maintain"
                        ? "Maintain Weight"
                        : "Gain Weight"}
                    </AppText>
                    <AppText role="Body" color="secondary">
                      {calorieCalculation.params.sex === "male"
                        ? "Male"
                        : "Female"}
                      , {calorieCalculation.params.age} years,{" "}
                      {calorieCalculation.params.weight}kg,{" "}
                      {calorieCalculation.params.height}cm
                    </AppText>
                  </View>
                  <AppText
                    role="Headline"
                    style={{ color: colors.semantic.calories, marginBottom: 8 }}
                  >
                    Activity Level: {calorieCalculation.method.label}
                  </AppText>
                  <AppText role="Body" color="secondary">
                    {calorieCalculation.method.description}
                  </AppText>
                </View>
              )}

              {/** Manual override section */}
              <View style={styles.manualOverrideSection}>
                <View style={styles.manualOverrideSectionHeader}>
                  <AppText role="Caption" style={{ marginBottom: 8 }}>
                    Manual
                  </AppText>
                  <AppText role="Body" color="secondary">
                    Set your own target below.
                  </AppText>
                </View>
                <View style={styles.nutritionSettingRow}>
                  <View style={styles.settingInfo}>
                    <AppText role="Headline" style={{ marginBottom: 4 }}>
                      Daily target
                    </AppText>
                    <AppText role="Body" color="secondary">
                      Adjust your daily calories goal
                    </AppText>
                  </View>
                  <Stepper
                    value={dailyTargets.calories}
                    min={nutritionConfigs[0].min}
                    max={nutritionConfigs[0].max}
                    step={nutritionConfigs[0].step}
                    onChange={(newValue) =>
                      handleTargetChange("calories", newValue)
                    }
                    type="calories"
                    disabled={false}
                  />
                </View>
              </View>
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
              {/** Recommended section with primary calculator CTA */}
              {!isProteinSet && proteinEnabled && (
                <View style={styles.recommendedSection}>
                  <AppText role="Caption" style={{ marginBottom: 4 }}>
                    Recommended
                  </AppText>
                  <AppText
                    role="Body"
                    color="secondary"
                    style={{ marginBottom: 16 }}
                  >
                    Get a personalized protein target based on your body weight.
                  </AppText>
                  <AnimatedCalculatorButton
                    isCalorieCard={false}
                    onPress={() => setIsProteinCalculatorVisible(true)}
                    variant="primary"
                    hasCalculation={!!proteinCalculation}
                  />
                </View>
              )}

              {/** Selected calculation details */}
              {!!proteinCalculation && (
                <View style={styles.calculationInfoProtein}>
                  <View style={styles.calculationHeader}>
                    <AppText role="Headline" style={{ marginBottom: 2 }}>
                      {proteinCalculation.method.title}
                    </AppText>
                    <AppText role="Body" color="secondary">
                      {proteinCalculation.bodyWeight}kg body weight
                    </AppText>
                  </View>
                  <AppText
                    role="Headline"
                    style={{ color: colors.semantic.protein, marginBottom: 8 }}
                  >
                    Recommended: {proteinCalculation.calculatedProtein}g daily
                  </AppText>
                  <AppText role="Body" color="secondary">
                    {proteinCalculation.method.description}
                  </AppText>
                </View>
              )}

              {/** Manual override section */}
              <View style={styles.manualOverrideSection}>
                <View style={styles.manualOverrideSectionHeader}>
                  <AppText role="Caption" style={{ marginBottom: 8 }}>
                    Manual
                  </AppText>
                  <AppText role="Body" color="secondary">
                    Set your own target below.
                  </AppText>
                </View>
                <View style={styles.nutritionSettingRow}>
                  <View style={styles.settingInfo}>
                    <AppText role="Headline" style={{ marginBottom: 4 }}>
                      Daily target
                    </AppText>
                    <AppText role="Body" color="secondary">
                      Adjust your daily protein goal
                    </AppText>
                  </View>
                  <Stepper
                    value={dailyTargets.protein}
                    min={nutritionConfigs[1].min}
                    max={nutritionConfigs[1].max}
                    step={nutritionConfigs[1].step}
                    onChange={(newValue) =>
                      handleTargetChange("protein", newValue)
                    }
                    type="protein"
                    disabled={!proteinEnabled}
                  />
                </View>
              </View>
            </AccordionItem>

            <AccordionItem
              title="Fat"
              subtitle={
                fatEnabled
                  ? `${Math.round(fatGrams)} g • ${fatPercentage}%`
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
              {fatEnabled && (
                <View style={styles.calculationInfoFat}>
                  <AppText
                    role="Headline"
                    style={{ color: colors.semantic.fat, marginBottom: 8 }}
                  >
                    Current: {Math.round(fatGrams)} g • {fatPercentage}%
                  </AppText>
                  <AppText role="Body" color="secondary">
                    Maximum allowed based on your protein and calories:{" "}
                    {Math.round(maxFatPercentage)}%
                  </AppText>
                </View>
              )}

              <View style={styles.manualOverrideSection}>
                <View style={styles.manualOverrideSectionHeader}>
                  <AppText role="Caption" style={{ marginBottom: 8 }}>
                    Manual
                  </AppText>
                  <AppText role="Body" color="secondary">
                    Adjust the percentage of total calories that come from fat.
                  </AppText>
                </View>
                <NutritionSlider
                  label="Fat Percentage"
                  unit="%"
                  value={fatPercentage}
                  minimumValue={10}
                  maximumValue={maxFatPercentage}
                  step={1}
                  onValueChange={handleFatPercentageChange}
                />
              </View>
            </AccordionItem>

            <AccordionItem
              title="Carbs"
              subtitle={
                carbsEnabled
                  ? `${Math.round(carbsGrams)} g`
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
                <View style={styles.calculationInfoCarbs}>
                  <AppText
                    role="Headline"
                    style={{ color: colors.semantic.carbs, marginBottom: 8 }}
                  >
                    Target: {Math.round(carbsGrams)} g
                  </AppText>
                  <AppText role="Body" color="secondary">
                    {`${Math.round(
                      ((carbsGrams * 4) / Math.max(dailyTargets.calories, 1)) *
                        100
                    )}% of calories. Remaining calories go to carbohydrates.`}
                  </AppText>
                </View>
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
        </View>
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
    section: {
      marginBottom: spacing.xl,
    },
    sectionTitle: {
      marginBottom: spacing.xs,
    },
    sectionSubtitle: {
      marginBottom: spacing.lg,
    },
    resetButtonContainer: {
      marginTop: spacing.lg,
      alignItems: "center",
    },
    resetButton: {
      minWidth: 200,
    },
    // Inline accordion content styles (moved from removed NutritionCard)
    recommendedSection: {
      marginTop: spacing.sm,
      marginBottom: spacing.xl,
    },
    manualOverrideSection: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: spacing.lg,
    },
    manualOverrideSectionHeader: {
      marginBottom: spacing.lg,
    },
    nutritionSettingRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      paddingVertical: spacing.lg,
    },
    settingInfo: {
      flex: 1,
      marginRight: spacing.lg,
    },
    calculationHeader: {
      marginBottom: spacing.sm,
    },
    calculationInfoCalories: {
      backgroundColor: colors.semanticBadges.calories.background,
      borderRadius: 16,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      shadowColor: colors.semantic.calories,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 1,
    },
    calculationInfoProtein: {
      backgroundColor: colors.semanticBadges.protein.background,
      borderRadius: 16,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      shadowColor: colors.semantic.protein,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 1,
    },
    calculationInfoFat: {
      backgroundColor: colors.semanticBadges.fat.background,
      borderRadius: 16,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      shadowColor: colors.semantic.fat,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 1,
    },
    calculationInfoCarbs: {
      backgroundColor: colors.semanticBadges.carbs.background,
      borderRadius: 16,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      shadowColor: colors.semantic.carbs,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 1,
    },
  });
};
