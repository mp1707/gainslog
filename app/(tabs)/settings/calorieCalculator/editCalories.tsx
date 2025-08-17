import React, { useMemo, useCallback } from "react";
import {
  View,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PencilIcon, CalculatorIcon } from "phosphor-react-native";
import * as Haptics from "expo-haptics";

import { useTheme } from "@/providers";
import { useFoodLogStore } from "@/stores/useFoodLogStore";
import { SelectionCard } from "@/shared/ui/atoms/SelectionCard";
import { useNavigationGuard } from "@/shared/hooks/useNavigationGuard";
import { StyleSheet } from "react-native";

const EditCaloriesScreen = React.memo(function EditCaloriesScreen() {
  const { colors, theme: themeObj } = useTheme();
  const { dailyTargets } = useFoodLogStore();
  const { safeNavigate, isNavigating } = useNavigationGuard();

  const styles = useMemo(
    () => createStyles(colors, themeObj),
    [colors, themeObj]
  );

  const currentCalories = dailyTargets?.calories || 0;

  const handleEditCurrent = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    safeNavigate({ route: "/settings/calorieCalculator/manualInput", replace: true });
  }, [safeNavigate]);

  const handleStartFresh = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    safeNavigate({ route: "/settings/calorieCalculator/sex", replace: true });
  }, [safeNavigate]);

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      {/* Content */}
      <View style={styles.content}>
        <View style={styles.textSection}>
          <Text style={styles.subtitle}>Edit your calorie target</Text>
          <Text style={styles.description}>
            Your current target is {currentCalories} calories. Choose how you'd like to update it.
          </Text>
        </View>

        <View style={styles.selectionSection}>
          <View style={styles.optionsContainer}>
            <SelectionCard
              title="Edit Current Value"
              description="Manually adjust your current calorie target"
              icon={PencilIcon}
              iconColor={colors.semantic.protein}
              isSelected={false}
              onSelect={handleEditCurrent}
              accessibilityLabel="Edit current calorie value manually"
              accessibilityHint="Opens manual input screen with your current calorie value pre-filled"
            />

            <SelectionCard
              title="Start Fresh Calculation"
              description="Recalculate your calories from the beginning"
              icon={CalculatorIcon}
              iconColor={colors.accent}
              isSelected={false}
              onSelect={handleStartFresh}
              accessibilityLabel="Start fresh calorie calculation"
              accessibilityHint="Begins the full calorie calculation process from sex selection"
            />
          </View>
        </View>

        {/* Spacer to push content up and provide consistent spacing */}
        <View style={styles.spacer} />
      </View>
    </SafeAreaView>
  );
});

export default EditCaloriesScreen;

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