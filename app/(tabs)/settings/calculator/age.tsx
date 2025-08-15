import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  KeyboardAvoidingView,
  TouchableOpacity,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import { CaretRightIcon } from "phosphor-react-native";
import * as Haptics from "expo-haptics";

import { useTheme } from "@/providers";
import { useFoodLogStore } from "@/stores/useFoodLogStore";
import { ProgressBar } from "@/shared/ui/molecules/ProgressBar";
import type { CalorieIntakeParams } from "@/types";
import { StyleSheet } from "react-native";

export default function AgeSelectionScreen() {
  const { colors, theme: themeObj } = useTheme();
  const {
    calculatorParams,
    setCalculatorParams,
  } = useFoodLogStore();

  const [localParams, setLocalParams] = useState<CalorieIntakeParams>(
    calculatorParams || {
      sex: "male",
      age: 30,
      weight: 85,
      height: 175,
    }
  );

  const styles = useMemo(
    () => createStyles(colors, themeObj),
    [colors, themeObj]
  );

  // Update local params when store changes
  useEffect(() => {
    if (calculatorParams) {
      setLocalParams(calculatorParams);
    }
  }, [calculatorParams]);

  const updateAge = (age: number) => {
    const newParams = { ...localParams, age };
    setLocalParams(newParams);
    setCalculatorParams(newParams);
  };

  const handleContinue = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/settings/calculator/weight");
  };


  // Generate age items from 13 to 120
  const ageItems = Array.from({ length: 108 }, (_, i) => i + 13);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <SafeAreaView style={styles.container} edges={["left", "right"]}>
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <ProgressBar
            totalSteps={6}
            currentStep={2}
            accessibilityLabel="Calculator progress: step 2 of 6"
          />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.subtitle}>
            What is your age?
          </Text>
          <Text style={styles.description}>
            Your age helps determine your baseline metabolic rate.
          </Text>

          <View style={styles.pickerSection}>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={localParams.age}
                onValueChange={updateAge}
                style={styles.picker}
                itemStyle={styles.pickerItem}
              >
                {ageItems.map((age) => (
                  <Picker.Item key={age} label={`${age} years`} value={age} />
                ))}
              </Picker>
            </View>
          </View>

          {/* Continue Button */}
          <View style={styles.navigationContainer}>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue}
              accessibilityRole="button"
              accessibilityLabel="Continue to weight selection"
            >
              <Text style={styles.continueButtonText}>Continue</Text>
              <CaretRightIcon size={20} color="#FFFFFF" />
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
    progressContainer: {
      paddingHorizontal: spacing.pageMargins.horizontal,
      paddingTop: spacing.md,
      paddingBottom: spacing.lg,
    },
    content: {
      flex: 1,
      paddingHorizontal: spacing.pageMargins.horizontal,
      justifyContent: "space-between",
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
    pickerSection: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    pickerContainer: {
      backgroundColor: colors.secondaryBackground,
      borderRadius: themeObj.components.buttons.cornerRadius,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
      width: "80%",
      maxWidth: 280,
    },
    picker: {
      height: 200,
      color: colors.primaryText,
    },
    pickerItem: {
      fontSize: typography.Body.fontSize,
      color: colors.primaryText,
    },
    navigationContainer: {
      paddingBottom: spacing.xl,
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
    continueButtonText: {
      fontSize: typography.Body.fontSize,
      fontFamily: typography.Body.fontFamily,
      color: "#FFFFFF",
      fontWeight: "600",
      marginRight: spacing.sm,
    },
  });
};