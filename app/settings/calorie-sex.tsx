import React, { useMemo, useCallback, useState } from "react";
import { View, Text } from "react-native";
import { User } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/theme";
import { SelectionCard } from "@/components/settings/SelectionCard";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { StyleSheet } from "react-native";
import { UserSettings } from "@/types/models";
import { useAppStore } from "@/store/useAppStore";
import { ModalHeader } from "@/components/daily-food-logs/ModalHeader";
import { useRouter } from "expo-router";

const SexSelectionScreen = React.memo(function SexSelectionScreen() {
  const { colors, theme: themeObj } = useTheme();
  const { userSettings, setUserSettings } = useAppStore();
  const { safeNavigate } = useNavigationGuard();
  const { back } = useRouter();
  const [selectedSex, setSelectedSex] = useState<UserSettings["sex"] | undefined>();

  const styles = useMemo(
    () => createStyles(colors, themeObj),
    [colors, themeObj]
  );

  const handleSexSelect = useCallback(
    async (sex: UserSettings["sex"]) => {
      setSelectedSex(sex);
      const newSettings: UserSettings = {
        sex,
        age: userSettings?.age ?? 30,
        weight: userSettings?.weight ?? 85,
        height: userSettings?.height ?? 175,
        activityLevel: userSettings?.activityLevel ?? "moderate",
        calorieGoalType: userSettings?.calorieGoalType ?? "maintain",
        fatCalculationPercentage: userSettings?.fatCalculationPercentage ?? 25,
      };
      setUserSettings(newSettings);

      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      safeNavigate("/settings/calorie-age");
    },
    [userSettings, setUserSettings, safeNavigate]
  );

  const handleCancel = () => {
    back();
  };


  return (
    <View style={styles.container}>
      <ModalHeader 
        title="Biological Sex"
        onClose={handleCancel}
        closeAccessibilityLabel="Go back"
        closeAccessibilityHint="Returns to previous screen"
      />

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
              icon={User}
              iconColor="#4A90E2"
              isSelected={selectedSex === "male"}
              onSelect={() => handleSexSelect("male")}
              accessibilityLabel="Select male as biological sex"
              accessibilityHint="This will help calculate your calorie needs and advance to the next step"
            />

            <SelectionCard
              title="Female"
              description="Biological female"
              icon={User}
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
    </View>
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
