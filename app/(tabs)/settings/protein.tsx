import React, { useEffect, useMemo } from "react";
import { View, ScrollView, KeyboardAvoidingView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/providers";
import { useFoodLogStore } from "@/stores/useFoodLogStore";
import { ProteinCalculatorModal } from "@/shared/ui/molecules/ProteinCalculatorModal";
import { useNutritionCalculations } from "@/features/settings/hooks/useNutritionCalculations";
import { useSettingsModals } from "@/features/settings/hooks/useSettingsModals";
import { useKeyboardOffset } from "@/features/settings/hooks/useKeyboardOffset";
import { StyleSheet } from "react-native";
import { Card } from "src/components";
import { NutritionAccordionContent } from "@/features/settings/ui/molecules/NutritionAccordionContent";

export default function ProteinScreen() {
  const { loadDailyTargets, isLoadingTargets } = useFoodLogStore();
  const { colors, theme: themeObj } = useTheme();
  const keyboardOffset = useKeyboardOffset(true);

  // Use extracted hooks
  const nutritionCalculations = useNutritionCalculations();
  const {
    dailyTargets,
    isCaloriesSet,
    handleTargetChange,
  } = nutritionCalculations;

  const {
    isProteinCalculatorVisible,
    setIsProteinCalculatorVisible,
    proteinCalculation,
    handleProteinCalculationSelect,
  } = useSettingsModals(
    handleTargetChange,
    () => {}, // No navigation callbacks needed here
    () => {}
  );

  const styles = useMemo(
    () => createStyles(colors, themeObj, keyboardOffset),
    [colors, themeObj, keyboardOffset]
  );

  useEffect(() => {
    loadDailyTargets();
  }, [loadDailyTargets]);

  // Nutrition configuration for protein
  const proteinConfig = {
    key: "protein" as const,
    label: "Protein",
    unit: "g",
    min: 50,
    max: 500,
    step: 5,
  };

  const proteinEnabled = isCaloriesSet;

  if (isLoadingTargets) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]} edges={["top", "left", "right"]}>
        {/* Loading state handled by parent navigation */}
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
      <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Card style={styles.card}>
            <NutritionAccordionContent
              calculatorType="protein"
              calculatorDescription="Protein supports muscle growth, repair, and the maintenance of body tissues. Get a personalized protein target based on your body weight."
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
              stepperMin={proteinConfig.min}
              stepperMax={proteinConfig.max}
              stepperStep={proteinConfig.step}
              onStepperChange={(newValue) => handleTargetChange("protein", newValue)}
              stepperType="protein"
              stepperDisabled={!proteinEnabled}
            />
          </Card>
        </ScrollView>

        <ProteinCalculatorModal
          visible={isProteinCalculatorVisible}
          onClose={() => setIsProteinCalculatorVisible(false)}
          onSelectMethod={handleProteinCalculationSelect}
          initialBodyWeight={proteinCalculation?.bodyWeight}
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
    card: {
      padding: 0, // NutritionAccordionContent handles its own padding
    },
  });
};