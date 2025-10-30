import React, { useMemo, useCallback } from "react";
import { View, StyleSheet, Alert, Linking } from "react-native";
import { Shield, FileText } from "lucide-react-native";

import { AppText } from "@/components";
import { useTheme, Colors, Theme } from "@/theme";
import { SettingRow } from "../SettingRow";

const PRIVACY_URL = "https://macroloop.app/privacy";
const TERMS_URL = "https://macroloop.app/terms";

export const AboutSection = () => {
  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);

  const handleOpenLink = useCallback((url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert("Unable to open link");
    });
  }, []);

  return (
    <View style={styles.section}>
      <AppText role="Caption" color="secondary" style={styles.sectionHeader}>
        LEGAL
      </AppText>
      <View style={styles.sectionGroup}>
        <SettingRow
          icon={Shield}
          title="Privacy Policy"
          onPress={() => handleOpenLink(PRIVACY_URL)}
          accessory="none"
          backgroundColor={colors.secondaryBackground}
        />
        <View style={styles.separator} />
        <SettingRow
          icon={FileText}
          title="Terms of Service"
          onPress={() => handleOpenLink(TERMS_URL)}
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
      marginRight: theme.spacing.lg
    },
  });
