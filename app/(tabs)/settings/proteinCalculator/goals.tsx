import React, { useState, useMemo } from "react";
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Text,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";

import { useTheme } from "@/providers";
import { useFoodLogStore } from "@/stores/useFoodLogStore";
import { Button } from "@/shared/ui/atoms/Button";
import { ProgressBar } from "@/shared/ui/molecules/ProgressBar";
import { ProteinCalculationCard, CALCULATION_METHODS } from "@/shared/ui/atoms/ProteinCalculationCard";
import type { ProteinCalculationMethod } from "@/types";
import { StyleSheet } from "react-native";

export default function ProteinGoalsScreen() {
  const { colors, theme: themeObj } = useTheme();
  const {
    calculatorParams,
    dailyTargets,
    updateDailyTargets,
    setProteinCalculation,
    clearProteinCalculatorData,
  } = useFoodLogStore();

  const [selectedMethod, setSelectedMethod] = useState<ProteinCalculationMethod | null>(null);

  const styles = useMemo(
    () => createStyles(colors, themeObj),
    [colors, themeObj]
  );

  const bodyWeight = calculatorParams?.weight ?? 70;

  const handleMethodSelect = async (method: ProteinCalculationMethod) => {
    setSelectedMethod(method);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Auto-save the selected method and complete the flow
    await handleSaveTarget(method);
  };

  const handleSaveTarget = async (method: ProteinCalculationMethod) => {
    if (!calculatorParams?.weight || bodyWeight <= 0) {
      Alert.alert(
        "Error",
        "Missing weight information. Please start over."
      );
      return;
    }

    const calculatedProtein = Math.round((bodyWeight * method.multiplier) / 5) * 5;

    try {
      // Provide success haptic feedback
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Update the daily targets
      const newTargets = { ...dailyTargets, protein: calculatedProtein };
      await updateDailyTargets(newTargets);

      // Save the calculation for display on settings screen
      setProteinCalculation(method, bodyWeight, calculatedProtein);

      // Clear calculator params
      clearProteinCalculatorData();

      // Go back to close the modal and return to settings
      router.dismissTo("/settings");
    } catch (error) {
      console.error("Error saving protein target:", error);
      Alert.alert("Error", "Failed to save protein target. Please try again.");
    }
  };

  if (!calculatorParams?.weight || bodyWeight <= 0) {
    return (
      <SafeAreaView
        style={[styles.container, styles.centered]}
        edges={["left", "right"]}
      >
        <Text style={styles.errorText}>
          Missing weight data. Please start over.
        </Text>
        <Button
          onPress={() => router.replace("/settings")}
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
        <View style={styles.progressContainer}>
          <ProgressBar
            totalSteps={2}
            currentStep={2}
            accessibilityLabel={`Calculator progress: step 2 of 2`}
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
              Based on your weight of {bodyWeight}kg
            </Text>
          </View>

          <View style={styles.methodsSection}>
            {methods.map((method) => (
              <ProteinCalculationCard
                key={method.id}
                method={method}
                bodyWeight={bodyWeight}
                isSelected={selectedMethod?.id === method.id}
                onSelect={handleMethodSelect}
              />
            ))}
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