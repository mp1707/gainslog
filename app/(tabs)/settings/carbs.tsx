import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/providers";
import { useFoodLogStore } from "src/store-legacy/useFoodLogStore";
import { useNutritionCalculations } from "@/hooks/useNutritionCalculations";
import {
  calculateFatGramsFromPercentage,
  calculateCarbsFromMacros,
} from "@/utils/nutritionCalculations";
import type { ColorScheme, Theme } from "@/theme";

const CarbsScreen = React.memo(function CarbsScreen() {
  const { colors, theme: themeObj, colorScheme } = useTheme();
  const { dailyTargets, isLoadingTargets } = useFoodLogStore();
  const { fatPercentage, isCaloriesSet, isProteinSet } =
    useNutritionCalculations();

  const styles = useMemo(
    () => createStyles(colors, themeObj, colorScheme),
    [colors, themeObj, colorScheme]
  );

  const carbsEnabled = isCaloriesSet && isProteinSet;

  // Calculate carbs value
  const fatGrams = useMemo(
    () => calculateFatGramsFromPercentage(dailyTargets.calories, fatPercentage),
    [dailyTargets.calories, fatPercentage]
  );

  const carbsGrams = useMemo(
    () =>
      calculateCarbsFromMacros(
        dailyTargets.calories,
        dailyTargets.protein,
        fatGrams
      ),
    [dailyTargets.calories, dailyTargets.protein, fatGrams]
  );

  const carbsPercentage = useMemo(
    () =>
      Math.round(((carbsGrams * 4) / Math.max(dailyTargets.calories, 1)) * 100),
    [carbsGrams, dailyTargets.calories]
  );

  if (isLoadingTargets) {
    return (
      <SafeAreaView
        style={[styles.container, styles.centered]}
        edges={["left", "right"]}
      >
        {/* Loading state handled by parent navigation */}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.textSection}>
          <Text style={styles.subtitle}>Carbohydrate Target</Text>
          {carbsEnabled ? (
            <Text style={styles.carbsInfo}>
              Your current target is: {Math.round(carbsGrams)}g (
              {carbsPercentage}% of calories).
            </Text>
          ) : (
            <Text style={styles.disabledInfo}>
              Set your protein target first to view your carbohydrate goal.
            </Text>
          )}
        </View>

        {/* Informational Card */}
        <View style={styles.infoCard}>
          {carbsEnabled ? (
            <>
              <Text style={styles.cardHeader}>
                Carbohydrates serve as the body's main source of quick and
                efficient energy. They're essential for hard workouts and
                optimal performance!
              </Text>

              <View style={styles.calculationSection}>
                <Text style={styles.calculationTitle}>
                  Automatic Calculation
                </Text>
                <Text style={styles.calculationDescription}>
                  {carbsPercentage}% of total calories. Remaining calories after
                  protein and fat go to carbohydrates.
                </Text>
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.footerText}>
                  Your carbohydrate target updates automatically when you adjust
                  your protein and fat targets.
                </Text>
              </View>
            </>
          ) : (
            <Text style={styles.cardHeader}>
              Set your protein and fat targets first to calculate your
              carbohydrate goal automatically.
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
});

export default CarbsScreen;

type Colors = ReturnType<typeof useTheme>["colors"];

const createStyles = (
  colors: Colors,
  themeObj: Theme,
  colorScheme: ColorScheme
) => {
  const { spacing, typography, getComponentStyles } = themeObj;
  // The 'colors' object is already theme-aware, so we pass its scheme to getComponentStyles
  const componentStyles = getComponentStyles(colorScheme);

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.primaryBackground,
    },
    centered: {
      justifyContent: "center",
      alignItems: "center",
    },
    scrollContent: {
      paddingHorizontal: spacing.pageMargins.horizontal,
      paddingBottom: spacing.xxl, // Ensures space at the bottom for better scrolling
      gap: spacing.md,
    },
    textSection: {
      paddingTop: spacing.lg,
    },
    subtitle: {
      fontSize: typography.Title2.fontSize,
      fontFamily: typography.Title2.fontFamily,
      color: colors.primaryText,
      textAlign: "center",
      marginBottom: spacing.sm,
    },
    carbsInfo: {
      fontSize: typography.Subhead.fontSize,
      fontFamily: typography.Subhead.fontFamily,
      color: colors.accent,
      textAlign: "center",
      fontWeight: "600",
      marginBottom: spacing.sm,
    },
    disabledInfo: {
      fontSize: typography.Subhead.fontSize,
      fontFamily: typography.Subhead.fontFamily,
      color: colors.secondaryText,
      textAlign: "center",
      fontWeight: "600",
      marginBottom: spacing.sm,
    },
    infoCard: {
      ...componentStyles.cards,
      borderRadius: componentStyles.cards.cornerRadius,
      borderWidth: 2,
      borderColor: colors.border,
      padding: spacing.lg,
    },
    cardHeader: {
      ...typography.Body,
      color: colors.primaryText,
      lineHeight: typography.Body.fontSize * 1.5,
      marginBottom: spacing.lg,
    },
    calculationSection: {
      gap: spacing.sm,
    },
    calculationTitle: {
      ...typography.Subhead,
      color: colors.secondaryText,
      fontWeight: "600",
      marginBottom: spacing.xs,
    },
    calculationDescription: {
      ...typography.Caption,
      color: colors.secondaryText,
      lineHeight: typography.Caption.fontSize * 1.4,
    },
    // Card Footer styling
    cardFooter: {
      borderTopWidth: 1,
      borderColor: colors.border,
      marginTop: spacing.lg,
      paddingTop: spacing.lg,
    },
    footerText: {
      ...typography.Caption,
      color: colors.secondaryText,
      textAlign: "center",
    },
  });
};
