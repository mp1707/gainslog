import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  TextInput as RNTextInput,
  InputAccessoryView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { CaretRightIcon } from "phosphor-react-native";
import * as Haptics from "expo-haptics";

import { NumericTextInput } from "@/shared/ui/atoms/NumericTextInput";

import { useTheme } from "@/providers";
import { useFoodLogStore } from "@/stores/useFoodLogStore";
import { ProgressBar } from "@/shared/ui/molecules/ProgressBar";
import type { CalorieIntakeParams } from "@/types";
import { StyleSheet } from "react-native";

export default function AgeSelectionScreen() {
  const { colors, theme: themeObj } = useTheme();
  const { calculatorParams, setCalculatorParams } = useFoodLogStore();

  const [localParams, setLocalParams] = useState<CalorieIntakeParams>(
    calculatorParams || {
      sex: "male",
      age: 30,
      weight: 85,
      height: 175,
    }
  );

  const [ageInput, setAgeInput] = useState<string>(localParams.age.toString());
  const inputRef = useRef<RNTextInput>(null);
  const inputAccessoryViewID = "ageInputAccessory";

  const styles = useMemo(
    () => createStyles(colors, themeObj),
    [colors, themeObj]
  );

  // Update local params when store changes
  useEffect(() => {
    if (calculatorParams) {
      setLocalParams(calculatorParams);
      setAgeInput(calculatorParams.age.toString());
    }
  }, [calculatorParams]);

  // Auto-focus input when screen mounts
  useEffect(() => {
    const focusTimer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100); // Small delay to ensure component is fully mounted

    return () => clearTimeout(focusTimer);
  }, []);

  const updateAge = (ageText: string) => {
    setAgeInput(ageText);
    
    if (ageText === '') {
      return; // Allow empty input
    }
    
    const age = parseInt(ageText, 10);
    if (!isNaN(age)) {
      const newParams = { ...localParams, age };
      setLocalParams(newParams);
      setCalculatorParams(newParams);
    }
  };

  const handleContinue = async () => {
    const age = parseInt(ageInput, 10);
    if (isNaN(age) || age < 13 || age > 120) {
      return;
    }

    // Dismiss keyboard first, then navigate
    inputRef.current?.blur();
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/settings/calculator/weight");
  };

  const isValidAge = () => {
    if (ageInput === '') return false;
    const age = parseInt(ageInput, 10);
    return !isNaN(age) && age >= 13 && age <= 120;
  };

  // InputAccessoryView component
  const renderInputAccessory = () => (
    <InputAccessoryView nativeID={inputAccessoryViewID}>
      <View style={styles.inputAccessoryContainer}>
        <View style={styles.inputAccessoryContent}>
          <TouchableOpacity
            style={[
              styles.accessoryContinueButton,
              !isValidAge() && styles.accessoryContinueButtonDisabled,
            ]}
            onPress={handleContinue}
            disabled={!isValidAge()}
            accessibilityRole="button"
            accessibilityLabel="Continue to weight selection"
          >
            <Text 
              style={[
                styles.accessoryContinueButtonText,
                !isValidAge() && styles.accessoryContinueButtonTextDisabled,
              ]}
            >
              Continue
            </Text>
            <CaretRightIcon 
              size={20} 
              color={isValidAge() ? "#FFFFFF" : colors.disabledText} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </InputAccessoryView>
  );

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <View style={styles.progressContainer}>
        <ProgressBar
          totalSteps={6}
          currentStep={2}
          accessibilityLabel={`Calculator progress: step 2 of 6`}
        />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.textSection}>
          <Text style={styles.subtitle}>What is your age?</Text>
          <Text style={styles.description}>
            Your age helps determine your baseline metabolic rate.
          </Text>
        </View>

        <View style={styles.inputSection}>
          <View style={styles.inputContainer}>
            <NumericTextInput
              ref={inputRef}
              value={ageInput}
              onChangeText={updateAge}
              min={13}
              max={120}
              placeholder="30"
              accessibilityLabel="Age input"
              accessibilityHint="Enter your age between 13 and 120 years"
              inputAccessoryViewID={inputAccessoryViewID}
              extraLarge
              borderless
              integerOnly
            />
            <Text style={styles.unitText}>years</Text>
          </View>
        </View>

        {/* Spacer to push content up and provide consistent spacing */}
        <View style={styles.spacer} />
      </View>

      {/* Input Accessory View */}
      {renderInputAccessory()}
    </SafeAreaView>
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
    inputSection: {
      alignItems: "center",
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "baseline",
      justifyContent: "center",
    },
    unitText: {
      fontSize: typography.Headline.fontSize,
      fontFamily: typography.Headline.fontFamily,
      color: colors.secondaryText,
      marginLeft: spacing.sm,
    },
    spacer: {
      flex: 1,
      minHeight: spacing.xxl * 2, // Ensure minimum spacing
    },
    progressContainer: {
      padding: spacing.md,
    },
    // InputAccessoryView styles
    inputAccessoryContainer: {
      backgroundColor: colors.secondaryBackground,
      borderTopWidth: 0.5,
      borderTopColor: colors.border,
    },
    inputAccessoryContent: {
      paddingHorizontal: spacing.pageMargins.horizontal,
      paddingVertical: spacing.md,
      paddingBottom: spacing.lg, // Extra padding for safe area
    },
    accessoryContinueButton: {
      backgroundColor: colors.accent,
      borderRadius: themeObj.components.buttons.cornerRadius,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      minHeight: 50, // iOS standard button height
    },
    accessoryContinueButtonText: {
      fontSize: typography.Button.fontSize,
      fontFamily: typography.Button.fontFamily,
      color: "#FFFFFF",
      fontWeight: "600",
      marginRight: spacing.sm,
    },
    accessoryContinueButtonDisabled: {
      backgroundColor: colors.disabledBackground,
    },
    accessoryContinueButtonTextDisabled: {
      color: colors.disabledText,
    },
  });
};
