import React, { useEffect, useMemo } from "react";
import { View, ScrollView, KeyboardAvoidingView, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useTheme } from "@/providers";
import { useFoodLogStore } from "@/stores/useFoodLogStore";
import { useNutritionCalculations } from "@/features/settings/hooks/useNutritionCalculations";
import { useKeyboardOffset } from "@/features/settings/hooks/useKeyboardOffset";
import { StyleSheet } from "react-native";
import { Card } from "src/components";
import { NutritionAccordionContent } from "@/features/settings/ui/molecules/NutritionAccordionContent";
import { SettingsSection } from "@/shared/ui/molecules/SettingsSection";

export default function CaloriesScreen() {
  const { loadDailyTargets, isLoadingTargets, calorieCalculation } = useFoodLogStore();
  const { colors, theme: themeObj } = useTheme();
  const keyboardOffset = useKeyboardOffset(true);

  // Use extracted hooks
  const nutritionCalculations = useNutritionCalculations();
  const {
    dailyTargets,
    handleTargetChange,
  } = nutritionCalculations;

  const styles = useMemo(
    () => createStyles(colors, themeObj, keyboardOffset),
    [colors, themeObj, keyboardOffset]
  );

  // Nutrition configuration for calories
  const caloriesConfig = {
    key: "calories" as const,
    label: "Calories",
    unit: "kcal",
    min: 1000,
    max: 5000,
    step: 50,
  };

  if (isLoadingTargets) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]} edges={["left", "right"]}>
        {/* Loading state handled by parent navigation */}
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
      <SafeAreaView style={styles.container} edges={["left", "right"]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <SettingsSection
            title="Daily Calorie Target"
            subtitle="Set your daily calorie goal using our calculator or manually adjust the target below"
          >
            <Card style={styles.card}>
            <NutritionAccordionContent
              calculatorType="calories"
              calculatorDescription="Calories provide the body with energy to perform all physical and mental activities. Get a personalized calories target based on your body and goals. (Recommended)"
              onCalculatorPress={() => router.push("/settings/calculator/sex")}
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
                        calorieCalculation.params.sex === "male" ? "Male" : "Female"
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
              stepperMin={caloriesConfig.min}
              stepperMax={caloriesConfig.max}
              stepperStep={caloriesConfig.step}
              onStepperChange={(newValue) => handleTargetChange("calories", newValue)}
              stepperType="calories"
              stepperDisabled={false}
            />
            </Card>
          </SettingsSection>
        </ScrollView>
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
      padding: spacing.lg,
    },
  });
};