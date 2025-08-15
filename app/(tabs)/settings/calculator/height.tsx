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
import { Toggle, type ToggleOption } from "@/shared/ui/atoms/Toggle";
import { ProgressBar } from "@/shared/ui/molecules/ProgressBar";
import type { CalorieIntakeParams } from "@/types";
import { StyleSheet } from "react-native";

type HeightUnit = "cm" | "ft";

export default function HeightSelectionScreen() {
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

  const [heightUnit, setHeightUnit] = useState<HeightUnit>("cm");

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

  const updateHeight = (height: number) => {
    // Always store in cm
    const heightInCm = heightUnit === "ft" ? height * 30.48 : height;
    const newParams = { ...localParams, height: Math.round(heightInCm) };
    setLocalParams(newParams);
    setCalculatorParams(newParams);
  };

  const handleContinue = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/settings/calculator/activity-level");
  };

  // Height unit toggle options
  const heightUnitOptions: [ToggleOption<HeightUnit>, ToggleOption<HeightUnit>] = [
    {
      value: "cm",
      label: "cm",
    },
    {
      value: "ft",
      label: "ft",
    },
  ];

  // Generate height items based on unit
  const getHeightItems = () => {
    if (heightUnit === "cm") {
      return Array.from({ length: 151 }, (_, i) => i + 100); // 100-250 cm
    } else {
      // Generate feet values from 3'3" to 8'2" (100-250 cm equivalent)
      const items = [];
      for (let feet = 3; feet <= 8; feet++) {
        const startInches = feet === 3 ? 3 : 0;
        const endInches = feet === 8 ? 2 : 11;
        for (let inches = startInches; inches <= endInches; inches++) {
          const totalInches = feet * 12 + inches;
          const heightInFeet = totalInches / 12;
          if (heightInFeet >= 3.25 && heightInFeet <= 8.17) { // 100-250 cm range
            items.push(heightInFeet);
          }
        }
      }
      return items;
    }
  };

  const heightItems = getHeightItems();

  // Get display height based on unit
  const getDisplayHeight = () => {
    if (heightUnit === "cm") {
      return localParams.height;
    } else {
      return Math.round((localParams.height / 30.48) * 12) / 12; // Convert to feet with 1-inch precision
    }
  };

  const displayHeight = getDisplayHeight();

  // Format height display for ft unit
  const formatHeightDisplay = (heightInFeet: number) => {
    const feet = Math.floor(heightInFeet);
    const inches = Math.round((heightInFeet - feet) * 12);
    return `${feet}'${inches}"`;
  };

  // Get conversion text
  const getConversionText = () => {
    if (heightUnit === "cm") {
      const feet = Math.floor(localParams.height / 30.48);
      const inches = Math.round((localParams.height % 30.48) / 2.54);
      return `${localParams.height}cm = ${feet}'${inches}"`;
    } else {
      return `${formatHeightDisplay(localParams.height / 30.48)} = ${localParams.height}cm`;
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <SafeAreaView style={styles.container} edges={["left", "right"]}>
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <ProgressBar
            totalSteps={6}
            currentStep={4}
            accessibilityLabel="Calculator progress: step 4 of 6"
          />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.subtitle}>
            What is your height?
          </Text>
          <Text style={styles.description}>
            Your height is used to calculate your daily calorie needs.
          </Text>

          {/* Unit Toggle */}
          <View style={styles.unitToggleContainer}>
            <Toggle
              value={heightUnit}
              options={heightUnitOptions}
              onChange={(unit) => {
                setHeightUnit(unit);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              accessibilityLabel="Select height unit"
            />
          </View>

          <View style={styles.pickerSection}>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={displayHeight}
                onValueChange={updateHeight}
                style={styles.picker}
                itemStyle={styles.pickerItem}
              >
                {heightItems.map((height) => (
                  <Picker.Item 
                    key={height} 
                    label={heightUnit === "cm" ? `${height} cm` : formatHeightDisplay(height)}
                    value={height} 
                  />
                ))}
              </Picker>
            </View>
            
            <Text style={styles.conversionText}>
              {getConversionText()}
            </Text>
          </View>

          {/* Continue Button */}
          <View style={styles.navigationContainer}>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue}
              accessibilityRole="button"
              accessibilityLabel="Continue to activity level selection"
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
      marginBottom: spacing.lg,
    },
    unitToggleContainer: {
      alignItems: "center",
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
      marginBottom: spacing.md,
    },
    picker: {
      height: 200,
      color: colors.primaryText,
    },
    pickerItem: {
      fontSize: typography.Body.fontSize,
      color: colors.primaryText,
    },
    conversionText: {
      fontSize: typography.Caption.fontSize,
      fontFamily: typography.Caption.fontFamily,
      color: colors.secondaryText,
      textAlign: "center",
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