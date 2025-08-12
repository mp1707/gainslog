import { StyleSheet } from "react-native";
import { theme } from "@/theme";
import type { Colors } from "@/theme";

export const createStyles = (colors: Colors) =>
  StyleSheet.create({
    container: {
      marginBottom: theme.spacing.md,
    },

    label: {
      fontSize: theme.typography.Headline.fontSize,
      fontWeight: theme.typography.Headline.fontWeight,
      fontFamily: theme.typography.Headline.fontFamily,
      color: colors.primaryText,
      marginBottom: theme.spacing.sm,
    },

    skeletonContainer: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: theme.components.buttons.cornerRadius,
      backgroundColor: colors.secondaryBackground,
      padding: theme.spacing.md,
      minHeight: 100, // Similar to multiline text input
    },

    loadingTextContainer: {
      marginBottom: theme.spacing.sm,
    },

    loadingText: {
      fontSize: theme.typography.Body.fontSize,
      fontFamily: theme.typography.Body.fontFamily,
      color: colors.secondaryText,
      fontStyle: "italic",
    },

    skeletonLines: {
      gap: theme.spacing.sm,
    },

    skeletonLine: {
      borderRadius: 4,
    },
  });

// Legacy export for compatibility
export const styles = createStyles(theme.getColors());
