import React, { useMemo } from "react";
import { View } from "react-native";
import { AppText } from "@/components/shared/AppText";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import * as Haptics from "expo-haptics";
import {
  TrendingUp,
  Dumbbell,
  ShieldCheck,
  Heart,
  Activity,
} from "lucide-react-native";
import { useTheme } from "@/theme";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { SelectionCard } from "@/components/settings/SelectionCard";
import { StyleSheet } from "react-native";
import { ProteinGoalType, UserSettings } from "@/types/models";
import { OnboardingScreen } from "../../src/components/onboarding/OnboardingScreen";

const METHODS: Record<
  ProteinGoalType,
  {
    id: ProteinGoalType;
    title: string;
    description: string;
    factor: number;
  }
> = {
  baseline: {
    id: "baseline",
    title: "1.2 g/kg - The Baseline",
    description:
      "Balanced & Healthy. Ideal for an active lifestyle and maintaining your general fitness.",
    factor: 1.2,
  },
  exerciser: {
    id: "exerciser",
    title: "1.6 g/kg - The Exerciser",
    description:
      "Fit & Toned. Perfect for supporting your training results and maintaining muscle.",
    factor: 1.6,
  },
  athlete: {
    id: "athlete",
    title: "2.0 g/kg - The Athlete",
    description:
      "Maximum Muscle Gain. Optimal for effectively maximizing muscle growth after intense strength training.",
    factor: 2.0,
  },
  diet_phase: {
    id: "diet_phase",
    title: "2.2 g/kg - The Diet Phase",
    description:
      "Protection & Satiety. Maximizes muscle retention and provides fullness during a calorie reduction (diet).",
    factor: 2.2,
  },
};

// Icon mapping for protein calculation methods
const getIconForMethod = (methodId: string) => {
  switch (methodId) {
    case "baseline":
      return Heart;
    case "exerciser":
      return Activity;
    case "athlete":
      return Dumbbell;
    case "diet_phase":
      return ShieldCheck;
    default:
      return TrendingUp;
  }
};

export default function ProteinGoalsScreen() {
  const { colors, theme: themeObj } = useTheme();
  const styles = createStyles(colors, themeObj);
  const { weight, setProteinGoal, setProteinGoalType } = useOnboardingStore();
  const { safePush } = useNavigationGuard();

  const currentWeight = weight || 0;

  const proteinGoals = useMemo(() => {
    return {
      baseline: Math.round(currentWeight * METHODS.baseline.factor),
      exerciser: Math.round(currentWeight * METHODS.exerciser.factor),
      athlete: Math.round(currentWeight * METHODS.athlete.factor),
      diet_phase: Math.round(currentWeight * METHODS.diet_phase.factor),
    };
  }, [currentWeight]);

  const handleMethodSelect = async (
    method: UserSettings["proteinGoalType"]
  ) => {
    const proteinValue = proteinGoals[method as keyof typeof proteinGoals];
    setProteinGoal(proteinValue);
    setProteinGoalType(method as ProteinGoalType);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    safePush("/onboarding/calculator-summary");
  };

  const methods = Object.values(METHODS);
  return (
    <OnboardingScreen
      title={<AppText role="Title2">Set Your Protein Target</AppText>}
      subtitle={
        <AppText role="Body" color="secondary" style={styles.secondaryText}>
          Based on your weight of {weight}kg
        </AppText>
      }
    >
      <View style={styles.contentWrapper}>
        <View style={styles.methodsSection}>
          {methods.map((method) => {
            const proteinGoal =
              proteinGoals[method.id as keyof typeof proteinGoals];
            const IconComponent = getIconForMethod(method.id as string);

            return (
              <SelectionCard
                key={method.id}
                title={method.title}
                description={method.description}
                icon={IconComponent}
                iconColor={colors.accent}
                isSelected={false}
                onSelect={() => handleMethodSelect(method.id)}
                dailyTarget={{
                  value: proteinGoal,
                  unit: "g",
                  label: "Daily Target",
                }}
                accessibilityLabel={`${method.title} protein calculation method`}
                accessibilityHint={`Calculate ${proteinGoal}g protein per day based on ${method.description.toLowerCase()}`}
              />
            );
          })}
        </View>

        {/* Footer Note */}
        <View style={styles.footer}>
          <AppText
            role="Caption"
            color="secondary"
            style={styles.secondaryText}
          >
            These recommendations are general guidelines. Consult with a
            nutritionist or healthcare provider for personalized advice.
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
    methodsSection: {
      marginBottom: spacing.lg,
      gap: spacing.md,
    },
    footer: {
      marginTop: spacing.xl,
      paddingTop: spacing.lg,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
  });
};
