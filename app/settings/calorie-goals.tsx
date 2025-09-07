import React, { useMemo, useState } from "react";
import { View, ScrollView, KeyboardAvoidingView, Text } from "react-native";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import * as Haptics from "expo-haptics";
import { TrendingDown, Equal, TrendingUp } from "lucide-react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { SelectionCard } from "@/components/settings/SelectionCard";
import { Button } from "@/components/shared/Button";
import type { UserSettings } from "@/types/models";
import { StyleSheet } from "react-native";
import { useAppStore } from "@/store/useAppStore";
import { calculateCalorieGoals } from "@/utils/calculateCalories";
import { useRouter } from "expo-router";
import { CloseButton } from "@/components/shared/CloseButton";
import { GradientWrapper } from "@/components/shared/GradientWrapper";

export default function Step3GoalsScreen() {
  const { colors, theme: themeObj } = useTheme();
  const styles = createStyles(colors, themeObj);
  const { userSettings, setUserSettings, dailyTargets, setDailyTargets } =
    useAppStore();
  const { safeDismissTo, safeReplace } = useNavigationGuard();
  const { back, dismissAll } = useRouter();
  const [selectedGoal, setSelectedGoal] = useState<UserSettings["calorieGoalType"] | undefined>();

  const handleCancel = () => {
    back();
  };

  // Calculate calorie goals based on stored params and activity level
  const calorieGoals = !userSettings
    ? undefined
    : calculateCalorieGoals(
        {
          sex: userSettings.sex,
          age: userSettings.age,
          weight: userSettings.weight,
          height: userSettings.height,
          activityLevel: userSettings.activityLevel,
          calorieGoalType: userSettings.calorieGoalType,
        },
        userSettings.activityLevel as any
      );

  const handleGoalSelect = async (
    goalType: UserSettings["calorieGoalType"]
  ) => {
    if (!userSettings) return;
    if (!calorieGoals) return;
    if (!goalType) return;
    setSelectedGoal(goalType);
    setUserSettings({ ...userSettings, calorieGoalType: goalType });
    const newDailyTargets = {
      ...dailyTargets,
      calories: calorieGoals[goalType],
      protein: undefined,
      carbs: undefined,
      fat: undefined,
    };
    setDailyTargets(newDailyTargets);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => {
      dismissAll();
    }, 300);
  };

  if (!calorieGoals) {
    return (
      <GradientWrapper style={[styles.container, styles.centered]}>
        <View style={styles.closeButton}>
          <CloseButton
            onPress={handleCancel}
            accessibilityLabel={"Go back"}
            accessibilityHint={"Returns to previous screen"}
          />
        </View>
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
      </GradientWrapper>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <GradientWrapper style={styles.container}>
        <View style={styles.closeButton}>
          <CloseButton
            onPress={handleCancel}
            accessibilityLabel={"Go back"}
            accessibilityHint={"Returns to previous screen"}
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
              icon={TrendingDown}
              iconColor={colors.error}
              isSelected={selectedGoal === "lose"}
              onSelect={() => handleGoalSelect("lose")}
              dailyTarget={{
                value: calorieGoals.lose,
                unit: "kcal",
                label: "Daily Target",
              }}
              accessibilityLabel="Lose Weight goal"
              accessibilityHint={`Set ${calorieGoals.lose} calories as your daily goal to create a calorie deficit to lose weight gradually`}
            />

            <SelectionCard
              title="Maintain Weight"
              description="Eat at maintenance calories to stay at current weight"
              icon={Equal}
              iconColor={colors.success}
              isSelected={selectedGoal === "maintain"}
              onSelect={() => handleGoalSelect("maintain")}
              dailyTarget={{
                value: calorieGoals.maintain,
                unit: "kcal",
                label: "Daily Target",
              }}
              accessibilityLabel="Maintain Weight goal"
              accessibilityHint={`Set ${calorieGoals.maintain} calories as your daily goal to eat at maintenance calories to stay at current weight`}
            />

            <SelectionCard
              title="Gain Weight"
              description="Create a calorie surplus to gain weight gradually"
              icon={TrendingUp}
              iconColor={colors.semantic.protein}
              isSelected={selectedGoal === "gain"}
              onSelect={() => handleGoalSelect("gain")}
              dailyTarget={{
                value: calorieGoals.gain,
                unit: "kcal",
                label: "Daily Target",
              }}
              accessibilityLabel="Gain Weight goal"
              accessibilityHint={`Set ${calorieGoals.gain} calories as your daily goal to create a calorie surplus to gain weight gradually`}
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
      </GradientWrapper>
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
    closeButton: {
      position: "absolute",
      top: spacing.lg,
      right: spacing.md,
      zIndex: 15,
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
      paddingTop: spacing.xxl + spacing.md,
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
