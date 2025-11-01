import React, { useMemo, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { Target } from "lucide-react-native";

import { AppText } from "@/components";
import { useTheme, Colors, Theme } from "@/theme";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { SettingRow } from "../SettingRow";

export const GoalsSection = () => {
  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);
  const { safeNavigate } = useNavigationGuard();

  const handleNutritionTargets = useCallback(() => {
    safeNavigate("/onboarding");
  }, [safeNavigate]);

  return (
    <View style={styles.section}>
      <AppText role="Caption" color="secondary" style={styles.sectionHeader}>
        TRACKING
      </AppText>
      <View style={styles.sectionGroup}>
        <SettingRow
          icon={Target}
          title="Nutrition Targets"
          subtitle="Set daily calories and macros."
          onPress={handleNutritionTargets}
          accessory="chevron"
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
  });
