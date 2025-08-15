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

const HeightSelectionScreen = React.memo(function HeightSelectionScreen() {
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

  const [heightInput, setHeightInput] = useState<string>(
    localParams.height.toString()
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
      setHeightInput(calculatorParams.height.toString());
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

  const updateHeight = useCallback(
    (heightText: string) => {
      setHeightInput(heightText);

      if (heightText === "") {
        return; // Allow empty input
      }

      const height = parseFloat(heightText);
      if (!isNaN(height) && height > 0) {
        const newParams = { ...localParams, height: Math.round(height) };
        setLocalParams(newParams);
        setCalculatorParams(newParams);
      }
    },
    [localParams, setCalculatorParams]
  );

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
    if (heightInput === "") return false;
    const height = parseFloat(heightInput);
    return !isNaN(height) && height >= 100 && height <= 250;
  }, [heightInput]);

  const heightMin = 100;
  const heightMax = 250;

  return (
    <CalculatorScreenLayout
      currentStep={4}
      totalSteps={6}
      progressLabel="Calculator progress: step 4 of 6"
    >
      <CalculatorHeader
        title="How tall are you?"
        description="Your height is used to calculate your daily calorie needs."
      />

      <View style={styles.inputSection}>
        <View style={styles.inputContainer}>
          <NumericTextInput
            ref={inputRef}
            value={heightInput}
            onChangeText={updateHeight}
            min={heightMin}
            max={heightMax}
            placeholder="175"
            accessibilityLabel="Height input"
            accessibilityHint={`Enter your height in cm between ${heightMin} and ${heightMax}`}
            inputAccessoryViewID={inputAccessoryViewID}
            extraLarge
            borderless
          />
          <Text style={styles.unitText}>cm</Text>
        </View>
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
