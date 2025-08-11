import { StyleSheet } from "react-native";
import type { Colors, Theme } from "../../../../../theme";

export const createStyles = (colors: Colors, theme: Theme) =>
  StyleSheet.create({
    expandableContainer: {
      position: "relative",
    },
    container: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: theme.spacing.md,
      minHeight: 40,
    },

    navigationButton: {
      padding: theme.spacing.sm,
      borderRadius: theme.spacing.sm,
      backgroundColor: colors.secondaryBackground,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: "rgba(0, 0, 0, 0.05)",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 4,
      elevation: 2,
    },

    navigationButtonDisabled: {
      backgroundColor: colors.disabledBackground,
      borderColor: colors.border,
      opacity: 0.5,
    },

    datePickerContainer: {
      flexShrink: 0,
      marginLeft: -10,
    },

    // Mini summary overlay (no layout shift)
    miniSummaryWrapper: {
      position: "absolute",
      // extend beyond the header's horizontal padding so the background is full width
      left: -theme.spacing.pageMargins.horizontal,
      right: -theme.spacing.pageMargins.horizontal,
      bottom: - 65,
      backgroundColor: colors.secondaryBackground,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
      paddingBottom: theme.spacing.sm,
      // Sit above the scroll content but below modal overlays
      zIndex: 10,
      elevation: 3,
    },
    miniSummaryContent: {
      paddingHorizontal: theme.spacing.pageMargins.horizontal,
      paddingVertical: theme.spacing.sm,
    },
    miniSummaryLabel: {
      color: colors.secondaryText,
    },
    miniBadgesRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      justifyContent: "center",
      alignItems: "center",
    },
  });
