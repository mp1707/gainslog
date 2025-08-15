import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  KeyboardAvoidingView,
  TouchableOpacity,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { GenderMaleIcon, GenderFemaleIcon } from "phosphor-react-native";
import * as Haptics from "expo-haptics";

import { useTheme } from "@/providers";
import { useFoodLogStore } from "@/stores/useFoodLogStore";
import { SelectionCard } from "@/shared/ui/atoms/SelectionCard";
import type { CalorieIntakeParams, Sex } from "@/types";
import { getCalorieCalculatorParams } from "@/lib/storage";
import { StyleSheet } from "react-native";
import { ProgressBar } from "@/shared/ui/molecules/ProgressBar";

export default function SexSelectionScreen() {
  const { colors, theme: themeObj } = useTheme();
  const { calculatorParams, setCalculatorParams, clearCalculatorData } =
    useFoodLogStore();

  // Create stable initial params to prevent re-renders
  const stableInitialParams = useMemo(
    () => ({
      sex: "male" as Sex,
      age: 30,
      weight: 85,
      height: 175,
    }),
    []
  );

  const [localParams, setLocalParams] = useState<CalorieIntakeParams>(
    calculatorParams || stableInitialParams
  );
  const [isLoaded, setIsLoaded] = useState(false);

  const styles = useMemo(
    () => createStyles(colors, themeObj),
    [colors, themeObj]
  );

  // Load saved params when screen opens
  useEffect(() => {
    const loadSavedParams = async () => {
      try {
        const savedParams = await getCalorieCalculatorParams();
        const paramsToUse = calculatorParams || savedParams;
        setLocalParams(paramsToUse);
        setCalculatorParams(paramsToUse);
        setIsLoaded(true);
      } catch (error) {
        console.error("Failed to load saved params:", error);
        const defaultParams = calculatorParams || stableInitialParams;
        setLocalParams(defaultParams);
        setCalculatorParams(defaultParams);
        setIsLoaded(true);
      }
    };

    loadSavedParams();
  }, [calculatorParams, setCalculatorParams, stableInitialParams]);

  // Update local params when store changes
  useEffect(() => {
    if (calculatorParams) {
      setLocalParams(calculatorParams);
    }
  }, [calculatorParams]);

  const handleSexSelect = async (sex: Sex) => {
    const newParams = { ...localParams, sex };
    setLocalParams(newParams);
    setCalculatorParams(newParams);

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Auto-advance to next screen after a short delay for visual feedback
    setTimeout(() => {
      router.push("/settings/calculator/age");
    }, 300);
  };

  const handleManualInput = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/settings/calculator/manualInput");
  };

  const handleBack = () => {
    router.back();
  };

  if (!isLoaded) {
    return (
      <SafeAreaView
        style={[styles.container, styles.centered]}
        edges={["left", "right"]}
      >
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <SafeAreaView style={styles.container} edges={["left", "right"]}>
        <View style={styles.progressContainer}>
          <ProgressBar
            totalSteps={6}
            currentStep={1}
            accessibilityLabel={`Calculator progress: step 1 of 6`}
          />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.textSection}>
            <Text style={styles.subtitle}>What is your biological sex?</Text>
            <Text style={styles.description}>
              This helps us calculate your daily calorie needs more accurately.
            </Text>
          </View>

          <View style={styles.selectionSection}>
            <View style={styles.optionsContainer}>
              <SelectionCard
                title="Male"
                description="Biological male"
                icon={GenderMaleIcon}
                iconColor="#4A90E2"
                isSelected={localParams.sex === "male"}
                onSelect={() => handleSexSelect("male")}
                accessibilityLabel="Select male as biological sex"
                accessibilityHint="This will help calculate your calorie needs and advance to the next step"
              />

              <SelectionCard
                title="Female"
                description="Biological female"
                icon={GenderFemaleIcon}
                iconColor="#E24A90"
                isSelected={localParams.sex === "female"}
                onSelect={() => handleSexSelect("female")}
                accessibilityLabel="Select female as biological sex"
                accessibilityHint="This will help calculate your calorie needs and advance to the next step"
              />
            </View>

            {/* Separator */}
            <View style={styles.separator} />

            {/* Manual Input Option */}
            <TouchableOpacity
              style={styles.manualInputButton}
              onPress={handleManualInput}
              accessibilityRole="button"
              accessibilityLabel="Enter your own calorie value"
              accessibilityHint="Skip the calculator and enter your daily calorie goal manually"
            >
              <Text style={styles.manualInputText}>Enter own value</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    loadingText: {
      fontSize: typography.Body.fontSize,
      fontFamily: typography.Body.fontFamily,
      color: colors.secondaryText,
    },
    content: {
      flex: 1,
      paddingTop: spacing.lg,
      paddingHorizontal: spacing.pageMargins.horizontal,
      justifyContent: "center",
    },
    textSection: {
      marginBottom: spacing.md,
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
    },
    selectionSection: {
      flex: 1,
      justifyContent: "center",
    },
    optionsContainer: {
      gap: spacing.md,
      marginBottom: spacing.xl,
    },
    separator: {
      height: 1,
      backgroundColor: colors.border,
      marginHorizontal: spacing.xl,
      marginBottom: spacing.xl,
    },
    manualInputButton: {
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: themeObj.components.buttons.cornerRadius,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.secondaryBackground,
      alignItems: "center",
      marginHorizontal: spacing.lg,
    },
    manualInputText: {
      fontSize: typography.Body.fontSize,
      fontFamily: typography.Body.fontFamily,
      color: colors.secondaryText,
      fontWeight: "500",
    },
    progressContainer: {
      padding: themeObj.spacing.md,
    },
  });
};
