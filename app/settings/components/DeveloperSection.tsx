import React, { useMemo, useCallback } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Wrench, AlertTriangle, BadgeCheck } from "lucide-react-native";

import { AppText } from "@/components";
import { useTheme, Colors, Theme } from "@/theme";
import { useAppStore } from "@/store/useAppStore";
import { seedFoodLogs } from "@/utils/seed";
import { SettingRow } from "../SettingRow";

export const DeveloperSection = () => {
  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);
  const { clearAllLogs, clearNutritionGoals, isPro, setPro } = useAppStore();

  const handleSeedData = useCallback(() => {
    seedFoodLogs();
  }, []);

  const handleClearAllLogs = useCallback(() => {
    Alert.alert(
      "Delete All Logs",
      "This deletes all logs and any saved photos. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          style: "destructive",
          onPress: () => clearAllLogs(),
        },
      ]
    );
  }, [clearAllLogs]);

  const handleClearNutritionGoals = useCallback(() => {
    Alert.alert(
      "Clear Nutrition Goals",
      "Remove all saved macro targets? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear Goals",
          style: "destructive",
          onPress: () => clearNutritionGoals(),
        },
      ]
    );
  }, [clearNutritionGoals]);

  const handleTogglePro = useCallback(() => {
    setPro(!isPro);
  }, [isPro, setPro]);

  // Only render in development mode
  if (!__DEV__) {
    return null;
  }

  return (
    <View style={styles.section}>
      <AppText role="Caption" color="secondary" style={styles.sectionHeader}>
        DEVELOPER
      </AppText>
      <View style={styles.sectionGroup}>
        <SettingRow
          icon={Wrench}
          title="Seed Sample Logs"
          subtitle="Add demo logs for QA flows."
          actionButton={{
            label: "Run",
            onPress: handleSeedData,
          }}
          accessory="none"
          backgroundColor={colors.secondaryBackground}
        />
        <View style={styles.separator} />
        <SettingRow
          icon={AlertTriangle}
          title="Delete All Logs..."
          actionButton={{
            label: "Delete",
            onPress: handleClearAllLogs,
            tone: "error",
          }}
          accessory="none"
          backgroundColor={colors.secondaryBackground}
        />
        <View style={styles.separator} />
        <SettingRow
          icon={AlertTriangle}
          title="Clear Nutrition Goals"
          subtitle="Removes saved macro targets."
          actionButton={{
            label: "Reset",
            onPress: handleClearNutritionGoals,
            tone: "error",
          }}
          accessory="none"
          backgroundColor={colors.secondaryBackground}
        />
        <View style={styles.separator} />
        <SettingRow
          icon={BadgeCheck}
          title={`Toggle Pro (${isPro ? "ON" : "OFF"})`}
          subtitle="Helpful when testing paywall states."
          actionButton={{
            label: isPro ? "Disable" : "Enable",
            onPress: handleTogglePro,
          }}
          accessory="none"
          backgroundColor={colors.secondaryBackground}
        />
      </View>
    </View>
  );
};

const createStyles = (colors: Colors, theme: Theme) =>
  StyleSheet.create({
    section: {
      marginBottom: theme.spacing.lg,
    },
    sectionHeader: {
      marginBottom: theme.spacing.sm,
      marginLeft: theme.spacing.lg,
      letterSpacing: 0.5,
    },
    sectionGroup: {
      borderRadius: theme.components.cards.cornerRadius,
      overflow: "hidden",
      backgroundColor: colors.secondaryBackground,
    },
    separator: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.subtleBorder,
      marginLeft: theme.spacing.lg + 24 + theme.spacing.md,
    },
  });
