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
      flex: 1,
    },
    headerTitle: {
      color: colors.primaryText,
      flex: 6,
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
      backgroundColor: "rgba(0, 0, 0, 0.3)",
    },
    modalBackdropTouchable: {
      flex: 1,
    },
    modalContent: {
      position: "absolute",
      backgroundColor: colors.primaryBackground,
      borderRadius: theme.spacing.sm,
      padding: theme.spacing.md,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 5,
      minWidth: 200,
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
