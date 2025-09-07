import React, { useMemo } from "react";
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Text,
  Alert,
} from "react-native";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import * as Haptics from "expo-haptics";
import { TrendingUp, Dumbbell, ShieldCheck, Trophy } from "lucide-react-native";

import { useTheme } from "@/theme";
import { useAppStore } from "@/store/useAppStore";
import { SelectionCard } from "@/components/settings/SelectionCard";
import { StyleSheet } from "react-native";
import { UserSettings } from "@/types/models";
import {
  calculateCarbsFromMacros,
  calculateFatGramsFromPercentage,
} from "@/utils/nutritionCalculations";
import { useRouter } from "expo-router";
import { RoundButton } from "@/components/shared/RoundButton";
import { X } from "lucide-react-native";
import { GradientWrapper } from "@/components/shared/GradientWrapper";

const METHODS: Record<
  NonNullable<UserSettings["proteinGoalType"]>,
  {
    id: NonNullable<UserSettings["proteinGoalType"]>;
    title: string;
    description: string;
    factor: number;
  }
> = {
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
  const { userSettings, setUserSettings, dailyTargets, setDailyTargets } =
    useAppStore();
  const { safeDismissTo } = useNavigationGuard();
  const { back } = useRouter();
  const weight = userSettings?.weight || 0;
  const handleCancel = () => {
    back();
  };
  const [selectedMethodId, setSelectedMethodId] = React.useState<
    UserSettings["proteinGoalType"] | undefined
  >();

  const proteinGoals = useMemo(() => {
    return {
      optimal_growth: Math.round(weight * METHODS.optimal_growth.factor),
      dedicated_athlete: Math.round(weight * METHODS.dedicated_athlete.factor),
      anabolic_insurance: Math.round(
        weight * METHODS.anabolic_insurance.factor
      ),
      max_preservation: Math.round(weight * METHODS.max_preservation.factor),
    };
  }, [userSettings]);

  const handleMethodSelect = async (
    method: UserSettings["proteinGoalType"]
  ) => {
    if (!userSettings) return;
    setUserSettings({ ...userSettings, proteinGoalType: method });
    const newDailyTargets = {
      ...dailyTargets,
      protein: proteinGoals[method as keyof typeof proteinGoals],
      fat: calculateFatGramsFromPercentage(
        dailyTargets?.calories || 0,
        userSettings?.fatCalculationPercentage || 0
      ),
      carbs: calculateCarbsFromMacros(
        dailyTargets?.calories || 0,
        proteinGoals[method as keyof typeof proteinGoals],
        calculateFatGramsFromPercentage(
          dailyTargets?.calories || 0,
          userSettings?.fatCalculationPercentage || 0
        )
      ),
    };
    setDailyTargets(newDailyTargets);
    setSelectedMethodId(method);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => {
      safeDismissTo("/settings");
    }, 300);
  };

  const methods = Object.values(METHODS);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <GradientWrapper style={styles.container}>
        <View style={styles.closeButton}>
          <RoundButton
            onPress={handleCancel}
            Icon={X}
            variant="tertiary"
            accessibilityLabel="Go back"
            accessibilityHint="Returns to previous screen"
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
            <Text style={styles.subtitle}>Choose your protein goal</Text>
            <Text style={styles.description}>
              Select the option that best matches your training and goals.
            </Text>
            <Text style={styles.weightInfo}>
              Based on your weight of {weight}kg
            </Text>
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
            <Text style={styles.footerNote}>
              These recommendations are general guidelines. Consult with a
              nutritionist or healthcare provider for personalized advice.
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
      marginBottom: spacing.sm,
    },
    weightInfo: {
      fontSize: typography.Subhead.fontSize,
      fontFamily: typography.Subhead.fontFamily,
      color: colors.accent,
      textAlign: "center",
      fontWeight: "600",
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
    footerNote: {
      fontSize: typography.Caption.fontSize,
      fontFamily: typography.Caption.fontFamily,
      color: colors.secondaryText,
      textAlign: "center",
      lineHeight: 18,
    },
  });
};
