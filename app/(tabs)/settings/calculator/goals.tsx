import React, { useState, useMemo } from "react";
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  TouchableOpacity,
  Text,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";

import { useTheme } from "@/providers";
import { useFoodLogStore } from "@/stores/useFoodLogStore";
import { GoalSelectionCard } from "@/shared/ui/atoms/GoalSelectionCard";
import { CALCULATION_METHODS } from "@/shared/ui/atoms/CalorieCalculationCard";
import { calculateCalorieGoals } from "@/utils/calculateCalories";
import { Button } from "@/shared/ui/atoms/Button";
import { ProgressBar } from "@/shared/ui/molecules/ProgressBar";
import type { GoalType } from "@/types";
import { StyleSheet } from "react-native";

export default function Step3GoalsScreen() {
  const { colors, theme: themeObj } = useTheme();
  const {
    calculatorParams,
    calculatorActivityLevel,
    dailyTargets,
    updateDailyTargets,
    setCalorieCalculation,
    clearCalculatorData,
  } = useFoodLogStore();

  const [selectedGoal, setSelectedGoal] = useState<GoalType | null>(null);

  const styles = useMemo(
    () => createStyles(colors, themeObj),
    [colors, themeObj]
  );

  // Calculate calorie goals based on stored params and activity level
  const calorieGoals = useMemo(() => {
    if (!calculatorParams || !calculatorActivityLevel) {
      return null;
    }
    return calculateCalorieGoals(calculatorParams, calculatorActivityLevel);
  }, [calculatorParams, calculatorActivityLevel]);

  const handleGoalSelect = async (goalType: GoalType) => {
    setSelectedGoal(goalType);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Auto-save the selected goal and complete the flow
    await handleSaveTarget(goalType, false);
  };

  const handleSaveTarget = async (goalType: GoalType, useManualValue = false) => {
    if (!calculatorParams || !calculatorActivityLevel || !calorieGoals) {
      Alert.alert("Error", "Missing calculation parameters. Please start over.");
      return;
    }

    let calories: number;

    if (useManualValue) {
      const manualValue = parseFloat(manualCalories);
      if (isNaN(manualValue) || manualValue < 1000 || manualValue > 5000) {
        Alert.alert("Invalid Input", "Please enter a calorie value between 1000 and 5000.");
        return;
      }
      calories = manualValue;
    } else {
      calories =
        calorieGoals[
          goalType === "lose"
            ? "loseWeight"
            : goalType === "maintain"
            ? "maintainWeight"
            : "gainWeight"
        ];
    }

    try {
      // Provide success haptic feedback
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Update the daily targets
      const newTargets = { ...dailyTargets, calories };
      await updateDailyTargets(newTargets);

      // Save the calculation for display on settings screen
      const selectedMethod = CALCULATION_METHODS[calculatorActivityLevel];
      setCalorieCalculation(
        selectedMethod,
        calculatorParams,
        calculatorActivityLevel,
        calories,
        goalType
      );

      // Clear calculator data and navigate back to settings
      clearCalculatorData();
      router.replace("/settings");
    } catch (error) {
      console.error("Error saving calorie target:", error);
      Alert.alert("Error", "Failed to save calorie target. Please try again.");
    }
  };

  if (!calculatorParams || !calculatorActivityLevel || !calorieGoals) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]} edges={["left", "right"]}>
        <Text style={styles.errorText}>
          Missing calculation data. Please start over.
        </Text>
        <Button onPress={() => router.replace("/settings")} style={styles.backButton}>
          Go Back
        </Button>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <SafeAreaView style={styles.container} edges={["left", "right"]}>
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <ProgressBar
            totalSteps={6}
            currentStep={6}
            accessibilityLabel="Calculator progress: step 6 of 6"
          />
        </View>

        {/* Content */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.subtitle}>
            Choose your calorie goal based on what you want to achieve.
          </Text>

          <View style={styles.goalsSection}>
            <GoalSelectionCard
              goalType="lose"
              calories={calorieGoals.loseWeight}
              isSelected={selectedGoal === "lose"}
              onSelect={handleGoalSelect}
            />

            <GoalSelectionCard
              goalType="maintain"
              calories={calorieGoals.maintainWeight}
              isSelected={selectedGoal === "maintain"}
              onSelect={handleGoalSelect}
            />

            <GoalSelectionCard
              goalType="gain"
              calories={calorieGoals.gainWeight}
              isSelected={selectedGoal === "gain"}
              onSelect={handleGoalSelect}
            />
          </View>


          {/* Footer Note */}
          <View style={styles.footer}>
            <Text style={styles.footerNote}>
              These recommendations are general guidelines based on the
              Mifflin-St Jeor equation. Consult with a nutritionist or
              healthcare provider for personalized advice.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

type Colors = ReturnType<typeof useTheme>["colors"];
type Theme = ReturnType<typeof useTheme>["theme"];

const createStyles = (colors: Colors, themeObj: Theme) => {
  const { spacing, typography } = themeObj;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.primaryBackground,
    },
    centered: {
      justifyContent: "center",
      alignItems: "center",
    },
    progressContainer: {
      paddingHorizontal: spacing.pageMargins.horizontal,
      paddingTop: spacing.md,
      paddingBottom: spacing.lg,
    },
    errorText: {
      fontSize: typography.Body.fontSize,
      fontFamily: typography.Body.fontFamily,
      color: colors.error,
      textAlign: "center",
      marginBottom: spacing.lg,
    },
    backButton: {
      minWidth: 120,
    },
    content: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: spacing.pageMargins.horizontal,
      paddingTop: spacing.lg,
      paddingBottom: 100,
    },
    subtitle: {
      fontSize: typography.Body.fontSize,
      fontFamily: typography.Body.fontFamily,
      color: colors.secondaryText,
      textAlign: "center",
      lineHeight: 22,
      marginBottom: spacing.lg,
    },
    goalsSection: {
      marginBottom: spacing.lg,
    },
    footer: {
      marginTop: spacing.xl,
      paddingTop: spacing.lg,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    footerNote: {
      fontSize: typography.Caption.fontSize,
      fontFamily: typography.Caption.fontFamily,
      color: colors.secondaryText,
      textAlign: "center",
      lineHeight: 18,
    },
  });
};