import React, { useEffect, useMemo } from "react";
import { View, ScrollView, KeyboardAvoidingView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/providers";
import { useFoodLogStore } from "@/stores/useFoodLogStore";
import { useNutritionCalculations } from "@/features/settings/hooks/useNutritionCalculations";
import { useKeyboardOffset } from "@/features/settings/hooks/useKeyboardOffset";
import {
  calculateFatGramsFromPercentage,
  calculateMaxFatPercentage,
} from "@/utils/nutritionCalculations";
import { StyleSheet } from "react-native";
import { Card } from "src/components";
import { NutritionAccordionContent } from "@/features/settings/ui/molecules/NutritionAccordionContent";

export default function FatScreen() {
  const { loadDailyTargets, isLoadingTargets } = useFoodLogStore();
  const { colors, theme: themeObj } = useTheme();
  const keyboardOffset = useKeyboardOffset(true);

  // Use extracted hooks
  const nutritionCalculations = useNutritionCalculations();
  const {
    dailyTargets,
    fatPercentage,
    isCaloriesSet,
    isProteinSet,
    handleFatPercentageChange,
  } = nutritionCalculations;

  const styles = useMemo(
    () => createStyles(colors, themeObj, keyboardOffset),
    [colors, themeObj, keyboardOffset]
  );

  useEffect(() => {
    loadDailyTargets();
  }, [loadDailyTargets]);

  const fatEnabled = isCaloriesSet && isProteinSet;

  // Calculate values for display
  const fatGrams = calculateFatGramsFromPercentage(
    dailyTargets.calories,
    fatPercentage
  );
  const maxFatPercentage = calculateMaxFatPercentage(
    dailyTargets.calories,
    dailyTargets.protein
  );

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
          <Card style={styles.card}>
            <NutritionAccordionContent
              calculationInfo={
                fatEnabled
                  ? {
                      type: "fat",
                      highlightText: `Current: ${Math.round(fatGrams)} g • ${fatPercentage}%`,
                      description: `Maximum allowed based on your protein and calories: ${Math.round(
                        maxFatPercentage
                      )}%`,
                    }
                  : null
              }
              stepperLabel="Fat is essential for hormone production, nutrient absorption, and long-term energy storage. A scientifically based guideline for fat intake is a proportion of 25% to 35% of total daily calories. Your specific goal determines where you should position yourself within this range: for muscle gain, 25–30% is more suitable to leave more calories available for performance-enhancing carbohydrates. For fat loss, 30–35% is beneficial, as fat supports satiety and helps stabilize hormone production during a calorie deficit. Adjust the percentage of total calories that come from fat here."
              stepperValue={fatPercentage}
              stepperMin={10}
              stepperMax={Math.round(maxFatPercentage)}
              stepperStep={1}
              onStepperChange={handleFatPercentageChange}
              stepperType="fat"
              stepperDisabled={!fatEnabled}
            />
          </Card>
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
      padding: 0, // NutritionAccordionContent handles its own padding
    },
  });
};