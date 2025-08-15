import React, { useState, useMemo } from "react";
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  TouchableOpacity,
  Text,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { CaretLeftIcon } from "phosphor-react-native";
import * as Haptics from "expo-haptics";

import { useTheme } from "@/providers";
import { useFoodLogStore } from "@/stores/useFoodLogStore";
import { GoalSelectionCard } from "@/shared/ui/atoms/GoalSelectionCard";
import { CALCULATION_METHODS } from "@/shared/ui/atoms/CalorieCalculationCard";
import { calculateCalorieGoals } from "@/utils/calculateCalories";
import { Button } from "@/shared/ui/atoms/Button";
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
  const [showManualAdjust, setShowManualAdjust] = useState(false);
  const [manualCalories, setManualCalories] = useState("");

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

  const handleGoalSelect = (goalType: GoalType) => {
    setSelectedGoal(goalType);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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

      // Clear calculator data and navigate back
      clearCalculatorData();
      router.back();
    } catch (error) {
      console.error("Error saving calorie target:", error);
      Alert.alert("Error", "Failed to save calorie target. Please try again.");
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleManualAdjust = () => {
    if (!selectedGoal || !calorieGoals) return;

    const baseCalories =
      calorieGoals[
        selectedGoal === "lose"
          ? "loseWeight"
          : selectedGoal === "maintain"
          ? "maintainWeight"
          : "gainWeight"
      ];

    setManualCalories(String(baseCalories));
    setShowManualAdjust(true);
  };

  const handleManualSave = () => {
    if (!selectedGoal) return;
    handleSaveTarget(selectedGoal, true);
  };

  if (!calculatorParams || !calculatorActivityLevel || !calorieGoals) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]} edges={["left", "right"]}>
        <Text style={styles.errorText}>
          Missing calculation data. Please start over.
        </Text>
        <Button onPress={() => router.back()} style={styles.backButton}>
          Go Back
        </Button>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <SafeAreaView style={styles.container} edges={["left", "right"]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
          >
            <CaretLeftIcon size={24} color={colors.accent} />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Choose Your Goal</Text>
            <Text style={styles.stepIndicator}>Step 6 of 6</Text>
          </View>
          <View style={styles.headerSpacer} />
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

          {/* Manual Adjustment Section */}
          {selectedGoal && !showManualAdjust && (
            <View style={styles.manualSection}>
              <Button
                onPress={handleManualAdjust}
                variant="secondary"
                size="medium"
                style={styles.manualButton}
              >
                Manually Adjust Target
              </Button>
            </View>
          )}

          {/* Manual Input */}
          {showManualAdjust && (
            <View style={styles.manualInputCard}>
              <Text style={styles.manualTitle}>Manual Calorie Target</Text>
              <Text style={styles.manualSubtitle}>
                Enter your preferred daily calorie target (1000-5000 kcal)
              </Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.manualInput}
                  value={manualCalories}
                  onChangeText={setManualCalories}
                  placeholder="2000"
                  placeholderTextColor={colors.secondaryText}
                  keyboardType="numeric"
                  maxLength={4}
                  selectTextOnFocus
                />
                <Text style={styles.inputUnit}>kcal</Text>
              </View>
              <View style={styles.manualButtons}>
                <Button
                  onPress={() => setShowManualAdjust(false)}
                  variant="secondary"
                  size="medium"
                  style={styles.manualCancelButton}
                >
                  Cancel
                </Button>
                <Button
                  onPress={handleManualSave}
                  variant="primary"
                  size="medium"
                  style={styles.manualSaveButton}
                >
                  Save Target
                </Button>
              </View>
            </View>
          )}

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
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.pageMargins.horizontal,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    titleContainer: {
      flex: 1,
      alignItems: "center",
    },
    title: {
      fontSize: typography.Headline.fontSize,
      fontFamily: typography.Headline.fontFamily,
      color: colors.primaryText,
      textAlign: "center",
    },
    stepIndicator: {
      fontSize: typography.Caption.fontSize,
      fontFamily: typography.Caption.fontFamily,
      color: colors.secondaryText,
      marginTop: 2,
    },
    headerSpacer: {
      width: 24, // Same width as back button
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
    manualSection: {
      alignItems: "center",
      marginBottom: spacing.lg,
    },
    manualButton: {
      minWidth: 200,
    },
    manualInputCard: {
      backgroundColor: colors.secondaryBackground,
      borderRadius: themeObj.components.cards.cornerRadius,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    manualTitle: {
      fontSize: typography.Headline.fontSize,
      fontFamily: typography.Headline.fontFamily,
      color: colors.primaryText,
      marginBottom: spacing.sm,
      textAlign: "center",
    },
    manualSubtitle: {
      fontSize: typography.Body.fontSize,
      fontFamily: typography.Body.fontFamily,
      color: colors.secondaryText,
      textAlign: "center",
      marginBottom: spacing.lg,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.lg,
    },
    manualInput: {
      backgroundColor: colors.primaryBackground,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: themeObj.components.buttons.cornerRadius,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      fontSize: typography.Body.fontSize,
      fontFamily: typography.Body.fontFamily,
      color: colors.primaryText,
      textAlign: "center",
      minWidth: 80,
      marginRight: spacing.sm,
    },
    inputUnit: {
      fontSize: typography.Body.fontSize,
      fontFamily: typography.Body.fontFamily,
      color: colors.primaryText,
    },
    manualButtons: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: spacing.md,
    },
    manualCancelButton: {
      flex: 1,
    },
    manualSaveButton: {
      flex: 1,
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