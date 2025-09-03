import { StyleSheet } from "react-native";
import type { Colors, Theme } from "@/theme";

export const createStyles = (colors: Colors, theme: Theme, itemWidth: number) =>
  StyleSheet.create({
    container: {
      // Remove fixed height to accommodate header
    },
    sliderContainer: {
      height: 100,
    },
    itemContainer: {
      alignItems: "center",
      justifyContent: "center",
      height: 100,
      width: itemWidth,
    },
    weekdayContainer: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs / 2,
      borderRadius: 12,
      alignSelf: "center",
      marginBottom: theme.spacing.xs,
    },
    selectedWeekdayContainer: {
      backgroundColor: `${colors.subtleBackground}`,
    },
    weekdayText: {
      ...theme.typography.Caption,
      fontWeight: "600",
      color: colors.secondaryText,
      textAlign: "center",
    },
    selectedWeekdayText: {
      fontWeight: "900",
      color: colors.primaryText,
    },
    progressContainer: {
      alignItems: "center",
      justifyContent: "center",
    },
  });
