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

type WeightUnit = "kg" | "lbs";

export default function WeightSelectionScreen() {
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

  const [weightUnit, setWeightUnit] = useState<WeightUnit>("kg");

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

  const updateWeight = (weight: number) => {
    // Always store in kg
    const weightInKg = weightUnit === "lbs" ? weight / 2.205 : weight;
    const newParams = { ...localParams, weight: Math.round(weightInKg * 10) / 10 };
    setLocalParams(newParams);
    setCalculatorParams(newParams);
  };

  const handleContinue = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/settings/calculator/height");
  };

  // Weight unit toggle options
  const weightUnitOptions: [ToggleOption<WeightUnit>, ToggleOption<WeightUnit>] = [
    {
      value: "kg",
      label: "kg",
    },
    {
      value: "lbs",
      label: "lbs",
    },
  ];

  // Generate weight items based on unit
  const getWeightItems = () => {
    if (weightUnit === "kg") {
      return Array.from({ length: 271 }, (_, i) => i + 30); // 30-300 kg
    } else {
      return Array.from({ length: 596 }, (_, i) => i + 66); // 66-661 lbs (30-300 kg equivalent)
    }
  };

  const weightItems = getWeightItems();

  // Get display weight based on unit
  const getDisplayWeight = () => {
    if (weightUnit === "kg") {
      return localParams.weight;
    } else {
      return Math.round(localParams.weight * 2.205);
    }
  };

  const displayWeight = getDisplayWeight();

  // Get conversion text
  const getConversionText = () => {
    if (weightUnit === "kg") {
      return `${localParams.weight}kg = ${Math.round(localParams.weight * 2.205)}lbs`;
    } else {
      return `${Math.round(localParams.weight * 2.205)}lbs = ${localParams.weight}kg`;
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <SafeAreaView style={styles.container} edges={["left", "right"]}>
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <ProgressBar
            totalSteps={6}
            currentStep={3}
            accessibilityLabel="Calculator progress: step 3 of 6"
          />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.subtitle}>
            What is your weight?
          </Text>
          <Text style={styles.description}>
            Your weight is used to calculate your daily calorie needs.
          </Text>

          {/* Unit Toggle */}
          <View style={styles.unitToggleContainer}>
            <Toggle
              value={weightUnit}
              options={weightUnitOptions}
              onChange={(unit) => {
                setWeightUnit(unit);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              accessibilityLabel="Select weight unit"
            />
          </View>

          <View style={styles.pickerSection}>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={displayWeight}
                onValueChange={updateWeight}
                style={styles.picker}
                itemStyle={styles.pickerItem}
              >
                {weightItems.map((weight) => (
                  <Picker.Item 
                    key={weight} 
                    label={`${weight} ${weightUnit}`} 
                    value={weight} 
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
              accessibilityLabel="Continue to height selection"
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