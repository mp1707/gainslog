import { StyleSheet } from "react-native";
import { theme } from "../../../../theme";

export const createStyles = (colors: any, bottomOffset?: number) =>
  StyleSheet.create({
    container: {
      position: "absolute",
      bottom: bottomOffset || theme.spacing.lg,
      right: theme.spacing.pageMargins.horizontal,
      alignItems: "center",
      zIndex: 1000,
    },

    backdrop: {
      position: "absolute",
      top: -1000,
      left: -1000,
      right: -1000,
      bottom: -1000,
      backgroundColor: colors.primaryText,
      zIndex: -1,
    },

    backdropPressable: {
      flex: 1,
    },

    actionButtonsContainer: {
      position: "absolute",
      bottom: 0, // Position at FAB level
      right: 0, // Align with FAB
      alignItems: "center",
      justifyContent: "center",
      width: theme.components.aiActionTargets.height,
      height: theme.components.aiActionTargets.height,
      zIndex: 999,
    },

    actionButtonWrapper: {
      position: "absolute",
      alignItems: "center",
      justifyContent: "center",
    },

    actionButton: {
      backgroundColor: colors.accent,
      width: theme.components.aiActionTargets.height,
      height: theme.components.aiActionTargets.height,
      borderRadius: theme.components.aiActionTargets.height / 2, // Circular
      alignItems: "center",
      justifyContent: "center",
      // Enhanced shadow for more depth
      shadowColor: "rgba(0, 0, 0, 0.25)",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 1,
      shadowRadius: 12,
      elevation: 8,
    },

    mainFab: {
      backgroundColor: colors.accent,
      width: theme.components.aiActionTargets.height,
      height: theme.components.aiActionTargets.height,
      borderRadius: theme.components.aiActionTargets.height / 2, // Circular
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1001, // Ensure main FAB stays on top
      // Enhanced shadow for premium feel
      shadowColor: "rgba(0, 0, 0, 0.3)",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 1,
      shadowRadius: 16,
      elevation: 10,
    },
  });
