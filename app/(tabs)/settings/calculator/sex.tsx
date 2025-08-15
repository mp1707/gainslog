import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
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

const SexSelectionScreen = React.memo(function SexSelectionScreen() {
  const { colors, theme: themeObj } = useTheme();
  const { calculatorParams, setCalculatorParams, clearCalculatorData } =
    useFoodLogStore();

  // Create stable initial params to prevent re-renders
  const stableInitialParams = useMemo(
    () => ({
      age: 30,
      weight: 85,
      height: 175,
    }),
    []
  );

  const [localParams, setLocalParams] = useState<CalorieIntakeParams | null>(
    calculatorParams
  );
  const [selectedSex, setSelectedSex] = useState<Sex | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const styles = useMemo(
    () => createStyles(colors, themeObj),
    [colors, themeObj]
  );

  // Load saved params when screen opens
  useEffect(() => {
    const loadSavedParams = async () => {
      try {
        // If store has been explicitly cleared (calculatorParams is null),
        // start fresh without loading old AsyncStorage data
        if (calculatorParams === null) {
          setLocalParams(null);
          setIsLoaded(true);
          return;
        }

        // If we have store params, use them
        if (calculatorParams) {
          setLocalParams(calculatorParams);
          setIsLoaded(true);
          return;
        }

        // Otherwise, load from AsyncStorage for fresh app launches
        const savedParams = await getCalorieCalculatorParams();
        setLocalParams(savedParams);
        setCalculatorParams(savedParams);
        setIsLoaded(true);
      } catch (error) {
        console.error("Failed to load saved params:", error);
        // Start with no selection on error
        setLocalParams(null);
        setIsLoaded(true);
      }
    };

    loadSavedParams();
  }, [calculatorParams, setCalculatorParams]);

  // Update local params when store changes
  useEffect(() => {
    if (calculatorParams) {
      setLocalParams(calculatorParams);
    }
  }, [calculatorParams]);

  const handleSexSelect = useCallback(async (sex: Sex) => {
    setSelectedSex(sex);
    const newParams = { ...stableInitialParams, ...localParams, sex };
    setLocalParams(newParams);
    setCalculatorParams(newParams);

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Auto-advance to next screen after a short delay for visual feedback
    setTimeout(() => {
      router.push("/settings/calculator/age");
    }, 300);
  }, [stableInitialParams, localParams, setCalculatorParams]);

  const handleManualInput = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/settings/calculator/manualInput");
  }, []);

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
              isSelected={selectedSex === "male"}
              onSelect={() => handleSexSelect("male")}
              accessibilityLabel="Select male as biological sex"
              accessibilityHint="This will help calculate your calorie needs and advance to the next step"
            />

            <SelectionCard
              title="Female"
              description="Biological female"
              icon={GenderFemaleIcon}
              iconColor="#E24A90"
              isSelected={selectedSex === "female"}
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

        {/* Spacer to push content up and provide consistent spacing */}
        <View style={styles.spacer} />
      </View>
    </SafeAreaView>
  );
});

export default SexSelectionScreen;

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
      paddingHorizontal: spacing.pageMargins.horizontal,
      justifyContent: "flex-start",
      alignItems: "stretch",
      gap: spacing.xxl,
    },
    textSection: {
      paddingTop: spacing.lg,
      gap: spacing.sm,
    },
    subtitle: {
      fontSize: typography.Title2.fontSize,
      fontFamily: typography.Title2.fontFamily,
      color: colors.primaryText,
      textAlign: "center",
    },
    description: {
      fontSize: typography.Body.fontSize,
      fontFamily: typography.Body.fontFamily,
      color: colors.secondaryText,
      textAlign: "center",
      lineHeight: 22,
    },
    selectionSection: {
      alignItems: "stretch",
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
    spacer: {
      flex: 1,
      minHeight: spacing.xxl * 2, // Ensure minimum spacing
    },
    progressContainer: {
      padding: themeObj.spacing.md,
    },
  });
};
