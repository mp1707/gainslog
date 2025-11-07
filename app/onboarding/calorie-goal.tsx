import React, { useEffect, useState, useRef } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import * as Haptics from "expo-haptics";
import { TrendingDown, Equal, TrendingUp } from "lucide-react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { RadioCard } from "@/components/shared/RadioCard";
import { Button } from "@/components/shared/Button";
import type { UserSettings } from "@/types/models";
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
    setInputMethod,
  } = useOnboardingStore();
  const { safePush } = useNavigationGuard();
  const scrollRef = useRef<ScrollView>(null);

  const [selectedGoal, setSelectedGoal] = useState<
    UserSettings["calorieGoalType"] | null
  >(calorieGoalType || null);

  // Ensure we're in calculate mode when entering questionnaire
  useEffect(() => {
    setInputMethod("calculate");
  }, [setInputMethod]);

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

  const handleGoalSelect = (goalType: UserSettings["calorieGoalType"]) => {
    if (!calorieGoals) return;
    if (!goalType) return;
    setSelectedGoal(goalType);
    setCalorieGoalType(goalType);
    setCalorieGoal(calorieGoals[goalType]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scrollRef.current?.scrollToEnd({ animated: true });
  };

  const handleContinue = () => {
    if (!selectedGoal) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    safePush("/onboarding/protein-goal");
  };

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
      ref={scrollRef}
      title={<AppText role="Title2">What's the objective?</AppText>}
      subtitle={
        <AppText role="Body" color="secondary" style={styles.secondaryText}>
          Based on your data, here are three starting points with daily calorie
          targets.
        </AppText>
      }
      actionButton={
        <Button
          variant="primary"
          label="Continue"
          disabled={!selectedGoal}
          onPress={handleContinue}
        />
      }
    >
      <View style={styles.contentWrapper}>
        <View style={styles.goalsSection}>
          <RadioCard
            title="Cut"
            description="Create a calorie deficit to lose weight gradually"
            titleIcon={TrendingDown}
            titleIconColor={colors.error}
            badge={{ label: `${calorieGoals.lose} kcal` }}
            isSelected={selectedGoal === "lose"}
            onSelect={() => handleGoalSelect("lose")}
            accessibilityLabel="Cut goal"
            accessibilityHint={`Set ${calorieGoals.lose} calories per day to lose weight gradually`}
          />

          <RadioCard
            title="Maintain"
            description="Eat at maintenance calories to stay at current weight"
            titleIcon={Equal}
            titleIconColor={colors.success}
            badge={{ label: `${calorieGoals.maintain} kcal` }}
            isSelected={selectedGoal === "maintain"}
            onSelect={() => handleGoalSelect("maintain")}
            accessibilityLabel="Maintain goal"
            accessibilityHint={`Set ${calorieGoals.maintain} calories per day to stay at current weight`}
          />

          <RadioCard
            title="Bulk"
            description="Create a calorie surplus to gain weight gradually"
            titleIcon={TrendingUp}
            titleIconColor={colors.semantic.protein}
            badge={{ label: `${calorieGoals.gain} kcal` }}
            isSelected={selectedGoal === "gain"}
            onSelect={() => handleGoalSelect("gain")}
            accessibilityLabel="Bulk goal"
            accessibilityHint={`Set ${calorieGoals.gain} calories per day to gain weight gradually`}
          />
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
    },
  });
};
