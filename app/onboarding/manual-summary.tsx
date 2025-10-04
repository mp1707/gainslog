import React, { useState, useEffect } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { AppText } from "@/components/shared/AppText";
import { useTheme } from "@/theme";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import * as Haptics from "expo-haptics";
import { Button } from "@/components/shared/Button";
import { OnboardingScreen } from "../../src/components/onboarding/OnboardingScreen";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { useAppStore } from "@/store/useAppStore";
import { CalorieBreakdown } from "@/components/onboarding/CalorieBreakdown";
import { DailyTargets } from "@/types/models";

const ManualSummaryScreen = () => {
  const { colors, theme: themeObj } = useTheme();
  const styles = createStyles(colors, themeObj);
  const { safeDismissTo, safeNavigate } = useNavigationGuard();
  const [isConfirming, setIsConfirming] = useState(false);

  const {
    calorieGoal,
    proteinGoal,
    fatGoal,
    setCarbGoal,
  } = useOnboardingStore();

  const { setDailyTargets } = useAppStore();

  // Calculate carbs from remaining calories
  const proteinCalories = (proteinGoal || 0) * 4;
  const fatCalories = (fatGoal || 0) * 9;
  const remainingCalories = (calorieGoal || 0) - proteinCalories - fatCalories;
  const calculatedCarbs = Math.max(0, Math.round(remainingCalories / 4));

  // Save carbs to store when component mounts
  useEffect(() => {
    setCarbGoal(calculatedCarbs);
  }, [calculatedCarbs, setCarbGoal]);

  const handleConfirmAndStartTracking = async () => {
    // Validate we have all required data
    if (!calorieGoal || !proteinGoal || !fatGoal) {
      console.error("Missing required data for daily targets");
      return;
    }

    // Set confirming state to prevent visual artifacts
    setIsConfirming(true);

    // Create the daily targets object
    const newTargets: DailyTargets = {
      calories: calorieGoal,
      protein: proteinGoal,
      carbs: calculatedCarbs,
      fat: fatGoal,
    };

    // Save to main app store
    setDailyTargets(newTargets);

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Dismiss the onboarding modal and return to root
    safeDismissTo("/");
  };

  const handleEditTargets = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    safeNavigate("/onboarding/manual-calories");
  };

  return (
    <OnboardingScreen
      actionButton={
        <View style={styles.actionButtonsContainer}>
          <View style={styles.secondaryActions}>
            <Pressable onPress={handleEditTargets}>
              <AppText role="Button" color="accent" style={styles.centeredText}>
                Edit Targets
              </AppText>
            </Pressable>
          </View>
          <Button
            variant="primary"
            label={isConfirming ? "Starting..." : "Confirm & Start Tracking"}
            onPress={handleConfirmAndStartTracking}
            disabled={isConfirming}
          />
        </View>
      }
    >
      <View style={styles.contentWrapper}>
        {/* Header */}
        <View style={styles.headerSection}>
          <AppText role="Title2">Your Daily Blueprint</AppText>
          <AppText role="Body" color="secondary" style={styles.subtitle}>
            Review your custom targets and start tracking.
          </AppText>
        </View>

        {/* Final breakdown with all macros */}
        {calorieGoal && proteinGoal !== undefined && fatGoal !== undefined && (
          <View style={styles.breakdownSection}>
            <CalorieBreakdown
              totalCalories={calorieGoal}
              proteinGrams={proteinGoal}
              fatGrams={fatGoal}
              carbGrams={calculatedCarbs}
              highlightMacro="carbs"
            />
          </View>
        )}

        {/* Helper Info */}
        <View style={styles.helperSection}>
          <AppText role="Caption" color="secondary" style={styles.helperText}>
            Carbs are calculated from your remaining calories. Since carbs
            provide 4 kcal per gram, the remaining {remainingCalories} kcal are
            filled with {calculatedCarbs}g of carbs.
          </AppText>
        </View>
      </View>
    </OnboardingScreen>
  );
};

export default ManualSummaryScreen;

type Colors = ReturnType<typeof useTheme>["colors"];
type Theme = ReturnType<typeof useTheme>["theme"];

const createStyles = (colors: Colors, themeObj: Theme) => {
  const { spacing } = themeObj;

  return StyleSheet.create({
    contentWrapper: {
      paddingHorizontal: spacing.lg,
      gap: spacing.lg,
    },
    headerSection: {
      alignItems: "center",
      gap: spacing.xs,
    },
    subtitle: {
      textAlign: "center",
      maxWidth: "80%",
    },
    breakdownSection: {
      paddingHorizontal: spacing.md,
    },
    helperSection: {
      paddingHorizontal: spacing.md,
    },
    helperText: {
      textAlign: "center",
    },
    actionButtonsContainer: {
      gap: spacing.lg,
      alignItems: "stretch",
    },
    secondaryActions: {
      gap: spacing.xs,
      alignItems: "center",
    },
    centeredText: {
      textAlign: "center",
    },
  });
};
