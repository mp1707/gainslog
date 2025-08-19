import { StyleSheet } from "react-native";
import { theme } from "@/theme";
import type { Colors } from "@/theme";

export const createStyles = (colors: Colors) =>
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

    topSection: {
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "flex-start",
      marginBottom: theme.spacing.md,
      gap: theme.spacing.sm,
    },

    titleSection: {
      flex: 1,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: theme.spacing.sm,
    },

    title: {
      flex: 1,
      alignSelf: "flex-end",
    },

    favoriteButton: {
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: theme.spacing.xs,
    },

    loadingTitle: {
      color: colors.disabledText,
      fontStyle: "italic",
    },

    description: {
      fontStyle: "italic",
    },

    bottomSection: {
      flexDirection: "row",
      justifyContent: "space-between",
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
      flex: 1,
    },
    
    // Edit button styles
    editButton: {
      width: 28,
      height: 28,
      borderRadius: 14,
      justifyContent: "center",
      alignItems: "center",
    },
    
    // Chevron container
    chevronContainer: {
      marginLeft: theme.spacing.xs,
      justifyContent: "center",
      alignItems: "center",
      position: "absolute",
      right: 0,
      left: 0,
      bottom: -10,
    },
    
    // Detailed macros styles
    detailedMacros: {
      flexDirection: "column",
      gap: theme.spacing.xs,
    },
    
    macroRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      minWidth: 80,
    },
    
    macroLabel: {
      ...theme.typography.Caption,
    },
    
    macroValue: {
      ...theme.typography.Caption,
    },
  });

// Legacy export for compatibility
export const styles = createStyles(theme.getColors());
