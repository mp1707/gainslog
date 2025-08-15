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
import type { CalorieIntakeParams } from "@/types";
import { StyleSheet } from "react-native";

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

  const [weightInput, setWeightInput] = useState<string>(
    localParams.weight.toString()
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
      setWeightInput(calculatorParams.weight.toString());
    }
  }, [calculatorParams]);

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
        const newParams = {
          ...localParams,
          weight: Math.round(weight * 10) / 10,
        };
        setLocalParams(newParams);
        setCalculatorParams(newParams);
      }
    },
    [localParams, setCalculatorParams]
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
    return !isNaN(weight) && weight >= 30 && weight <= 300;
  }, [weightInput]);

  const weightMin = 30;
  const weightMax = 300;

  return (
    <CalculatorScreenLayout
      currentStep={3}
      totalSteps={6}
      progressLabel="Calculator progress: step 3 of 6"
    >
      <CalculatorHeader
        title="How much do you weigh?"
        description="Your weight is used to calculate your daily calorie needs."
      />

      <View style={styles.inputSection}>
        <View style={styles.inputContainer}>
          <NumericTextInput
            ref={inputRef}
            value={weightInput}
            onChangeText={updateWeight}
            min={weightMin}
            max={weightMax}
            placeholder="70"
            accessibilityLabel="Weight input"
            accessibilityHint={`Enter your weight in kg between ${weightMin} and ${weightMax}`}
            inputAccessoryViewID={inputAccessoryViewID}
            extraLarge
            borderless
          />
          <Text style={styles.unitText}>kg</Text>
        </View>
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
