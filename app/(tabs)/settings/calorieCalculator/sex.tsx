import React, { useState, useEffect, useMemo, useCallback } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { GenderMaleIcon, GenderFemaleIcon } from "phosphor-react-native";
import * as Haptics from "expo-haptics";

import { useTheme } from "@/theme";
import { useAppStore } from "@/store";
import { SelectionCard } from "@/components/settings/SelectionCard";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import type { Sex } from "src/types-legacy/indexLegacy";
import { StyleSheet } from "react-native";
import { ProgressBar } from "@/components/settings/ProgressBar";
import { UserSettings } from "@/types";

const SexSelectionScreen = React.memo(function SexSelectionScreen() {
  const { colors, theme: themeObj } = useTheme();
  const userSettings = useAppStore((s) => s.userSettings);
  const updateUserSettings = useAppStore((s) => s.updateUserSettings);
  const { safeNavigate, isNavigating } = useNavigationGuard();

  // Create stable initial params to prevent re-renders
  const stableInitialParams = useMemo(
    () => ({
      age: 30,
      weight: 85,
      height: 175,
    }),
    []
  );

  const [localParams, setLocalParams] = useState<Partial<UserSettings> | null>(
    userSettings
  );
  const [selectedSex, setSelectedSex] = useState<Sex | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const styles = useMemo(
    () => createStyles(colors, themeObj),
    [colors, themeObj]
  );

  // Initialize from persisted userSettings
  useEffect(() => {
    setLocalParams(userSettings);
    setIsLoaded(true);
  }, [userSettings]);

  // Update local params when store changes
  useEffect(() => {
    if (userSettings) {
      setLocalParams(userSettings);
    }
  }, [userSettings]);

  const handleSexSelect = useCallback(
    async (sex: Sex) => {
      setSelectedSex(sex);
      const newParams: Partial<UserSettings> = {
        ...stableInitialParams,
        ...localParams,
        sex,
      } as Partial<UserSettings>;
      setLocalParams(newParams);
      updateUserSettings(newParams);

      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      safeNavigate("/settings/calorieCalculator/age");
    },
    [stableInitialParams, localParams, safeNavigate]
  );

  const handleManualInput = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    safeNavigate("/settings/calorieCalculator/manualInput");
  }, [safeNavigate]);

  if (!isLoaded) {
    return (
      <SafeAreaView
        style={[styles.container, styles.centered]}
        edges={["left", "right"]}
      >
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <View style={styles.progressContainer}>
        <ProgressBar
          totalSteps={6}
          currentStep={1}
          accessibilityLabel={`Calculator progress: step 1 of 6`}
        />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.textSection}>
          <Text style={styles.subtitle}>What is your biological sex?</Text>
          <Text style={styles.description}>
            This helps us calculate your daily calorie needs more accurately.
          </Text>
        </View>

        <View style={styles.selectionSection}>
          <View style={styles.optionsContainer}>
            <SelectionCard
              title="Male"
              description="Biological male"
              icon={GenderMaleIcon}
              iconColor="#4A90E2"
              isSelected={selectedSex === "male"}
              onSelect={() => handleSexSelect("male")}
              accessibilityLabel="Select male as biological sex"
              accessibilityHint="This will help calculate your calorie needs and advance to the next step"
            />

            <SelectionCard
              title="Female"
              description="Biological female"
              icon={GenderFemaleIcon}
              iconColor="#E24A90"
              isSelected={selectedSex === "female"}
              onSelect={() => handleSexSelect("female")}
              accessibilityLabel="Select female as biological sex"
              accessibilityHint="This will help calculate your calorie needs and advance to the next step"
            />
          </View>
        </View>

        {/* Spacer to push content up and provide consistent spacing */}
        <View style={styles.spacer} />
      </View>
    </SafeAreaView>
  );
});

export default SexSelectionScreen;

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
    selectionSection: {
      alignItems: "stretch",
    },
    optionsContainer: {
      gap: spacing.md,
      marginBottom: spacing.xl,
    },
    separator: {
      height: 1,
      backgroundColor: colors.border,
      marginHorizontal: spacing.xl,
      marginBottom: spacing.xl,
    },
    manualInputButton: {
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: themeObj.components.buttons.cornerRadius,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.secondaryBackground,
      alignItems: "center",
      marginHorizontal: spacing.lg,
    },
    manualInputText: {
      fontSize: typography.Body.fontSize,
      fontFamily: typography.Body.fontFamily,
      color: colors.secondaryText,
      fontWeight: "500",
    },
    spacer: {
      flex: 1,
      minHeight: spacing.xxl * 2, // Ensure minimum spacing
    },
    progressContainer: {
      padding: themeObj.spacing.md,
    },
  });
};
