import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/providers/ThemeProvider";
import { useFoodLogStore } from "@/stores/useFoodLogStore";
import { Button } from "@/shared/ui/atoms/Button";
import { StatusIcon } from "@/shared/ui/atoms/StatusIcon";
import { ProteinCalculatorModal } from "@/shared/ui/molecules/ProteinCalculatorModal";
import { CalorieCalculatorModal } from "@/shared/ui/molecules/CalorieCalculatorModal";
import { NutritionCard } from "@/features/settings/ui/molecules/NutritionCard";
import { MacroDistributionSection } from "@/features/settings/ui/molecules/MacroSplitCard";
import { AppearanceCard } from "@/features/settings/ui/molecules/AppearanceCard";
import { useNutritionCalculations } from "@/features/settings/hooks/useNutritionCalculations";
import { useSettingsModals } from "@/features/settings/hooks/useSettingsModals";
import { useKeyboardOffset } from "@/features/settings/hooks/useKeyboardOffset";
import {
  calculateFatGramsFromPercentage,
  calculateCarbsFromMacros,
  calculateMaxFatPercentage,
} from "@/utils/nutritionCalculations";
import { StyleSheet } from "react-native";
import { Card } from "src/components";

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
        <Text style={styles.loadingText}>Loading settings...</Text>
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
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
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

            <Card>
              {/* Step 1 - Calories */}
              <View
                style={[
                  styles.accordionItem,
                  !caloriesEnabled && styles.accordionDisabled,
                ]}
              >
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    if (!caloriesEnabled) return;
                    setExpandedStep((prev) =>
                      prev === "calories" ? null : "calories"
                    );
                  }}
                  accessibilityRole="button"
                  accessibilityState={{
                    expanded: expandedStep === "calories",
                    disabled: !caloriesEnabled,
                  }}
                  accessibilityLabel="Calorie target"
                  style={[styles.accordionHeader, styles.accordionHeaderFirst]}
                >
                  <View style={styles.headerTextContainer}>
                    <Text style={styles.accordionTitle}>Calorie target</Text>
                    <Text style={styles.accordionSummary}>
                      {isCaloriesSet
                        ? `Target: ${dailyTargets.calories} kcal`
                        : "Select a calories target"}
                    </Text>
                  </View>
                  <StatusIcon
                    type={isCaloriesSet ? "completed" : "next"}
                    accessibilityLabel={
                      isCaloriesSet
                        ? "Calorie target completed"
                        : "Next step: set calories"
                    }
                  />
                </TouchableOpacity>
                {expandedStep === "calories" && (
                  <View style={styles.accordionContent}>
                    <NutritionCard
                      config={nutritionConfigs[0]}
                      value={dailyTargets.calories}
                      isFieldDisabled={false}
                      onValueChange={handleTargetChange}
                      onCalculatorPress={() =>
                        setIsCalorieCalculatorVisible(true)
                      }
                      calorieCalculation={calorieCalculation}
                      variant="flat"
                    />
                  </View>
                )}
              </View>

              {/* Step 2 - Protein */}
              <View
                style={[
                  styles.accordionItem,
                  !proteinEnabled && styles.accordionDisabled,
                ]}
              >
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    if (!proteinEnabled) return;
                    setExpandedStep((prev) =>
                      prev === "protein" ? null : "protein"
                    );
                  }}
                  disabled={!proteinEnabled}
                  accessibilityRole="button"
                  accessibilityState={{
                    expanded: expandedStep === "protein",
                    disabled: !proteinEnabled,
                  }}
                  accessibilityLabel="Protein target"
                  style={styles.accordionHeader}
                >
                  <View style={styles.headerTextContainer}>
                    <Text style={styles.accordionTitle}>Protein target</Text>
                    <Text style={styles.accordionSummary}>
                      {proteinEnabled
                        ? isProteinSet
                          ? `Target: ${dailyTargets.protein} g`
                          : "Select a protein target"
                        : "Select a calories target first to continue"}
                    </Text>
                  </View>
                  {isProteinSet ? (
                    <StatusIcon
                      type="completed"
                      accessibilityLabel="Protein target completed"
                    />
                  ) : nextStep === "protein" ? (
                    <StatusIcon
                      type="next"
                      accessibilityLabel="Next step: set protein"
                    />
                  ) : null}
                </TouchableOpacity>
                {expandedStep === "protein" && (
                  <View style={styles.accordionContent}>
                    <NutritionCard
                      config={nutritionConfigs[1]}
                      value={dailyTargets.protein}
                      isFieldDisabled={!proteinEnabled}
                      onValueChange={handleTargetChange}
                      onCalculatorPress={() =>
                        setIsProteinCalculatorVisible(true)
                      }
                      proteinCalculation={proteinCalculation}
                      variant="flat"
                    />
                  </View>
                )}
              </View>

              {/* Step 3 - Fat */}
              <View
                style={[
                  styles.accordionItem,
                  !fatEnabled && styles.accordionDisabled,
                ]}
              >
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    if (!fatEnabled) return;
                    setExpandedStep((prev) => (prev === "fat" ? null : "fat"));
                  }}
                  disabled={!fatEnabled}
                  accessibilityRole="button"
                  accessibilityState={{
                    expanded: expandedStep === "fat",
                    disabled: !fatEnabled,
                  }}
                  accessibilityLabel="Fat target"
                  style={styles.accordionHeader}
                >
                  <View style={styles.headerTextContainer}>
                    <Text style={styles.accordionTitle}>Fat target</Text>
                    <Text style={styles.accordionSummary}>
                      {fatEnabled
                        ? `Fat: ${Math.round(
                            fatGrams
                          )} g • Fat %: ${fatPercentage}%`
                        : "Select a protein target first to continue"}
                    </Text>
                  </View>
                  {fatEnabled ? (
                    <StatusIcon
                      type="completed"
                      accessibilityLabel="Fat target ready"
                    />
                  ) : null}
                </TouchableOpacity>
                {expandedStep === "fat" && (
                  <View style={styles.accordionContent}>
                    <MacroDistributionSection
                      calories={dailyTargets.calories}
                      protein={dailyTargets.protein}
                      fatGrams={fatGrams}
                      carbsGrams={carbsGrams}
                      fatPercentage={fatPercentage}
                      maxFatPercentage={maxFatPercentage}
                      onFatPercentageChange={handleFatPercentageChange}
                      variant="flat"
                    />
                  </View>
                )}
              </View>

              {/* Step 4 - Carbs */}
              <View
                style={[
                  styles.accordionItem,
                  !carbsEnabled && styles.accordionDisabled,
                ]}
              >
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    if (!carbsEnabled) return;
                    setExpandedStep((prev) =>
                      prev === "carbs" ? null : "carbs"
                    );
                  }}
                  disabled={!carbsEnabled}
                  accessibilityRole="button"
                  accessibilityState={{
                    expanded: expandedStep === "carbs",
                    disabled: !carbsEnabled,
                  }}
                  accessibilityLabel="Carb target"
                  style={[styles.accordionHeader, styles.accordionHeaderLast]}
                >
                  <View style={styles.headerTextContainer}>
                    <Text style={styles.accordionTitle}>Carb target</Text>
                    <Text style={styles.accordionSummary}>
                      {carbsEnabled
                        ? `Carbs: ${Math.round(carbsGrams)} g`
                        : "Select a protein target first to continue"}
                    </Text>
                  </View>
                  {carbsEnabled ? (
                    <StatusIcon
                      type="completed"
                      accessibilityLabel="Carb target ready"
                    />
                  ) : null}
                </TouchableOpacity>
                {expandedStep === "carbs" && (
                  <View
                    style={[
                      styles.accordionContent,
                      styles.accordionContentLast,
                    ]}
                  >
                    <Text style={styles.accordionSummary}>
                      Carbohydrates are set automatically to the remaining
                      calories after protein and fat.
                    </Text>
                    <View style={{ height: 8 }} />
                    <Text style={styles.accordionSummary}>
                      {`Target: ${Math.round(carbsGrams)} g (${Math.round(
                        ((carbsGrams * 4) /
                          Math.max(dailyTargets.calories, 1)) *
                          100
                      )}% of calories)`}
                    </Text>
                  </View>
                )}
              </View>
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
                <Text style={styles.resetButtonText}>Reset Daily Targets</Text>
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
    </KeyboardAvoidingView>
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
    accordionContainer: {
      borderRadius: 16,
      backgroundColor: colors.secondaryBackground,
      overflow: "hidden",
    },
    accordionItem: {
      backgroundColor: "transparent",
    },
    accordionDisabled: {
      opacity: 0.5,
    },
    accordionHeader: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      backgroundColor: colors.secondaryBackground,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    accordionHeaderFirst: {
      borderTopWidth: 0,
    },
    accordionHeaderLast: {
      // keeps same style; rounded corners are on container
    },
    headerTextContainer: {
      flex: 1,
      paddingRight: spacing.md,
    },
    accordionTitle: {
      fontSize: typography.Subhead.fontSize,
      fontFamily: typography.Subhead.fontFamily,
      fontWeight: "600",
      color: colors.primaryText,
      marginBottom: 4,
    },
    accordionSummary: {
      fontSize: typography.Caption.fontSize,
      fontFamily: typography.Caption.fontFamily,
      color: colors.secondaryText,
    },
    accordionContent: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.lg,
      backgroundColor: colors.secondaryBackground,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    accordionContentLast: {
      borderBottomLeftRadius: 16,
      borderBottomRightRadius: 16,
    },
    checkIcon: {
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: colors.success,
      alignItems: "center",
      justifyContent: "center",
    },
    checkIconText: {
      color: colors.white,
      fontSize: 14,
      fontWeight: "700",
      lineHeight: 16,
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
