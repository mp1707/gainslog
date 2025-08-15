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
  const [heightInput, setHeightInput] = useState<string>(
    heightUnit === "cm" 
      ? localParams.height.toString()
      : (localParams.height / 30.48).toFixed(1)
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
      const displayHeight = heightUnit === "cm" 
        ? calculatorParams.height
        : (calculatorParams.height / 30.48);
      setHeightInput(heightUnit === "cm" ? displayHeight.toString() : displayHeight.toFixed(1));
    }
  }, [calculatorParams, heightUnit]);


  // Update height input when unit changes
  useEffect(() => {
    const displayHeight = heightUnit === "cm" 
      ? localParams.height
      : (localParams.height / 30.48);
    setHeightInput(heightUnit === "cm" ? displayHeight.toString() : displayHeight.toFixed(1));
  }, [heightUnit, localParams.height]);

  const updateHeight = (heightText: string) => {
    setHeightInput(heightText);
    
    if (heightText === '') {
      return; // Allow empty input
    }
    
    const height = parseFloat(heightText);
    if (!isNaN(height) && height > 0) {
      // Always store in cm
      const heightInCm = heightUnit === "ft" ? height * 30.48 : height;
      const newParams = { ...localParams, height: Math.round(heightInCm) };
      setLocalParams(newParams);
      setCalculatorParams(newParams);
    }
  };

  const handleContinue = async () => {
    const height = parseFloat(heightInput);
    if (isNaN(height) || height <= 0) {
      return;
    }
    
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/settings/calculator/activity-level");
  };

  const isValidHeight = () => {
    if (heightInput === '') return false;
    const height = parseFloat(heightInput);
    const minHeight = heightUnit === "cm" ? 100 : 3.3;
    const maxHeight = heightUnit === "cm" ? 250 : 8.2;
    return !isNaN(height) && height >= minHeight && height <= maxHeight;
  };

  // Get dynamic min/max based on current unit
  const getHeightConstraints = () => {
    if (heightUnit === "cm") {
      return { min: 100, max: 250 };
    } else {
      return { min: 3.3, max: 8.2 }; // feet
    }
  };

  const { min: heightMin, max: heightMax } = getHeightConstraints();


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
        <View style={styles.progressContainer}>
          <ProgressBar
            totalSteps={6}
            currentStep={4}
            accessibilityLabel={`Calculator progress: step 4 of 6`}
          />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.textSection}>
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
          </View>

          <View style={styles.inputSection}>
            <View style={styles.inputContainer}>
              <NumericTextInput
                ref={inputRef}
                style={styles.heightInput}
                value={heightInput}
                onChangeText={updateHeight}
                min={heightMin}
                max={heightMax}
                placeholder={heightUnit === "cm" ? "175" : "5.8"}
                accessibilityLabel="Height input"
                accessibilityHint={`Enter your height in ${heightUnit} between ${heightMin} and ${heightMax}`}
              />
              <Text style={styles.unitText}>{heightUnit}</Text>
            </View>
            
            <Text style={styles.conversionText}>
              {getConversionText()}
            </Text>
          </View>

          <View style={styles.navigationContainer}>
            <TouchableOpacity
              style={[
                styles.continueButton,
                !isValidHeight() && styles.continueButtonDisabled,
              ]}
              onPress={handleContinue}
              disabled={!isValidHeight()}
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
    heightInput: {
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