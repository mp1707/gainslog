import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  View,
  KeyboardAvoidingView,
  TouchableOpacity,
  Text,
  TextInput as RNTextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { CaretRightIcon } from "phosphor-react-native";
import * as Haptics from "expo-haptics";

import { NumericTextInput } from "@/shared/ui/atoms/NumericTextInput";

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
  const [weightInput, setWeightInput] = useState<string>(
    weightUnit === "kg" 
      ? localParams.weight.toString()
      : Math.round(localParams.weight * 2.205).toString()
  );
  const inputRef = useRef<RNTextInput>(null);

  const styles = useMemo(
    () => createStyles(colors, themeObj),
    [colors, themeObj]
  );

  // Update local params when store changes
  useEffect(() => {
    if (calculatorParams) {
      setLocalParams(calculatorParams);
      const displayWeight = weightUnit === "kg" 
        ? calculatorParams.weight
        : Math.round(calculatorParams.weight * 2.205);
      setWeightInput(displayWeight.toString());
    }
  }, [calculatorParams, weightUnit]);


  // Update weight input when unit changes
  useEffect(() => {
    const displayWeight = weightUnit === "kg" 
      ? localParams.weight
      : Math.round(localParams.weight * 2.205);
    setWeightInput(displayWeight.toString());
  }, [weightUnit, localParams.weight]);

  const updateWeight = (weightText: string) => {
    setWeightInput(weightText);
    
    if (weightText === '') {
      return; // Allow empty input
    }
    
    const weight = parseFloat(weightText);
    if (!isNaN(weight) && weight > 0) {
      // Always store in kg
      const weightInKg = weightUnit === "lbs" ? weight / 2.205 : weight;
      const newParams = { ...localParams, weight: Math.round(weightInKg * 10) / 10 };
      setLocalParams(newParams);
      setCalculatorParams(newParams);
    }
  };

  const handleContinue = async () => {
    const weight = parseFloat(weightInput);
    if (isNaN(weight) || weight <= 0) {
      return;
    }
    
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/settings/calculator/height");
  };

  const isValidWeight = () => {
    if (weightInput === '') return false;
    const weight = parseFloat(weightInput);
    const minWeight = weightUnit === "kg" ? 30 : 66;
    const maxWeight = weightUnit === "kg" ? 300 : 661;
    return !isNaN(weight) && weight >= minWeight && weight <= maxWeight;
  };

  // Get dynamic min/max based on current unit
  const getWeightConstraints = () => {
    if (weightUnit === "kg") {
      return { min: 30, max: 300 };
    } else {
      return { min: 66, max: 661 };
    }
  };

  const { min: weightMin, max: weightMax } = getWeightConstraints();


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
        <View style={styles.progressContainer}>
          <ProgressBar
            totalSteps={6}
            currentStep={3}
            accessibilityLabel={`Calculator progress: step 3 of 6`}
          />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.textSection}>
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
          </View>

          <View style={styles.inputSection}>
            <View style={styles.inputContainer}>
              <NumericTextInput
                ref={inputRef}
                style={styles.weightInput}
                value={weightInput}
                onChangeText={updateWeight}
                min={weightMin}
                max={weightMax}
                placeholder={weightUnit === "kg" ? "70" : "155"}
                accessibilityLabel="Weight input"
                accessibilityHint={`Enter your weight in ${weightUnit} between ${weightMin} and ${weightMax}`}
              />
              <Text style={styles.unitText}>{weightUnit}</Text>
            </View>
            
            <Text style={styles.conversionText}>
              {getConversionText()}
            </Text>
          </View>

          <View style={styles.navigationContainer}>
            <TouchableOpacity
              style={[
                styles.continueButton,
                !isValidWeight() && styles.continueButtonDisabled,
              ]}
              onPress={handleContinue}
              disabled={!isValidWeight()}
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
    content: {
      flex: 1,
      paddingHorizontal: spacing.pageMargins.horizontal,
      justifyContent: "space-between",
    },
    textSection: {
      paddingTop: spacing.lg,
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
    },
    inputSection: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: spacing.xl,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "baseline",
      justifyContent: "center",
      marginBottom: spacing.md,
    },
    weightInput: {
      fontSize: typography.Title1.fontSize,
      fontFamily: typography.Title1.fontFamily,
      textAlign: "center",
      minWidth: 120,
    },
    unitText: {
      fontSize: typography.Title1.fontSize,
      fontFamily: typography.Title1.fontFamily,
      color: colors.secondaryText,
      marginLeft: spacing.sm,
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
    progressContainer: {
      padding: themeObj.spacing.md,
    },
    continueButtonDisabled: {
      backgroundColor: colors.disabledBackground,
      opacity: 0.6,
    },
  });
};