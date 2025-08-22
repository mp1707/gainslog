import React, { useState, useMemo } from "react";
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Text,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigationGuard } from "@/shared/hooks/useNavigationGuard";
import * as Haptics from "expo-haptics";
import { TrendDownIcon, EqualsIcon, TrendUpIcon } from "phosphor-react-native";

import { useTheme } from "@/providers";
import { useFoodLogStore } from "@/stores/useFoodLogStore";
import { SelectionCard } from "@/shared/ui/atoms/SelectionCard";
import { CALCULATION_METHODS } from "@/shared/constants/calculationMethods";
import { calculateCalorieGoals } from "@/utils/calculateCalories";
import { Button } from "@/shared/ui/atoms/Button";
import { ProgressBar } from "@/shared/ui/molecules/ProgressBar";
import { saveCalorieCalculatorParams } from "@/lib/storage";
import type { GoalType } from "@/types/indexLegacy";
import { StyleSheet } from "react-native";

export default function Step3GoalsScreen() {
  const { colors, theme: themeObj } = useTheme();
  const {
    calculatorParams,
    calculatorActivityLevel,
    dailyTargets,
    updateDailyTargets,
    setCalorieCalculation,
  } = useFoodLogStore();
  const { safeDismissTo, safeReplace } = useNavigationGuard();

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
    await handleSaveTarget(goalType);
  };

  const handleSaveTarget = async (goalType: GoalType) => {
    if (!calculatorParams || !calculatorActivityLevel || !calorieGoals) {
      Alert.alert(
        "Error",
        "Missing calculation parameters. Please start over."
      );
      return;
    }

    const calories =
      calorieGoals[
        goalType === "lose"
          ? "loseWeight"
          : goalType === "maintain"
          ? "maintainWeight"
          : "gainWeight"
      ];

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

      // Save calculator params to AsyncStorage for future use
      await saveCalorieCalculatorParams(calculatorParams);

      // Go back to close the modal and return to settings
      safeDismissTo("/settings");
    } catch (error) {
      console.error("Error saving calorie target:", error);
      Alert.alert("Error", "Failed to save calorie target. Please try again.");
    }
  };

  if (!calculatorParams || !calculatorActivityLevel || !calorieGoals) {
    return (
      <SafeAreaView
        style={[styles.container, styles.centered]}
        edges={["left", "right"]}
      >
        <Text style={styles.errorText}>
          Missing calculation data. Please start over.
        </Text>
        <Button
          onPress={() => safeReplace("/settings")}
          disabled={false}
          style={styles.backButton}
        >
          Go Back
        </Button>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <SafeAreaView style={styles.container} edges={["left", "right"]}>
        <View style={styles.progressContainer}>
          <ProgressBar
            totalSteps={6}
            currentStep={6}
            accessibilityLabel={`Calculator progress: step 6 of 6`}
          />
        </View>

        {/* Content */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.textSection}>
            <Text style={styles.subtitle}>Choose your calorie goal</Text>
            <Text style={styles.description}>
              Select the goal that best matches what you want to achieve.
            </Text>
          </View>

          <View style={styles.goalsSection}>
            <SelectionCard
              title="Lose Weight"
              description="Create a calorie deficit to lose weight gradually"
              icon={TrendDownIcon}
              iconColor={colors.error}
              isSelected={selectedGoal === "lose"}
              onSelect={() => handleGoalSelect("lose")}
              dailyTarget={{
                value: calorieGoals.loseWeight,
                unit: "kcal",
                label: "Daily Target",
              }}
              accessibilityLabel="Lose Weight goal"
              accessibilityHint={`Set ${calorieGoals.loseWeight} calories as your daily goal to create a calorie deficit to lose weight gradually`}
            />

            <SelectionCard
              title="Maintain Weight"
              description="Eat at maintenance calories to stay at current weight"
              icon={EqualsIcon}
              iconColor={colors.success}
              isSelected={selectedGoal === "maintain"}
              onSelect={() => handleGoalSelect("maintain")}
              dailyTarget={{
                value: calorieGoals.maintainWeight,
                unit: "kcal",
                label: "Daily Target",
              }}
              accessibilityLabel="Maintain Weight goal"
              accessibilityHint={`Set ${calorieGoals.maintainWeight} calories as your daily goal to eat at maintenance calories to stay at current weight`}
            />

            <SelectionCard
              title="Gain Weight"
              description="Create a calorie surplus to gain weight gradually"
              icon={TrendUpIcon}
              iconColor={colors.semantic.protein}
              isSelected={selectedGoal === "gain"}
              onSelect={() => handleGoalSelect("gain")}
              dailyTarget={{
                value: calorieGoals.gainWeight,
                unit: "kcal",
                label: "Daily Target",
              }}
              accessibilityLabel="Gain Weight goal"
              accessibilityHint={`Set ${calorieGoals.gainWeight} calories as your daily goal to create a calorie surplus to gain weight gradually`}
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
    textSection: {
      marginBottom: spacing.xl,
    },
    subtitle: {
      fontSize: typography.Title2.fontSize,
      fontFamily: typography.Title2.fontFamily,
      color: colors.primaryText,
      textAlign: "center",
      marginBottom: spacing.md,
    },
    description: {
      fontSize: typography.Body.fontSize,
      fontFamily: typography.Body.fontFamily,
      color: colors.secondaryText,
      textAlign: "center",
      lineHeight: 22,
    },
    goalsSection: {
      marginBottom: spacing.lg,
      gap: spacing.md,
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
    progressContainer: {
      padding: themeObj.spacing.md,
    },
  });
};
