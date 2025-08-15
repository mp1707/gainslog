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

export default function SexSelectionScreen() {
  const { colors, theme: themeObj } = useTheme();
  const {
    calculatorParams,
    setCalculatorParams,
    clearCalculatorData,
  } = useFoodLogStore();

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

  const handleCancel = () => {
    clearCalculatorData();
    router.back();
  };

  if (!isLoaded) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]} edges={["left", "right"]}>
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <SafeAreaView style={styles.container} edges={["left", "right"]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleCancel}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
            hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
          >
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Biological Sex</Text>
            <Text style={styles.stepIndicator}>Step 1 of 6</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.subtitle}>
            What is your biological sex?
          </Text>
          <Text style={styles.description}>
            This helps us calculate your daily calorie needs more accurately.
          </Text>

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
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.pageMargins.horizontal,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    cancelButton: {
      color: colors.accent,
      fontSize: typography.Body.fontSize,
      fontFamily: typography.Body.fontFamily,
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
      width: 60, // Same width as cancel button area
    },
    content: {
      flex: 1,
      paddingHorizontal: spacing.pageMargins.horizontal,
      paddingTop: spacing.xl,
      justifyContent: "center",
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
      marginBottom: spacing.xl,
    },
    optionsContainer: {
      paddingBottom: spacing.xl,
    },
  });
};