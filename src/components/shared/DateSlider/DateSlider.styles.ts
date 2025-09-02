import { StyleSheet } from "react-native";
import type { Colors, Theme } from "@/theme";

export const createStyles = (colors: Colors, theme: Theme, itemWidth: number) =>
  StyleSheet.create({
    container: {
      // Remove fixed height to accommodate header
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.md,
    },
    headerButtonContainer: {
      flexDirection: "row",
      gap: theme.spacing.sm,
    },
    headerTitle: {
      color: colors.primaryText,
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
    modalBackdrop: {
      flex: 1,
    },
    blurContainer: {
      flex: 1,
    },
    modalBackdropTouchable: {
      flex: 1,
      paddingTop: "40%",
      alignItems: "center",
    },
    modalContent: {
      backgroundColor: colors.secondaryBackground,
      borderRadius: theme.spacing.md,
      padding: theme.spacing.md,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
    },
    closeButton: {
      marginTop: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      alignItems: "center",
    },
    closeButtonText: {
      ...theme.typography.Body,
      color: colors.accent,
      fontWeight: "600",
    },
  });
