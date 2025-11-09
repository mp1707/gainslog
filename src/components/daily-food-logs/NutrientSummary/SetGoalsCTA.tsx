import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";

import { AppText, Button } from "@/components";
import { Colors, Theme, useTheme } from "@/theme";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";

export const SetGoalsCTA: React.FC = () => {
  const { colors, theme } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);
  const { safeNavigate } = useNavigationGuard();

  const handleCTAPress = () => {
    safeNavigate("/onboarding");
  };

  return (
    <View style={styles.container}>
      <AppText style={styles.title}>
        {t("dailyFoodLogs.setGoalsCTA.title")}
      </AppText>
      <Button
        variant="primary"
        label={t("dailyFoodLogs.setGoalsCTA.ctaLabel")}
        onPress={handleCTAPress}
        style={styles.button}
      />
    </View>
  );
};

const createStyles = (colors: Colors, theme: Theme) =>
  StyleSheet.create({
    container: {
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.xl,
      gap: theme.spacing.md,
      minHeight: 176,
      marginTop: theme.spacing.xxl * 3,
    },
    title: {
      ...theme.typography.Headline,
      color: colors.primaryText,
      textAlign: "center",
      fontWeight: "600",
    },
    button: {
      marginTop: theme.spacing.md,
      minWidth: 180,
    },
  });
