import { StyleSheet } from "react-native";
import type { Colors, Theme } from "@/theme";

export const createStyles = (colors: Colors, theme: Theme) =>
  StyleSheet.create({
    container: {
      gap: theme.spacing.xs,
    },
    cardHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    sectionHeader: {
      marginBottom: theme.spacing.sm,
      letterSpacing: 0.6,
      color: colors.secondaryText,
    },
    componentRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: theme.spacing.md,
    },
    solidBackgroundForSwipe: {
      backgroundColor: colors.secondaryBackground,
      paddingVertical: theme.spacing.md,
    },
    componentExpandContainer: {
      flexDirection: "row",
    },
    leftColumn: {
      flex: 1,
    },
    rightColumn: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
      marginRight: theme.spacing.sm,
    },
    deleteAction: {
      backgroundColor: colors.error,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: theme.spacing.lg,
      marginVertical: theme.spacing.xs,
      flexDirection: "row",
      gap: theme.spacing.sm,
    },
    addRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: theme.spacing.md,
    },
    addLabel: {
      marginLeft: theme.spacing.sm,
    },
    componentName: {
      flex: 1,
    },
    amountText: {
      marginRight: theme.spacing.sm,
    },
  });
