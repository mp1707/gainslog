import { StyleSheet } from "react-native";
import type { Colors, Theme } from "@/theme";

export const createStyles = (colors: Colors, theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      backgroundColor: colors.secondaryBackground,
      borderRadius: theme.spacing.lg + theme.spacing.xs, // 28px - slightly more rounded for harmony
      padding: theme.spacing.xs / 2, // 2px padding inside
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 4, // Enhanced shadow depth
      },
      shadowOpacity: 0.12, // Slightly increased for better definition
      shadowRadius: 10,
      elevation: 6,
      // Subtle border for premium feel
      borderWidth: 0.5,
      borderColor: colors.border,
    },
    segment: {
      flex: 1,
      paddingVertical: theme.spacing.sm + theme.spacing.xs / 2, // 12px vertical padding
      paddingHorizontal: theme.spacing.md,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: theme.spacing.md + theme.spacing.xs, // 20px border radius
      zIndex: 2,
    },
    segmentText: {
      ...theme.typography.Button,
      fontSize: 16,
      fontWeight: "600",
      // Enhanced typography for better readability
      letterSpacing: 0.3,
    },
    activeSegmentText: {
      color: colors.primaryText,
      fontWeight: "700", // Slightly bolder for selected state
    },
    inactiveSegmentText: {
      color: colors.secondaryText,
      fontWeight: "500", // Lighter weight for unselected
    },
    selectionIndicator: {
      position: "absolute",
      top: theme.spacing.xs / 2,
      bottom: theme.spacing.xs / 2,
      borderRadius: theme.spacing.md + theme.spacing.xs, // 20px border radius
      backgroundColor: colors.primaryBackground,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.2, // Enhanced shadow for better depth
      shadowRadius: 6,
      elevation: 4,
      zIndex: 1,
      // Subtle border for indicator
      borderWidth: 0.5,
      borderColor: colors.subtleBorder,
    },
  });
