import React from "react";
import { View } from "react-native";
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
import { OnboardingScreen } from "../../src/components/onboarding/OnboardingScreen";
import { AppText } from "@/components/shared/AppText";

export default function Step3GoalsScreen() {
  const { colors, theme: themeObj } = useTheme();
  const styles = createStyles(colors, themeObj);
  const {
    age,
    sex,
    weight,
    height,
    activityLevel,
    calorieGoalType,
    setCalorieGoalType,
    setCalorieGoal,
  } = useOnboardingStore();
  const { safePush } = useNavigationGuard();

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
    setCalorieGoalType(goalType);
    setCalorieGoal(calorieGoals[goalType]);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    safePush("/onboarding/protein-goal");
  };
  console.log(sex, age, weight, height, activityLevel);

  if (!calorieGoals) {
    return (
      <OnboardingScreen
        actionButton={
          <Button
            variant="primary"
            label="Go Back"
            onPress={() => safePush("/onboarding/activity-level")}
            disabled={false}
          />
        }
      >
        <View style={{ alignItems: "center", gap: 16 }}>
          <AppText role="Body" color="secondary" style={styles.secondaryText}>
            Missing calculation data. Please start over.
          </AppText>
        </View>
      </OnboardingScreen>
    );
  }

  return (
    <OnboardingScreen
      title={<AppText role="Title2">What's the objective?</AppText>}
      subtitle={
        <AppText role="Body" color="secondary" style={styles.secondaryText}>
          Based on your data, here are three starting points.
        </AppText>
      }
    >
      <View style={styles.contentWrapper}>
        <View style={styles.goalsSection}>
          <SelectionCard
            title="Cut"
            description="Create a calorie deficit to lose weight gradually"
            icon={TrendingDown}
            iconColor={colors.error}
            isSelected={calorieGoalType === "lose"}
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
            title="Maintain"
            description="Eat at maintenance calories to stay at current weight"
            icon={Equal}
            iconColor={colors.success}
            isSelected={calorieGoalType === "maintain"}
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
            title="Bulk"
            description="Create a calorie surplus to gain weight gradually"
            icon={TrendingUp}
            iconColor={colors.semantic.protein}
            isSelected={calorieGoalType === "gain"}
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
          <AppText
            role="Caption"
            color="secondary"
            style={styles.secondaryText}
          >
            These recommendations are general guidelines based on the Mifflin-St
            Jeor equation. Consult with a nutritionist or healthcare provider
            for personalized advice.
          </AppText>
        </View>
      </View>
    </OnboardingScreen>
  );
}

type Colors = ReturnType<typeof useTheme>["colors"];
type Theme = ReturnType<typeof useTheme>["theme"];

const createStyles = (colors: Colors, themeObj: Theme) => {
  const { spacing } = themeObj;

  return StyleSheet.create({
    secondaryText: {
      textAlign: "center",
      maxWidth: "75%",
      alignSelf: "center",
    },
    contentWrapper: {
      paddingHorizontal: spacing.md,
    },
    goalsSection: {
      gap: spacing.md,
      marginBottom: spacing.lg,
    },
    footer: {
      marginTop: spacing.xl,
      paddingTop: spacing.lg,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
  });
};
