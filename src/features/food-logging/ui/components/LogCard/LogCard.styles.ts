import { StyleSheet } from "react-native";
import { theme } from "@/theme";
import type { Colors } from "@/theme";

export const createStyles = (colors: Colors) =>
  StyleSheet.create({
    cardContainer: {
      flex: 1,
    },

    card: {
      // Card uses no additional styles since the Card component handles styling
    },

    pressable: {
      flex: 1,
    },

    contentContainer: {
      flexDirection: "row",
      gap: theme.spacing.md,
    },
    leftSection: {
      flex: 2,
      flexDirection: "column",
      justifyContent: "space-between",
      gap: theme.spacing.sm,
    },

    textContainer: {
      gap: theme.spacing.sm,
    },

    rightSection: {
      flex: 1,
      alignItems: "flex-start",
      justifyContent: "flex-end",
      gap: theme.spacing.sm,
    },

    titleContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: theme.spacing.sm,
    },

    title: {
      flex: 1,
    },

    description: {
      fontStyle: "italic",
    },

    confidenceBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.xs,
      borderRadius: theme.spacing.sm,
    },

    confidenceText: {
      fontSize: theme.typography.Caption.fontSize,
      fontWeight: "600" as const,
    },

    // Confidence badge variants - now use theme tokens
    confidenceHigh: {
      backgroundColor: colors.confidence.high.background,
    },

    confidenceHighText: {
      color: colors.confidence.high.text,
    },

    confidenceMedium: {
      backgroundColor: colors.confidence.medium.background,
    },

    confidenceMediumText: {
      color: colors.confidence.medium.text,
    },

    confidenceLow: {
      backgroundColor: colors.confidence.low.background,
    },

    confidenceLowText: {
      color: colors.confidence.low.text,
    },

    confidenceUncertain: {
      backgroundColor: colors.confidence.uncertain.background,
    },

    confidenceUncertainText: {
      color: colors.confidence.uncertain.text,
    },
  });

// Legacy export for compatibility
export const styles = createStyles(theme.getColors());
