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
import { SettingsSection } from "@/shared/ui/molecules/SettingsSection";

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
          <SettingsSection
            title="Daily Fat Target"
            subtitle="Adjust the percentage of total calories that come from fat"
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
              stepperLabel="Fat is essential for hormone production, nutrient absorption, and long-term energy storage.\n\nScientifically based guideline: 25-35% of total daily calories from fat.\n\n• Muscle gain: 25-30% (leaves more calories for performance-enhancing carbohydrates)\n• Fat loss: 30-35% (fat supports satiety and hormone production during calorie deficit)"
              stepperValue={fatPercentage}
              stepperMin={10}
              stepperMax={Math.round(maxFatPercentage)}
              stepperStep={1}
              onStepperChange={handleFatPercentageChange}
              stepperType="fat"
              stepperDisabled={!fatEnabled}
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