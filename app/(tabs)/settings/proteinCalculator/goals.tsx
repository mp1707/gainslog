import React, { useState, useMemo } from "react";
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Text,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import * as Haptics from "expo-haptics";
import {
  ChartLineUpIcon,
  BarbellIcon,
  ShieldCheckIcon,
  TrophyIcon,
} from "phosphor-react-native";

import { useTheme } from "@/theme";
import { useAppStore } from "@/store";
import { Button } from "@/components/shared/Button";
import { ProgressBar } from "@/components/settings/ProgressBar";
import { SelectionCard } from "@/components/settings/SelectionCard";
import type { ProteinCalculationMethod } from "@/types";
import { StyleSheet } from "react-native";

// Protein calculation methods with their configurations
const CALCULATION_METHODS: Record<string, ProteinCalculationMethod> = {
  optimal_growth: {
    id: "optimal_growth",
    title: "1.6 g/kg - Optimal Growth",
    description:
      "The evidence-based point of diminishing returns for maximizing muscle growth in a caloric surplus or maintenance.",
    multiplier: 1.6,
  },
  dedicated_athlete: {
    id: "dedicated_athlete",
    title: "2.0 g/kg - Dedicated Athlete",
    description:
      "A robust target for dedicated athletes to optimize all training adaptations and ensure consistent muscle growth.",
    multiplier: 2.0,
  },
  anabolic_insurance: {
    id: "anabolic_insurance",
    title: "2.2 g/kg - Anabolic Insurance",
    description:
      "The upper-end target to ensure protein is never a limiting factor. Ideal for advanced athletes.",
    multiplier: 2.2,
  },
  max_preservation: {
    id: "max_preservation",
    title: "3.0 g/kg - Max Preservation",
    description:
      "A very high intake to maximize muscle retention during a significant or prolonged caloric deficit (cutting).",
    multiplier: 3.0,
  },
};

// Icon mapping for protein calculation methods
const getIconForMethod = (methodId: string) => {
  switch (methodId) {
    case "optimal_growth":
      return ChartLineUpIcon;
    case "dedicated_athlete":
      return BarbellIcon;
    case "anabolic_insurance":
      return ShieldCheckIcon;
    case "max_preservation":
      return TrophyIcon;
    default:
      return ChartLineUpIcon;
  }
};

// Calculate protein intake (convert kg to grams, round to nearest 5)
const calculateProteinIntake = (
  bodyWeight: number,
  multiplier: number
): number => {
  return bodyWeight > 0 ? Math.round((bodyWeight * multiplier) / 5) * 5 : 0;
};

export default function ProteinGoalsScreen() {
  const { colors, theme: themeObj } = useTheme();
  const userSettings = useAppStore((s) => s.userSettings);
  const dailyTargets = useAppStore((s) => s.dailyTargets) || {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  };
  const setDailyTargets = useAppStore((s) => s.setDailyTargets);
  const updateUserSettings = useAppStore((s) => s.updateUserSettings);
  const { safeDismissTo, safeReplace } = useNavigationGuard();

  const [selectedMethod, setSelectedMethod] =
    useState<ProteinCalculationMethod | null>(null);

  const styles = useMemo(
    () => createStyles(colors, themeObj),
    [colors, themeObj]
  );

  const bodyWeight = userSettings?.weight ?? 70;

  const handleMethodSelect = async (method: ProteinCalculationMethod) => {
    setSelectedMethod(method);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Auto-save the selected method and complete the flow
    await handleSaveTarget(method);
  };

  const handleSaveTarget = async (method: ProteinCalculationMethod) => {
    if (!userSettings?.weight || bodyWeight <= 0) {
      Alert.alert("Error", "Missing weight information. Please start over.");
      return;
    }

    const calculatedProtein =
      Math.round((bodyWeight * method.multiplier) / 5) * 5;

    try {
      // Provide success haptic feedback
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Update the daily targets
      await setDailyTargets({ protein: calculatedProtein });
      // Remember chosen method in settings so future recalcs can use it
      updateUserSettings({ proteinCalculationFactor: method.multiplier });

      // Go back to close the modal and return to settings
      safeDismissTo("/settings");
    } catch (error) {
      console.error("Error saving protein target:", error);
      Alert.alert("Error", "Failed to save protein target. Please try again.");
    }
  };

  if (!userSettings?.weight || bodyWeight <= 0) {
    return (
      <SafeAreaView
        style={[styles.container, styles.centered]}
        edges={["left", "right"]}
      >
        <Text style={styles.errorText}>
          Missing weight data. Please start over.
        </Text>
        <Button
          onPress={() => safeReplace("/settings")}
          disabled={false}
          style={styles.backButton}
        >
          Go Back
        </Button>
      </SafeAreaView>
    );
  }

  const methods = Object.values(CALCULATION_METHODS);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <SafeAreaView style={styles.container} edges={["left", "right"]}>
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
              Based on your weight of {bodyWeight}kg
            </Text>
          </View>

          <View style={styles.methodsSection}>
            {methods.map((method) => {
              const calculatedProtein = calculateProteinIntake(
                bodyWeight,
                method.multiplier
              );
              const IconComponent = getIconForMethod(method.id);

              return (
                <SelectionCard
                  key={method.id}
                  title={method.title}
                  description={method.description}
                  icon={IconComponent}
                  iconColor={colors.primaryText}
                  isSelected={selectedMethod?.id === method.id}
                  onSelect={() => handleMethodSelect(method)}
                  dailyTarget={{
                    value: calculatedProtein,
                    unit: "g",
                    label: "Daily Target",
                  }}
                  accessibilityLabel={`${method.title} protein calculation method`}
                  accessibilityHint={`Calculate ${calculatedProtein}g protein per day based on ${method.description.toLowerCase()}`}
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
      </SafeAreaView>
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
      paddingTop: spacing.lg,
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
    progressContainer: {
      padding: themeObj.spacing.md,
    },
  });
};
