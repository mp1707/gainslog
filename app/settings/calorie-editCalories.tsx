import React, { useMemo, useCallback, useState } from "react";
import { View, Text } from "react-native";
import { Edit, Calculator } from "lucide-react-native";
import * as Haptics from "expo-haptics";

import { useTheme } from "@/theme";
import { useAppStore } from "@/store/useAppStore";
import { SelectionCard } from "@/components/settings/SelectionCard";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { ModalHeader } from "@/components/daily-food-logs/ModalHeader";

const EditCaloriesScreen = React.memo(function EditCaloriesScreen() {
  const { colors, theme: themeObj } = useTheme();
  const styles = createStyles(colors, themeObj);
  const { dailyTargets } = useAppStore();
  const { safeReplace } = useNavigationGuard();
  const { back } = useRouter();
  const currentCalories = dailyTargets?.calories || 0;
  const [selectedOption, setSelectedOption] = useState<'edit' | 'fresh' | null>(null);

  const handleCancel = () => {
    back();
  };

  const handleSave = () => {
    if (selectedOption === 'edit') {
      handleEditCurrent();
    } else if (selectedOption === 'fresh') {
      handleStartFresh();
    }
  };

  const handleEditCurrent = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    safeReplace("/settings/calorie-manualInput");
  }, [safeReplace]);

  const handleStartFresh = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    safeReplace("/settings/calorie-sex");
  }, [safeReplace]);

  const handleEditCurrentPreselect = () => {
    setSelectedOption('edit');
  };

  const handleStartFreshPreselect = () => {
    setSelectedOption('fresh');
  };

  return (
    <View style={styles.container}>
      <ModalHeader onCancel={handleCancel} onSave={handleSave} disabled={!selectedOption} />
      
      {/* Content */}
      <View style={styles.content}>
        <View style={styles.textSection}>
          <Text style={styles.subtitle}>Edit your calorie target</Text>
          <Text style={styles.description}>
            Your current target is {currentCalories} calories. Choose how you'd
            like to update it.
          </Text>
        </View>

        <View style={styles.selectionSection}>
          <View style={styles.optionsContainer}>
            <SelectionCard
              title="Edit Current Value"
              description="Manually adjust your current calorie target"
              icon={Edit}
              iconColor={colors.semantic.protein}
              isSelected={selectedOption === 'edit'}
              onSelect={handleEditCurrentPreselect}
              accessibilityLabel="Edit current calorie value manually"
              accessibilityHint="Opens manual input screen with your current calorie value pre-filled"
            />

            <SelectionCard
              title="Start Fresh Calculation"
              description="Recalculate your calories from the beginning"
              icon={Calculator}
              iconColor={colors.accent}
              isSelected={selectedOption === 'fresh'}
              onSelect={handleStartFreshPreselect}
              accessibilityLabel="Start fresh calorie calculation"
              accessibilityHint="Begins the full calorie calculation process from sex selection"
            />
          </View>
        </View>

        {/* Spacer to push content up and provide consistent spacing */}
        <View style={styles.spacer} />
      </View>
    </View>
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
      gap: spacing.md,
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