import React, { useMemo, useState, useRef } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { AppText } from "@/components/shared/AppText";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/theme";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { RadioCard } from "@/components/shared/RadioCard";
import { Button } from "@/components/shared/Button";
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
    title: "The Baseline",
    description:
      "Balanced & Healthy. Ideal for an active lifestyle and maintaining your general fitness.",
    factor: 1.2,
  },
  exerciser: {
    id: "exerciser",
    title: "The Exerciser",
    description:
      "Fit & Toned. Perfect for supporting your training results and gaining muscle.",
    factor: 1.6,
  },
  athlete: {
    id: "athlete",
    title: "The Athlete",
    description:
      "Maximum Muscle Gain. Optimal in combination with intense strength training.",
    factor: 2.0,
  },
  diet_phase: {
    id: "diet_phase",
    title: "The Diet Phase",
    description:
      "Protection & Satiety. Maximizes muscle retention and provides fullness during a calorie reduction.",
    factor: 2.2,
  },
};

export default function ProteinGoalsScreen() {
  const { colors, theme: themeObj } = useTheme();
  const styles = createStyles(colors, themeObj);
  const { weight, proteinGoalType, setProteinGoal, setProteinGoalType } =
    useOnboardingStore();
  const { safePush } = useNavigationGuard();
  const scrollRef = useRef<ScrollView>(null);

  const [selectedMethod, setSelectedMethod] = useState<ProteinGoalType | null>(
    proteinGoalType || null
  );

  const currentWeight = weight || 0;

  const proteinGoals = useMemo(() => {
    return {
      baseline: Math.round(currentWeight * METHODS.baseline.factor),
      exerciser: Math.round(currentWeight * METHODS.exerciser.factor),
      athlete: Math.round(currentWeight * METHODS.athlete.factor),
      diet_phase: Math.round(currentWeight * METHODS.diet_phase.factor),
    };
  }, [currentWeight]);

  const handleCardSelect = async (method: ProteinGoalType) => {
    setSelectedMethod(method);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scrollRef.current?.scrollToEnd({ animated: true });
  };

  const handleContinue = async () => {
    if (!selectedMethod) return;

    const proteinValue =
      proteinGoals[selectedMethod as keyof typeof proteinGoals];
    setProteinGoal(proteinValue);
    setProteinGoalType(selectedMethod);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    safePush("/onboarding/calculator-summary");
  };

  const methods = Object.values(METHODS);
  return (
    <OnboardingScreen
      ref={scrollRef}
      title={<AppText role="Title2">Set Your Protein Target</AppText>}
      subtitle={
        <AppText role="Body" color="secondary" style={styles.secondaryText}>
          Based on your weight of {weight}kg
        </AppText>
      }
      actionButton={
        <Button
          variant="primary"
          label="Continue"
          disabled={!selectedMethod}
          onPress={handleContinue}
        />
      }
    >
      <View style={styles.contentWrapper}>
        <View style={styles.methodsSection}>
          {methods.map((method) => {
            return (
              <RadioCard
                key={method.id}
                title={method.title}
                description={method.description}
                factor={method.factor}
                isSelected={selectedMethod === method.id}
                onSelect={() => handleCardSelect(method.id)}
                accessibilityLabel={`${method.title} protein calculation method`}
                accessibilityHint={`Select ${method.factor} grams per kilogram protein goal. ${method.description}`}
              />
            );
          })}
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
