import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { Moon, Palette, Languages } from "lucide-react-native";
import { useTranslation } from "react-i18next";

import { AppText } from "@/components";
import { useTheme, Colors, Theme } from "@/theme";
import { useSafeRouter } from "@/hooks/useSafeRouter";
import { SettingRow } from "../SettingRow";
import { useLocalization } from "@/context/LocalizationContext";

export const AppearanceSection = () => {
  const { t } = useTranslation();
  const { languagePreference } = useLocalization();
  const { colors, theme } = useTheme();
  const router = useSafeRouter();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);
  const languageValue = useMemo(() => {
    switch (languagePreference) {
      case "en":
        return t("settings.language.options.en.label");
      case "de":
        return t("settings.language.options.de.label");
      default:
        return t("settings.language.options.device.label");
    }
  }, [languagePreference, t]);

  return (
    <View style={styles.section}>
      <AppText role="Caption" color="secondary" style={styles.sectionHeader}>
        {t("settings.sections.appearance.label")}
      </AppText>
      <View style={styles.sectionGroup}>
        <SettingRow
          icon={Moon}
          title={t("settings.sections.appearance.rows.darkMode.title")}
          subtitle={t("settings.sections.appearance.rows.darkMode.subtitle")}
          accessory="chevron"
          onPress={() => router.push("/settings/dark-mode")}
          backgroundColor={colors.secondaryBackground}
        />
        <View style={styles.separator} />
        <SettingRow
          icon={Languages}
          title={t("settings.sections.appearance.rows.language.title")}
          subtitle={t("settings.sections.appearance.rows.language.subtitle")}
          accessory="chevron"
          onPress={() => router.push("/settings/language")}
          value={languageValue}
          valueTone="secondary"
          backgroundColor={colors.secondaryBackground}
        />
        <View style={styles.separator} />
        <SettingRow
          icon={Palette}
          title={t("settings.sections.appearance.rows.design.title")}
          subtitle={t("settings.sections.appearance.rows.design.subtitle")}
          accessory="chevron"
          onPress={() => router.push("/settings/design")}
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
      marginRight: theme.spacing.lg,
    },
  });
