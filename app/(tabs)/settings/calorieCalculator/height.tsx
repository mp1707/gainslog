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

const inputAccessoryViewID = "height-input-accessory";

const HeightSelectionScreen = () => {
  const { colors, theme: themeObj, colorScheme } = useTheme();
  const { calculatorParams, setCalculatorParams } = useFoodLogStore();
  const { safeNavigate, isNavigating } = useNavigationGuard();

  const styles = useMemo(
    () => createStyles(colors, themeObj),
    [colors, themeObj]
  );

  const [height, setHeight] = useState<number>(calculatorParams?.height ?? 175);

  // Update height when store changes
  useEffect(() => {
    if (calculatorParams?.height !== undefined) {
      setHeight(calculatorParams.height);
    }
  }, [calculatorParams?.height]);

  const handleHeightChange = (heightText: string) => {
    const newHeight = heightText === "" ? 0 : parseFloat(heightText);
    
    if (!isNaN(newHeight)) {
      setHeight(newHeight);

      const updatedParams = {
        ...calculatorParams,
        sex: calculatorParams?.sex ?? "male",
        age: calculatorParams?.age ?? 30,
        weight: calculatorParams?.weight ?? 70,
        height: newHeight,
      };
      setCalculatorParams(updatedParams);
    }
  };

  const handleContinue = async () => {
    if (height < 100 || height > 250) {
      Alert.alert(
        "Invalid Height",
        "Please enter a valid height between 100 and 250 cm.",
        [{ text: "OK" }]
      );
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    safeNavigate("/settings/calorieCalculator/activity-level");
  };

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <View style={styles.progressContainer}>
        <ProgressBar
          totalSteps={6}
          currentStep={4}
          accessibilityLabel={`Calculator progress: step 4 of 6`}
        />
      </View>

      <View style={styles.content}>
        <View style={styles.textSection}>
          <Text style={styles.subtitle}>How tall are you?</Text>
          <Text style={styles.description}>
            Your height is used to calculate your daily calorie needs.
          </Text>
        </View>

        <View style={styles.inputSection}>
          <View style={styles.inputContainer}>
            <TextInput
              value={height === 0 ? "" : height.toString()}
              onChangeText={handleHeightChange}
              placeholder="175"
              keyboardType="numeric"
              keyboardAppearance={colorScheme}
              style={styles.heightInput}
              accessibilityLabel="Height input"
              accessibilityHint="Enter your height between 100 and 250 cm"
              accessibilityRole="spinbutton"
              inputAccessoryViewID={inputAccessoryViewID}
              selectTextOnFocus
              autoFocus
            />
            <Text style={styles.unitText}>cm</Text>
          </View>
        </View>

        <View style={styles.spacer} />

        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          disabled={isNavigating}
          accessibilityRole="button"
          accessibilityLabel="Continue to activity level selection"
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
          accessibilityLabel="Continue to activity level selection"
        />
      )}
    </SafeAreaView>
  )
};

export default HeightSelectionScreen;

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
    heightInput: {
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
