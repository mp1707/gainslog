import React, { useMemo, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  FireIcon,
  LightningIcon,
  PencilSimpleIcon,
} from "phosphor-react-native";
import * as Haptics from "expo-haptics";

import { useTheme } from "@/theme";
import { useAppStore } from "@/store";
import { SelectionCard } from "@/components/settings/SelectionCard";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { useNutritionCalculations } from "@/hooks/useNutritionCalculations";
import {
  calculateFatGramsFromPercentage,
  calculateMaxFatPercentage,
} from "@/utils/nutritionCalculations";
import type { ColorScheme, Theme } from "@/theme";

// GuidelineRow Component: No changes needed here, as it inherits styles from the parent.
const GuidelineRow = ({
  label,
  range,
  description,
  Icon,
}: {
  label: string;
  range: string;
  description: string;
  Icon: React.ElementType;
}) => {
  const { colors, theme, colorScheme } = useTheme();
  const styles = createStyles(colors, theme, colorScheme);

  return (
    <View style={styles.guidelineRow}>
      <Icon size={24} color={colors.secondaryText} weight={"regular"} />
      <View style={styles.guidelineTextContainer}>
        <Text style={styles.guidelineLabel}>
          {label} ({range})
        </Text>
        <Text style={styles.guidelineDescription}>{description}</Text>
      </View>
    </View>
  );
};

const EditFatScreen = React.memo(function EditFatScreen() {
  const { colors, theme: themeObj, colorScheme } = useTheme();
  const dailyTargets = useAppStore((s) => s.dailyTargets) || {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  };
  const { safeReplace } = useNavigationGuard();
  const { fatPercentage } = useNutritionCalculations();

  const styles = useMemo(
    () => createStyles(colors, themeObj, colorScheme),
    [colors, themeObj, colorScheme]
  );

  const fatGrams = useMemo(
    () => calculateFatGramsFromPercentage(dailyTargets.calories, fatPercentage),
    [dailyTargets.calories, fatPercentage]
  );

  const maxFatPercentage = useMemo(
    () =>
      calculateMaxFatPercentage(dailyTargets.calories, dailyTargets.protein),
    [dailyTargets.calories, dailyTargets.protein]
  );

  const handleEditCurrent = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    safeReplace("/settings/fatCalculator/manualInput");
  }, [safeReplace]);

  return (
    <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.textSection}>
          <Text style={styles.subtitle}>Fat Target</Text>
          <Text style={styles.fatInfo}>
            Your current target is: {Math.round(fatGrams)}g ({fatPercentage}% of
            calories).
          </Text>
        </View>
        {/* Interactive Card Section */}
        <SelectionCard
          title="Edit Current Value"
          description="Manually adjust your fat target"
          icon={PencilSimpleIcon}
          iconColor={colors.accent}
          isSelected={false}
          onSelect={handleEditCurrent}
          accessibilityLabel="Edit current fat value manually"
          accessibilityHint="Opens a screen to manually input your fat percentage"
        />
        {/* Informational Card */}
        <View style={styles.infoCard}>
          <Text style={styles.cardHeader}>
            Fat is essential for hormone production, nutrient absorption, and
            long-term energy storage.
          </Text>

          <View style={styles.guidelineSection}>
            <Text style={styles.guidelineTitle}>
              Scientifically Based Guidelines
            </Text>
            <GuidelineRow
              label="Muscle Gain"
              range="25-30%"
              description="Leaves more calories for carbohydrates"
              Icon={LightningIcon}
            />
            <GuidelineRow
              label="Fat Loss"
              range="30-35%"
              description="Supports satiety during a calorie deficit"
              Icon={FireIcon}
            />
          </View>

          <View style={styles.cardFooter}>
            <Text style={styles.footerText}>
              Max allowed based on your targets: {Math.round(maxFatPercentage)}%
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
});

export default EditFatScreen;

type Colors = ReturnType<typeof useTheme>["colors"];

const createStyles = (
  colors: Colors,
  themeObj: Theme,
  colorScheme: ColorScheme
) => {
  const { spacing, typography, getComponentStyles } = themeObj;
  // The 'colors' object is already theme-aware, so we pass its scheme to getComponentStyles
  const componentStyles = getComponentStyles(colorScheme);

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.primaryBackground,
    },
    scrollContent: {
      paddingHorizontal: spacing.pageMargins.horizontal,
      paddingBottom: spacing.xxl, // Ensures space at the bottom for better scrolling
      gap: spacing.md,
    },
    textSection: {
      paddingTop: spacing.lg,
    },
    subtitle: {
      fontSize: typography.Title2.fontSize,
      fontFamily: typography.Title2.fontFamily,
      color: colors.primaryText,
      textAlign: "center",
      marginBottom: spacing.sm,
    },
    fatInfo: {
      fontSize: typography.Subhead.fontSize,
      fontFamily: typography.Subhead.fontFamily,
      color: colors.accent,
      textAlign: "center",
      fontWeight: "600",
      marginBottom: spacing.sm,
    },
    infoCard: {
      ...componentStyles.cards,
      borderRadius: componentStyles.cards.cornerRadius,
      borderWidth: 2,
      borderColor: colors.border,
      padding: spacing.lg,
    },
    cardHeader: {
      ...typography.Body,
      color: colors.primaryText,
      lineHeight: typography.Body.fontSize * 1.5,
      marginBottom: spacing.lg,
    },
    guidelineSection: {
      gap: spacing.sm,
    },
    guidelineTitle: {
      ...typography.Subhead,
      color: colors.secondaryText,
      fontWeight: "600",
      marginBottom: spacing.xs,
    },
    // Guideline Row styling
    guidelineRow: {
      flexDirection: "row",
      alignItems: "center",
      padding: spacing.md,
      backgroundColor: colors.primaryBackground,
      // Consistent corner radius with other interactive elements
      borderRadius: themeObj.components.buttons.cornerRadius,
      gap: spacing.md,
    },
    guidelineTextContainer: {
      flex: 1,
      gap: spacing.xs / 2, // Small gap between label and description
    },
    guidelineLabel: {
      ...typography.Subhead,
      fontWeight: "600",
      color: colors.primaryText,
    },
    guidelineDescription: {
      ...typography.Caption,
      color: colors.secondaryText,
    },
    // Card Footer styling
    cardFooter: {
      borderTopWidth: 1,
      borderColor: colors.border,
      marginTop: spacing.lg,
      paddingTop: spacing.lg,
    },
    footerText: {
      ...typography.Caption,
      color: colors.secondaryText,
      textAlign: "center",
    },
  });
};
