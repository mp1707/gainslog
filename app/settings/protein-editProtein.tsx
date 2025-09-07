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
import { RoundButton } from "@/components/shared/RoundButton";
import { X } from "lucide-react-native";
import { GradientWrapper } from "@/components/shared/GradientWrapper";

const EditProteinScreen = React.memo(function EditProteinScreen() {
  const { colors, theme: themeObj } = useTheme();
  const styles = createStyles(colors, themeObj);
  const { dailyTargets } = useAppStore();
  const { safeReplace } = useNavigationGuard();
  const { back } = useRouter();
  const proteinTarget = dailyTargets?.protein || 0;
  const [selectedOption, setSelectedOption] = useState<'edit' | 'fresh' | undefined>();
  const handleCancel = () => {
    back();
  };

  const handleEditCurrent = useCallback(async () => {
    setSelectedOption('edit');
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    safeReplace("/settings/protein-manualInput");
  }, [safeReplace]);

  const handleStartFresh = useCallback(async () => {
    setSelectedOption('fresh');
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    safeReplace("/settings/protein-weight");
  }, [safeReplace]);

  return (
    <GradientWrapper style={styles.container}>
      <View style={styles.closeButton}>
        <RoundButton
          onPress={handleCancel}
          Icon={X}
          variant="tertiary"
          accessibilityLabel="Go back"
          accessibilityHint="Returns to previous screen"
        />
      </View>
      
      {/* Content */}
      <View style={styles.content}>
        <View style={styles.textSection}>
          <Text style={styles.subtitle}>Edit your protein target</Text>
          <Text style={styles.description}>
            Your current target is {proteinTarget}g protein. Choose how you'd
            like to update it.
          </Text>
        </View>

        <View style={styles.selectionSection}>
          <View style={styles.optionsContainer}>
            <SelectionCard
              title="Edit Current Value"
              description="Manually adjust your current protein target"
              icon={Edit}
              iconColor={colors.semantic.protein}
              isSelected={selectedOption === 'edit'}
              onSelect={handleEditCurrent}
              accessibilityLabel="Edit current protein value manually"
              accessibilityHint="Opens manual input screen with your current protein value pre-filled"
            />

            <SelectionCard
              title="Start Fresh Calculation"
              description="Recalculate your protein from the beginning"
              icon={Calculator}
              iconColor={colors.accent}
              isSelected={selectedOption === 'fresh'}
              onSelect={handleStartFresh}
              accessibilityLabel="Start fresh protein calculation"
              accessibilityHint="Begins the full protein calculation process from weight input"
            />
          </View>
        </View>

        {/* Spacer to push content up and provide consistent spacing */}
        <View style={styles.spacer} />
      </View>
    </GradientWrapper>
  );
});

export default EditProteinScreen;

type Colors = ReturnType<typeof useTheme>["colors"];
type Theme = ReturnType<typeof useTheme>["theme"];

const createStyles = (colors: Colors, themeObj: Theme) => {
  const { spacing, typography } = themeObj;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.primaryBackground,
    },
    closeButton: {
      position: "absolute",
      top: spacing.lg,
      right: spacing.md,
      zIndex: 15,
    },
    content: {
      flex: 1,
      paddingHorizontal: spacing.pageMargins.horizontal,
      justifyContent: "flex-start",
      alignItems: "stretch",
      gap: spacing.xxl,
    },
    textSection: {
      paddingTop: spacing.xxl + spacing.md,
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
