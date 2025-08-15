import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  View,
  KeyboardAvoidingView,
  TouchableOpacity,
  Text,
  TextInput as RNTextInput,
  InputAccessoryView,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { CaretRightIcon } from "phosphor-react-native";
import * as Haptics from "expo-haptics";

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
  const buttonOpacity = useRef(new Animated.Value(0.6)).current;
  const INPUT_ACCESSORY_VIEW_ID = "ageInputAccessory";

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

  // Auto-focus input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Animate button opacity based on validity
  useEffect(() => {
    const isValid = isValidAge();
    Animated.timing(buttonOpacity, {
      toValue: isValid ? 1 : 0.6,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [ageInput, buttonOpacity]);

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

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/settings/calculator/weight");
  };

  const isValidAge = () => {
    if (ageInput === '') return false;
    const age = parseInt(ageInput, 10);
    return !isNaN(age) && age >= 10 && age <= 120;
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
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
              <Text style={styles.ageDisplay}>
                {ageInput || "0"}
              </Text>
              <Text style={styles.unitText}>years</Text>
            </View>
            
            {/* Hidden TextInput for keyboard control */}
            <RNTextInput
              ref={inputRef}
              style={styles.hiddenInput}
              value={ageInput}
              onChangeText={updateAge}
              keyboardType="number-pad"
              inputAccessoryViewID={INPUT_ACCESSORY_VIEW_ID}
              accessibilityLabel="Age input"
              accessibilityHint="Enter your age between 10 and 120 years"
            />
          </View>

          {/* Input Accessory View */}
          <InputAccessoryView nativeID={INPUT_ACCESSORY_VIEW_ID}>
            <View style={styles.accessoryContainer}>
              <Animated.View
                style={[
                  styles.accessoryButton,
                  { opacity: buttonOpacity },
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.continueButton,
                    !isValidAge() && styles.continueButtonDisabled,
                  ]}
                  onPress={handleContinue}
                  disabled={!isValidAge()}
                  accessibilityRole="button"
                  accessibilityLabel="Continue to weight selection"
                >
                  <Text style={styles.continueButtonText}>Continue</Text>
                  <CaretRightIcon size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </Animated.View>
            </View>
          </InputAccessoryView>
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
    },
    ageDisplay: {
      fontSize: 56,
      fontFamily: typography.Title1.fontFamily,
      fontWeight: "700",
      color: colors.primaryText,
      textAlign: "center",
      minWidth: 120,
    },
    unitText: {
      fontSize: 20,
      fontFamily: typography.Subhead.fontFamily,
      fontWeight: "400",
      color: colors.secondaryText,
      marginLeft: spacing.md,
      marginTop: 8,
    },
    hiddenInput: {
      position: "absolute",
      opacity: 0,
      width: 1,
      height: 1,
    },
    accessoryContainer: {
      backgroundColor: colors.secondaryBackground,
      borderTopWidth: 0.5,
      borderTopColor: colors.border,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      alignItems: "flex-end",
    },
    accessoryButton: {
      minWidth: 100,
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
    continueButtonDisabled: {
      backgroundColor: colors.disabledBackground,
      opacity: 0.6,
    },
    progressContainer: {
      padding: themeObj.spacing.md,
    },
  });
};
