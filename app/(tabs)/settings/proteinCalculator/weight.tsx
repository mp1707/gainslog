import React, { useState, useMemo, useRef, useCallback } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  TextInput,
  Platform,
  StyleSheet,
  Alert,
  InteractionManager,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CaretRightIcon } from "phosphor-react-native";
import * as Haptics from "expo-haptics";
import { useFocusEffect } from "@react-navigation/native";

import { useTheme } from "@/theme";
import { useFoodLogStore } from "src/store-legacy/useFoodLogStore";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { CalculatorInputAccessory } from "@/components/settings/CalculatorInputAccessory";

const inputAccessoryViewID = "protein-weight-input-accessory";

const ProteinWeightSelectionScreen = () => {
  const { colors, theme: themeObj, colorScheme } = useTheme();
  const { calculatorParams, setCalculatorParams } = useFoodLogStore();
  const { safeNavigate, isNavigating } = useNavigationGuard();

  const styles = useMemo(
    () => createStyles(colors, themeObj),
    [colors, themeObj]
  );

  const [weight, setWeight] = useState<number>(calculatorParams?.weight ?? 70);
  const inputRef = useRef<TextInput>(null);

  useFocusEffect(
    useCallback(() => {
      const task = InteractionManager.runAfterInteractions(() => {
        requestAnimationFrame(() => {
          setTimeout(() => {
            inputRef.current?.focus();
          }, 600);
        });
      });
      return () => task.cancel();
    }, [])
  );

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
        "Please enter a weight between 30 and 300 kg.",
        [{ text: "OK" }]
      );
      return;
    }

    // Ensure calculatorParams weight is set before navigation
    const updatedParams = {
      ...calculatorParams,
      sex: calculatorParams?.sex ?? "male",
      age: calculatorParams?.age ?? 30,
      weight: weight,
      height: calculatorParams?.height ?? 175,
    };
    setCalculatorParams(updatedParams);

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    safeNavigate("/settings/proteinCalculator/goals");
  };

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <View style={styles.content}>
        <View style={styles.textSection}>
          <Text style={styles.subtitle}>What's your weight?</Text>
          <Text style={styles.description}>
            Your weight is needed to calculate personalized protein
            recommendations.
          </Text>
        </View>

        <View style={styles.inputSection}>
          <View style={styles.inputContainer}>
            <TextInput
              ref={inputRef}
              value={weight === 0 ? "" : weight.toString()}
              onChangeText={handleWeightChange}
              placeholder="70"
              keyboardType="numeric"
              keyboardAppearance={colorScheme}
              style={styles.weightInput}
              inputAccessoryViewID={inputAccessoryViewID}
              selectTextOnFocus
            />
            <Text style={styles.unitText}>kg</Text>
          </View>
        </View>

        <View style={styles.spacer} />

        {Platform.OS === "android" && (
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
            disabled={isNavigating}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
            <CaretRightIcon size={20} color={colors.white} />
          </TouchableOpacity>
        )}
      </View>

      {Platform.OS === "ios" && (
        <CalculatorInputAccessory
          accessibilityLabel="Continue"
          nativeID={inputAccessoryViewID}
          isValid={true}
          onContinue={handleContinue}
        />
      )}
    </SafeAreaView>
  );
};

export default ProteinWeightSelectionScreen;

const createStyles = (colors: any, themeObj: any) => {
  const { spacing, typography, components } = themeObj;
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.primaryBackground },
    content: {
      flex: 1,
      paddingHorizontal: spacing.pageMargins.horizontal,
      justifyContent: "flex-start",
      gap: spacing.xxl,
    },
    textSection: { paddingTop: spacing.lg, gap: spacing.sm },
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
    inputSection: { alignItems: "center" },
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
    spacer: { flex: 1, minHeight: 64 },
    progressContainer: { padding: spacing.md },
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
      minWidth: 100,
      backgroundColor: "transparent",
    },
  });
};
