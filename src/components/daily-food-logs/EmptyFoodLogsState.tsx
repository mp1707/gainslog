import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/theme/ThemeProvider";
import { AppText } from "@/components";
import type { Colors, Theme } from "@/theme";

export const EmptyFoodLogsState: React.FC = () => {
  const { colors, theme } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <AppText style={styles.motivationalText}>
          {t("dailyFoodLogs.emptyState.encouragement")}
        </AppText>
      </View>
    </View>
  );
};

const createStyles = (colors: Colors, theme: Theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: theme.spacing.xl,
      paddingHorizontal: theme.spacing.lg,
      minHeight: 300,
    },
    contentContainer: {
      alignItems: "center",
      justifyContent: "center",
    },
    imageContainer: {
      alignItems: "center",
      justifyContent: "center",
      marginBottom: theme.spacing.md,
    },
    image: {
      width: 150,
      height: 150,
    },
    motivationalText: {
      ...theme.typography.Headline,
      color: colors.secondaryText,
      textAlign: "center",
    },
  });
};
