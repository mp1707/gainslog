import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput as RNTextInput,
  InteractionManager,
} from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";

import { NumericTextInput } from "@/shared/ui/atoms/NumericTextInput";
import { 
  CalculatorScreenLayout, 
  CalculatorInputAccessory, 
  CalculatorHeader 
} from "@/shared/ui/components";

import { useTheme } from "@/providers";
import { useFoodLogStore } from "@/stores/useFoodLogStore";
import { Toggle, type ToggleOption } from "@/shared/ui/atoms/Toggle";
import type { CalorieIntakeParams } from "@/types";
import { StyleSheet } from "react-native";

type HeightUnit = "cm" | "ft";

const HeightSelectionScreen = React.memo(function HeightSelectionScreen() {
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
  const inputAccessoryViewID = "heightInputAccessory";

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

  // Auto-focus input when screen mounts - after navigation animation completes
  useEffect(() => {
    const handle = InteractionManager.runAfterInteractions(() => {
      inputRef.current?.focus();
    });

    return () => handle.cancel();
  }, []);

  const updateHeight = useCallback((heightText: string) => {
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
  }, [heightUnit, localParams, setCalculatorParams]);

  const handleContinue = useCallback(async () => {
    const height = parseFloat(heightInput);
    if (isNaN(height) || height <= 0) {
      return;
    }
    
    // Dismiss keyboard first, then navigate
    inputRef.current?.blur();
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/settings/calculator/activity-level");
  }, [heightInput]);

  const isValidHeight = useCallback(() => {
    if (heightInput === '') return false;
    const height = parseFloat(heightInput);
    const minHeight = heightUnit === "cm" ? 100 : 3.3;
    const maxHeight = heightUnit === "cm" ? 250 : 8.2;
    return !isNaN(height) && height >= minHeight && height <= maxHeight;
  }, [heightInput, heightUnit]);

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
    <CalculatorScreenLayout
      currentStep={4}
      totalSteps={6}
      progressLabel="Calculator progress: step 4 of 6"
    >
      <CalculatorHeader
        title="What is your height?"
        description="Your height is used to calculate your daily calorie needs."
      >
        <Toggle
          value={heightUnit}
          options={heightUnitOptions}
          onChange={(unit) => {
            setHeightUnit(unit);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          accessibilityLabel="Select height unit"
        />
      </CalculatorHeader>

      <View style={styles.inputSection}>
        <View style={styles.inputContainer}>
          <NumericTextInput
            ref={inputRef}
            value={heightInput}
            onChangeText={updateHeight}
            min={heightMin}
            max={heightMax}
            placeholder={heightUnit === "cm" ? "175" : "5.8"}
            accessibilityLabel="Height input"
            accessibilityHint={`Enter your height in ${heightUnit} between ${heightMin} and ${heightMax}`}
            inputAccessoryViewID={inputAccessoryViewID}
            extraLarge
            borderless
          />
          <Text style={styles.unitText}>{heightUnit}</Text>
        </View>
        
        <Text style={styles.conversionText}>
          {getConversionText()}
        </Text>
      </View>

      {/* Spacer to push content up and provide consistent spacing */}
      <View style={styles.spacer} />

      {/* Input Accessory View */}
      <CalculatorInputAccessory
        nativeID={inputAccessoryViewID}
        isValid={isValidHeight()}
        onContinue={handleContinue}
        accessibilityLabel="Continue to activity level selection"
      />
    </CalculatorScreenLayout>
  );
});

export default HeightSelectionScreen;

type Colors = ReturnType<typeof useTheme>["colors"];
type Theme = ReturnType<typeof useTheme>["theme"];

const createStyles = (colors: Colors, themeObj: Theme) => {
  const { spacing, typography } = themeObj;

  return StyleSheet.create({
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
    conversionText: {
      fontSize: typography.Caption.fontSize,
      fontFamily: typography.Caption.fontFamily,
      color: colors.secondaryText,
      textAlign: "center",
      marginTop: spacing.md,
    },
    spacer: {
      flex: 1,
      minHeight: spacing.xxl * 2, // Ensure minimum spacing
    },
  });
};