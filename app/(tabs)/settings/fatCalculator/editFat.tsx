import React, { useMemo, useCallback } from "react";
import {
  View,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PencilIcon } from "phosphor-react-native";
import * as Haptics from "expo-haptics";

import { useTheme } from "@/providers";
import { useFoodLogStore } from "@/stores/useFoodLogStore";
import { SelectionCard } from "@/shared/ui/atoms/SelectionCard";
import { useNavigationGuard } from "@/shared/hooks/useNavigationGuard";
import { useNutritionCalculations } from "@/features/settings/hooks/useNutritionCalculations";
import {
  calculateFatGramsFromPercentage,
  calculateMaxFatPercentage,
} from "@/utils/nutritionCalculations";
import { StyleSheet } from "react-native";

const EditFatScreen = React.memo(function EditFatScreen() {
  const { colors, theme: themeObj } = useTheme();
  const { dailyTargets } = useFoodLogStore();
  const { safeReplace } = useNavigationGuard();
  const { fatPercentage } = useNutritionCalculations();

  const styles = useMemo(
    () => createStyles(colors, themeObj),
    [colors, themeObj]
  );

  const fatGrams = calculateFatGramsFromPercentage(
    dailyTargets.calories,
    fatPercentage
  );
  const maxFatPercentage = calculateMaxFatPercentage(
    dailyTargets.calories,
    dailyTargets.protein
  );

  const handleEditCurrent = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    safeReplace("/settings/fatCalculator/manualInput");
  }, [safeReplace]);

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      {/* Content */}
      <View style={styles.content}>
        <View style={styles.textSection}>
          <Text style={styles.subtitle}>Fat Target</Text>
          <Text style={styles.description}>
            Your current target is {Math.round(fatGrams)}g fat ({fatPercentage}% of total calories).
          </Text>
          <Text style={styles.educationalText}>
            Fat is essential for hormone production, nutrient absorption, and long-term energy storage.
            {"\n\n"}
            Scientifically based guideline: 25-35% of total daily calories from fat.
            {"\n\n"}
            • Muscle gain: 25-30% (leaves more calories for performance-enhancing carbohydrates)
            {"\n"}
            • Fat loss: 30-35% (fat supports satiety and hormone production during calorie deficit)
            {"\n\n"}
            Maximum allowed based on your protein and calories: {Math.round(maxFatPercentage)}%
          </Text>
        </View>

        <View style={styles.selectionSection}>
          <View style={styles.optionsContainer}>
            <SelectionCard
              title="Edit Current Value"
              description="Manually adjust your current fat target"
              icon={PencilIcon}
              iconColor={colors.accent}
              isSelected={false}
              onSelect={handleEditCurrent}
              accessibilityLabel="Edit current fat value manually"
              accessibilityHint="Opens manual input screen with your current fat percentage pre-filled"
            />
          </View>
        </View>

        {/* Spacer to push content up and provide consistent spacing */}
        <View style={styles.spacer} />
      </View>
    </SafeAreaView>
  );
});

export default EditFatScreen;

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
      lineHeight: 24,
    },
    educationalText: {
      fontSize: typography.Caption.fontSize,
      fontFamily: typography.Caption.fontFamily,
      color: colors.secondaryText,
      textAlign: "left",
      lineHeight: 18,
      marginTop: spacing.md,
    },
    selectionSection: {
      alignItems: "stretch",
    },
    optionsContainer: {
      gap: spacing.md,
    },
    spacer: {
      flex: 1,
      minHeight: spacing.xxl * 2, // Ensure minimum spacing
    },
  });
};