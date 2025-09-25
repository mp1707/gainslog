import React, { useMemo, useState } from "react";
import { View, ScrollView, KeyboardAvoidingView } from "react-native";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import * as Haptics from "expo-haptics";
import { TrendingDown, Equal, TrendingUp } from "lucide-react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { SelectionCard } from "@/components/settings/SelectionCard";
import { Button } from "@/components/shared/Button";
import type { UserSettings } from "@/types/models";
import { StyleSheet } from "react-native";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { calculateCalorieGoals } from "@/utils/calculateCalories";
import { useRouter } from "expo-router";
import { ModalHeader } from "@/components/daily-food-logs/ModalHeader";
import { GradientWrapper } from "@/components/shared/GradientWrapper";
import { AppText } from "@/components/shared/AppText";

export default function Step3GoalsScreen() {
  const { colors, theme: themeObj } = useTheme();
  const styles = createStyles(colors, themeObj);
  const { age, sex, weight, height, activityLevel, setCalorieGoal } =
    useOnboardingStore();
  const { safePush } = useNavigationGuard();
  const { back, dismissAll } = useRouter();
  const router = useRouter();
  const [selectedGoal, setSelectedGoal] = useState<
    UserSettings["calorieGoalType"] | undefined
  >();

  const handleCancel = () => {
    router.dismissTo("/");
  };

  const handleBack = () => {
    back();
  };

  // Calculate calorie goals based on onboarding data
  const calorieGoals =
    !age || !sex || !weight || !height || !activityLevel
      ? undefined
      : calculateCalorieGoals(
          {
            sex,
            age,
            weight,
            height,
            activityLevel,
            calorieGoalType: "maintain",
          },
          activityLevel as any
        );

  const handleGoalSelect = async (
    goalType: UserSettings["calorieGoalType"]
  ) => {
    if (!calorieGoals) return;
    if (!goalType) return;
    setSelectedGoal(goalType);
    setCalorieGoal(calorieGoals[goalType]);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => {
      safePush("/onboarding/protein-goal");
    }, 300);
  };

  if (!calorieGoals) {
    return (
      <GradientWrapper style={styles.container}>
        <ModalHeader handleBack={handleBack} handleCancel={handleCancel} />
        <AppText role="Body" color="secondary">
          Missing calculation data. Please start over.
        </AppText>
        <Button
          variant="primary"
          label="Go Back"
          onPress={() => safePush("/onboarding/protein-goal")}
          disabled={false}
          style={styles.backButton}
        />
      </GradientWrapper>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <GradientWrapper style={styles.container}>
        {/* Content */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.textSection}>
            <AppText role="Title2">Choose your calorie goal</AppText>
            <AppText role="Body" color="secondary">
              Select the goal that best matches what you want to achieve.
            </AppText>
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
            <AppText role="Caption" color="secondary">
              These recommendations are general guidelines based on the
              Mifflin-St Jeor equation. Consult with a nutritionist or
              healthcare provider for personalized advice.
            </AppText>
          </View>
        </ScrollView>
      </GradientWrapper>
    </KeyboardAvoidingView>
  );
}

type Colors = ReturnType<typeof useTheme>["colors"];
type Theme = ReturnType<typeof useTheme>["theme"];

const createStyles = (colors: Colors, themeObj: Theme) => {
  const { spacing } = themeObj;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.primaryBackground,
      gap: themeObj.spacing.md,
    },
    backButton: {
      minWidth: 120,
    },
    content: {
      flex: 1,
      paddingTop: spacing.xxl + spacing.xl,
    },
    scrollContent: {
      paddingHorizontal: spacing.pageMargins.horizontal,
      paddingBottom: 100,
    },
    textSection: {
      marginBottom: spacing.xl,
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
    progressContainer: {
      padding: themeObj.spacing.md,
    },
  });
};
