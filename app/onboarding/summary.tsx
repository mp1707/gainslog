import React, { useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
} from "react-native";
import { AppText } from "@/components/shared/AppText";
import { useTheme } from "@/theme";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { useAppStore } from "@/store/useAppStore";
import { Button, Card } from "@/components/index";
import { OnboardingScreen } from "./_components/OnboardingScreen";
import * as Haptics from "expo-haptics";
import {
  Flame,
  BicepsFlexed,
  Wheat,
  Droplet,
} from "lucide-react-native";
import { calculateFatGramsFromPercentage } from "@/utils/nutritionCalculations";
import { DailyTargets } from "@/types/models";


const SummaryScreen = () => {
  const { colors, theme: themeObj } = useTheme();
  const styles = createStyles(colors, themeObj);
  const { safeReplace } = useNavigationGuard();
  const [isConfirming, setIsConfirming] = useState(false);

  // Onboarding store state
  const {
    calorieGoal,
    proteinGoal,
    fatPercentage,
    setCalorieGoal,
    setProteinGoal,
    setFatPercentage,
    reset,
  } = useOnboardingStore();

  // Main app store
  const { setDailyTargets } = useAppStore();



  // Get stored values based on mode
  const effectiveFatPercentage = fatPercentage ?? 30;
  const baseCalories = calorieGoal || 0;
  const baseProtein = proteinGoal || 0;
  const baseFat = calorieGoal
    ? calculateFatGramsFromPercentage(calorieGoal, effectiveFatPercentage)
    : 0;

  // Calculate carbs using the base values
  // When confirming, keep displaying the original values to prevent visual artifacts
  const displayCalories = isConfirming ? baseCalories : (calorieGoal || 0);
  const displayProtein = isConfirming ? baseProtein : (proteinGoal || 0);
  const displayFat = isConfirming ? baseFat : (calorieGoal ? calculateFatGramsFromPercentage(calorieGoal, effectiveFatPercentage) : 0);

  const currentCarbs = useMemo(() => {
    const proteinCals = displayProtein * 4;
    const fatCals = displayFat * 9;
    const remainingCals = Math.max(0, displayCalories - proteinCals - fatCals);
    return Math.round(remainingCals / 4);
  }, [displayCalories, displayProtein, displayFat]);

  const currentCalories = baseCalories;
  const currentProtein = baseProtein;
  const currentFat = baseFat;


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

    // Clear the onboarding store
    reset();

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Navigate to main dashboard
    safeReplace("/");
  };

  // Define the target rows data
  const targetRows = [
    {
      key: "calories" as const,
      icon: Flame,
      color: colors.semantic.calories,
      backgroundColor: colors.semanticSurfaces.calories,
      label: "Calories",
      value: displayCalories,
      unit: "kcal",
    },
    {
      key: "protein" as const,
      icon: BicepsFlexed,
      color: colors.semantic.protein,
      backgroundColor: colors.semanticSurfaces.protein,
      label: "Protein",
      value: displayProtein,
      unit: "g",
    },
    {
      key: "fat" as const,
      icon: Droplet,
      color: colors.semantic.fat,
      backgroundColor: colors.semanticSurfaces.fat,
      label: "Fat",
      value: displayFat,
      unit: "g",
      percentage: `${effectiveFatPercentage}% of calories`,
    },
    {
      key: "carbs",
      icon: Wheat,
      color: colors.semantic.carbs,
      backgroundColor: colors.semanticSurfaces.carbs,
      label: "Carbs",
      value: currentCarbs,
      unit: "g",
    },
  ];

  return (
    <OnboardingScreen
      actionButton={
        <View style={styles.actionButtonsContainer}>
          <View style={styles.secondaryActions}>
            <Pressable>
              <AppText
                role="Button"
                color="accent"
                style={styles.centeredText}
              >
                Adjust Targets
              </AppText>
            </Pressable>
          </View>
          <Button
            variant="primary"
            label={isConfirming ? "Starting..." : "Confirm & Start Tracking"}
            onPress={handleConfirmAndStartTracking}
            disabled={currentCalories <= 0 || currentProtein <= 0 || isConfirming}
          />
        </View>
      }
    >
      {/* Title */}
      <View style={styles.titleSection}>
        <AppText role="Title2">Your Daily Blueprint</AppText>
        <AppText role="Body" color="secondary" style={styles.secondaryText}>
          Here are your starting targets. You can adjust these anytime.
        </AppText>
      </View>
      {/* Targets List */}
      <View style={styles.targetsSection}>
        {targetRows.map((target) => {
          const IconComponent = target.icon;

          return (
            <View key={target.key}>
              <Card padding={themeObj.spacing.md} style={styles.cardOverrides}>
                <View style={styles.targetRowContent}>
                  <View style={styles.targetLeft}>
                    <View
                      style={[
                        styles.targetIconBackground,
                        { backgroundColor: target.backgroundColor },
                      ]}
                    >
                      <IconComponent
                        size={20}
                        color={target.color}
                        fill={target.color}
                        strokeWidth={0}
                      />
                    </View>
                    <AppText role="Body">{target.label}</AppText>
                  </View>

                  <View style={styles.targetRight}>
                    <View style={styles.targetValueContainer}>
                      <AppText role="Headline">
                        {target.value} {target.unit}
                      </AppText>
                      {target.percentage && (
                        <AppText role="Caption" color="secondary">
                          ({target.percentage})
                        </AppText>
                      )}
                    </View>
                  </View>
                </View>
              </Card>
            </View>
          );
        })}
      </View>

      {/* Informational Footer */}
      <View style={styles.infoSection}>
        <AppText
          role="Caption"
          color="secondary"
          style={[
            styles.secondaryText,
            { lineHeight: 18, textAlign: "center" },
          ]}
        >
          Tip: Fat is defaulted to 30% and can be adjusted. Carbs are calculated
          from the remainder.
        </AppText>
      </View>
    </OnboardingScreen>
  );
};

export default SummaryScreen;

type Colors = ReturnType<typeof useTheme>["colors"];
type Theme = ReturnType<typeof useTheme>["theme"];

const createStyles = (colors: Colors, theme: Theme) => {
  const { spacing } = theme;

  return StyleSheet.create({
    titleSection: {
      alignItems: "center",
      marginBottom: spacing.xl,
      gap: spacing.xs,
    },
    secondaryText: {
      textAlign: "center",
      maxWidth: "75%",
      alignSelf: "center",
    },
    targetsSection: {
      gap: spacing.sm,
      marginBottom: spacing.xl,
    },
    cardOverrides: {
      minHeight: 60,
    },
    targetRowContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flex: 1,
    },
    targetLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
    },
    targetRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    targetValueContainer: {
      alignItems: "flex-end",
      minWidth: 88,
    },
    infoSection: {
      paddingHorizontal: spacing.sm,
      marginBottom: spacing.xl,
    },
    actionButtonsContainer: {
      gap: spacing.md,
      alignItems: "stretch",
    },
    secondaryActions: {
      gap: spacing.xs,
      alignItems: "center",
    },
    centeredText: {
      textAlign: "center",
    },
    targetIconBackground: {
      borderRadius: 100,
      padding: spacing.sm,
    },
  });
};
