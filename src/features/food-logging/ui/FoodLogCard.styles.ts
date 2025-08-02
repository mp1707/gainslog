import { StyleSheet } from "react-native";
import { theme } from "../../../theme";

export const createStyles = (colors: any) =>
  StyleSheet.create({
    cardContainer: {
      position: "relative",
    },

    card: {
      // Card uses no additional styles since the Card component handles styling
    },

    flashOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: theme.components.cards.cornerRadius,
      zIndex: 1,
      pointerEvents: "none",
    },

    titleRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: theme.spacing.md,
    },

    titleContent: {
      flex: 1,
      marginRight: theme.spacing.md,
    },

    title: {
      flex: 1,
    },

    loadingTitle: {
      color: colors.disabledText,
      fontStyle: "italic",
    },

    description: {
      fontStyle: "italic",
    },

    rightSection: {
      alignItems: "flex-end",
      gap: theme.spacing.sm,
    },

    // Macro badges container
    macroRowContainer: {
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "center",
      gap: theme.spacing.sm,
      flexWrap: "wrap",
    },

    // Skeleton-specific styles
    macroRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },

    macroItem: {
      alignItems: "center",
      flex: 1,
    },
  });

// Legacy export for compatibility
export const styles = createStyles(theme.getColors());
