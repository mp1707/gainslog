import React, { useMemo } from "react";
import { View } from "react-native";
import { AppText } from "@/components/shared/AppText";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import * as Haptics from "expo-haptics";
import {
  TrendingUp,
  Dumbbell,
  ShieldCheck,
  Trophy,
  Heart,
  Activity,
} from "lucide-react-native";

import { useTheme } from "@/theme";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { SelectionCard } from "@/components/settings/SelectionCard";
import { StyleSheet } from "react-native";
import { ProteinGoalType, UserSettings } from "@/types/models";
import {
  calculateCarbsFromMacros,
  calculateFatGramsFromPercentage,
} from "@/utils/nutritionCalculations";
import { useRouter } from "expo-router";
import { ModalHeader } from "@/components/daily-food-logs/ModalHeader";
import { OnboardingScreen } from "./_components/OnboardingScreen";

const METHODS: Record<
  ProteinGoalType,
  {
    id: ProteinGoalType;
    title: string;
    description: string;
    factor: number;
  }
> = {
  daily_maintenance: {
    id: "daily_maintenance",
    title: "0.8 g/kg - Daily Maintenance",
    description:
      "The official recommendation for general health and basic bodily functions. Perfect for a casual, healthy lifestyle.",
    factor: 0.8,
  },
  active_lifestyle: {
    id: "active_lifestyle",
    title: "1.2 g/kg - Active Lifestyle",
    description:
      "Ideal for those who exercise regularly and want to support muscle maintenance and a healthy metabolism.",
    factor: 1.2,
  },
  optimal_growth: {
    id: "optimal_growth",
    title: "1.6 g/kg - Optimal Growth",
    description:
      "The evidence-based point of diminishing returns for maximizing muscle growth in a caloric surplus or maintenance.",
    factor: 1.6,
  },
  dedicated_athlete: {
    id: "dedicated_athlete",
    title: "2.0 g/kg - Dedicated Athlete",
    description:
      "A robust target for dedicated athletes to optimize all training adaptations and ensure consistent muscle growth.",
    factor: 2.0,
  },
  anabolic_insurance: {
    id: "anabolic_insurance",
    title: "2.2 g/kg - Anabolic Insurance",
    description:
      "The upper-end target to ensure protein is never a limiting factor. Ideal for advanced athletes.",
    factor: 2.2,
  },
  max_preservation: {
    id: "max_preservation",
    title: "3.0 g/kg - Max Preservation",
    description:
      "A very high intake to maximize muscle retention during a significant or prolonged caloric deficit (cutting).",
    factor: 3.0,
  },
};

// Icon mapping for protein calculation methods
const getIconForMethod = (methodId: string) => {
  switch (methodId) {
    case "daily_maintenance":
      return Heart;
    case "active_lifestyle":
      return Activity;
    case "optimal_growth":
      return TrendingUp;
    case "dedicated_athlete":
      return Dumbbell;
    case "anabolic_insurance":
      return ShieldCheck;
    case "max_preservation":
      return Trophy;
    default:
      return TrendingUp;
  }
};

export default function ProteinGoalsScreen() {
  const { colors, theme: themeObj } = useTheme();
  const styles = createStyles(colors, themeObj);
  const { weight, setProteinGoal } = useOnboardingStore();
  const { safePush } = useNavigationGuard();
  const { back } = useRouter();
  const router = useRouter();
  const currentWeight = weight || 0;
  const handleCancel = () => {
    router.dismissTo("/");
  };

  const handleBack = () => {
    back();
  };
  const [selectedMethodId, setSelectedMethodId] = React.useState<
    UserSettings["proteinGoalType"] | undefined
  >();

  const proteinGoals = useMemo(() => {
    return {
      daily_maintenance: Math.round(
        currentWeight * METHODS.daily_maintenance.factor
      ),
      active_lifestyle: Math.round(
        currentWeight * METHODS.active_lifestyle.factor
      ),
      optimal_growth: Math.round(currentWeight * METHODS.optimal_growth.factor),
      dedicated_athlete: Math.round(
        currentWeight * METHODS.dedicated_athlete.factor
      ),
      anabolic_insurance: Math.round(
        currentWeight * METHODS.anabolic_insurance.factor
      ),
      max_preservation: Math.round(
        currentWeight * METHODS.max_preservation.factor
      ),
    };
  }, [currentWeight]);

  const handleMethodSelect = async (
    method: UserSettings["proteinGoalType"]
  ) => {
    setSelectedMethodId(method);
    const proteinValue = proteinGoals[method as keyof typeof proteinGoals];
    setProteinGoal(proteinValue);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => {
      safePush("/onboarding/summary");
    }, 300);
  };

  const methods = Object.values(METHODS);

  return (
    <OnboardingScreen>
      <View style={styles.textSection}>
        <AppText role="Title2">Set Your Protein Target</AppText>
        <AppText
          role="Body"
          color="secondary"
          style={{ textAlign: "center" }}
        >
          Choose a target based on your training intensity.
        </AppText>
        <AppText role="Body" color="secondary" style={{ textAlign: "center" }}>
          Based on your weight of {weight}kg
        </AppText>
      </View>

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
                  isSelected={selectedMethodId === method.id}
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
        <AppText role="Caption" color="secondary" style={{ textAlign: "center" }}>
          These recommendations are general guidelines. Consult with a
          nutritionist or healthcare provider for personalized advice.
        </AppText>
      </View>
    </OnboardingScreen>
  );
}

type Colors = ReturnType<typeof useTheme>["colors"];
type Theme = ReturnType<typeof useTheme>["theme"];

const createStyles = (colors: Colors, themeObj: Theme) => {
  const { spacing } = themeObj;

  return StyleSheet.create({
    textSection: {
      marginBottom: spacing.xl,
      alignItems: "center",
      gap: spacing.sm,
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
