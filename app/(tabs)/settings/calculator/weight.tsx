import React, { useState, useEffect, useMemo } from "react";
import { View, TouchableOpacity, Text, TextInput, Platform, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { CaretRightIcon } from "phosphor-react-native";
import * as Haptics from "expo-haptics";

import { useTheme } from "@/providers";
import { useFoodLogStore } from "@/stores/useFoodLogStore";
import { ProgressBar } from "@/shared/ui/molecules/ProgressBar";
import { CalculatorInputAccessory } from "@/shared/ui";

const inputAccessoryViewID = "weight-input-accessory";

const WeightSelectionScreen = () => {
  const { colors, theme: themeObj } = useTheme();
  const { calculatorParams, setCalculatorParams } = useFoodLogStore();

  const styles = useMemo(
    () => createStyles(colors, themeObj),
    [colors, themeObj]
  );

  const [weight, setWeight] = useState<number>(calculatorParams?.weight ?? 70);

  // Update weight when store changes
  useEffect(() => {
    if (calculatorParams?.weight !== undefined) {
      setWeight(calculatorParams.weight);
    }
  }, [calculatorParams?.weight]);

  const handleWeightChange = (weightText: string) => {
    const newWeight = weightText === "" ? 0 : parseFloat(weightText);
    
    if (!isNaN(newWeight)) {
      setWeight(newWeight);

      const updatedParams = {
        ...calculatorParams,
        sex: calculatorParams?.sex ?? "male",
        age: calculatorParams?.age ?? 30,
        weight: newWeight,
        height: calculatorParams?.height ?? 175,
      };
      setCalculatorParams(updatedParams);
    }
  };

  const handleContinue = async () => {
    if (weight < 30 || weight > 300) {
      Alert.alert(
        "Invalid Weight",
        "Please enter a valid weight between 30 and 300 kg.",
        [{ text: "OK" }]
      );
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/settings/calculator/height");
  };

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <View style={styles.progressContainer}>
        <ProgressBar
          totalSteps={6}
          currentStep={3}
          accessibilityLabel={`Calculator progress: step 3 of 6`}
        />
      </View>

      <View style={styles.content}>
        <View style={styles.textSection}>
          <Text style={styles.subtitle}>How much do you weigh?</Text>
          <Text style={styles.description}>
            Your weight is used to calculate your daily calorie needs.
          </Text>
        </View>

        <View style={styles.inputSection}>
          <View style={styles.inputContainer}>
            <TextInput
              value={weight === 0 ? "" : weight.toString()}
              onChangeText={handleWeightChange}
              placeholder="70"
              keyboardType="numeric"
              style={styles.weightInput}
              accessibilityLabel="Weight input"
              accessibilityHint="Enter your weight between 30 and 300 kg"
              accessibilityRole="spinbutton"
              inputAccessoryViewID={inputAccessoryViewID}
              selectTextOnFocus
              autoFocus
            />
            <Text style={styles.unitText}>kg</Text>
          </View>
        </View>

        <View style={styles.spacer} />

        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          accessibilityRole="button"
          accessibilityLabel="Continue to height selection"
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
          accessibilityLabel="Continue to height selection"
        />
      )}
    </SafeAreaView>
  )
};

export default WeightSelectionScreen;

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
    weightInput: {
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
