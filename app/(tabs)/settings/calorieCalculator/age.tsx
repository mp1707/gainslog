import React, { useState, useEffect, useMemo } from "react";
import { View, TouchableOpacity, Text, TextInput, Platform, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { CaretRightIcon } from "phosphor-react-native";
import * as Haptics from "expo-haptics";

import { useTheme } from "@/providers";
import { useFoodLogStore } from "@/stores/useFoodLogStore";
import { ProgressBar } from "@/shared/ui/molecules/ProgressBar";
import { useNavigationGuard } from "@/shared/hooks/useNavigationGuard";
import { CalculatorInputAccessory } from "@/shared/ui";

const inputAccessoryViewID = "age-input-accessory";

const AgeSelectionScreen = () => {
  const { colors, theme: themeObj, colorScheme } = useTheme();
  const { calculatorParams, setCalculatorParams } = useFoodLogStore();
  const { safeNavigate, isNavigating } = useNavigationGuard();

  const styles = useMemo(
    () => createStyles(colors, themeObj),
    [colors, themeObj]
  );

  const [age, setAge] = useState<number>(calculatorParams?.age ?? 30);

  // Update age when store changes
  useEffect(() => {
    if (calculatorParams?.age !== undefined) {
      setAge(calculatorParams.age);
    }
  }, [calculatorParams?.age]);

  const handleAgeChange = (ageText: string) => {
    const newAge = ageText === "" ? 0 : parseInt(ageText, 10);
    
    if (!isNaN(newAge)) { 
      setAge(newAge);

      const updatedParams = {
        ...calculatorParams,
        sex: calculatorParams?.sex ?? "male",
        age: newAge,
        weight: calculatorParams?.weight ?? 85,
        height: calculatorParams?.height ?? 175,
      };
      setCalculatorParams(updatedParams);
    }
  };

  const handleContinue = async () => {
    if (age < 13 || age > 120) {
      Alert.alert(
        "Invalid Age",
        "Please enter a valid age between 13 and 120 years.",
        [{ text: "OK" }]
      );
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    safeNavigate({ route: "/settings/calorieCalculator/weight" });
  };


  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <View style={styles.progressContainer}>
        <ProgressBar
          totalSteps={6}
          currentStep={2}
          accessibilityLabel={`Calculator progress: step 2 of 6`}
        />
      </View>

      <View style={styles.content}>
        <View style={styles.textSection}>
          <Text style={styles.subtitle}>How old are you?</Text>
          <Text style={styles.description}>
            Your age helps determine your baseline metabolic rate.
          </Text>
        </View>

        <View style={styles.inputSection}>
          <View style={styles.inputContainer}>
            <TextInput
              value={age === 0 ? "" : age.toString()}
              onChangeText={handleAgeChange}
              placeholder="30"
              keyboardType="number-pad"
              keyboardAppearance={colorScheme}
              style={styles.ageInput}
              accessibilityLabel="Age input"
              accessibilityHint="Enter your age between 13 and 120 years"
              accessibilityRole="spinbutton"
              inputAccessoryViewID={inputAccessoryViewID}
              selectTextOnFocus
              autoFocus
            />
            <Text style={styles.unitText}>years</Text>
          </View>
        </View>

        <View style={styles.spacer} />

        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          disabled={isNavigating}
          accessibilityRole="button"
          accessibilityLabel="Continue to weight selection"
        >
          <Text style={styles.continueButtonText}>
            Continue
          </Text>
          <CaretRightIcon
            size={20}
            color={colors.white}
          />
        </TouchableOpacity>
      </View>

      {/* Input Accessory View - iOS only */}
      {Platform.OS === 'ios' && (
        <CalculatorInputAccessory
          nativeID={inputAccessoryViewID}
          isValid={true}
          onContinue={handleContinue}
          accessibilityLabel="Continue to weight selection"
        />
      )}
    </SafeAreaView>
  )
};

export default AgeSelectionScreen;

type Colors = ReturnType<typeof useTheme>["colors"];
type Theme = ReturnType<typeof useTheme>["theme"];

const createStyles = (colors: Colors, themeObj: Theme) => {
  const { spacing, typography, components } = themeObj;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.primaryBackground,
    },
    content: {
      flex: 1,
      paddingHorizontal: spacing.pageMargins.horizontal,
      justifyContent: "flex-start",
      alignItems: "stretch",
      gap: spacing.xxl,
    },
    textSection: {
      paddingTop: spacing.lg,
      gap: spacing.sm,
    },
    subtitle: {
      fontSize: typography.Title2.fontSize,
      fontFamily: typography.Title2.fontFamily,
      color: colors.primaryText,
      textAlign: "center",
    },
    description: {
      fontSize: typography.Body.fontSize,
      fontFamily: typography.Body.fontFamily,
      color: colors.secondaryText,
      textAlign: "center",
      lineHeight: 22,
    },
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
    spacer: {
      flex: 1,
      minHeight: 64,
    },
    progressContainer: {
      padding: spacing.md,
    },
    continueButton: {
      backgroundColor: colors.accent,
      borderRadius: components.buttons.cornerRadius,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      minHeight: 50,
      marginHorizontal: spacing.pageMargins.horizontal,
      marginBottom: spacing.lg,
    },
    continueButtonText: {
      fontSize: typography.Headline.fontSize,
      fontFamily: typography.Headline.fontFamily,
      color: colors.white,
      fontWeight: "600",
      marginRight: spacing.sm,
    },
    ageInput: {
      fontSize: 48,
      fontFamily: typography.Title1.fontFamily,
      color: colors.primaryText,
      textAlign: "center",
      minWidth: 120,
      backgroundColor: "transparent",
      borderWidth: 0,
      padding: 0,
      margin: 0,
    },
  });
};
