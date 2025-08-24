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
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { InteractionManager } from "react-native";
import { CaretRightIcon } from "phosphor-react-native";
import * as Haptics from "expo-haptics";

import { useTheme } from "@/providers";
import { useFoodLogStore } from "src/legacystore/useFoodLogStore";
import { ProgressBar } from "@/components/settings/ProgressBar";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { CalculatorInputAccessory } from "@/components/settings/CalculatorInputAccessory";

const inputAccessoryViewID = "age-input-accessory";

const AgeSelectionScreen = () => {
  const { colors, theme: themeObj, colorScheme } = useTheme();
  const { calculatorParams, setCalculatorParams } = useFoodLogStore();
  const { safeNavigate, isNavigating } = useNavigationGuard();

  const [age, setAge] = useState<number>(calculatorParams?.age ?? 30);
  const inputRef = useRef<TextInput>(null);

  const styles = useMemo(
    () => createStyles(colors, themeObj),
    [colors, themeObj]
  );

  useEffect(() => {
    if (calculatorParams?.age !== undefined) {
      setAge(calculatorParams.age);
    }
  }, [calculatorParams?.age]);

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

  const handleContinue = async () => {
    if (age < 15 || age > 100) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    safeNavigate("/settings/calorieCalculator/weight");
  };

  const handleAgeChange = (text: string) => {
    const newAge = parseInt(text, 10);
    if (!isNaN(newAge)) {
      setAge(newAge);
      setCalculatorParams({
        ...calculatorParams,
        sex: calculatorParams?.sex ?? "male",
        age: newAge,
        weight: calculatorParams?.weight ?? 85,
        height: calculatorParams?.height ?? 175,
      });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <View style={styles.progressContainer}>
        <ProgressBar
          totalSteps={6}
          currentStep={2}
          accessibilityLabel="Step 2 of 6"
        />
      </View>

      <View style={styles.content}>
        <View style={styles.textSection}>
          <Text style={styles.subtitle}>How old are you?</Text>
          <Text style={styles.description}>
            Your age helps us calculate your calorie needs.
          </Text>
        </View>

        <View style={styles.inputSection}>
          <TextInput
            ref={inputRef}
            value={age.toString()}
            onChangeText={handleAgeChange}
            placeholder="30"
            keyboardType="numeric"
            keyboardAppearance={colorScheme}
            style={styles.ageInput}
            accessibilityLabel="Age input"
            inputAccessoryViewID={inputAccessoryViewID}
            selectTextOnFocus
          />
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
          isValid={age >= 15 && age <= 100}
          onContinue={handleContinue}
        />
      )}
    </SafeAreaView>
  );
};

export default AgeSelectionScreen;

const createStyles = (colors: any, themeObj: any) => {
  const { spacing, typography, components } = themeObj;
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.primaryBackground },
    progressContainer: { padding: spacing.md },
    content: {
      flex: 1,
      paddingHorizontal: spacing.pageMargins.horizontal,
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
    },
    inputSection: { alignItems: "center" },
    ageInput: {
      fontSize: 48,
      fontFamily: typography.Title1.fontFamily,
      color: colors.primaryText,
      textAlign: "center",
      minWidth: 100,
    },
    spacer: { flex: 1 },
    continueButton: {
      backgroundColor: colors.accent,
      borderRadius: components.buttons.cornerRadius,
      paddingVertical: spacing.md,
      flexDirection: "row",
      justifyContent: "center",
      marginHorizontal: spacing.pageMargins.horizontal,
      marginBottom: spacing.lg,
    },
    continueButtonText: {
      fontSize: typography.Headline.fontSize,
      fontFamily: typography.Headline.fontFamily,
      color: colors.white,
      marginRight: spacing.sm,
    },
  });
};
