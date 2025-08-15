import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
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
  CalculatorHeader,
} from "@/shared/ui/components";

import { useTheme } from "@/providers";
import { useFoodLogStore } from "@/stores/useFoodLogStore";
import { Toggle, type ToggleOption } from "@/shared/ui/atoms/Toggle";
import type { CalorieIntakeParams } from "@/types";
import { StyleSheet } from "react-native";

type WeightUnit = "kg" | "lbs";

const WeightSelectionScreen = React.memo(function WeightSelectionScreen() {
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

  const [weightUnit, setWeightUnit] = useState<WeightUnit>("kg");
  const [weightInput, setWeightInput] = useState<string>(
    weightUnit === "kg"
      ? localParams.weight.toString()
      : Math.round(localParams.weight * 2.205).toString()
  );
  const inputRef = useRef<RNTextInput>(null);
  const inputAccessoryViewID = "weightInputAccessory";

  const styles = useMemo(
    () => createStyles(colors, themeObj),
    [colors, themeObj]
  );

  // Update local params when store changes
  useEffect(() => {
    if (calculatorParams) {
      setLocalParams(calculatorParams);
      const displayWeight =
        weightUnit === "kg"
          ? calculatorParams.weight
          : Math.round(calculatorParams.weight * 2.205);
      setWeightInput(displayWeight.toString());
    }
  }, [calculatorParams, weightUnit]);

  // Update weight input when unit changes
  useEffect(() => {
    const displayWeight =
      weightUnit === "kg"
        ? localParams.weight
        : Math.round(localParams.weight * 2.205);
    setWeightInput(displayWeight.toString());
  }, [weightUnit, localParams.weight]);

  // Auto-focus input when screen mounts - wait for animation to fully complete
  useEffect(() => {
    const handle = InteractionManager.runAfterInteractions(() => {
      // Additional delay to ensure navigation animation is visually complete
      const focusTimer = setTimeout(() => {
        inputRef.current?.focus();
      }, 400); // 400ms total delay for smooth animation completion

      return () => clearTimeout(focusTimer);
    });

    return () => handle.cancel();
  }, []);

  const updateWeight = useCallback(
    (weightText: string) => {
      setWeightInput(weightText);

      if (weightText === "") {
        return; // Allow empty input
      }

      const weight = parseFloat(weightText);
      if (!isNaN(weight) && weight > 0) {
        // Always store in kg
        const weightInKg = weightUnit === "lbs" ? weight / 2.205 : weight;
        const newParams = {
          ...localParams,
          weight: Math.round(weightInKg * 10) / 10,
        };
        setLocalParams(newParams);
        setCalculatorParams(newParams);
      }
    },
    [weightUnit, localParams, setCalculatorParams]
  );

  const handleContinue = useCallback(async () => {
    const weight = parseFloat(weightInput);
    if (isNaN(weight) || weight <= 0) {
      return;
    }

    // Dismiss keyboard first, then navigate
    inputRef.current?.blur();
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/settings/calculator/height");
  }, [weightInput]);

  const isValidWeight = useCallback(() => {
    if (weightInput === "") return false;
    const weight = parseFloat(weightInput);
    const minWeight = weightUnit === "kg" ? 30 : 66;
    const maxWeight = weightUnit === "kg" ? 300 : 661;
    return !isNaN(weight) && weight >= minWeight && weight <= maxWeight;
  }, [weightInput, weightUnit]);

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
  const weightUnitOptions: [
    ToggleOption<WeightUnit>,
    ToggleOption<WeightUnit>
  ] = [
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
      return `${localParams.weight}kg = ${Math.round(
        localParams.weight * 2.205
      )}lbs`;
    } else {
      return `${Math.round(localParams.weight * 2.205)}lbs = ${
        localParams.weight
      }kg`;
    }
  };

  return (
    <CalculatorScreenLayout
      currentStep={3}
      totalSteps={6}
      progressLabel="Calculator progress: step 3 of 6"
    >
      <CalculatorHeader
        title="What is your weight?"
        description="Your weight is used to calculate your daily calorie needs."
      >
        <Toggle
          value={weightUnit}
          options={weightUnitOptions}
          onChange={(unit) => {
            setWeightUnit(unit);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          accessibilityLabel="Select weight unit"
        />
      </CalculatorHeader>

      <View style={styles.inputSection}>
        <View style={styles.inputContainer}>
          <NumericTextInput
            ref={inputRef}
            value={weightInput}
            onChangeText={updateWeight}
            min={weightMin}
            max={weightMax}
            placeholder={weightUnit === "kg" ? "70" : "155"}
            accessibilityLabel="Weight input"
            accessibilityHint={`Enter your weight in ${weightUnit} between ${weightMin} and ${weightMax}`}
            inputAccessoryViewID={inputAccessoryViewID}
            extraLarge
            borderless
          />
          <Text style={styles.unitText}>{weightUnit}</Text>
        </View>

        <Text style={styles.conversionText}>{getConversionText()}</Text>
      </View>

      {/* Spacer to push content up and provide consistent spacing */}
      <View style={styles.spacer} />

      {/* Input Accessory View */}
      <CalculatorInputAccessory
        nativeID={inputAccessoryViewID}
        isValid={isValidWeight()}
        onContinue={handleContinue}
        accessibilityLabel="Continue to height selection"
      />
    </CalculatorScreenLayout>
  );
});

export default WeightSelectionScreen;

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
