import React, { useMemo, useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { AppText } from "@/components/shared/AppText";
import { useTheme } from "@/theme";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/index";
import { OnboardingScreen } from "../../src/components/onboarding/OnboardingScreen";
import * as Haptics from "expo-haptics";
import { Flame, BicepsFlexed, Wheat, Droplet } from "lucide-react-native";
import { calculateFatGramsFromPercentage } from "@/utils/nutritionCalculations";
import { DailyTargets } from "@/types/models";

const CalculatorSummaryScreen = () => {
  const { colors, theme: themeObj } = useTheme();
  const styles = createStyles(colors, themeObj);
  const { safeDismissTo, safeNavigate } = useNavigationGuard();
  const [isConfirming, setIsConfirming] = useState(false);

  // Onboarding store state
  const {
    calorieGoal,
    proteinGoal,
    fatPercentage,
    inputMethod,
    carbGoal,
    fatGoal,
    setInputMethod,
  } = useOnboardingStore();

  // Main app store
  const { setDailyTargets } = useAppStore();

  // Detect input method
  const isManualMode = inputMethod === "manual";

  // Get stored values with defaults
  const effectiveFatPercentage = fatPercentage ?? 20;
  const currentCalories = calorieGoal || 0;
  const currentProtein = proteinGoal || 0;

  // Fat calculation: Use manual value if in manual mode, otherwise calculate from percentage
  const currentFat = isManualMode
    ? fatGoal || 0
    : calorieGoal
    ? calculateFatGramsFromPercentage(calorieGoal, effectiveFatPercentage)
    : 0;

  // Calculate fat gram ranges (20-35%) - only for calculated mode
  const fatMinGrams = currentFat; // 20% minimum
  const fatMaxGrams = currentCalories
    ? Math.round((currentCalories * 0.35) / 9) // 35% maximum
    : 0;

  // Carbs calculation: Use manual value if in manual mode, otherwise calculate from remainder
  const currentCarbs = useMemo(() => {
    if (isManualMode) {
      return carbGoal || 0;
    }
    const proteinCals = currentProtein * 4;
    const fatCals = currentFat * 9;
    const remainingCals = Math.max(0, currentCalories - proteinCals - fatCals);
    return Math.floor(remainingCals / 4);
  }, [isManualMode, carbGoal, currentCalories, currentProtein, currentFat]);

  const handleAdjustTargets = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    safeNavigate("/onboarding/calorie-goal");
  };

  const handleSwitchToManual = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Pre-fill manual input with calculated values by navigating
    safeNavigate("/onboarding/manual-calories");
  };

  const handleRecalculate = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Switch to calculate mode and navigate to questionnaire
    setInputMethod("calculate");
    safeNavigate("/onboarding/age");
  };

  const handleEditTargets = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    safeNavigate("/onboarding/manual-calories");
  };

  const handleConfirmAndStartTracking = async () => {
    // Validate we have all required data
    if (currentCalories <= 0 || currentProtein <= 0) {
      console.error("Missing required data for daily targets");
      return;
    }

    // Set confirming state to prevent visual artifacts
    setIsConfirming(true);

    // Create the daily targets object
    const newTargets: DailyTargets = {
      calories: currentCalories,
      protein: currentProtein,
      carbs: currentCarbs,
      fat: currentFat,
    };

    // Save to main app store
    setDailyTargets(newTargets);

    // Note: Onboarding store will be reset when re-entering via /onboarding/index.tsx
    // No need to reset here to avoid visual artifacts

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Dismiss the onboarding modal and return to root
    safeDismissTo("/");
  };

  // Define the target rows data
  const targetRows = [
    {
      key: "calories" as const,
      icon: Flame,
      color: colors.semantic.calories,
      label: "Calories",
      subtitle: "Daily target",
      value: currentCalories,
      unit: "kcal",
    },
    {
      key: "protein" as const,
      icon: BicepsFlexed,
      color: colors.semantic.protein,
      label: "Protein",
      subtitle: "Daily target",
      value: currentProtein,
      unit: "g",
    },
    {
      key: "fat" as const,
      icon: Droplet,
      color: colors.semantic.fat,
      label: "Fat",
      subtitle: isManualMode
        ? "Daily target"
        : `Baseline ${fatMinGrams}-${fatMaxGrams}g`,
      value: currentFat,
      unit: "g",
    },
    {
      key: "carbs",
      icon: Wheat,
      color: colors.semantic.carbs,
      label: "Carbs",
      subtitle: isManualMode ? "Daily target" : "Remainder",
      value: currentCarbs,
      unit: "g",
    },
  ];

  return (
    <OnboardingScreen
      actionButton={
        <View style={styles.actionButtonsContainer}>
          <View style={styles.secondaryActions}>
            {isManualMode ? (
              <>
                <Pressable onPress={handleEditTargets}>
                  <AppText
                    role="Button"
                    color="accent"
                    style={styles.centeredText}
                  >
                    Edit Targets
                  </AppText>
                </Pressable>
                <Pressable onPress={handleRecalculate}>
                  <AppText
                    role="Caption"
                    color="secondary"
                    style={styles.centeredText}
                  >
                    Recalculate from Profile
                  </AppText>
                </Pressable>
              </>
            ) : (
              <>
                <Pressable onPress={handleAdjustTargets}>
                  <AppText
                    role="Button"
                    color="accent"
                    style={styles.centeredText}
                  >
                    Adjust Targets
                  </AppText>
                </Pressable>
                <Pressable onPress={handleSwitchToManual}>
                  <AppText
                    role="Caption"
                    color="secondary"
                    style={styles.centeredText}
                  >
                    Switch to Manual Entry
                  </AppText>
                </Pressable>
              </>
            )}
          </View>
          <Button
            variant="primary"
            label={isConfirming ? "Starting..." : "Confirm & Start Tracking"}
            onPress={handleConfirmAndStartTracking}
            disabled={
              currentCalories <= 0 || currentProtein <= 0 || isConfirming
            }
          />
        </View>
      }
    >
      {/* Title */}
      <View style={styles.titleSection}>
        <AppText role="Title2">Your Daily Blueprint</AppText>
        <AppText role="Body" color="secondary" style={styles.secondaryText}>
          {isManualMode
            ? "Your custom targets are ready to go."
            : "Here are your starting targets. You can adjust these anytime."}
        </AppText>
      </View>
      {/* Targets List */}
      <View style={styles.targetsSection}>
        {targetRows.map((target) => {
          const IconComponent = target.icon;

          return (
            <View key={target.key} style={styles.targetRow}>
              <View style={styles.targetLeft}>
                <IconComponent
                  size={20}
                  color={target.color}
                  fill={target.color}
                  strokeWidth={0}
                />
                <View style={styles.targetLabels}>
                  <AppText role="Body">{target.label}</AppText>
                  <AppText role="Caption" color="secondary">
                    {target.subtitle}
                  </AppText>
                </View>
              </View>

              <View style={styles.targetRight}>
                <AppText role="Headline">
                  {target.value} {target.unit}
                </AppText>
              </View>
            </View>
          );
        })}
      </View>

      {/* Informational Footer */}
      <View style={styles.infoSection}>
        <AppText role="Caption" color="secondary" style={styles.footerText}>
          {isManualMode
            ? "Custom targets set. Adjust anytime in settings."
            : "Fat baseline: 20-35% of calories. Carbs are calculated from the remainder."}
        </AppText>
      </View>
    </OnboardingScreen>
  );
};

export default CalculatorSummaryScreen;

type Colors = ReturnType<typeof useTheme>["colors"];
type Theme = ReturnType<typeof useTheme>["theme"];

const createStyles = (colors: Colors, theme: Theme) => {
  const { spacing } = theme;

  return StyleSheet.create({
    titleSection: {
      alignItems: "center",
      marginBottom: spacing.lg,
      gap: spacing.xs,
    },
    secondaryText: {
      textAlign: "center",
      maxWidth: "75%",
      alignSelf: "center",
    },
    targetsSection: {
      gap: spacing.md,
      marginBottom: spacing.lg,
      paddingHorizontal: spacing.lg,
    },
    targetRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: spacing.sm,
    },
    targetLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      flex: 1,
    },
    targetLabels: {
      gap: spacing.xs / 2,
    },
    targetRight: {
      alignItems: "flex-end",
    },
    infoSection: {
      paddingHorizontal: spacing.lg,
      marginBottom: spacing.md,
    },
    footerText: {
      textAlign: "center",
      lineHeight: 18,
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
