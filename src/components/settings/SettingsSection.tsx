import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { AppText } from "@/components";

interface SettingsSectionProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  subtitle,
  children,
}) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    section: {
      marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
      marginBottom: theme.spacing.xs,
    },
    sectionSubtitle: {
      marginBottom: theme.spacing.lg,
    },
  });

  return (
    <View style={styles.section} accessibilityRole="summary">
      <AppText role="Title2" style={styles.sectionTitle}>
        {title}
      </AppText>
      <AppText role="Body" color="secondary" style={styles.sectionSubtitle}>
        {subtitle}
      </AppText>
      {children}
    </View>
  );
};
