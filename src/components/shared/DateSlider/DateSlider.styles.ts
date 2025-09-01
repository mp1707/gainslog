import { StyleSheet } from "react-native";
import type { Colors, Theme } from "@/theme";

export const createStyles = (colors: Colors, theme: Theme, itemWidth: number) =>
  StyleSheet.create({
    container: {
      height: 100,
    },
    itemContainer: {
      alignItems: "center",
      justifyContent: "center",
      height: 100,
      width: itemWidth,
    },
    weekdayText: {
      ...theme.typography.Caption,
      fontWeight: "600",
      color: colors.secondaryText,
      marginBottom: theme.spacing.xs,
      textAlign: "center",
    },
    selectedWeekdayText: {
      color: colors.accent,
    },
    progressContainer: {
      alignItems: "center",
      justifyContent: "center",
    },
  });