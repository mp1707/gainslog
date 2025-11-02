import { StyleSheet } from "react-native";
import type { Colors, Theme } from "@/theme";

export const createStyles = (colors: Colors, theme: Theme) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.md,
    },
    weekdayRow: {
      flexDirection: "row",
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.subtleBorder,
      marginBottom: theme.spacing.sm,
    },
    weekdayCell: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    weekdayText: {
      color: colors.secondaryText,
      fontWeight: "600",
      textAlign: "center",
    },
    calendarGrid: {
      flexDirection: "column",
    },
    calendarRow: {
      flexDirection: "row",
      alignItems: "center",
    },
  });