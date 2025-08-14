import React, { useEffect, useMemo } from "react";
import { View, ScrollView, KeyboardAvoidingView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/providers";
import { useFoodLogStore } from "@/stores/useFoodLogStore";
import { useNutritionCalculations } from "@/features/settings/hooks/useNutritionCalculations";
import { useKeyboardOffset } from "@/features/settings/hooks/useKeyboardOffset";
import {
  calculateFatGramsFromPercentage,
  calculateCarbsFromMacros,
} from "@/utils/nutritionCalculations";
import { StyleSheet } from "react-native";
import { Card, AppText } from "src/components";
import { CalculationInfoCard } from "@/shared/ui/molecules/CalculationInfoCard";

export default function CarbsScreen() {
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
  } = nutritionCalculations;

  const styles = useMemo(
    () => createStyles(colors, themeObj, keyboardOffset),
    [colors, themeObj, keyboardOffset]
  );

  useEffect(() => {
    loadDailyTargets();
  }, [loadDailyTargets]);

  const carbsEnabled = isCaloriesSet && isProteinSet;

  // Calculate carbs value
  const fatGrams = calculateFatGramsFromPercentage(
    dailyTargets.calories,
    fatPercentage
  );
  const carbsGrams = calculateCarbsFromMacros(
    dailyTargets.calories,
    dailyTargets.protein,
    fatGrams
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
            {carbsEnabled && (
              <View style={styles.carbsInfoContainer}>
                <AppText role="Caption">
                  Carbohydrates serve as the body's main source of quick and
                  efficient energy. (You need them for hard workouts!)
                </AppText>
                <CalculationInfoCard
                  type="carbs"
                  highlightText={`Target: ${Math.round(carbsGrams)} g`}
                  description={`${Math.round(
                    ((carbsGrams * 4) /
                      Math.max(dailyTargets.calories, 1)) *
                      100
                  )}% of calories. Remaining calories go to carbohydrates.`}
                />
              </View>
            )}
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
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.lg,
    },
    carbsInfoContainer: {
      gap: spacing.md,
    },
  });
};