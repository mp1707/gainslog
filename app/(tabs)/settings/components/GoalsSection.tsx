import React, { useMemo, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { Calculator, Edit2 } from "lucide-react-native";
import { useTranslation } from "react-i18next";

import { AppText, Card } from "@/components";
import { useTheme, Theme } from "@/theme";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { SettingRow } from "../SettingRow";
import { useOnboardingStore } from "@/store/useOnboardingStore";

export const GoalsSection = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { safeNavigate } = useNavigationGuard();
  const { setInputMethod } = useOnboardingStore();

  const handleCalculatedTargets = useCallback(() => {
    setInputMethod("calculate");
    safeNavigate("/onboarding/age");
  }, [safeNavigate, setInputMethod]);

  const handleManualTargets = useCallback(() => {
    setInputMethod("manual");
    safeNavigate("/onboarding/manual-input");
  }, [safeNavigate, setInputMethod]);

  return (
    <View style={styles.section}>
      <AppText role="Caption" color="secondary" style={styles.sectionHeader}>
        {t("settings.sections.tracking.label")}
      </AppText>
      <Card padding={0}>
        <SettingRow
          icon={Calculator}
          title={t("settings.sections.tracking.rows.calculateTargets.title")}
          subtitle={t(
            "settings.sections.tracking.rows.calculateTargets.subtitle"
          )}
          onPress={handleCalculatedTargets}
          accessory="chevron"
        />
        <SettingRow
          icon={Edit2}
          title={t("settings.sections.tracking.rows.manualTargets.title")}
          subtitle={t(
            "settings.sections.tracking.rows.manualTargets.subtitle"
          )}
          onPress={handleManualTargets}
          accessory="chevron"
        />
      </Card>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    section: {
      marginBottom: theme.spacing.lg,
    },
    sectionHeader: {
      marginBottom: theme.spacing.sm,
      marginLeft: theme.spacing.lg,
      letterSpacing: 0.5,
    },
  });
