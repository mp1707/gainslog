import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  TouchableOpacity,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import { CaretRightIcon } from "phosphor-react-native";
import * as Haptics from "expo-haptics";

import { useTheme } from "@/providers";
import { useFoodLogStore } from "@/stores/useFoodLogStore";
import { Toggle, type ToggleOption } from "@/shared/ui/atoms/Toggle";
import { GenderMaleIcon, GenderFemaleIcon } from "phosphor-react-native";
import type { CalorieIntakeParams, Sex } from "@/types";
import { getCalorieCalculatorParams } from "@/lib/storage";
import { StyleSheet } from "react-native";

export default function Step1PersonalInfoScreen() {
  const { colors, theme: themeObj } = useTheme();
  const {
    calculatorParams,
    setCalculatorParams,
    clearCalculatorData,
  } = useFoodLogStore();

  // Create stable initial params to prevent re-renders
  const stableInitialParams = useMemo(
    () => ({
      sex: "male" as Sex,
      age: 30,
      weight: 85,
      height: 175,
    }),
    []
  );

  const [localParams, setLocalParams] = useState<CalorieIntakeParams>(
    calculatorParams || stableInitialParams
  );
  const [isLoaded, setIsLoaded] = useState(false);

  const styles = useMemo(
    () => createStyles(colors, themeObj),
    [colors, themeObj]
  );

  // Load saved params when screen opens
  useEffect(() => {
    const loadSavedParams = async () => {
      try {
        const savedParams = await getCalorieCalculatorParams();
        const paramsToUse = calculatorParams || savedParams;
        setLocalParams(paramsToUse);
        setCalculatorParams(paramsToUse);
        setIsLoaded(true);
      } catch (error) {
        console.error("Failed to load saved params:", error);
        const defaultParams = calculatorParams || stableInitialParams;
        setLocalParams(defaultParams);
        setCalculatorParams(defaultParams);
        setIsLoaded(true);
      }
    };

    loadSavedParams();
  }, [calculatorParams, setCalculatorParams, stableInitialParams]);

  // Update local params when store changes
  useEffect(() => {
    if (calculatorParams) {
      setLocalParams(calculatorParams);
    }
  }, [calculatorParams]);

  const updateParam = <K extends keyof CalorieIntakeParams>(
    key: K,
    value: CalorieIntakeParams[K]
  ) => {
    const newParams = { ...localParams, [key]: value };
    setLocalParams(newParams);
    setCalculatorParams(newParams);
  };

  const handleContinue = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/settings/calculator/step2-activity-level");
  };

  const handleCancel = () => {
    clearCalculatorData();
    router.back();
  };

  // Sex toggle options
  const sexToggleOptions: [ToggleOption<Sex>, ToggleOption<Sex>] = [
    {
      value: "male",
      label: "Male",
      icon: GenderMaleIcon,
    },
    {
      value: "female",
      label: "Female",
      icon: GenderFemaleIcon,
    },
  ];

  // Generate picker items
  const ageItems = Array.from({ length: 108 }, (_, i) => i + 13); // 13-120
  const weightItems = Array.from({ length: 271 }, (_, i) => i + 30); // 30-300
  const heightItems = Array.from({ length: 151 }, (_, i) => i + 100); // 100-250

  if (!isLoaded) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]} edges={["left", "right"]}>
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <SafeAreaView style={styles.container} edges={["left", "right"]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleCancel}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
            hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
          >
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Personal Information</Text>
            <Text style={styles.stepIndicator}>Step 1 of 3</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        {/* Content */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.subtitle}>
            Enter your details to calculate your daily calorie needs.
          </Text>

          {/* Sex Selection Card */}
          <View style={styles.inputCard}>
            <Text style={styles.sectionTitle}>Biological Sex</Text>
            <Toggle
              value={localParams.sex}
              options={sexToggleOptions}
              onChange={(value) => updateParam("sex", value)}
              accessibilityLabel="Select biological sex"
            />
          </View>

          {/* Age Picker Card */}
          <View style={styles.inputCard}>
            <Text style={styles.sectionTitle}>Age (years)</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={localParams.age}
                onValueChange={(value) => updateParam("age", value)}
                style={styles.picker}
                itemStyle={styles.pickerItem}
              >
                {ageItems.map((age) => (
                  <Picker.Item key={age} label={`${age}`} value={age} />
                ))}
              </Picker>
            </View>
          </View>

          {/* Weight Picker Card */}
          <View style={styles.inputCard}>
            <Text style={styles.sectionTitle}>Weight (kg)</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={localParams.weight}
                onValueChange={(value) => updateParam("weight", value)}
                style={styles.picker}
                itemStyle={styles.pickerItem}
              >
                {weightItems.map((weight) => (
                  <Picker.Item key={weight} label={`${weight}`} value={weight} />
                ))}
              </Picker>
            </View>
            <Text style={styles.inputHint}>
              {localParams.weight}kg = {Math.round(localParams.weight * 2.205)}lbs
            </Text>
          </View>

          {/* Height Picker Card */}
          <View style={styles.inputCard}>
            <Text style={styles.sectionTitle}>Height (cm)</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={localParams.height}
                onValueChange={(value) => updateParam("height", value)}
                style={styles.picker}
                itemStyle={styles.pickerItem}
              >
                {heightItems.map((height) => (
                  <Picker.Item key={height} label={`${height}`} value={height} />
                ))}
              </Picker>
            </View>
            <Text style={styles.inputHint}>
              {localParams.height}cm = {Math.floor(localParams.height / 30.48)}'
              {Math.round((localParams.height % 30.48) / 2.54)}"
            </Text>
          </View>

          {/* Continue Button */}
          <View style={styles.navigationContainer}>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue}
              accessibilityRole="button"
              accessibilityLabel="Continue to next step"
            >
              <Text style={styles.continueButtonText}>Continue</Text>
              <CaretRightIcon size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </ScrollView>
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
    centered: {
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      fontSize: typography.Body.fontSize,
      fontFamily: typography.Body.fontFamily,
      color: colors.secondaryText,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.pageMargins.horizontal,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    cancelButton: {
      color: colors.accent,
      fontSize: typography.Body.fontSize,
      fontFamily: typography.Body.fontFamily,
    },
    titleContainer: {
      flex: 1,
      alignItems: "center",
    },
    title: {
      fontSize: typography.Headline.fontSize,
      fontFamily: typography.Headline.fontFamily,
      color: colors.primaryText,
      textAlign: "center",
    },
    stepIndicator: {
      fontSize: typography.Caption.fontSize,
      fontFamily: typography.Caption.fontFamily,
      color: colors.secondaryText,
      marginTop: 2,
    },
    headerSpacer: {
      width: 60, // Same width as cancel button area
    },
    content: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: spacing.pageMargins.horizontal,
      paddingTop: spacing.lg,
      paddingBottom: 100,
    },
    subtitle: {
      fontSize: typography.Body.fontSize,
      fontFamily: typography.Body.fontFamily,
      color: colors.secondaryText,
      textAlign: "center",
      lineHeight: 22,
      marginBottom: spacing.lg,
    },
    inputCard: {
      backgroundColor: colors.secondaryBackground,
      borderRadius: themeObj.components.cards.cornerRadius,
      padding: spacing.lg,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sectionTitle: {
      fontSize: typography.Headline.fontSize,
      fontFamily: typography.Headline.fontFamily,
      color: colors.primaryText,
      marginBottom: spacing.md,
    },
    pickerContainer: {
      backgroundColor: colors.primaryBackground,
      borderRadius: themeObj.components.buttons.cornerRadius,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    picker: {
      height: 180,
      color: colors.primaryText,
    },
    pickerItem: {
      fontSize: typography.Body.fontSize,
      color: colors.primaryText,
    },
    inputHint: {
      fontSize: typography.Caption.fontSize,
      fontFamily: typography.Caption.fontFamily,
      color: colors.secondaryText,
      textAlign: "center",
      marginTop: spacing.sm,
    },
    navigationContainer: {
      marginTop: spacing.xl,
      marginBottom: spacing.lg,
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
  });
};