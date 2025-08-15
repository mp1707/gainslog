import React, { useState, useMemo } from "react";
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  TouchableOpacity,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";

import { useTheme } from "@/providers";
import { useFoodLogStore } from "@/stores/useFoodLogStore";
import {
  CalorieCalculationCard,
  CALCULATION_METHODS,
} from "@/shared/ui/atoms/CalorieCalculationCard";
import { ProgressBar } from "@/shared/ui/molecules/ProgressBar";
import type { CalorieCalculationMethod, ActivityLevel } from "@/types";
import { StyleSheet } from "react-native";

export default function Step2ActivityLevelScreen() {
  const { colors, theme: themeObj } = useTheme();
  const {
    calculatorActivityLevel,
    setCalculatorActivityLevel,
  } = useFoodLogStore();

  const [selectedActivityLevel, setSelectedActivityLevel] = useState<ActivityLevel | null>(
    calculatorActivityLevel
  );

  const styles = useMemo(
    () => createStyles(colors, themeObj),
    [colors, themeObj]
  );

  const handleActivityLevelSelect = async (method: CalorieCalculationMethod) => {
    setSelectedActivityLevel(method.id);
    setCalculatorActivityLevel(method.id);
    
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Auto-advance to next screen after a short delay for visual feedback
    setTimeout(() => {
      router.push("/settings/calculator/goals");
    }, 300);
  };


  const methods = Object.values(CALCULATION_METHODS);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <SafeAreaView style={styles.container} edges={["left", "right"]}>
        <View style={styles.progressContainer}>
          <ProgressBar
            totalSteps={6}
            currentStep={5}
            accessibilityLabel={`Calculator progress: step 5 of 6`}
          />
        </View>

        {/* Content */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.textSection}>
            <Text style={styles.subtitle}>
              Choose your activity level
            </Text>
            <Text style={styles.description}>
              Select the option that best matches your lifestyle and exercise routine.
            </Text>
          </View>

          <View style={styles.methodsSection}>
            {methods.map((method) => (
              <CalorieCalculationCard
                key={method.id}
                method={method}
                isSelected={selectedActivityLevel === method.id}
                onSelect={handleActivityLevelSelect}
                showCalorieGoals={false}
              />
            ))}
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
    content: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: spacing.pageMargins.horizontal,
      paddingTop: spacing.lg,
      paddingBottom: 100,
    },
    textSection: {
      marginBottom: spacing.xl,
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
    methodsSection: {
      marginBottom: spacing.lg,
    },
    progressContainer: {
      padding: themeObj.spacing.md,
    },
  });
};