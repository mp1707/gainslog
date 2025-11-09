import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";

import { AppText } from "@/components";
import { useTheme, Colors, Theme } from "@/theme";

export default function DesignScreen() {
  const { t } = useTranslation();
  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <AppText role="Body" color="secondary" style={styles.placeholder}>
          {t("settings.design.placeholder")}
        </AppText>
      </View>
    </View>
  );
}

const createStyles = (colors: Colors, theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.primaryBackground,
    },
    content: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: theme.spacing.lg,
    },
    placeholder: {
      textAlign: "center",
    },
  });
