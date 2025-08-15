import React, { useState, useMemo } from "react";
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  TouchableOpacity,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { CaretLeftIcon, CaretRightIcon } from "phosphor-react-native";
import * as Haptics from "expo-haptics";

import { useTheme } from "@/providers";
import { useFoodLogStore } from "@/stores/useFoodLogStore";
import {
  CalorieCalculationCard,
  CALCULATION_METHODS,
} from "@/shared/ui/atoms/CalorieCalculationCard";
import type { CalorieCalculationMethod, ActivityLevel } from "@/types";
import { StyleSheet } from "react-native";

export default function Step2ActivityLevelScreen() {
  const { colors, theme: themeObj } = useTheme();
  const {
    calculatorActivityLevel,
    setCalculatorActivityLevel,
  } = useFoodLogStore();

  const [selectedActivityLevel, setSelectedActivityLevel] = useState<ActivityLevel | null>(
    calculatorActivityLevel
  );

  const styles = useMemo(
    () => createStyles(colors, themeObj),
    [colors, themeObj]
  );

  const handleActivityLevelSelect = (method: CalorieCalculationMethod) => {
    setSelectedActivityLevel(method.id);
    setCalculatorActivityLevel(method.id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleContinue = async () => {
    if (!selectedActivityLevel) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/settings/calculator/step3-goals");
  };

  const handleBack = () => {
    router.back();
  };

  const methods = Object.values(CALCULATION_METHODS);
  const canProceed = selectedActivityLevel !== null;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <SafeAreaView style={styles.container} edges={["left", "right"]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
          >
            <CaretLeftIcon size={24} color={colors.accent} />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Activity Level</Text>
            <Text style={styles.stepIndicator}>Step 2 of 3</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        {/* Content */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.subtitle}>
            Select the option that best matches your lifestyle and exercise routine.
          </Text>

          <View style={styles.methodsSection}>
            {methods.map((method) => (
              <CalorieCalculationCard
                key={method.id}
                method={method}
                isSelected={selectedActivityLevel === method.id}
                onSelect={handleActivityLevelSelect}
                showCalorieGoals={false}
              />
            ))}
          </View>

          {/* Continue Button */}
          <View style={styles.navigationContainer}>
            <TouchableOpacity
              style={[
                styles.continueButton,
                !canProceed && styles.continueButtonDisabled,
              ]}
              onPress={handleContinue}
              disabled={!canProceed}
              accessibilityRole="button"
              accessibilityLabel="Continue to final step"
              accessibilityState={{ disabled: !canProceed }}
            >
              <Text
                style={[
                  styles.continueButtonText,
                  !canProceed && styles.continueButtonTextDisabled,
                ]}
              >
                Continue
              </Text>
              <CaretRightIcon
                size={20}
                color={canProceed ? "#FFFFFF" : colors.disabledText}
              />
            </TouchableOpacity>
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
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.pageMargins.horizontal,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    titleContainer: {
      flex: 1,
      alignItems: "center",
    },
    title: {
      fontSize: typography.Headline.fontSize,
      fontFamily: typography.Headline.fontFamily,
      color: colors.primaryText,
      textAlign: "center",
    },
    stepIndicator: {
      fontSize: typography.Caption.fontSize,
      fontFamily: typography.Caption.fontFamily,
      color: colors.secondaryText,
      marginTop: 2,
    },
    headerSpacer: {
      width: 24, // Same width as back button
    },
    content: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: spacing.pageMargins.horizontal,
      paddingTop: spacing.lg,
      paddingBottom: 100,
    },
    subtitle: {
      fontSize: typography.Body.fontSize,
      fontFamily: typography.Body.fontFamily,
      color: colors.secondaryText,
      textAlign: "center",
      lineHeight: 22,
      marginBottom: spacing.lg,
    },
    methodsSection: {
      marginBottom: spacing.lg,
    },
    navigationContainer: {
      marginTop: spacing.xl,
      marginBottom: spacing.lg,
    },
    continueButton: {
      backgroundColor: colors.accent,
      borderRadius: themeObj.components.buttons.cornerRadius,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    continueButtonDisabled: {
      backgroundColor: colors.disabledBackground,
    },
    continueButtonText: {
      fontSize: typography.Body.fontSize,
      fontFamily: typography.Body.fontFamily,
      color: "#FFFFFF",
      fontWeight: "600",
      marginRight: spacing.sm,
    },
    continueButtonTextDisabled: {
      color: colors.disabledText,
    },
  });
};