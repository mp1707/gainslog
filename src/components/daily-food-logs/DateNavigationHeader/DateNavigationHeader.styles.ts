import { StyleSheet } from "react-native";
import type { Colors, Theme } from "../../../theme";

export const createStyles = (colors: Colors, theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: theme.spacing.md,
      minHeight: 40,
      width: "100%",
    },

    navigationButtonDisabled: {
      backgroundColor: colors.disabledBackground,
      borderColor: colors.border,
      opacity: 0.5,
    },

    datePickerContainer: {
      flex: 2,
    },

    // Mini summary overlay (no layout shift)
    miniSummaryWrapper: {
      position: "absolute",
      // extend beyond the header's horizontal padding so the background is full width
      left: -theme.spacing.pageMargins.horizontal,
      right: -theme.spacing.pageMargins.horizontal,
      bottom: -65,
      // Sit above the scroll content but below modal overlays
      zIndex: 10,
      elevation: 3,
    },
    miniBackground: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.secondaryBackground,
      // borderBottomWidth: StyleSheet.hairlineWidth,
      // borderBottomColor: colors.border,
    },
    miniSummaryContent: {
      paddingHorizontal: theme.spacing.pageMargins.horizontal,
      paddingVertical: theme.spacing.md,
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
    datepicker: {
      marginLeft: -20,
    },
    button: {
      flex: 1,
    },
  });
