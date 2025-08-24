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
import {
  HouseIcon,
  PersonIcon,
  BicycleIcon,
  FlameIcon,
  LightningIcon,
} from "phosphor-react-native";

import { useTheme } from "@/theme";
import { useAppStore } from "@/store";
import { SelectionCard } from "@/components/settings/SelectionCard";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { CALCULATION_METHODS } from "@/components/settings/calculationMethods";
import { ProgressBar } from "@/components/settings/ProgressBar";
import type { CalorieCalculationMethod, ActivityLevel } from "@/types";
import { StyleSheet } from "react-native";

export default function Step2ActivityLevelScreen() {
  const { colors, theme: themeObj } = useTheme();
  const userSettings = useAppStore((s) => s.userSettings);
  const updateUserSettings = useAppStore((s) => s.updateUserSettings);
  const { safeNavigate } = useNavigationGuard();

  const [selectedActivityLevel, setSelectedActivityLevel] =
    useState<ActivityLevel | null>(userSettings?.activityLevel || null);

  const styles = useMemo(
    () => createStyles(colors, themeObj),
    [colors, themeObj]
  );

  const handleActivityLevelSelect = async (
    method: CalorieCalculationMethod
  ) => {
    setSelectedActivityLevel(method.id);
    updateUserSettings({ activityLevel: method.id });

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Auto-advance to next screen after a short delay for visual feedback
    setTimeout(() => {
      safeNavigate("/settings/calorieCalculator/goals");
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
            <Text style={styles.subtitle}>Choose your activity level</Text>
            <Text style={styles.description}>
              Select the option that best matches your lifestyle and exercise
              routine.
            </Text>
          </View>

          <View style={styles.methodsSection}>
            {methods.map((method) => {
              // Map activity level to appropriate icon
              const getIcon = (id: string) => {
                switch (id) {
                  case "sedentary":
                    return HouseIcon;
                  case "light":
                    return PersonIcon;
                  case "moderate":
                    return BicycleIcon;
                  case "active":
                    return FlameIcon;
                  case "veryactive":
                    return LightningIcon;
                  default:
                    return PersonIcon;
                }
              };

              return (
                <SelectionCard
                  key={method.id}
                  title={method.title}
                  description={method.description}
                  icon={getIcon(method.id)}
                  iconColor={colors.secondaryText}
                  isSelected={selectedActivityLevel === method.id}
                  onSelect={() => handleActivityLevelSelect(method)}
                  accessibilityLabel={`${method.title} activity level`}
                  accessibilityHint={`Calculate calories for ${method.description.toLowerCase()}`}
                />
              );
            })}
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
      gap: spacing.md,
    },
    progressContainer: {
      padding: themeObj.spacing.md,
    },
  });
};
