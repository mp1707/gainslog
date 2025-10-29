import { StyleSheet } from "react-native";
import type { Colors, Theme } from "@/theme";

export const createStyles = (colors: Colors, theme: Theme) =>
  StyleSheet.create({
    container: {
      // Section container (no card wrapper)
    },
    sectionHeader: {
      marginBottom: theme.spacing.md,
      letterSpacing: 0.6,
      color: colors.secondaryText,
    },
    listContainer: {
      backgroundColor: colors.secondaryBackground,
      borderRadius: theme.components.cards.cornerRadius,
      // overflow: "hidden",
    },
    separator: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.subtleBorder,
      // Full-bleed within content column - no margin offset
    },
    componentRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      minHeight: 56, // 7 × 8pt for native feel
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
      minWidth: 0,
    },
    rightColumn: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
      marginRight: theme.spacing.sm,
      flexShrink: 0,
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
      paddingVertical: theme.spacing.sm,
      alignSelf: "flex-end",
      paddingTop: theme.spacing.md,
      minHeight: 56,
      backgroundColor: colors.secondaryBackground,
    },
    addLabel: {},
    componentName: {
      flex: 1,
      flexShrink: 1,
      minWidth: 0,
    },
    amountText: {
      marginRight: theme.spacing.sm,
    },
    namePressable: {
      width: "100%",
      minWidth: 0,
    },
    expansionContent: {
      padding: theme.spacing.md,
      gap: theme.spacing.md,
    },
    estimateLine: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
    estimateText: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
      flex: 1,
    },
    buttonRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: theme.spacing.md,
    },
    acceptPill: {
      minHeight: 40,
      paddingHorizontal: theme.spacing.md,
      borderRadius: 20,
      backgroundColor: colors.accent,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    acceptPillText: {
      color: colors.accent === "#44EBD4" ? colors.black : colors.white,
      fontSize: theme.typography.Body.fontSize,
      fontWeight: "600",
    },
    editTextButton: {
      paddingVertical: theme.spacing.xs,
    },
    editTextButtonLabel: {
      color: colors.secondaryText,
      fontSize: theme.typography.Body.fontSize,
    },
  });
